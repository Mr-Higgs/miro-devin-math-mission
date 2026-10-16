import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { TEST_DATA_DIR, loadImage, parseJsonReply, type ImageInput } from "./common.js";

export interface ExtractionSample {
  id: string;
  images: ImageInput[];
  expected: any;
}

export function loadExtractionSamples(): ExtractionSample[] {
  const root = join(TEST_DATA_DIR, "graded-tests");
  return readdirSync(root)
    .filter((d) => existsSync(join(root, d, "expected.json")))
    .map((d) => {
      const dir = join(root, d);
      const photos = readdirSync(dir)
        .filter((f) => /^photo-\d+\.(jpe?g|png)$/i.test(f))
        .sort((a, b) => parseInt(a.slice(6)) - parseInt(b.slice(6)));
      return {
        id: d,
        images: photos.map((f, i) => loadImage(join(dir, f), `Photo ${i + 1} of ${photos.length}`)),
        expected: JSON.parse(readFileSync(join(dir, "expected.json"), "utf8")),
      };
    });
}

const norm = (s: unknown) =>
  String(s ?? "")
    .toUpperCase()
    .replace(/[\s,$]/g, "")
    .split("")
    .sort()
    .join("");

export interface ExtractionScore {
  questionsExpected: number;
  questionsFound: number;
  extraQuestions: number;
  missedRecall: number; // share of truly missed questions the model flagged as missed
  missedPrecision: number; // share of model-flagged misses that were truly missed
  markedCorrectAccuracy: number;
  studentAnswerAccuracy: number;
  partialCreditFound: boolean | null;
  details: string[];
}

export function scoreExtraction(expected: any, replyText: string): ExtractionScore {
  const reply = parseJsonReply(replyText);
  const got: any[] = Array.isArray(reply.questions) ? reply.questions : [];
  const byNum = new Map<number, any>();
  for (const q of got) if (!byNum.has(Number(q.question_number))) byNum.set(Number(q.question_number), q);

  const exp: any[] = expected.questions;
  const truth = new Set<number>(expected.expected_missed_questions);
  let found = 0, markedOk = 0, answerOk = 0;
  const details: string[] = [];
  let partialCreditFound: boolean | null = null;

  for (const e of exp) {
    const g = byNum.get(e.question_number);
    if (!g) { details.push(`Q${e.question_number}: not found`); continue; }
    found++;
    if (Boolean(g.marked_correct) === e.marked_correct) markedOk++;
    else details.push(`Q${e.question_number}: marked_correct ${g.marked_correct}, expected ${e.marked_correct}`);
    if (norm(g.student_answer) === norm(e.student_answer)) answerOk++;
    else details.push(`Q${e.question_number}: student answer "${g.student_answer}", expected "${e.student_answer}"`);
    if (e.points_earned > 0 && e.points_earned < 1) {
      partialCreditFound = Number(g.points_earned) > 0 && Number(g.points_earned) < Number(g.points_possible ?? 1);
      if (!partialCreditFound) details.push(`Q${e.question_number}: partial credit not detected`);
    }
  }

  const flagged = new Set<number>(got.filter((q) => q.marked_correct === false).map((q) => Number(q.question_number)));
  const hits = [...flagged].filter((n) => truth.has(n)).length;
  const extra = got.length - byNum.size + [...byNum.keys()].filter((n) => !exp.some((e) => e.question_number === n)).length;

  return {
    questionsExpected: exp.length,
    questionsFound: found,
    extraQuestions: extra,
    missedRecall: truth.size ? hits / truth.size : 1,
    missedPrecision: flagged.size ? hits / flagged.size : 0,
    markedCorrectAccuracy: markedOk / exp.length,
    studentAnswerAccuracy: answerOk / exp.length,
    partialCreditFound,
    details,
  };
}
