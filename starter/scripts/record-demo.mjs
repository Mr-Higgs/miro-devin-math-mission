// Records the standardized buildathon demo video: onboard → sample test →
// missed questions → practice → print sheet → upload work → review.
// Uses system Chrome (channel: "chrome"), so no browser download is needed.
// Usage: `npm run demo:record` (needs `npm run dev` on another terminal, or
// pass a running URL as DEMO_URL; defaults to http://localhost:3000).
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.DEMO_URL ?? "http://localhost:3000";
const outDir = path.join(root, "submission");

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright isn't installed. Run: npm i -D playwright");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: outDir, size: { width: 1280, height: 800 } },
});
const page = await context.newPage();
const beat = (ms = 1200) => page.waitForTimeout(ms);

try {
  // Onboard (only if no profile yet — fine either way)
  await page.goto(`${base}/onboard`, { waitUntil: "networkidle" });
  await beat();
  await page.getByRole("button", { name: /save and continue/i }).click();
  await page.waitForURL("**/");
  await beat();

  // New session → sample test → extraction runs
  await page.getByRole("link", { name: /start a new session/i }).click();
  await page.waitForURL("**/sessions/new");
  await beat();
  await page.getByRole("button", { name: /use the sample test/i }).click();
  await page.waitForURL("**/questions");
  await beat(800);
  await page.waitForSelector("text=/missed out of/", { timeout: 60000 });
  await beat(1500);

  // Practice set
  await page.getByRole("link", { name: /continue to practice set/i }).click();
  await page.waitForURL("**/practice");
  await beat(800);
  await page.waitForSelector("text=/practice questions/", { timeout: 60000 });
  await beat(1500);

  // Print sheet (preview), then back
  const m = page.url().match(/sessions\/([0-9a-f-]+)/);
  const id = m[1];
  await page.goto(`${base}/sessions/${id}/print/sheet`);
  await beat(1500);

  // Upload work → review (mock grading doesn't look at pixels)
  await page.goto(`${base}/sessions/${id}/work`);
  await beat();
  await page.getByRole("button", { name: /use a sample of finished work/i }).click();
  await page.waitForURL("**/review");
  await beat(800);
  await page.waitForSelector("text=/passed ·|passed·|to redo/", { timeout: 60000 });
  await beat(2000);
} finally {
  await context.close(); // finalizes the video
  await browser.close();
}

// Playwright writes a random .webm name; normalize to submission/demo.webm.
import { readdirSync, renameSync, statSync } from "node:fs";
const videos = readdirSync(outDir)
  .filter((f) => f.endsWith(".webm") && f !== "demo.webm")
  .map((f) => ({ f, t: statSync(path.join(outDir, f)).mtimeMs }))
  .sort((a, b) => b.t - a.t);
if (videos[0]) {
  renameSync(path.join(outDir, videos[0].f), path.join(outDir, "demo.webm"));
  console.log(`Demo video: ${path.join(outDir, "demo.webm")}`);
} else {
  console.log(`Demo video written to ${outDir} (no .webm found to rename)`);
}
