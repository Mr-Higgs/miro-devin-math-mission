# 009 — No grade level: the uploaded test decides

**Status:** Decided
**Date:** 2026-10-12
**Phase:** 0
**Supersedes:** [008](008-target-grade-level.md) (target 3rd grade)

## Question
Should the app be built for a specific grade level?

## Decision
**No.** Grade level is not part of the product. The app works from whatever graded test is uploaded. The questions, topics and difficulty come from that test, not from a grade setting.

## Why
- The core idea is to practice *exactly what was on the test*. The test already carries the grade level, so the app never needs to know it.
- The same app works for Gabe this year and next year, and for any family at public launch (see [001](001-launch-audience.md)), without per-grade work.
- 008 was decided on the assumption that question generation needs a per-grade template library. That assumption is now an open question (below), not a given.

## What this means
- **No grade field** in setup, accounts or the data model.
- **Test samples:** what matters is *variety* (different topics, formats, visuals, teacher marking styles), not a specific grade. Gabe's 3rd-grade tests this year are welcome as samples because they're new topics, not because the app targets 3rd grade.
- **Visuals:** practice sheets must handle whatever pictures appear on uploaded tests: base-ten blocks, place-value charts, arrays, fraction bars, number lines, shapes, graphs, and so on.
- **Spec §5's question-type list** becomes *examples* of what the app must handle, not the complete set.

## Open question this raises → question generation (resolved by [010](010-question-generation.md))
The backend doc (§8.2) plans **rule-based generation**: a hand-built template per question type. That only covers types someone has written templates for. That's fine for a fixed grade, but not for "whatever gets uploaded." Options to decide (proposed as decision 010):
1. **AI-generated variations, checked by code.** The AI writes the new version of each question plus its answer; the app independently checks the math before showing it. Handles any question type.
2. **Templates for common types, AI for everything else.** Most reliable on frequent types, flexible on the rest.
3. **Templates only** (backend doc as written). Most predictable, but limited to types someone has built.

## Affects
- **Decision 002:** sample priorities are variety, not grade.
- **Spec §5, backend doc §2.1 and §8.2:** reword grade-specific scope; generation approach pending 010.
