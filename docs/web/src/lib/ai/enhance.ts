// Makes faint pencil easier for the AI to read (2026-10-19). Applied only to
// the copy sent to the AI; the stored photo the adult sees is unchanged.
// Colors are kept, because the prompt tells student pencil (gray) apart from
// teacher pen (blue, red...). Node only: used by the server and the benchmark.
import sharp from "sharp";

export async function enhanceForReading(jpeg: Buffer): Promise<Buffer> {
  return sharp(jpeg)
    .normalise({ lower: 1, upper: 99 }) // stretch dim photos to full range
    .linear(1.35, -0.35 * 255) // darken grays (pencil) and colors; white stays white
    .jpeg({ quality: 90 })
    .toBuffer();
}
