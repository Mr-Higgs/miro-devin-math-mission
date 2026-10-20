# Cost optimization

**Ideas for keeping the per-use cost of Math Mission low**, to grow over time and act on as we go. It feeds the open business-model decision ([004](decisions/README.md): free, free with limits, or paid; who covers AI costs).

**How to use this list**
- Add an idea any time: a row in [Ideas](#ideas) with status 💡.
- Before acting on one, measure it (usually with the benchmark: `npm run bench` in `web/` prints tokens in/out per run) and note the result.
- When it's done, record what it saved, and move it to [Done](#done).
- Never trade away accuracy blindly: a cheaper setting must keep benchmark accuracy, or the saving goes into [Rejected](#rejected-or-on-hold) with the reason.

**Status key:** 💡 idea · 🔬 measuring · ✅ done · ⏸️ on hold · ❌ rejected

**Last updated:** 2026-10-19

---

## Where the money goes today

| Item | Cost driver | Notes |
|---|---|---|
| **Reading a test** (extraction) | One Gemini 3.8 Flash call with every page | Benchmark 2026-10-19, 6 photos: about 7,400 input tokens (mostly the photos, about 1,100 each) and 9,200 output tokens, **most of it Gemini's "thinking"**. Output costs several times more per token than input |
| **Writing practice questions** (generation) | One small text call per missed question | 13 questions ≈ 12k input / 20k output tokens in total (2026-10-19) |
| **Grading the student's work** | One call per photo of the student's work | Not built yet |
| Hosting (Vercel), database and storage (Supabase) | Free tiers for now | Paid plans needed at public launch (see [007](decisions/007-tech-stack.md) watch-outs) |

Exact prices change; check Google's current Gemini pricing when estimating.

## Ideas

| # | Idea | Expected saving | Accuracy risk | Status | Notes |
|---|---|---|---|---|---|
| 2 | **Spend extra care only where needed**: graded tests (teacher marks + score to cross-check) use cheap settings; higher image detail and any second reading only for ungraded tests ([012](decisions/012-ungraded-tests.md)) | Medium | Low: graded tests have built-in checks | 💡 idea | Depends on 012 |
| 3 | **Record tokens used per session** (save input/output tokens with each AI call) so pricing is based on real numbers | None directly; makes every other decision measurable | None | 💡 idea | Small database addition (e.g. on `extraction_results`) |
| 4 | **Grow the benchmark with every new real test** | Avoids paying for settings that only looked good on one quiz | None | 💡 idea | Each new graded test of Gabe's → a sample |
| 9 | **Low thinking for generation** (writing practice questions): the app's math checks catch mistakes, so cheaper reasoning may be safe there | Large: output tokens drop ~70% | Low: math-checked | 💡 idea | Rejected for extraction (see below); measure with `npm run bench -- generation --thinking low` |
| 5 | **Lower image detail** (`mediaResolution` low/medium) for clean, well-lit photos | Input tokens per photo: 1,120 → 560 or 280 | High for faint pencil | 💡 idea | Only after measuring; faint pencil is the main weakness |
| 6 | **Don't re-send all pages for a second look**: if a re-check is ever added, send only the pages with the doubtful questions | Proportional to pages skipped | None | 💡 idea | Only relevant if a second look is built |
| 7 | **Cap pages and uploads per session/month** at public launch | Bounds worst-case cost per user | None | 💡 idea | Roadmap Phase 4 already lists per-user limits |
| 8 | **Batch generation**: write all practice questions in one call instead of one per question | Fewer repeated instructions (input tokens) | A bad question could affect others; retries get bigger | 💡 idea | Measure with the generation benchmark |

## Measurements

**Extraction settings, 2026-10-19** (Gemini 3.8 Flash, samples 001 + 004, per reading of a 6-photo test; `npm run bench -- extraction --repeat 2` with `--enhance`, `--detail`, `--thinking`):

| Setup | Accuracy | Input / output tokens | Time | Rough cost vs current |
|---|---|---|---|---|
| **Current: new prompt, default settings** (5 readings) | 100% on every measure | 7,400 / 9,200 | 58 s | baseline |
| Contrast boost (`--enhance`) | Student answers 93% (Q5 "138" read as "128") | 7,400 / 15,300 | 105 s | about +60% |
| Ultra image detail (`--detail ultra_high`) | 100% | 14,000 / 11,100 | 70 s | about +30% |
| Low thinking (`--thinking low`) | 92–95%: marked correct answers as missed | 7,400 / 2,500 | 17 s | about −65% |

Rough cost assumes output tokens cost several times more than input; check current prices.

## Done

| # | What | Saving | Date |
|---|---|---|---|
| – | Photos shrunk to 2400 px in the browser before upload | Smaller uploads and storage; photo tokens stay at the default ~1,100 | 2026-10-19 |
| – | Reading, rotation detection and score reading in **one** AI call (no separate calls) | Avoided 1–2 extra calls per test | 2026-10-19 |
| – | Math checks and score cross-checks done in **code**, not by the AI | No AI cost for checking | 2026-10-19 |

## Rejected or on hold

| # | What | Why |
|---|---|---|
| 1 | Low thinking for **extraction** | ❌ Rejected 2026-10-19: about 65% cheaper and 3× faster, but put correctly answered questions on the practice sheet (see Measurements). Kept as idea 9 for generation |
| – | Contrast boost on photos sent to the AI | ❌ Rejected 2026-10-19: slightly worse reading and about +60% cost. Code kept (`web/src/lib/ai/enhance.ts`, off) in case new photo types need it |
| – | Ultra image detail for extraction | ⏸️ On hold 2026-10-19: no gain over default on current samples, about +30% cost. Candidate for ungraded tests ([012](decisions/012-ungraded-tests.md) Q4) |
| – | Gemini Pro for extraction | ⏸️ On hold: costs several times more than Flash, and Flash reached 100% on both benchmark samples with the new prompt (2026-10-19). Revisit if accuracy drops on new tests |
