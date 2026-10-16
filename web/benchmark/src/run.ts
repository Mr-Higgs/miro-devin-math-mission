// Usage: npm run bench -- [extraction|grading|all] [--models id1,id2] [--repeat N] [--dry-run]
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  BENCH_DIR, loadEnv, loadModels,
  type CallResult, type ImageInput,
} from "./common.js";
import { callAnthropic } from "./providers/anthropic.js";
import { callOpenAI } from "./providers/openai.js";
import { callGoogle } from "./providers/google.js";
import { loadExtractionSamples, scoreExtraction, type ExtractionScore } from "./extraction.js";
import { gradingUserText, loadGradingPages, scoreGradingPage, summarizeGrading, type ItemOutcome } from "./grading.js";
import { EXTRACTION_INSTRUCTIONS, EXTRACTION_REQUEST } from "../../src/prompts/extraction.js";
import { GRADING_INSTRUCTIONS } from "../../src/prompts/grading.js";

const PROVIDERS = { anthropic: callAnthropic, openai: callOpenAI, google: callGoogle };

function parseArgs(argv: string[]) {
  const args = { task: "all", models: [] as string[], repeat: 1, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--models") args.models = argv[++i].split(",");
    else if (a === "--repeat") args.repeat = Math.max(1, parseInt(argv[++i], 10));
    else if (a === "--dry-run") args.dryRun = true;
    else if (["extraction", "grading", "all"].includes(a)) args.task = a;
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

const pct = (x: number) => (Number.isNaN(x) ? "—" : `${Math.round(x * 100)}%`);

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));
  const models = loadModels().filter((m) => !args.models.length || args.models.includes(m.id));
  const doExtraction = args.task !== "grading";
  const doGrading = args.task !== "extraction";
  const extractionSamples = doExtraction ? loadExtractionSamples() : [];
  const gradingPages = doGrading ? loadGradingPages() : [];
  const extractionPrompt = EXTRACTION_INSTRUCTIONS;
  const gradingPrompt = GRADING_INSTRUCTIONS;

  const imageKb = (imgs: ImageInput[]) => Math.round(imgs.reduce((n, i) => n + i.base64.length * 0.75, 0) / 1024);
  console.log(`Models: ${models.map((m) => m.id).join(", ")}`);
  console.log(`Extraction samples: ${extractionSamples.map((s) => `${s.id} (${s.images.length} photos, ${imageKb(s.images)} KB)`).join("; ") || "none"}`);
  console.log(`Grading pages: ${gradingPages.length}, items: ${gradingPages.reduce((n, p) => n + p.items.length, 0)}`);

  if (args.dryRun) {
    // Self-check: perfect replies built from the expected answers must score 100%.
    for (const s of extractionSamples) {
      const perfect = JSON.stringify({ questions: s.expected.questions });
      const sc = scoreExtraction(s.expected, perfect);
      console.log(`Self-check extraction ${s.id}: recall ${pct(sc.missedRecall)}, precision ${pct(sc.missedPrecision)}, answers ${pct(sc.studentAnswerAccuracy)}`);
    }
    const outcomes = gradingPages.flatMap((p) =>
      scoreGradingPage(p, JSON.stringify({ results: p.items.map((i) => ({ id: i.id, result: i.acceptable[0] })) })),
    );
    const g = summarizeGrading(outcomes);
    console.log(`Self-check grading: ${pct(g.accuracyAll)} of ${g.answeredItems} answered items, blanks ${pct(g.blankSkippedCorrectly)}`);
    console.log("Dry run only: no API calls made.");
    return;
  }

  const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
  const outDir = join(BENCH_DIR, "results", stamp);
  mkdirSync(outDir, { recursive: true });
  const raw: any[] = [];
  const rows: string[] = [];

  for (const model of models) {
    const call = (system: string, images: ImageInput[], text: string): Promise<CallResult> =>
      PROVIDERS[model.provider](model.id, system, images, text);
    let tokensIn = 0, tokensOut = 0, ms = 0, calls = 0, errors = 0;
    const extractionScores: ExtractionScore[] = [];
    const gradingOutcomes: ItemOutcome[] = [];
    let fatal: string | undefined;

    const attempt = async (what: string, fn: () => Promise<CallResult>, onReply: (r: CallResult) => void) => {
      if (fatal) return;
      try {
        const r = await fn();
        calls++; tokensIn += r.inputTokens ?? 0; tokensOut += r.outputTokens ?? 0; ms += r.ms;
        raw.push({ model: model.id, what, reply: r.text, ms: r.ms });
        onReply(r);
      } catch (e: any) {
        errors++;
        const msg = String(e?.message ?? e);
        raw.push({ model: model.id, what, error: msg });
        console.log(`  ${model.id} ${what}: ERROR ${msg}`);
        if (/not set|401|403|authentication|api key|not found|404/i.test(msg)) fatal = msg;
      }
    };

    for (let rep = 1; rep <= args.repeat; rep++) {
      for (const s of extractionSamples) {
        console.log(`${model.id}: extraction ${s.id} (run ${rep})`);
        await attempt(`extraction:${s.id}:${rep}`, () => call(extractionPrompt, s.images, EXTRACTION_REQUEST), (r) => {
          try { extractionScores.push(scoreExtraction(s.expected, r.text)); }
          catch (e: any) { errors++; console.log(`  unparseable reply: ${e.message}`); }
        });
      }
      for (const p of gradingPages) {
        console.log(`${model.id}: grading ${p.sampleId}/${p.photo} (run ${rep})`);
        await attempt(`grading:${p.sampleId}/${p.photo}:${rep}`, () => call(gradingPrompt, [p.image], gradingUserText(p)), (r) => {
          try { gradingOutcomes.push(...scoreGradingPage(p, r.text)); }
          catch (e: any) { errors++; console.log(`  unparseable reply: ${e.message}`); }
        });
      }
    }

    const avg = (f: (s: ExtractionScore) => number) =>
      extractionScores.length ? extractionScores.reduce((n, s) => n + f(s), 0) / extractionScores.length : NaN;
    const g = summarizeGrading(gradingOutcomes);
    rows.push(
      `| ${model.label}${model.confirm ? " ⚠️" : ""} | ${pct(avg((s) => s.missedRecall))} | ${pct(avg((s) => s.missedPrecision))} | ` +
      `${pct(avg((s) => s.studentAnswerAccuracy))} | ${pct(g.accuracyVerified)} | ${pct(g.accuracyAll)} | ${g.wrongfulRedos} | ` +
      `${pct(g.blankSkippedCorrectly)} | ${calls ? (ms / calls / 1000).toFixed(1) + "s" : "—"} | ${tokensIn.toLocaleString()} / ${tokensOut.toLocaleString()} | ${errors}${fatal ? " (stopped)" : ""} |`,
    );
    raw.push({ model: model.id, extractionScores, gradingSummary: g });
  }

  const summary = [
    `# Benchmark run ${stamp}`,
    "",
    `Task: ${args.task} · repeats: ${args.repeat}`,
    "",
    "| Model | Missed found (recall) | Missed precision | Student answers read | Grading (verified items) | Grading (all items) | Wrongful redos | Blanks skipped | Avg time/call | Tokens in / out | Errors |",
    "|---|---|---|---|---|---|---|---|---|---|---|",
    ...rows,
    "",
    "⚠️ = model ID from web research; confirm with `npm run bench:models`.",
    "Details per question are in raw.json in this folder.",
  ].join("\n");
  writeFileSync(join(outDir, "summary.md"), summary + "\n");
  writeFileSync(join(outDir, "raw.json"), JSON.stringify(raw, null, 2));
  console.log("\n" + summary);
  console.log(`\nSaved to ${outDir}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
