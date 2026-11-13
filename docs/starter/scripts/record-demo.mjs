// Records the standardized buildathon demo video: onboard → sample material →
// key ideas → practice → results, driven by the app's data-step hooks so copy
// changes don't break it. Tries system Chrome first, then Playwright's
// bundled Chromium.
// Usage: `npm run demo:record` (needs `npm run dev` on another terminal, or
// pass a running URL as DEMO_URL; defaults to http://localhost:3000).
import { mkdirSync, readdirSync, readFileSync, renameSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.env.DEMO_URL ?? "http://localhost:3000";
const outDir = path.join(root, "submission");
const shotsDir = path.join(root, "screenshots");

// Practice answers come from the fixture, so the mock run answers correctly
// (except one deliberate miss). Real AI? The per-type fallback still applies.
let fixtureQuestions = [];
try {
  fixtureQuestions = JSON.parse(readFileSync(path.join(root, "fixtures", "generate-practice.json"), "utf8")).questions ?? [];
} catch {}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("Playwright isn't installed. Run: npm i -D playwright");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
mkdirSync(shotsDir, { recursive: true });

let browser;
try {
  browser = await chromium.launch({ channel: "chrome" });
} catch {
  try {
    browser = await chromium.launch();
  } catch {
    console.error("No browser found. Install one with: npx playwright install chromium");
    process.exit(1);
  }
}
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: outDir, size: { width: 1280, height: 800 } },
});
const page = await context.newPage();
const beat = (ms = 1200) => page.waitForTimeout(ms);

try {
  // Screen 1: Get to know me
  await page.goto(`${base}/onboard`, { waitUntil: "networkidle" });
  await beat();
  await page.screenshot({ path: path.join(shotsDir, "step-1-get-to-know-me.png") });
  await page.locator('[data-step="save-profile"]').click();
  await page.waitForURL("**/");
  await beat();

  // Screen 2: What I'm studying → sample material
  await page.getByRole("link", { name: /start a new session/i }).click();
  await page.waitForURL("**/sessions/new");
  await beat();
  await page.locator('[data-step="use-sample"]').click();
  await page.waitForURL("**/material");
  await page.locator('[data-step="start-practice"]').waitFor({ timeout: 60000 });
  await beat(1500);
  await page.screenshot({ path: path.join(shotsDir, "step-2-what-im-studying.png") });

  // Screen 3: Practice — answer each question by type
  await page.locator('[data-step="start-practice"]').click();
  await page.waitForURL("**/practice");
  await page.locator("[data-question-type]").first().waitFor({ timeout: 60000 });
  await beat(1200);
  let missedOne = false;
  for (const fieldset of await page.locator("[data-question-type]").all()) {
    const type = await fieldset.getAttribute("data-question-type");
    const prompt = ((await fieldset.locator("p").first().innerText()) ?? "").trim();
    const fq = fixtureQuestions.find((q) => q.prompt?.trim() === prompt);
    const answer = fq?.answer;
    if (type === "multiple_choice") {
      let letter = answer;
      // Deliberately miss the first fixture-matched MC so the video shows both outcomes.
      if (letter && !missedOne) {
        letter = Object.keys(fq.choices ?? {}).find((l) => l !== answer) ?? answer;
        missedOne = true;
      }
      if (letter) await fieldset.locator(`input[type="radio"][value="${letter}"]`).check();
      else await fieldset.locator('input[type="radio"]').first().check();
    } else if (type === "fill_in") {
      await fieldset.locator('input[type="text"], input:not([type])').first().fill(answer ?? "Here is my best try");
    } else if (type === "short_answer" || type === "scenario") {
      await fieldset.locator("textarea").first().fill(answer ?? "Here is my best try");
    } else if (type === "flashcard") {
      await fieldset.getByRole("button", { name: /show answer/i }).click();
      await fieldset.getByRole("radio", { name: /i knew it/i }).check();
    }
    await beat(300);
  }
  await beat(800);
  await page.screenshot({ path: path.join(shotsDir, "step-3-practice.png") });

  // Screen 4: How did I do
  await page.locator('[data-step="submit-answers"]').click();
  await page.waitForURL("**/results");
  await page.locator('[data-step="results-summary"]').waitFor({ timeout: 60000 });
  await beat(2000);
  await page.screenshot({ path: path.join(shotsDir, "step-4-how-did-i-do.png") });
} finally {
  await context.close(); // finalizes the video
  await browser.close();
}

// Playwright writes a random .webm name; normalize to submission/demo.webm.
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
