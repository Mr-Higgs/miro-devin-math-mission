// Screen 3's job: write practice.count questions from the material's key
// ideas, at the learner's level, using only the allowed types. Retries with
// the check problems up to MAX_TRIES times; afterwards, questions that still
// fail are kept flagged ("needs a look") when minimally usable — and only if
// nothing is usable does the job fail.
import "server-only";
import { randomUUID } from "node:crypto";
import { mission } from "@mission";
import { generatePracticeInstructions, generatePracticeRequest } from "@/prompts/generate-practice";
import { AiError, GENERATION_SETTINGS, ai, parseJsonReply } from "@/lib/ai";
import { checkPractice } from "@/lib/checks";
import { getSession, isUuid, updateSession, type PracticeQuestion } from "@/lib/store";
import { MAX_TRIES, claimable, retryFeedback, type JobOutcome } from "./job";

export async function generatePractice(sessionId: string): Promise<JobOutcome> {
  if (!isUuid(sessionId)) return "not_found";
  const session = await getSession(sessionId);
  if (!session) return "not_found";
  if (session.material.status !== "ready") return "failed";

  const { practice } = session;
  if (practice.status === "ready") return "ready";
  if (!claimable(practice.status, practice.started_at)) return "busy";

  try {
    await updateSession(sessionId, (s) => ({
      ...s,
      practice: { ...s.practice, status: "working", started_at: new Date().toISOString(), error: null },
    }));

    const keyIdeaIds = session.material.key_ideas.map((k) => k.id);
    const opts = { count: mission.practice.count, questionTypes: mission.practice.questionTypes, keyIdeaIds };
    const request = generatePracticeRequest({
      title: session.material.title,
      summary: session.material.summary,
      keyIdeas: session.material.key_ideas,
    });

    let problems: string[] = [];
    let lastCheck: ReturnType<typeof checkPractice> | null = null;
    let lastList: unknown[] = [];

    for (let tries = 1; tries <= MAX_TRIES; tries++) {
      try {
        const reply = await ai.ask({
          job: "generate_practice",
          instructions: generatePracticeInstructions(),
          parts: [{ text: request + (problems.length ? retryFeedback(problems) : "") }],
          ...GENERATION_SETTINGS,
        });
        const parsed = parseJsonReply(reply.text) as Record<string, unknown>;
        lastList = Array.isArray(parsed?.questions) ? parsed.questions : [];
        lastCheck = checkPractice(parsed, opts);
        problems = [
          ...lastCheck.problems,
          ...lastCheck.questions.flatMap((q, i) => q.problems.map((p) => `question ${i + 1}: ${p}`)),
        ];
        if (!problems.length) break;
      } catch (e) {
        if (!(e instanceof AiError)) throw e;
        lastCheck = null;
        lastList = [];
        problems = ["The reply couldn't be used. Return only the JSON described."];
      }
    }

    // Keep what we can: drafts that passed are "passed"; replies with at
    // least a prompt and an answer are kept but flagged for a look.
    const questions: PracticeQuestion[] = [];
    lastList.forEach((raw, i) => {
      const check = lastCheck?.questions[i];
      const q = raw as Record<string, unknown>;
      if (check?.draft) {
        questions.push({
          id: randomUUID(),
          position: questions.length + 1,
          ...check.draft,
          check_status: "passed",
          check_notes: null,
        });
      } else if (q && typeof q === "object" && typeof q.prompt === "string" && q.prompt.trim() && typeof q.answer === "string" && q.answer.trim()) {
        questions.push({
          id: randomUUID(),
          position: questions.length + 1,
          type: ((opts.questionTypes as string[]).includes(String(q.type)) ? q.type : "short_answer") as PracticeQuestion["type"],
          key_idea_id: typeof q.key_idea_id === "string" && keyIdeaIds.includes(q.key_idea_id) ? q.key_idea_id : null,
          prompt: q.prompt.trim(),
          choices:
            q.choices && typeof q.choices === "object" && !Array.isArray(q.choices)
              ? Object.fromEntries(Object.entries(q.choices as Record<string, unknown>).map(([k, v]) => [k, String(v)]))
              : null,
          answer: q.answer.trim(),
          explanation: typeof q.explanation === "string" && q.explanation.trim() ? q.explanation.trim() : "(No explanation was written.)",
          hint: typeof q.hint === "string" && q.hint.trim() ? q.hint.trim() : null,
          check_status: "flagged",
          check_notes: (check?.problems.join(" ") || "The app couldn't check this question.").slice(0, 1000),
        });
      }
    });

    if (!questions.length) {
      throw new AiError(`The practice set couldn't be written: ${problems.join(" ") || "no usable answer"}`);
    }

    await updateSession(sessionId, (s) => ({
      ...s,
      practice: { ...s.practice, status: "ready", questions },
      answers: {},
      results: { status: "none", started_at: null, error: null, items: [], summary: null, next_steps: [] },
    }));
    return "ready";
  } catch (e) {
    const message = e instanceof AiError ? e.message : "Something went wrong while writing the practice set.";
    await updateSession(sessionId, (s) => ({ ...s, practice: { ...s.practice, status: "failed", error: message } }));
    return "failed";
  }
}
