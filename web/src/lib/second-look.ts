// The automatic second look, shared by the app and the benchmark. Questions
// whose student answer wasn't found get one more, focused try: only their own
// photo is sent, with the second-look prompt. Most tests need no second look
// (no extra cost); a test with gaps pays one small call per affected photo.
import { parseJsonReply } from "./ai/gemini-core";
import { SECOND_LOOK_INSTRUCTIONS, secondLookRequest } from "../prompts/second-look";

export interface ReadQuestionForLook {
  question_number: string;
  original_question_text: string;
  choices: Record<string, string> | null;
  /** Photo number (1-based) the main reading said the question is on. */
  photo: number | null;
  student_answer: string | null;
}

/** Sends instructions + one photo (by number) + a request; returns the reply text. */
export type AskOnePhoto = (instructions: string, photo: number, request: string) => Promise<string>;

export interface SecondLookResult {
  /** question_number -> answer found on the second look */
  found: Map<string, string>;
  photosChecked: number;
}

export async function secondLook(questions: ReadQuestionForLook[], photoCount: number, ask: AskOnePhoto): Promise<SecondLookResult> {
  const missing = questions.filter((q) => !q.student_answer && q.photo !== null && q.photo >= 1 && q.photo <= photoCount);
  const byPhoto = new Map<number, ReadQuestionForLook[]>();
  for (const q of missing) byPhoto.set(q.photo!, [...(byPhoto.get(q.photo!) ?? []), q]);

  const found = new Map<string, string>();
  // One call per photo, all at once, so it adds seconds rather than minutes.
  await Promise.all(
    [...byPhoto.entries()].map(async ([photo, qs]) => {
      try {
        const text = await ask(
          SECOND_LOOK_INSTRUCTIONS,
          photo,
          secondLookRequest(qs.map(({ question_number, original_question_text, choices }) => ({ question_number, original_question_text, choices }))),
        );
        const reply = parseJsonReply(text) as { answers?: { question_number?: unknown; student_answer?: unknown }[] };
        for (const a of reply.answers ?? []) {
          const number = String(a.question_number ?? "");
          const answer = typeof a.student_answer === "string" ? a.student_answer.trim().slice(0, 500) : "";
          if (answer && qs.some((q) => q.question_number === number)) found.set(number, answer);
        }
      } catch {
        // A failed second look just leaves the gap; Step 2 still flags it.
      }
    }),
  );
  return { found, photosChecked: byPhoto.size };
}
