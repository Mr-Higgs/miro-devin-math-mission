# 008 — Target grade level

**Status:** Superseded by [009](009-no-grade-level.md) (same day)
**Date:** 2026-10-12
**Phase:** 0

## Question
Which grade's math should the first version of the app be built and tested for?

The spec (April 2026) was written for Gabe in **2nd grade**, and its question types (§5) come from a 2nd-grade place-value quiz. Gabe moved up to **3rd grade** in fall 2026. The backend doc's long-term scope is grades 1–5.

## Decision
**Target 3rd grade** for MVP. Grades 1–5 stays the long-term scope.

## Why
The app's first real user is Gabe, and his tests this year will be 3rd-grade material. Building for 2nd grade would mean the question generator doesn't cover what he actually brings home.

## What this means
- **New question types.** The generator must cover typical 3rd-grade topics. Confirm the exact list against Gabe's actual curriculum as his tests come in:
  - multiplication and division within 100, including fact families and arrays
  - addition and subtraction within 1,000
  - rounding to the nearest 10 or 100
  - fractions: unit fractions, number lines, comparing
  - area and perimeter
  - time and measurement
  - reading graphs
  - two-step word problems
- **New visuals.** Practice sheets must be able to draw arrays, fraction bars and circles, number lines, area grids and bar graphs, alongside the base-ten blocks and place-value charts from 2nd grade.
- **Spec §5 needs a rewrite.** Its 2nd-grade types (place value count, missing addend, number from clues, value of a digit, place-value chart) stay supported. Gabe's worksheets use Florida B.E.S.T.-style standard codes (e.g., `2.GR.2.2`, `2.NSO.2.2`), so 3rd-grade codes (`3.xxx`) are a useful way to organize the template library.
- **Test samples.** The existing 2nd-grade samples (001–003) still test the mechanics: photo handling, teacher marks, handwriting, grading rules. 3rd-grade graded tests are now the top need for decision 002, ideally including multiplication/division and fractions.
- **Tone and visuals.** The game style (Hologram HUD) was chosen for a 2nd grader. It probably still fits a 3rd grader, but check that it doesn't feel too young.

## Affects
- **Spec §5:** question types and randomization rules.
- **Decision 002:** sample collection priorities.
- **Backend doc §2.1:** "Supported math scope" (already lists grades 1–5; add that grade 3 is first).
- **Phase 2 build:** question generator and practice-sheet visuals.
