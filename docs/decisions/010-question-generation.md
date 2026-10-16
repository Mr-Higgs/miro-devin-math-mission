# 010 — Question generation

**Status:** Decided
**Date:** 2026-10-15
**Phase:** 0
**Raised by:** [009](009-no-grade-level.md)

## Question
How does the app turn the questions a student missed into a practice set?

## Decision

**What gets generated**
- **One practice question per missed question.** Questions the student got right are not included.
- **Same question, new numbers.** Each practice question keeps the original's wording, format (multiple choice, fill-in, choose-all) and type of picture. Only the numbers inside it change.
- **Same order** as the original assignment. Questions are not shuffled.

**How the new numbers are chosen**
- **The AI rewrites each missed question with new numbers, and the app checks the math** before the question is used.

Example from [sample 001](../../test-data/graded-tests/001-topic10-place-value-quiz/), Q10:

| | Question | Answer |
|---|---|---|
| Missed | Which is the value of the 8 in the number 287? (A) 800 (B) 80 (C) 10 (D) 8 | B |
| Practice | Which is the value of the 5 in the number 352? (A) 500 (B) 50 (C) 10 (D) 5 | B |
| App check | 5 is in the tens place of 352 → 5 × 10 = 50 | ✔ |

## Options considered
1. **AI swaps numbers, app checks.** Works on any question, including types nobody planned for. *Chosen.*
2. **Pre-built rules only** (backend doc §8.2 as written). Very predictable, but a question type without a hand-written rule gets no practice version. Doesn't fit [009](009-no-grade-level.md) (the uploaded test decides what appears).

## Why
- Since 009, the app has to handle whatever is on the uploaded test. Only option 1 does that without building rules first.
- The AI already has to understand each question to extract it, so rewriting it is a small extra step.
- The app's own math check means a wrong answer key never reaches the student, even if the AI makes an arithmetic mistake.

## Rules for a good practice question
The new numbers must:
- **Keep the same skill.** If the original needed regrouping across a zero (308 − 10), the new one must too (e.g., 507 − 10), not an easy one like 358 − 10. This matters because the missed skill is the whole point (see the [tutoring session](../../test-data/tutoring-sessions/README.md): Gabe's misses were all regrouping across zero).
- **Keep the same size.** Same number of digits, same kind of numbers (whole numbers, money, measurements).
- **Have a valid answer.** No negative results, no impossible problems (spec §4.3).
- **Multiple choice:** keep the original's pattern of wrong choices (e.g., digit only, wrong place value), with exactly one correct answer.
- **Choose-all questions:** the same number of correct choices as the original.
- **Clue questions** ("It has 7 hundreds…"): the clues must lead to exactly one answer.
- **Pictures** (base-ten blocks, charts, shapes with side lengths) are redrawn to match the new numbers.
- **Names and objects in word problems stay the same** (Lucy, rubber bands). Only the numbers change.

## What happens when the check fails
1. The app asks the AI for a new version, up to a few retries.
2. If it still can't produce a version that passes the check, the question is flagged for the tutor during review, who can edit it by hand or keep the original numbers.

## What this means
- **Tutor review** shows each original missed question next to its practice version, with **Regenerate** (new numbers) and **Edit** buttons.
- **Questions with no numbers to change** (e.g., "Does this shape have a line of symmetry?") can't be varied by swapping numbers. For now they're reused as-is, flagged for the tutor. Revisit if this comes up often.
- **The answer key** (correct answer + worked steps) is produced alongside each practice question and covered by the same check.
- **Decision 002 benchmark** should also score generation: does each model keep the same skill and pass the check on the first try?

## Affects
- **Backend doc §8.2:** replace "rule-based generation" with AI generation + app check; §3 data model: Question Template / Question Type Metadata become validation rules rather than generators.
- **Spec §4.3:** keep the rules above; drop "Word problem character names … can optionally be varied."
- **Decision 002:** add generation to the benchmark.
- **Phase 2 build:** generation step, math checker, tutor review screen (Regenerate / Edit).
