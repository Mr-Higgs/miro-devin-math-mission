# 003 — Grading model

**Status:** Decided (amended 2026-10-12 and 2026-10-16, see Amendments 1 and 2)
**Date:** 2026-10-12
**Phase:** 0

## Question
In the review session, who decides whether each practice question is a pass or a redo, and what counts as a pass?

The sources disagreed:
- **Spec (§3 step 5, §4.5):** the tutor marks Correct or Redo; a tutor is always present.
- **Backend doc (§2.1, §8.2):** AI grades photos of the student's work; the tutor can override.
- **Wireframe feedback:** the review screen shows the student's uploaded work next to a pass/fail result.

## Options considered

**Who grades**
1. **AI suggests, tutor confirms.** AI pre-fills pass/fail; the tutor confirms each one.
2. **Tutor grades only.** The photo is shown for reference; no AI grading.
3. **AI grades, tutor can override.** The AI's result stands unless the tutor changes it.

**What counts as a pass**
1. Right answer + work shown.
2. Right final answer only.
3. Right answer + every step correct.

## Decision
- **AI grades, tutor can override** (option 3).
- **Pass = right answer + work shown** (option 1). The grader checks that work is present, not that every step is perfect. *Narrowed by Amendment 1: work is required only where the question asks for it.*

## Why
- Fastest session flow: results appear as soon as the work is uploaded, with no tapping through each question.
- Matches the backend doc's design and the wireframe feedback (pass/fail shown automatically next to the student's work).
- Leaves room for a future mode where the student works without the tutor at their side.
- "Answer + work shown" keeps the spec's habit-building rule without asking the AI to judge every handwritten step.

## What this means
- **AI grading accuracy becomes critical.** A wrong grade goes straight to the student unless the tutor catches it. Decision 002 (AI provider) must benchmark **grading** on photos of real student work, not only extraction from graded tests. Proposed bar: set alongside the spec's ≥85% extraction target when 002 is written.
- **When unsure, the AI defers.** If the AI can't read the work or isn't confident, the result is **"Needs tutor check"** instead of pass or fail. A wrong "fail" is more discouraging for a 2nd grader than a wrong "pass," so borderline cases shouldn't auto-fail.
- **Override must be quick and fully reversible.** One tap changes the result and adjusts stars and progress. If an override turns a pass into a redo, it removes the star without a negative animation.
- **Grading prompt changes.** The backend doc's §8.2 prompt says to "look for the final answer, not intermediate steps." It must be updated to also check that work is shown, and to return the "unclear" result above.
- **Redo flow (adapting spec §4.5):** fail → hint shown → student retries on paper → re-uploads → AI grades again. Pass on the retry = +0.5 star (per spec). The tutor can still choose "Move on."
- **Fallback.** If the AI service is down, the tutor grades by hand with the same Correct/Redo buttons.

## Affects
- **002 AI provider:** the benchmark must include grading student work.
- **Spec §3 step 5 and §4.5:** update from tutor-marked to AI-graded with override.
- **Backend doc §8.2:** grading prompt (work-shown check, "unclear" result).
- **Backend doc §4.4:** `PATCH /progress` override already exists; also add a "needs_check" status alongside correct / pending / redo.
- **Phase 2 build:** review screen, Redo/retry upload flow, star adjustments on override.

---

## Amendment 1 — 2026-10-12: when work is required

### What changed
The pass rule now depends on what the question asks for:

| Question type | Passes when |
|---|---|
| Asks to **"Show your work"** or **"Explain"** | Right answer **and** work or explanation shown |
| Plain **fill-in** or **multiple choice** | Right answer alone |
| **Choose all that apply** | All correct choices and no wrong ones. Partial = redo (matches the teacher's ½ credit in sample 001) |
| **Work and answer disagree** (any type) | Neither pass nor fail: **"Needs tutor check"** |

### Why
Real samples (see [002](002-ai-provider.md) and [test-data](../../test-data/README.md)) showed:
- Most school questions are multiple choice or short fill-in, with nothing to show (sample 001).
- The student often writes only the answer even when right (sample 003: 250 − 10 = 240). The original rule would fail correct answers, which is discouraging and doesn't match how his teacher grades.
- Sometimes the work shows the right idea and the written answer is wrong (sample 002, photo 6: work shows 21 and 7+7+7, answer says 9 cm). That calls for the tutor's judgment, not an automatic fail.

### What this means
- **Generated practice questions carry a `requires_work` flag**, copied from the original question ("Show your work" / "Explain" wording) or set by the tutor during review. The grading prompt receives this flag.
- **The tutor can change the flag** per question during extraction review, e.g., to require work on a question the student keeps guessing on.
- **Grading prompt (backend doc §8.2)** must: read the final answer, ignoring crossed-out attempts; check for work only when `requires_work` is true; return "unclear" when the work and answer conflict; skip unanswered questions instead of failing them.
- **Resolves the open issue** raised in 002 about multiple-choice questions and work shown.
- **Clarification (2026-10-15): drawings count as work.** Work or an explanation can be written words or numbers, or drawings and marks on the figure, even faint ones. Example: the student explained a symmetry answer by drawing a dotted line down the center of the shape ([sample 002](../../test-data/student-work/002-topic13-perimeter-symmetry/README.md), photo 3, Q4). The grader must look for these, and never treat a question with any student marks as "skipped."

---

## Amendment 2 — 2026-10-16: feedback is for the adult

Per [decision 011](011-adult-only-audience.md), grading feedback is written **to the adult**, not to the student. For example: "614: likely added instead of subtracting; review regrouping across zero." The adult decides what to say to the student. The grading prompt's `feedback` field changes from "one encouraging sentence for the student" to "a short note for the adult." Celebrations and stars move to printable rewards (011).
