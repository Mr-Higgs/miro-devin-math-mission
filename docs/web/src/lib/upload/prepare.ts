// Photo prep, done in the adult's browser before anything is uploaded
// (decision 006). Every page is redrawn onto a canvas and saved as a new JPEG:
//   * all hidden data (EXIF, GPS location, device details) is left behind,
//   * the photo is turned the right way up (from its EXIF orientation),
//   * large photos are shrunk, so uploads are quick and fit storage limits,
//   * each PDF page becomes its own image.
// Browser-only: import it from Client Components.

export const MAX_FILES = 10;
export const MAX_PAGES = 20;
export const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf";
const MAX_SIDE = 2400; // pixels on the longest side: plenty for reading handwriting
const QUALITY = 0.85;

export interface PreparedPage {
  blob: Blob;
  /** e.g. "photo-1.jpg" or "quiz.pdf, page 2" */
  label: string;
}

export class PrepError extends Error {}

function toJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new PrepError("Couldn't save the image."))), "image/jpeg", QUALITY),
  );
}

function canvasFor(width: number, height: number) {
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  return { canvas, scale };
}

async function prepareImage(file: File): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new PrepError(
      `"${file.name}" couldn't be opened in this browser. Try a JPG or PNG (on an iPhone, choose "Most Compatible" in Settings > Camera > Formats).`,
    );
  }
  const { canvas } = canvasFor(bitmap.width, bitmap.height);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; // transparent screenshots get a white page
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return toJpeg(canvas);
}

async function preparePdf(file: File): Promise<Blob[]> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const task = pdfjs.getDocument({ data: await file.arrayBuffer() });
  let doc;
  try {
    doc = await task.promise;
  } catch {
    throw new PrepError(`"${file.name}" couldn't be opened as a PDF.`);
  }
  const pages: Blob[] = [];
  for (let n = 1; n <= doc.numPages; n++) {
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const { canvas, scale } = canvasFor(base.width * 3, base.height * 3); // render sharp, then cap at MAX_SIDE
    const viewport = page.getViewport({ scale: 3 * scale });
    await page.render({ canvas, viewport, background: "#ffffff" }).promise;
    pages.push(await toJpeg(canvas));
  }
  await task.destroy();
  return pages;
}

/** Turns the chosen files into clean JPEG pages, in order. */
export async function preparePages(files: File[], onProgress?: (done: number, total: number) => void): Promise<PreparedPage[]> {
  if (!files.length) throw new PrepError("Choose at least one photo or PDF.");
  if (files.length > MAX_FILES) throw new PrepError(`Choose up to ${MAX_FILES} files at a time.`);

  const pages: PreparedPage[] = [];
  for (const [i, file] of files.entries()) {
    onProgress?.(i, files.length);
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      const blobs = await preparePdf(file);
      blobs.forEach((blob, p) => pages.push({ blob, label: `${file.name}, page ${p + 1}` }));
    } else {
      pages.push({ blob: await prepareImage(file), label: file.name });
    }
    if (pages.length > MAX_PAGES) throw new PrepError(`That's more than ${MAX_PAGES} pages. Upload one test at a time.`);
  }
  onProgress?.(files.length, files.length);
  return pages;
}
