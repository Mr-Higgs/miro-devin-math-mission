import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { TEST_DATA_DIR, loadImage, parseJsonReply, type ImageInput } from "./common.js";

export type GradeResult = "pass" | "redo" | "needs_check" | "skipped";

export interface GradingItem {
  id: string;
  question_text: string;
  correct_answer: string;
  requires_work: boolean;
  acceptable: GradeResult[]; // results that count as right for this item
  verified: boolean; // checked by the tutor
  note?: string;
}

export interface GradingPage {
  sampleId: string;
  photo: string;
  image: ImageInput;
  items: GradingItem[];
}

export function loadGradingPages(): GradingPage[] {
  const root = join(TEST_DATA_DIR, "student-work");
  const pages: GradingPage[] = [];
  for (const d of readdirSync(root)) {
    const file = join(root, d, "expected.json");
    if (!existsSync(file)) continue;
    const expected = JSON.parse(readFileSync(file, "utf8"));
    for (const p of expected.photos) {
      pages.push({
        sampleId: d,
        photo: p.photo,
        image: loadImage(join(root, d, p.photo), "Student's page"),
        items: p.items,
      });
    }
  }
  return pages;
}

export function gradingUserText(page: GradingPage): string {
  const questions = page.items.map(({ id, question_text, correct_answer, requires_work }) => ({
    id, question_text, correct_answer, requires_work,
  }));
  return `Questions on this page:\n${JSON.stringify(questions, null, 2)}\n\nGrade each question as instructed.`;
}

export interface ItemOutcome {
  sampleId: string;
  photo: string;
  id: string;
  verified: boolean;
  expected: GradeResult[];
  got: GradeResult | "missing";
  correct: boolean;
  wrongfulRedo: boolean; // expected only pass/needs_check but model said redo: the costliest error (003)
}

export function scoreGradingPage(page: GradingPage, replyText: string): ItemOutcome[] {
  const reply = parseJsonReply(replyText);
  const results: any[] = Array.isArray(reply.results) ? reply.results : [];
  const byId = new Map(results.map((r) => [String(r.id), r]));
  return page.items.map((item) => {
    const got = (byId.get(item.id)?.result ?? "missing") as GradeResult | "missing";
    const correct = got !== "missing" && item.acceptable.includes(got);
    return {
      sampleId: page.sampleId,
      photo: page.photo,
      id: item.id,
      verified: item.verified,
      expected: item.acceptable,
      got,
      correct,
      wrongfulRedo: got === "redo" && !item.acceptable.includes("redo"),
    };
  });
}

export function summarizeGrading(outcomes: ItemOutcome[]) {
  const answered = outcomes.filter((o) => !o.expected.every((e) => e === "skipped"));
  const verified = answered.filter((o) => o.verified);
  const blank = outcomes.filter((o) => o.expected.every((e) => e === "skipped"));
  const rate = (xs: ItemOutcome[]) => (xs.length ? xs.filter((o) => o.correct).length / xs.length : NaN);
  return {
    answeredItems: answered.length,
    accuracyAll: rate(answered),
    verifiedItems: verified.length,
    accuracyVerified: rate(verified),
    wrongfulRedos: outcomes.filter((o) => o.wrongfulRedo).length,
    blankItems: blank.length,
    blankSkippedCorrectly: rate(blank),
    misses: outcomes.filter((o) => !o.correct).map((o) => `${o.sampleId}/${o.photo} ${o.id}: got ${o.got}, expected ${o.expected.join(" or ")}`),
  };
}
