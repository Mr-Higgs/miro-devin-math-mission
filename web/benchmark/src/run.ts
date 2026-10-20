// Usage: npm run bench -- [extraction|grading|generation|all] [--models id1,id2] [--repeat N] [--dry-run]
//   Gemini only: [--detail default|medium|high|ultra_high] [--thinking default|minimal|low|medium|high] [--enhance]
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  BENCH_DIR, RUN_OPTIONS, loadEnv, loadModels,
  type CallResult, type ImageInput,
} from "./common.js";
import { callAnthropic } from "./providers/anthropic.js";
import { callOpenAI } from "./providers/openai.js";
import { callGoogle } from "./providers/google.js";
import { loadExtractionSamples, scoreExtraction, type ExtractionScore } from "./extraction.js";
import { gradingUserText, loadGradingPages, scoreGradingPage, summarizeGrading, type ItemOutcome } from "./grading.js";
import { EXTRACTION_INSTRUCTIONS, EXTRACTION_REQUEST } from "../../src/prompts/extraction.js";
import { GRADING_INSTRUCTIONS } from "../../src/prompts/grading.js";
import { secondLook } from "../../src/lib/second-look.js";
import { GENERATION_INSTRUCTIONS, generationRequest } from "../../src/prompts/generation.js";
import {
  generationDetails, loadGenerationCases, scoreGeneration, selfCheckGeneration, summarizeGeneration,
  type GenerationOutcome,
} from "./generation.js";

const PROVIDERS = { anthropic: callAnthropic, openai: callOpenAI, google: callGoogle };

function parseArgs(argv: string[]) {
  const args = { task: "all", models: [] as string[], repeat: 1, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--models") args.models = argv[++i].split(",");
    else if (a === "--repeat") args.repeat = Math.max(1, parseInt(argv[++i], 10));
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--detail") RUN_OPTIONS.detail = argv[++i];
    else if (a === "--thinking") RUN_OPTIONS.thinking = argv[++i];
    else if (a === "--enhance") RUN_OPTIONS.enhance = true;
    else if (["extraction", "grading", "generation", "all"].includes(a)) args.task = a;
    else throw new Error(`Unknown argument: ${a}`);
  }
  return args;
}

const pct = (x: number) => (Number.isNaN(x) ? "—" : `${Math.round(x * 100)}%`);

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));
  const models = loadModels().filter((m) => !args.models.length || args.models.includes(m.id));
  const doExtraction = ["all", "extraction"].includes(args.task);
  const doGrading = ["all", "grading"].includes(args.task);
  const doGeneration = ["all", "generation"].includes(args.task);
  const extractionSamples = doExtraction ? loadExtractionSamples() : [];
  const gradingPages = doGrading ? loadGradingPages() : [];
  const generationCases = doGeneration ? loadGenerationCases() : [];
  const extractionPrompt = EXTRACTION_INSTRUCTIONS;
  const gradingPrompt = GRADING_INSTRUCTIONS;

  const imageKb = (imgs: ImageInput[]) => Math.round(imgs.reduce((n, i) => n + i.base64.length * 0.75, 0) / 1024);
  console.log(`Models: ${models.map((m) => m.id).join(", ")}`);
  console.log(`Extraction samples: ${extractionSamples.map((s) => `${s.id} (${s.images.length} photos, ${imageKb(s.images)} KB)`).join("; ") || "none"}`);
  console.log(`Grading pages: ${gradingPages.length}, items: ${gradingPages.reduce((n, p) => n + p.items.length, 0)}`);
  console.log(`Generation cases: ${generationCases.length}`);

  if (args.dryRun) {
    // Self-check: perfect replies built from the expected answers must score 100%.
    for (const s of extractionSamples) {
      const perfect = JSON.stringify({
        questions: s.expected.questions,
        pages: (s.expected.page_rotations ?? []).map((rotation: number, i: number) => ({ photo: i + 1, rotation })),
      });
      const sc = scoreExtraction(s.expected, perfect);
      console.log(`Self-check extraction ${s.id}: recall ${pct(sc.missedRecall)}, precision ${pct(sc.missedPrecision)}, answers ${pct(sc.studentAnswerAccuracy)}, rotation ${pct(sc.rotationAccuracy ?? NaN)}`);
    }
    const outcomes = gradingPages.flatMap((p) =>
      scoreGradingPage(p, JSON.stringify({ results: p.items.map((i) => ({ id: i.id, result: i.acceptable[0] })) })),
    );
    const g = summarizeGrading(outcomes);
    console.log(`Self-check grading: ${pct(g.accuracyAll)} of ${g.answeredItems} answered items, blanks ${pct(g.blankSkippedCorrectly)}`);
    if (generationCases.length) {
      const failures = selfCheckGeneration(generationCases);
      console.log(`Self-check generation: ${failures.length ? `${failures.length} problem(s)` : "math checks pass good examples and catch wrong answers"}`);
      for (const f of failures) console.log(`  ${f}`);
      if (failures.length) process.exitCode = 1;
    }
    console.log("Dry run only: no API calls made.");
    return;
  }

  const stamp = new Date().toISOString().replace(/[:T]/g, "-").slice(0, 16);
  const outDir = join(BENCH_DIR, "results", stamp);
  mkdirSync(outDir, { recursive: true });
  const raw: any[] = [];
  const rows: string[] = [];
  const generationRows: string[] = [];
  const extractionMisses: string[] = [];
  const generationDetailLines: string[] = [];

  for (const model of models) {
    const call = (system: string, images: ImageInput[], text: string): Promise<CallResult> =>
      PROVIDERS[model.provider](model.id, system, images, text);
    let tokensIn = 0, tokensOut = 0, ms = 0, calls = 0, errors = 0, secondLooks = 0;
    const extractionScores: ExtractionScore[] = [];
    const gradingOutcomes: ItemOutcome[] = [];
    const generationOutcomes: GenerationOutcome[] = [];
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
        // Same as the app: main reading, then a second look at photos with missing student answers.
        const readWithSecondLook = async (): Promise<CallResult> => {
          const first = await call(extractionPrompt, s.images, EXTRACTION_REQUEST);
          let reply: any;
          try { reply = JSON.parse(first.text.slice(first.text.indexOf("{"), first.text.lastIndexOf("}") + 1)); } catch { return first; }
          const qs: any[] = Array.isArray(reply.questions) ? reply.questions : [];
          let extraIn = 0, extraOut = 0, extraMs = 0;
          const look = await secondLook(
            qs.map((q) => ({ question_number: String(q.question_number), original_question_text: String(q.original_question_text ?? ""), choices: q.choices ?? null, photo: Number(q.photo) || null, student_answer: q.student_answer || null })),
            s.images.length,
            async (instructions, photo, request) => {
              const r = await call(instructions, [s.images[photo - 1]], request);
              extraIn += r.inputTokens ?? 0; extraOut += r.outputTokens ?? 0; extraMs += r.ms;
              return r.text;
            },
          );
          for (const q of qs) { const a = look.found.get(String(q.question_number)); if (a && !q.student_answer) q.student_answer = a; }
          if (look.photosChecked) console.log(`  second look: ${look.photosChecked} photo(s), found ${[...look.found.keys()].join(", ") || "nothing"}`);
          secondLooks += look.photosChecked;
          return { text: JSON.stringify(reply), inputTokens: (first.inputTokens ?? 0) + extraIn, outputTokens: (first.outputTokens ?? 0) + extraOut, ms: first.ms + extraMs };
        };
        await attempt(`extraction:${s.id}:${rep}`, readWithSecondLook, (r) => {
          try { extractionScores.push({ ...scoreExtraction(s.expected, r.text), sampleId: s.id }); }
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
      for (const c of generationCases) {
        console.log(`${model.id}: generation ${c.id} (run ${rep})`);
        await attempt(`generation:${c.id}:${rep}`, () => call(GENERATION_INSTRUCTIONS, [], generationRequest(c.original)), (r) => {
          generationOutcomes.push(scoreGeneration(c, r.text));
        });
      }
    }

    const avg = (f: (s: ExtractionScore) => number) =>
      extractionScores.length ? extractionScores.reduce((n, s) => n + f(s), 0) / extractionScores.length : NaN;
    const g = summarizeGrading(gradingOutcomes);
    rows.push(
      `| ${model.label}${model.confirm ? " ⚠️" : ""} | ${pct(avg((s) => s.missedRecall))} | ${pct(avg((s) => s.missedPrecision))} | ` +
      `${pct(avg((s) => s.markedCorrectAccuracy))} | ${pct(avg((s) => s.studentAnswerAccuracy))} | ${pct(avg((s) => (s.totalScoreRead === null ? NaN : s.totalScoreRead ? 1 : 0)))} | ${pct(avg((s) => s.rotationAccuracy ?? NaN))} | ${pct(g.accuracyVerified)} | ${pct(g.accuracyAll)} | ${g.wrongfulRedos} | ` +
      `${pct(g.blankSkippedCorrectly)} | ${calls ? (ms / calls / 1000).toFixed(1) + "s" : "—"} | ${tokensIn.toLocaleString()} / ${tokensOut.toLocaleString()} | ${errors}${fatal ? " (stopped)" : ""} |`,
    );
    raw.push({ model: model.id, extractionScores, gradingSummary: g });
    if (extractionScores.length) {
      // Mistakes that keep coming back across samples and repeats.
      const counts = new Map<string, number>();
      extractionScores.forEach((s) => s.details.forEach((d) => {
        const key = `${s.sampleId} ${d}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }));
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
      extractionMisses.push("", `**${model.label}**: second looks needed on ${secondLooks} photo(s) across ${extractionScores.length} readings.`);
      extractionMisses.push("", `**${model.label}**, most common extraction mistakes (times seen across ${extractionScores.length} readings):`, ...top.map(([k, n]) => `- ${n}× ${k}`));
    }

    if (generationCases.length) {
      const gen = summarizeGeneration(generationOutcomes);
      generationRows.push(
        `| ${model.label} | ${gen.cases} | ${pct(gen.validJson)} | ${pct(gen.passed)} | ${pct(gen.passedMathChecked)} | ${gen.flagged.length} |`,
      );
      generationDetailLines.push("", `### ${model.label}`, "", ...generationDetails(generationOutcomes, generationCases));
      raw.push({ model: model.id, generationSummary: gen, generationOutcomes });
    }
  }

  const summary = [
    `# Benchmark run ${stamp}`,
    "",
    `Task: ${args.task} · repeats: ${args.repeat} · Gemini detail: ${RUN_OPTIONS.detail}, thinking: ${RUN_OPTIONS.thinking}, enhance: ${RUN_OPTIONS.enhance}`,
    "",
    "| Model | Missed found (recall) | Missed precision | Correct/missed right | Student answers read | Score read | Pages upright | Grading (verified items) | Grading (all items) | Wrongful redos | Blanks skipped | Avg time/call | Tokens in / out | Errors |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|",
    ...rows,
    "",
    "⚠️ = model ID from web research; confirm with `npm run bench:models`.",
    ...extractionMisses,
    ...(generationRows.length
      ? [
          "",
          "## Generation (decision 010)",
          "",
          "| Model | Cases | Valid JSON | Passed all checks | Passed with math confirmed | Flagged for the adult |",
          "|---|---|---|---|---|---|",
          ...generationRows,
          "",
          "Read the practice questions below: the checks confirm the math and format, but only a person can judge whether each one truly mirrors the original.",
          ...generationDetailLines,
        ]
      : []),
    "",
    "Details per question are in raw.json in this folder.",
  ].join("\n");
  writeFileSync(join(outDir, "summary.md"), summary + "\n");
  writeFileSync(join(outDir, "raw.json"), JSON.stringify(raw, null, 2));
  console.log("\n" + summary);
  console.log(`\nSaved to ${outDir}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
