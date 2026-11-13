# Prompts

Every instruction the app gives the AI lives here, one file per job (decision 007, "Built for change"). The app and the benchmark both read these files, so there's only one copy of each prompt.

| File | Job | Status |
|---|---|---|
| `extraction.ts` | Read photos of a graded test and list every question | Benchmarked (002) |
| `second-look.ts` | When a student answer wasn't found, look again at just that question's photo (2026-10-20) | Tested on the faintest mark in sample 004: 3/3 |
| `grading.ts` | Grade the student's finished work from a photo | Benchmarked (002, 003) |
| `generation.ts` | Write one mirrored practice question per missed question, with a check the app can work out (010) | Benchmarked 2026-10-19 |
| *hints* | Hints for the adult during review | Phase 2 |

## Changing a prompt
1. Edit the text between the backticks.
2. Run the benchmark from `docs/web/`: `npm run bench -- --models gemini-3.8-flash`
3. Compare with the last run in `docs/web/benchmark/results/`. Don't ship a change that does worse.

Wording rules: feedback is written for the adult, never addressed to the student (decision 011). Never ask the AI to repeat names, schools or other personal details.
