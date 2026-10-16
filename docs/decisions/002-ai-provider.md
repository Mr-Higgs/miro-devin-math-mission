# 002 — AI provider and model

**Status:** Decided (amended 2026-10-16, see Amendment 1)
**Date opened:** 2026-10-12
**Phase:** 0

## Question
Which AI provider and model(s) should Math Mission use for its two AI jobs?
1. **Extraction:** read a photographed graded test and find the missed questions.
2. **Grading:** read a photo of the student's handwritten practice work and decide pass / redo / needs tutor check (see [003](003-grading-model.md)).

## Prior positions
- Spec (§6.2): Claude, `claude-sonnet-4-6`.
- Backend doc (§8.3): GPT-4o primary, Gemini 1.5 Flash as a cheaper alternative.
- Both are dated. Choose from current models at benchmark time.

## How we'll decide
Run each candidate on the same samples and compare against hand-checked answers in `test-data/`.

**Candidates:** the current flagship and low-cost vision models from Anthropic, OpenAI and Google, checked for current pricing when the benchmark runs.

**Extraction scoring (per question):**
- Found the question at all
- Missed vs. correct identified correctly (most important; spec target ≥85%)
- Student's answer read correctly
- Question text and type correct

**Grading scoring (per photo of student work):**
- Pass / redo correct
- "Work shown" judged correctly
- Says "needs tutor check" when it should, and doesn't auto-fail borderline work

**Generation scoring (per missed question, see [010](010-question-generation.md)):**
- New version keeps the same skill, size and format
- Passes the app's math check on the first try

**Also compare:** cost per session, speed, data terms for children's photos: **must not train on uploads, and keep them as briefly as possible** (required by [006](006-upload-retention.md)).

## Samples

| Set | Have | Need |
|---|---|---|
| Graded tests (extraction) | 1: [001 Topic 10 place-value quiz](../../test-data/graded-tests/001-topic10-place-value-quiz/) (verified) | 10–15, with **variety**: different topics, formats, visuals and marking styles (see [009](009-no-grade-level.md)) |
| Student practice work (grading) | 10 photos, ~30 answered items: [002 perimeter/symmetry](../../test-data/student-work/002-topic13-perimeter-symmetry/), [003 subtract 10/100](../../test-data/student-work/003-topic11-subtract-10-and-100/) (not yet verified) | Verify the answers; a few more "right with work" examples |
| Real tutoring session | 1: [2026-04-06 Chapter 11](../../test-data/tutoring-sessions/) | Reference only |

## What sample 001 already shows
These findings affect the plan regardless of which model wins:

1. **Tests are multi-page.** One 10-question quiz took 6 photos. The backend doc assumes single-page uploads for MVP (§2.2), so that needs to change: one assignment = several photos.
2. **Photos come in upside down.** 5 of 6 were rotated 180°. The pipeline needs auto-rotation, or a model that handles it.
3. **Photos overlap.** Photo 2 also shows part of the next page. Extraction must not count Q4 twice.
4. **Teacher marks are subtle.** No ✗ marks. Wrong answers are shown by a blue circle on the *correct* choice, "-1", and a check. The student's own marks are in pencil. The model has to tell teacher pen from student pencil.
5. **Pictures carry the question.** Base-ten blocks, bundles of 100 and place-value charts. Extraction must describe them, and the practice generator must be able to *draw* them.
6. **Formats beyond simple multiple choice:** "choose all that apply" (with partial credit) and fill-in.
7. **Most questions are multiple choice, with no work to show.** This conflicts with 003's "right answer + work shown" rule. See the open issue below.
8. **Missed types match the spec.** The missed questions (missing addend, number from clues, place-value chart, value of a digit) are exactly the spec §5 types, so the spec was written from this quiz. More samples from other topics are needed to cover the backend doc's broader list (add/subtract/multiply/divide, rounding).

9. **Partial credit exists.** The "55" score is 55%: 5 right + ½ credit on a choose-all question.

## What samples 002, 003 and the tutoring session add
1. **Gabe often writes answers without work,** even when right (sample 003). A strict "work shown" rule would fail correct answers.
2. **Work and answer can disagree** (sample 002 photo 6: work shows 21 and 7+7+7, answer says 9 cm). The grader must flag this as "needs tutor check."
3. **Retries sit next to crossed-out first attempts.** Grade the final answer.
4. **Unanswered questions** must be skipped, not marked wrong.
5. **Digital ink.** Real sessions use a tablet, so uploads must accept PDFs and screenshots, not just phone photos.
6. **Invented spelling** in written explanations ("ekwolsisol"). The grader must read for meaning.

## Open issue raised for 003 (resolved)
If a practice question is multiple choice, what does "work shown" mean? **Resolved by [003 Amendment 1](003-grading-model.md#amendment-1--2026-10-12-when-work-is-required):** work is required only where the question asks for it.

## Round 1 (in progress, started 2026-10-15)
Approach chosen: run a first round now on the samples we have, then confirm as this year's tests come in.

- **Benchmark script:** [`benchmark/`](../../benchmark/README.md). Sends the samples to each model and scores the replies. Photos are stripped of metadata first.
- **Candidates** ([`benchmark/models.json`](../../benchmark/models.json)): Claude Opus 5.5, Sonnet 5.5, Haiku 5.5; OpenAI and Gemini models from web research (IDs to confirm with `npm run list-models`).
- **Correct answers:** sample 001 verified; samples 002 and 003 have `expected.json` files awaiting the tutor's check (scored separately as "unverified" until then).
- **Not yet tested:** generation (010).
- **Waiting on:** API keys from the tutor; verification of the ❓ items.

### Round 1a results: Google only (2026-10-15)
Only a Google key was available, so Claude and OpenAI are not tested yet. One run each; small sample. Treat as directional, not final.

| Model | Missed questions found | Missed precision | Student answers read | Grading (all items verified) | Wrongful redos | Blanks skipped | Avg time/call |
|---|---|---|---|---|---|---|---|
| Gemini 3.1 Pro (preview) | 20% | 50% | 40% | 78% | 2 | 95% | 17.8 s |
| **Gemini 3.8 Flash** | **100%** | **100%** | **100%** | 74% | 2 | 95% | 19.9 s |

Both runs used about 24k input tokens and ~5k output tokens per model (cost: cents).

**What happened:**
- **Reading the quiz:** Flash got every question right, including the ½ credit on Q9. Pro fell into the teacher-mark trap: it read the teacher's blue circle on the *correct* choice as the student's answer, so it thought Gabe got Q2, 7, 8 and 10 right. It also misread 138 as 128.
- **Shared grading mistakes (both models):**
  - **Faint or drawing-only answers came back as "skipped"** (sample 002 photo 4, Q4 and Q5; photo 1, Q5) instead of redo or needs check. The grading prompt should say that any marks in the answer area mean "needs check," never "skipped."
  - **Starburst (photo 3, Q4):** both said redo, which follows decision 003's rule for "Explain" questions. The tutor marked it correct, so the rule itself is in question (see the open issue in [sample 002](../../test-data/student-work/002-topic13-perimeter-symmetry/README.md)).
  - **Photo 4, Q6:** both models read a "D" that the answer key records as blank. The answer key may be wrong; tutor to check.
- **Other:** Pro marked the 9 cm / 7 cm conflict (photo 6) as pass, reading "7 cm"; Flash correctly flagged it for the tutor. Flash missed one circled "Yes" (photo 2, Q1).

**Takeaways so far:** Gemini 3.8 Flash is a strong candidate. The teacher-mark trap is the key extraction risk, exactly as sample 001 predicted. One run on one quiz isn't enough to rule Pro out.

**Next:** fix the "skipped" wording in the grading prompt, resolve the two answer-key questions, repeat runs to check consistency, and add Claude and OpenAI.

### Round 1b results: Google, 3 runs each (2026-10-15)
Changes since 1a: grading prompt now counts drawings as work and allows "skipped" only when there are no marks at all; answer key corrected (starburst = pass, Gabe explained by drawing a line; photo 4 Q6 = Gabe marked D); thinking tokens now counted.

| Model | Missed questions found (3 runs) | Student answers read | Grading | Wrongful redos | Est. cost (3 runs) |
|---|---|---|---|---|---|
| Gemini 3.1 Pro (preview) | 80%, 20%, 20% | 30% | 88% | 3 | ~$1.15 |
| **Gemini 3.8 Flash** | **100%, 100%, 100%** | 97% | 88% | 3 | ~$0.35 |

Cost estimates use per-token prices from secondary sources (Pro $2/$12, Flash $0.75/$3.75 per million in/out); check the Google billing page for actuals.

**Findings:**
- **Gemini 3.1 Pro is out for extraction.** It fell into the teacher-mark trap in all 3 runs, reading the teacher's blue circle on the correct choice as the student's answer. It would have left most missed questions off the practice sheet.
- **Gemini 3.8 Flash is consistent.** It found every missed question in all 3 runs. Its only error was one false alarm (misread 138 as 128 once), and it caught the partial credit in 2 of 3 runs.
- **Grading is tied at 88%.** The remaining errors are mostly about **faint marks**:
  - **Starburst:** both models missed Gabe's faint drawn line in all 3 runs, so each marked it redo. These 3 runs are the 3 "wrongful redos."
  - **Faint circled choice** (photo 1, Q5): Flash called it "skipped" every time; Pro usually flagged it for the tutor.
  - **Starred questions** (sample 003, Q24 and Q26): Flash flagged them for the tutor every time because of the stars on the page. That's harmless. If the stars are the tutor's, "needs check" is a reasonable answer there.
  - **Pro passed the 9 cm / 7 cm conflict** in 2 of 3 runs, which is a wrongful pass. Flash flagged it.
- **Product implication:** faint pencil is the main grading weakness for every model tested so far. The "needs tutor check" result and one-tap override (decision 003) are essential, and the upload screen should nudge for good lighting.

**Standing (Google only):** Gemini 3.8 Flash is the leading candidate. Decision still waits on Claude and OpenAI.

## Decision
**Google Gemini 3.8 Flash** (`gemini-3.8-flash`) for all three AI jobs: extraction, grading and generation. Decided by the tutor on 2026-10-15 after rounds 1a and 1b.

Claude and OpenAI were **not** tested; the tutor chose not to run them. The benchmark is in place, so they (or newer Gemini models such as `gemini-4-argon`, which the account lists) can be compared later at low cost.

## Why
- **Reads graded tests reliably:** found every missed question in 4 of 4 runs and avoided the teacher-mark trap that sank Gemini 3.1 Pro.
- **Grading as good as Pro** (88%), and safer: it flagged the work/answer conflict for the tutor instead of passing it.
- **Cheap and fast:** about $0.11 per full benchmark run (1 graded test + 10 homework pages), ~19 s per call.
- **Billing already set up** on a paid Google project, which is what decision 006 requires.

## What this means
- **Cost per session:** roughly $0.05–0.15 at today's prices (one extraction, one generation per missed question, one or two grading uploads). Secondary sources say Flash's introductory price doubles on 2027-01-01 ($1.50 / $7.50 per million in/out), so plan for ~$0.10–0.30.
- **Faint pencil is the known weakness.** Keep "needs tutor check" and one-tap override (003) prominent, and nudge for good lighting on the upload screen.
- **Generation (010) is still untested.** Add a generation test before building that step in Phase 2.
- **Privacy:** use only the paid tier (no training on data). Before stage 2, confirm Google's API terms for children's data as part of the COPPA review.

## Revisit if
- Accuracy drops on new samples (re-run `npm run bench` as Gabe's tests come in), especially missed questions not found
- Google changes pricing or data terms
- A newer Gemini model appears; test it with `--models`

---

## Amendment 1 — 2026-10-16: Google's terms on minors

**Finding.** [Google's Gemini API terms](https://ai.google.dev/gemini-api/terms) (updated 2026-04-28) say users must be 18+ and that the API won't be used in a service *"directed towards or is likely to be accessed by individuals under the age of 18."* This wasn't considered when Gemini was chosen. (Flagged by an October 12 plan in another folder; checked against Google's page on 2026-10-16.)

**Response.** Gemini 3.8 Flash stays the choice, with the app designed as **adult-only** in [decision 011](011-adult-only-audience.md): 18+ confirmation at sign-up, no student accounts, adult-facing screens, printable rather than on-screen student rewards, and feedback written for the adult.

**What changes**
- **Legal review moves earlier:** Gemini's terms and COPPA are reviewed **before the invite-only launch** (Phase 3), not only before the public launch.
- **Backup:** if the review says Gemini isn't allowed, switch providers (one setting). Run the benchmark on Claude first. [Anthropic's guidelines for organizations serving minors](https://support.claude.com/en/articles/9307344) allow it with safeguards. OpenAI's under-13 data rules are the strictest of the three.
- **Disclosure:** this analysis was written with Claude, which is made by Anthropic. It sticks to each company's published wording. Not legal advice.
