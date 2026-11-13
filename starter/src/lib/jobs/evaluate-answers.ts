// Screen 4's job: mark the saved answers. Multiple choice and exact fill-in
// matches are marked by code, flashcards are self-marked, and empty answers
// are skipped — everything else goes to one AI call, which also writes the
// summary and next steps. If the AI can't produce a usable reply after
// MAX_TRIES, the app still finishes: AI-marked items become "needs_look" with
// the model answer, and the summary/next steps are computed by code.
import "server-only";
import { EVALUATE_INSTRUCTIONS, evaluateRequest, type AlreadyGradedItem, type ToMarkItem } from "@/prompts/evaluate-answers";
import { AiError, ai, parseJsonReply } from "@/lib/ai";
import { checkEvaluation, gradeByApp } from "@/lib/checks";
import { getSession, isUuid, updateSession, type AnswerResult, type Session } from "@/lib/store";
import { MAX_TRIES, claimable, retryFeedback, type JobOutcome } from "./job";

const APP_FEEDBACK: Record<string, string> = {
  right: "Right!",
  not_yet: "",
  skipped: "",
};

function appGraded(session: Session): { graded: AnswerResult[]; toMark: { item: ToMarkItem; answer: string }[] } {
  const keyIdeas = new Map(session.material.key_ideas.map((k) => [k.id, k.title]));
  const graded: AnswerResult[] = [];
  const toMark: { item: ToMarkItem; answer: string }[] = [];

  for (const q of [...session.practice.questions].sort((a, b) => a.position - b.position)) {
    const answer = session.answers[q.id] ?? "";
    const app = gradeByApp(q, answer);
    if (app) {
      graded.push({
        question_id: q.id,
        learner_answer: answer,
        result: app.result,
        feedback:
          app.graded_by === "self"
            ? answer === "knew"
              ? "You marked that you knew it."
              : "You marked this one as not yet — worth another look."
            : (APP_FEEDBACK[app.result] ?? ""),
        graded_by: app.graded_by,
      });
    } else {
      toMark.push({
        answer,
        item: {
          question_id: q.id,
          type: q.type,
          key_idea_title: (q.key_idea_id && keyIdeas.get(q.key_idea_id)) || null,
          prompt: q.prompt,
          model_answer: q.answer,
          learner_answer: answer,
        },
      });
    }
  }
  return { graded, toMark };
}

/** Code-computed fallback when the AI can't be used: still completes. */
function fallbackResults(session: Session, graded: AnswerResult[], toMark: { item: ToMarkItem; answer: string }[]) {
  const items: AnswerResult[] = [
    ...graded,
    ...toMark.map(({ item, answer }) => ({
      question_id: item.question_id,
      learner_answer: answer,
      result: "needs_look" as const,
      feedback: `The app couldn't mark this one. Model answer: ${item.model_answer}`,
      graded_by: "app" as const,
    })),
  ];
  const total = session.practice.questions.length;
  const right = items.filter((i) => i.result === "right").length;
  const keyIdeas = new Map(session.material.key_ideas.map((k) => [k.id, k.title]));
  const missed = session.practice.questions.filter(
    (q) => items.find((i) => i.question_id === q.id)?.result !== "right",
  );
  const nextSteps = [...new Set(missed.map((q) => q.key_idea_id && keyIdeas.get(q.key_idea_id)).filter((t): t is string => !!t))].slice(0, 3);
  return {
    items,
    summary: `You got ${right} of ${total} right.`,
    next_steps: nextSteps.length ? nextSteps : ["Try a new set on this material."],
  };
}

export async function evaluateAnswers(sessionId: string): Promise<JobOutcome> {
  if (!isUuid(sessionId)) return "not_found";
  const session = await getSession(sessionId);
  if (!session) return "not_found";
  if (session.practice.status !== "ready") return "failed";

  const { results } = session;
  if (results.status === "ready") return "ready";
  if (!claimable(results.status, results.started_at)) return "busy";

  try {
    await updateSession(sessionId, (s) => ({
      ...s,
      results: { ...s.results, status: "working", started_at: new Date().toISOString(), error: null },
    }));

    const { graded, toMark } = appGraded(session);
    const ids = toMark.map((t) => t.item.question_id);
    const alreadyGraded: AlreadyGradedItem[] = graded.map((g) => ({ id: g.question_id, result: g.result, learner_answer: g.learner_answer }));
    const request = evaluateRequest({ toMark: toMark.map((t) => t.item), alreadyGraded });

    let problems: string[] = [];
    for (let tries = 1; tries <= MAX_TRIES; tries++) {
      try {
        const reply = await ai.ask({
          job: "evaluate_answers",
          instructions: EVALUATE_INSTRUCTIONS,
          parts: [{ text: request + (problems.length ? retryFeedback(problems) : "") }],
        });
        const parsed = checkEvaluation(parseJsonReply(reply.text), ids);
        if (parsed.ok && parsed.value) {
          const aiItems: AnswerResult[] = parsed.value.items.map((i) => ({
            question_id: i.question_id,
            learner_answer: session.answers[i.question_id] ?? "",
            result: i.result,
            feedback: i.feedback,
            graded_by: "ai",
          }));
          await updateSession(sessionId, (s) => ({
            ...s,
            status: "completed",
            results: {
              ...s.results,
              status: "ready",
              items: [...graded, ...aiItems],
              summary: parsed.value!.summary,
              next_steps: parsed.value!.next_steps,
            },
          }));
          return "ready";
        }
        problems = parsed.problems;
      } catch (e) {
        if (!(e instanceof AiError)) throw e;
        problems = ["The reply couldn't be used. Return only the JSON described."];
      }
    }

    // The AI couldn't produce a usable reply — finish with code-computed results.
    const fallback = fallbackResults(session, graded, toMark);
    await updateSession(sessionId, (s) => ({
      ...s,
      status: "completed",
      results: { ...s.results, status: "ready", ...fallback },
    }));
    return "ready";
  } catch (e) {
    const message = e instanceof AiError ? e.message : "Something went wrong while marking the answers.";
    await updateSession(sessionId, (s) => ({ ...s, results: { ...s.results, status: "failed", error: message } }));
    return "failed";
  }
}
