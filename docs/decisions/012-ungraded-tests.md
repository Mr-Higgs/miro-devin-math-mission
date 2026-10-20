# 012 — Ungraded tests

**Status:** Open (proposed design below; needs the tutor's choices on Q1–Q4)
**Date:** 2026-10-19
**Phase:** 2
**Raised by:** the tutor, after testing extraction on phone photos

## Question
Can the adult upload a test or worksheet **nobody has graded yet**, and have the app work out the right answers, read the student's answers, and decide which were missed?

Today the app relies on the teacher's marks: what the teacher marked wrong decides the practice set, and the score on the paper lets the app check its own reading. An ungraded test has neither, so:
- the student's **faint pencil** is the only evidence of what they answered (no teacher marks to fall back on);
- the **correct answers** must come from the app, not the teacher;
- the "score doesn't add up" cross-check can't run.

## Proposed design

**Q1. How does the app know a test is ungraded?**
1. *Recommended:* **it notices by itself.** While reading the test, the AI reports whether there are teacher marks or a score. Step 2 then says "This test hasn't been graded, so the app worked out the answers." The adult can switch it if the app got this wrong. Nothing extra to choose at upload, which matches the tutor's "no extra steps" preference (see the rotate-button discussion, 2026-10-19).
2. The adult chooses "Graded by the teacher / Not graded yet" at upload. Clearer, but one more thing to answer every time.

**Q2. Where do the correct answers come from?**
*Recommended:* **the AI works them out, and the app checks the math**, reusing the checks already written for practice questions ([010](010-question-generation.md), `web/src/lib/checks/`). For each question the AI gives its answer *plus* a calculation the app can verify itself (e.g. `1000 - 400`, or the clues of a "what is the number?" puzzle). Answers the app can't verify, such as symmetry, explanations and drawings, are marked **"needs your check"**, never silently trusted.

**Q3. Who decides if the student's answer is right?**
*Recommended:* **the app, in code, where it can**: comparing the student's multiple-choice letter or number with the verified correct answer is exact and free. The AI judges only open answers (explanations, "show your work"), following [003](003-grading-model.md): unsure → "needs your check", feedback written for the adult.

**Q4. How much extra care for the faint pencil?**
Ungraded tests depend entirely on reading the student's pencil, so they need the most accurate reading settings (contrast boost, more image detail; see the benchmark of 2026-10-19). Options, cheapest first:
1. Same settings as graded tests.
2. Higher detail and contrast boost for ungraded tests only.
3. Also read ungraded tests twice and compare, taking a third look where the two disagree (about double the cost).
*Recommendation:* 2, then 3 only if the benchmark shows it's needed.

## Cost (decision 004 is still open)
- Reading + solving + checking happens in **the same single AI call** as today. The checks and the multiple-choice/number grading are code, so they're free.
- Extra cost comes only from the Q4 choice (more image detail ≈ double the photo tokens; a second reading ≈ double the call).

## What this means if adopted
- **Step 1 (upload):** unchanged with Q1-1; one extra question with Q1-2.
- **Step 2:** a banner saying the answers were worked out by the app; "needs your check" flags on answers the app couldn't verify; the same one-tap fixes as today.
- **Prompt:** the extraction prompt also solves each question and returns a check, and reports whether the test was graded.
- **Database:** `assignments.graded_by` (`teacher` / `app`); per question, where the correct answer came from and whether the app verified it. Migration + privacy tests as usual.
- **Benchmark:** the student-work samples (002, 003) are ungraded practice pages with known right answers, so they can test this mode from day one. More ungraded tests should be added as they come in.

## Affects
- **Spec v1.1:** §3 steps 1–2 and §4.1–4.2 (add the ungraded path). Spec is a Word file; update after the tutor confirms this decision.
- **Backend doc:** §3 data model (fields above), §8.2 extraction prompt, §3.3 flow.
- **Site map:** Step 2 and the "Read the test" capability (listed under Proposed changes).
- **Roadmap:** Phase 2 item, after Step 2's review tools.
- **[003](003-grading-model.md), [010](010-question-generation.md):** reused, not changed.
