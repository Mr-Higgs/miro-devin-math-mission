# Math Mission: Backend Planning Document

**Project:** Math Mission  
**Status:** In Progress  
**Last Updated:** 2026-10-15  
**Audience:** miapen (product/builder) + future technical co-founder

> **October 2026 update:** revised to match the decision log ([docs/decisions/](decisions/README.md), decisions 001–011). Where this doc and a decision disagree, the decision wins. Main changes from the April draft: invite-only logins instead of a static API key, multi-page uploads, AI-generated practice questions with a math check (instead of rule-based templates), new grading rules, photo deletion, and the tech stack (Next.js + Supabase + Vercel). Sections 5, 6, 9 and 10 are now written.

---

## 1. Executive Summary

There are students who are at real risk of falling behind in math — not because they can't learn it, but because they aren't getting enough targeted practice on the specific concepts they're struggling with. The people who care most about helping them are often not professional teachers. They're parents, older siblings, tutors, and after-school program volunteers: people with the motivation to help but not always the time, tools, or confidence to do it consistently.

When one of these students gets a graded test back with wrong answers, the right move is more practice on exactly those problems. But producing that practice set is where the system breaks down. The casual educator faces two bad options: search online for math problems and hope they're relevant to what the student is actually being tested on in class — low confidence, often a mismatch — or create the questions manually, which works once but is too much effort to sustain week after week. The result is that follow-up practice either doesn't happen or happens inconsistently, and the gaps compound over time.

Math Mission solves this by turning a graded assignment directly into a personalized practice session. The educator photographs or uploads the graded test, the app uses AI to identify the wrong answers, and creates a fresh version of each missed question — same wording and format, new numbers — rooted in the student's actual classwork, not generic internet searches. The student works through them on paper, the educator uploads photos of the work, and the AI grades it right away. No manual question creation. No guessing what to practice.

The impact is two-sided. For the educator, it means being able to show up consistently and confidently — knowing the practice content is directly relevant to what their student is being tested on, without spending hours creating it. For the student, it means more repetitions on the concepts they actually missed, graded in real time, without waiting on anyone. The gap between "got it wrong on the test" and "practiced it enough to get it right next time" gets meaningfully smaller.

The app has no grade-level setting: whatever is on the uploaded test decides the topics and difficulty ([decision 009](decisions/009-no-grade-level.md)). Launch happens in two stages ([decision 001](decisions/001-launch-audience.md)): first **invite-only** for the student and a few trusted families, then **open to the public**. The project is done when the app is publicly available. One graded assignment equals one focused practice session.

---

## 2. MVP Scope & Core Assumptions

### 2.1 What's In (MVP)

**Core workflow — the happy path:**
- Educator uploads a graded math assignment: one or more phone photos, a PDF, or tablet screenshots. Multi-page tests are supported.
- AI extracts every question (text, format, answer choices, pictures, the student's answer, the teacher's marking including partial credit) and identifies which ones the student missed
- Educator reviews the extraction, corrects errors, and can mark any question as "work required"
- App creates **one practice question per missed question**: same wording, format and order, new numbers. The AI rewrites each question and the app checks the math before it's used ([decision 010](decisions/010-question-generation.md))
- App produces a printable practice sheet (letter size, space to show work) and an answer key with worked steps
- Student works the practice sheet on paper or a tablet; the educator uploads photos or a PDF of the work
- AI grades each question as **pass**, **redo** or **needs tutor check**; the educator can override any result ([decision 003](decisions/003-grading-model.md))
- Review session (adult-facing): grading notes, hints, redo with re-upload, Bonus Round, session summary; student rewards are **printable** (certificate, star chart) rather than on-screen ([decision 011](decisions/011-adult-only-audience.md))

**Supported math scope:** Whatever is on the uploaded test; no grade setting ([009](decisions/009-no-grade-level.md)). All samples so far are elementary math.

**Submission type:** Photos, PDFs or screenshots of handwritten work, on paper or in tablet ink. No typing required.

**Users:** adults only (18+): parents, guardians, tutors, teachers, mentors ([decision 011](decisions/011-adult-only-audience.md)). **Students never use, log in to, or operate the app**; the adult takes the photos and runs the session.
- **Stage 1 (invite-only):** the student's tutor plus a small group of invited adults. Each has their own login, confirms they're 18+, and their data is private to them.
- **Stage 2 (public):** open sign-up, with the same 18+ confirmation.

**Session model:** One graded assignment = one session. Text and results from past sessions are kept ([006](decisions/006-upload-retention.md)), but there are no cross-session analytics yet.

---

### 2.2 What's Out (Future Versions)

These are intentional cuts for MVP — not oversights. Each is a real feature that will matter, but adding them now would delay getting something working and testable.

- **Open public sign-up at stage 1** — stage 1 is invite-only; open sign-up comes at stage 2 ([001](decisions/001-launch-audience.md)).
- **Payments** — business model is undecided (decision 004, deferred to stage 2).
- **Student-facing app** — in MVP, the educator manages the device and workflow. A separate student-facing experience (independent login, their own view) is a v2 feature.
- **Cross-session analytics** — past results are kept, but there are no dashboards or progress tracking across assignments yet.
- **Problem area pattern detection** — questions are tagged by type, but no analytics surface is built on top of it in v1.
- **Non-math subjects** — reading, science, history are all out of scope. Math only.
- **Varying names and objects in word problems** — only the numbers change ([010](decisions/010-question-generation.md)).
- **Mobile app** — MVP is a web app that works on phones. A native iOS or Android app is a future consideration.
- **Typed answer submission** — work is submitted as photos, PDFs or screenshots, which most closely mirrors real tutoring.

---

### 2.3 Key Assumptions

These are the things we're treating as true for MVP. If any of these turn out to be wrong, the scope or design may need to revisit.

**On the educator:**
- The educator (the tutor or parent) is present to review AI extraction results before a session begins. Human review is a feature, not a gap.
- The educator has a phone or tablet capable of photographing the graded assignment clearly enough for AI to read.

**On the AI:**
- Google Gemini 3.8 Flash ([decision 002](decisions/002-ai-provider.md)) can extract printed and handwritten math questions from phone photos — including upside-down, crumpled and overlapping pages — well enough that educator review catches the rest. Target: ≥85% of missed questions correctly identified.
- The same model can grade photos of handwritten or tablet-ink work, including invented spelling, well enough that the "needs tutor check" result catches the uncertain cases.
- The model can rewrite a question with new numbers while keeping the same skill. The app's math check catches mistakes in the answer key.

**On the student:**
- The student's handwriting is legible enough for AI to read most of the time. Very messy handwriting goes to "needs tutor check."
- When the tutor and student write on the same page, the student's ink is distinguishable (e.g., a different color), or the tutor uploads a page only the student wrote on.

**On the product:**
- One graded assignment per session is the right granularity. The educator doesn't need to blend multiple tests into one session.
- Stage 1 needs to work reliably for a few families, not look polished for strangers. Stage 2 needs onboarding, clear errors and a landing page.

---

## 3. Data Model

The data model is designed around the core workflow: educator uploads a graded assignment → app extracts missed questions → app generates a new version of each → student works them → AI grades the work. It lives in Supabase Postgres ([007](decisions/007-tech-stack.md)); every change is a migration file in the repo.

### 3.1 Core Entities (MVP)

**1. User (educator)**
- The tutor or parent who logs in. Managed by Supabase Auth.
- Fields: user_id, email, invited_by, created_at, age_confirmed_at (18+ confirmation), terms_accepted_at
- There is no student user. The student is only a nickname on the Assignment ([011](decisions/011-adult-only-audience.md)).
- Every other record belongs to one user; users can only see their own data.

**2. Assignment**
- The original graded test the educator uploaded.
- Fields: assignment_id, user_id, student_nickname (entered by the tutor — never the real name from the paper), assignment_name, upload_date, extraction_status (pending, processing, done, failed), extraction_started_at, extraction_error
- *Proposed ([012](decisions/012-ungraded-tests.md)):* graded_by (teacher, app) for tests nobody has graded yet

**3. Assignment Page**
- One uploaded photo, PDF page or screenshot of the assignment. A quiz may have several.
- Fields: page_id, assignment_id, page_order, file_path, file_type, uploaded_at, deleted_at, rotation (0/90/180/270, reported by the AI so pages are shown upright)
- The file itself is deleted under the retention rules (§3.4); the row stays with `deleted_at` set.

**4. Extraction Result**
- The AI's reading of the whole assignment.
- Fields: extraction_result_id, assignment_id, model_used, extraction_confidence, notes (e.g., "Q4 appears on two photos; counted once"), score_as_written (the total the teacher wrote, used to cross-check the reading)

**5. Question (from Assignment)**
- One question as it appeared on the original test.
- Fields: question_id, assignment_id, question_number, original_question_text, format (multiple_choice, multiple_select, fill_in, open_response), choices (JSON), picture_description, question_type, student_answer, correct_answer, points_possible, points_earned (supports partial credit), marked_correct, requires_work, confidence
- `requires_work` is copied from "Show your work" / "Explain" wording and can be changed by the tutor ([003 Amendment 1](decisions/003-grading-model.md#amendment-1--2026-10-12-when-work-is-required)).

**6. Session**
- One tutoring workflow for one assignment.
- Fields: session_id, assignment_id, session_status (in_progress, completed), started_at, last_updated, completed_at
- `completed_at` triggers photo deletion.

**7. Generated Question**
- The practice version of one missed question.
- Fields: generated_question_id, session_id, question_id, position (same order as the original), question_text, choices (JSON), picture_spec, correct_answer, steps_to_solve, hint, requires_work, check_status (passed, flagged, tutor_edited), generation_attempts
- The answer key is built from these rows; there's no separate answer key table.

**8. Student Submission**
- One upload of the student's work. A single photo of the practice sheet can cover several questions.
- Fields: submission_id, session_id, attempt_number, uploaded_at

**9. Submission Page**
- One photo, PDF page or screenshot within a submission.
- Fields: submission_page_id, submission_id, file_path, file_type, uploaded_at, deleted_at

**10. Attempt**
- The grading result for one generated question from one submission.
- Fields: attempt_id, submission_id, generated_question_id, ai_result (pass, redo, needs_check), student_answer_read, work_shown, feedback, final_result, overridden_by_tutor

**11. Session Progress**
- Current status of each generated question.
- Fields: progress_id, session_id, generated_question_id, status (pending, pass, redo, needs_check), attempts_count, stars_awarded

**12. Validation Rule**
- Checks the app runs on every generated question ([010](decisions/010-question-generation.md)): the answer key is mathematically right, the skill and number size match the original, the answer is valid (e.g., no negatives), and multiple-choice questions have exactly one correct answer.
- Implemented in code (TypeScript) per question type, with a general fallback. Replaces the April draft's Question Template and Question Type Metadata entities.

**13. Problem Area Tag** (future-proofing for v2)
- Labels for problem areas (e.g., "regrouping across zero") for future pattern tracking.
- Fields: tag_id, tag_name, description
- Not used in MVP.

---

### 3.2 Data Schema Overview

```
User
└── Assignment
    ├── Assignment Pages (photos — deleted per §3.4)
    ├── Extraction Result
    ├── Questions (from the original test)
    └── Session
        ├── Generated Questions (one per missed question; also the answer key)
        ├── Student Submissions
        │   ├── Submission Pages (photos — deleted per §3.4)
        │   └── Attempts (grading result per question)
        └── Session Progress

Validation Rules (code) ── check ──▶ Generated Questions
Problem Area Tag (future) ── linked to ──▶ Questions
```

---

### 3.3 Data Relationships & Flow

**Upload → Extract → Review → Generate → Print → Submit → Grade → Review session → Complete**

1. **Upload**: Educator uploads one or more pages → Assignment + Assignment Pages
2. **Extract**: AI reads all pages → Extraction Result + Questions
3. **Review**: Educator corrects questions, sets `requires_work`
4. **Generate**: For each missed Question, AI writes a Generated Question; Validation Rules check it; failures retry, then get flagged
5. **Print**: Practice sheet and answer key built from Generated Questions
6. **Submit**: Educator uploads the student's work → Student Submission + Submission Pages
7. **Grade**: AI grades each question → Attempts; Session Progress updated
8. **Review session**: hints, redo + re-upload, overrides, stars, Bonus Round
9. **Complete**: Session marked completed → photos scheduled for deletion

---

### 3.4 Storage and Retention

Per [decision 006](decisions/006-upload-retention.md):

| Data | Kept | Then |
|---|---|---|
| Photos/PDFs (Assignment Pages, Submission Pages) | While the session is in progress | Deleted when the session is completed, or 30 days after upload if it never is |
| Text and results (all other tables) | Until the educator deletes them | — |

**Safeguards:**
- Photo metadata (including GPS location) is stripped on upload, before storing or sending to the AI.
- The student's real name, teacher's name and school name from the paper are not stored.
- Photos live in a private Supabase Storage bucket; links are private and expire.
- A daily scheduled job deletes photos that are due.
- The educator can delete one session or all their data at any time; deletion is immediate.

**Future considerations (v2+):**
- Student profiles (multiple students per educator)
- Problem area patterns and analytics across sessions

---

## 4. API Endpoints

The API is a set of Next.js server routes under `/api/v1` ([007](decisions/007-tech-stack.md)), using JSON (file uploads use `multipart/form-data`). The browser never talks to the AI provider directly.

**Authentication:** Supabase Auth. Users sign in via an invite link (stage 1) or open sign-up (stage 2). Every route checks the signed-in session and that the requested record belongs to that user; otherwise `401` / `404`. There are no static API keys and no custom auth endpoints.

**Status codes:** `200 OK`, `201 Created`, `202 Accepted` (work still running), `400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `429 Too Many Requests` (rate/spending limits), `500 Internal Server Error`.

### 4.1 Endpoint list

| Method | Path | Purpose |
|---|---|---|
| **Assignments & extraction** | | |
| `POST` | `/assignments` | Upload one or more pages (`files[]`, `student_nickname`, `assignment_name`). Strips metadata, stores files, starts extraction in the background. Returns `extraction_status: "processing"` |
| `GET` | `/assignments/:id` | Assignment record and extraction status |
| `GET` | `/assignments/:id/extraction` | Extracted questions for review (`202` while still running) |
| `PATCH` | `/assignments/:id/questions/:qid` | Educator corrects a question: text, format, choices, student answer, `marked_correct`, `requires_work` |
| `POST` | `/assignments/:id/questions` | Educator adds a question the AI missed |
| `DELETE` | `/assignments/:id/questions/:qid` | Remove a question from the practice set |
| **Sessions & generation** | | |
| `POST` | `/sessions` | Create a session from a reviewed assignment |
| `POST` | `/sessions/:id/questions/generate` | Generate one practice question per missed question, checked by the Validation Rules |
| `POST` | `/sessions/:id/questions/:gqid/regenerate` | New numbers for one practice question |
| `PATCH` | `/sessions/:id/questions/:gqid` | Educator edits a practice question by hand (`check_status: tutor_edited`) |
| `GET` | `/sessions/:id/questions` | Practice questions with current status |
| `GET` | `/sessions/:id/practice-sheet` | Printable practice sheet |
| `GET` | `/sessions/:id/answer-key` | Answer key with worked steps |
| **Submissions & grading** | | |
| `POST` | `/sessions/:id/submissions` | Upload the student's work (`files[]`, `attempt_number`); grades every question visible in it |
| `GET` | `/sessions/:id/questions/:gqid/attempts` | Attempt history for one question |
| **Progress & completion** | | |
| `GET` | `/sessions/:id` | Session record with counts (pass, redo, needs check, pending) |
| `GET` | `/sessions/:id/progress` | Status of every practice question |
| `PATCH` | `/sessions/:id/progress/:gqid` | Educator override (`status: pass / redo`) |
| `POST` | `/sessions/:id/complete` | Mark completed; schedules photo deletion |
| **Data deletion** | | |
| `DELETE` | `/sessions/:id` | Delete one session and its assignment, photos and text |
| `DELETE` | `/account/data` | Delete all of the educator's data |

### 4.2 Example: extraction result

`GET /assignments/asgn_abc123/extraction`

```json
{
  "extraction_result_id": "ext_xyz789",
  "assignment_id": "asgn_abc123",
  "extraction_confidence": 0.91,
  "notes": "6 photos, 5 rotated 180°. Q4 appears on photos 2 and 3; counted once.",
  "extracted_questions": [
    {
      "question_id": "q_010",
      "question_number": 10,
      "original_question_text": "Which is the value of the 8 in the number 287?",
      "format": "multiple_choice",
      "choices": { "A": "800", "B": "80", "C": "10", "D": "8" },
      "question_type": "value_of_digit",
      "student_answer": "D",
      "correct_answer": "B",
      "points_possible": 1,
      "points_earned": 0,
      "marked_correct": false,
      "requires_work": false,
      "confidence": 0.94
    },
    {
      "question_id": "q_009",
      "question_number": 9,
      "original_question_text": "Which is the correct value for the underlined digit? Choose all that apply. 556",
      "format": "multiple_select",
      "choices": { "A": "5 hundred", "B": "5", "C": "5 tens", "D": "5 ones", "E": "50" },
      "question_type": "value_of_digit",
      "student_answer": "C",
      "correct_answer": "C, E",
      "points_possible": 1,
      "points_earned": 0.5,
      "marked_correct": false,
      "requires_work": false,
      "confidence": 0.78
    }
  ]
}
```

### 4.3 Example: generated question

`POST /sessions/sess_def456/questions/generate` (one item shown)

```json
{
  "generated_question_id": "gq_005",
  "question_id": "q_010",
  "position": 5,
  "question_text": "Which is the value of the 5 in the number 352?",
  "choices": { "A": "500", "B": "50", "C": "10", "D": "5" },
  "correct_answer": "B",
  "steps_to_solve": "The 5 is in the tens place. Its value is 5 × 10 = 50.",
  "hint": "Which place is the 5 in: hundreds, tens, or ones?",
  "requires_work": false,
  "check_status": "passed",
  "generation_attempts": 1
}
```

### 4.4 Example: grading a submission

`POST /sessions/sess_def456/submissions` (two of the results shown)

```json
{
  "submission_id": "sub_001",
  "attempt_number": 1,
  "results": [
    {
      "generated_question_id": "gq_001",
      "ai_result": "pass",
      "student_answer_read": "600",
      "work_shown": true,
      "feedback": "Correct: 400 + 600 = 1,000, with work shown."
    },
    {
      "generated_question_id": "gq_004",
      "ai_result": "needs_check",
      "student_answer_read": "9 cm",
      "work_shown": true,
      "feedback": "The work shows 7 + 7 + 7 = 21, but the answer says 9 cm. Tutor check needed."
    }
  ]
}
```

---

## 5. Technology Stack

Decided in [007](decisions/007-tech-stack.md). Built by the product owner with Claude Code; chosen to be simple to run alone and familiar to a developer who joins later.

### 5.1 Backend Framework
**Next.js (TypeScript).** Screens and server routes live in one project. AI calls, the math checker, metadata stripping and the cleanup job all run in server routes, so secrets never reach the browser. Long extraction calls may need to run as background tasks; check Vercel's function time limits at setup.

### 5.2 Database
**Supabase Postgres.** The relational model in §3 fits directly. Row-level security keeps each educator's data private. Schema changes are migration files in the repo.

### 5.3 AI/Vision Services
**Google Gemini 3.8 Flash** (`gemini-3.8-flash`), chosen in [002](decisions/002-ai-provider.md) after benchmarking on the `test-data/` samples (`docs/web/benchmark/`). Paid tier only (no training on uploads). All prompts live in one folder in the repo; the benchmark re-runs on every prompt or model change.

### 5.4 File Storage
**Supabase Storage**, private bucket. Expiring links only. Files deleted per §3.4.

### 5.5 Hosting & Infrastructure
**Vercel.** Deploys from a private GitHub repo, with a preview link for every change and a staging + production setup. A daily scheduled job handles photo deletion. Supabase Auth handles logins (invite-only → open sign-up).

**Built for change** (from 007): one theme file, shared UI building blocks, a prompts folder, automatic tests against `test-data/`, migration files, and preview links for every change.

---

## 6. Cost Analysis

AI costs are based on the 002 benchmark with Gemini 3.8 Flash; platform terms are confirmed at setup.

### 6.1 Monthly Cost Breakdown

| Item | Stage 1 (invite-only) | Stage 2 (public) | Notes |
|---|---|---|---|
| Vercel hosting | Free plan likely enough | Paid plan needed if the app earns money | Free plan is for personal, non-commercial use; confirm current terms |
| Supabase (database, auth, storage) | Free tier likely enough | Paid tier for reliability and size | Free tier pauses projects left unused; confirm limits |
| AI usage | Per session (below) × sessions | Same, at larger volume | Main variable cost |
| Domain | None (free `*.vercel.app` address) | Small yearly fee | Decision 005: domain bought with the final name |

**AI cost per session** (Gemini 3.8 Flash), roughly $0.05–0.15 at today's prices, or ~$0.10–0.30 after the price increase reported for 2027-01-01:
- 1 extraction call per assignment (several photos)
- 1 generation call per missed question, plus retries when the math check fails
- 1 grading call per uploaded submission, plus redo re-uploads
- Optional: hints and Bonus Round questions

For reference, one full benchmark run (1 six-photo test + 10 homework pages) cost about $0.11. Generation calls are not measured yet.

### 6.2 Cost Optimization Strategies
- **Spending cap** with the AI provider from day one (stage 1 requirement).
- **Per-user limits** on uploads and sessions per day (stage 2 requirement, before open sign-up).
- **Cheaper model for simple steps** (e.g., generation or text-only checks) if 002 shows it's accurate enough.
- **Resize images** before sending to the AI; smaller images cost less.
- **Avoid re-sending pages:** extract once per assignment, not once per question.

---

## 7. Architecture Overview

Two services and one language ([007](decisions/007-tech-stack.md)): a Next.js app on Vercel (screens + server routes) and Supabase (database, logins, file storage). The AI provider is called only from the server.

### 7.1 System Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                    BROWSER (phone / tablet / laptop)         │
│   Next.js game UI (Hologram HUD theme)                       │
│   • Upload assignment and student work                       │
│   • Review extraction, practice set, grading results         │
│   • Print practice sheet and answer key                      │
└───────────────────────────┬──────────────────────────────────┘
                            │ HTTPS, Supabase login session
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                VERCEL — Next.js server routes (/api/v1)      │
│                                                              │
│  Upload handling      Extraction       Generation            │
│  • strip metadata     • AI reads       • AI rewrites missed  │
│  • rotate / resize      all pages        questions           │
│  • store files                         • Validation Rules    │
│                                          (math check)        │
│  Grading              Sessions         Scheduled job (daily) │
│  • AI grades work     • progress,      • delete photos due   │
│  • needs_check          overrides        under §3.4          │
└──────┬───────────────────────────┬──────────────────┬────────┘
       │                           │                  │
       ▼                           ▼                  ▼
┌──────────────────┐  ┌──────────────────────┐  ┌──────────────────┐
│ SUPABASE         │  │ SUPABASE STORAGE     │  │ AI PROVIDER      │
│ • Postgres       │  │ • Private bucket     │  │ Gemini 3.8 Flash │
│ • Auth (invites) │  │ • Assignment pages   │  │ • Extraction     │
│ • Row-level      │  │ • Submission pages   │  │ • Generation     │
│   security       │  │ • Expiring links     │  │ • Grading        │
└──────────────────┘  └──────────────────────┘  └──────────────────┘
```

**Component responsibilities:**
- **Server routes** are the only entry point to data and AI. They check the user's login on every request.
- **Supabase Postgres** holds all structured data (§3); row-level security keeps each educator's data private.
- **Supabase Storage** holds photos only for as long as §3.4 allows.
- **The AI provider** is called only by the server, with uploads stripped of metadata.

---

### 7.2 Request/Response Flows

#### Flow 1: Upload & extraction
```
Educator uploads 1+ pages
  → POST /assignments
  → strip metadata, convert PDF pages to images, rotate, resize
  → store pages in Supabase Storage; save Assignment + Assignment Pages
  → start background extraction; return assignment_id ("processing")
Background:
  → send all pages + extraction prompt to the AI
  → parse JSON; merge duplicate questions across overlapping photos
  → save Extraction Result + Questions
Educator polls GET /assignments/:id/extraction → reviews and corrects
```

#### Flow 2: Session & generation
```
POST /sessions → POST /sessions/:id/questions/generate
For each missed question, in original order:
  → AI writes a new version (same wording/format, new numbers) + answer + steps + hint
  → Validation Rules check it
      pass  → save Generated Question (check_status: passed)
      fail  → retry a few times → still failing → save with check_status: flagged
Educator reviews: Regenerate / Edit flagged or unwanted questions
GET /practice-sheet and /answer-key → print
```

#### Flow 3: Submission & grading
```
Educator uploads photos/PDF of the student's work
  → POST /sessions/:id/submissions
  → strip metadata, store pages
  → send pages + practice questions (with correct answers and requires_work) to the AI
  → for each question: pass / redo / needs_check, answer read, work shown, feedback
      (ignore crossed-out attempts; skip unanswered questions; work/answer conflict → needs_check)
  → save Attempts; update Session Progress and stars
```

#### Flow 4: Redo, override & completion
```
Redo → hint shown → student retries on paper → re-upload (attempt 2) → graded again
Override → PATCH /progress/:gqid → stars adjusted, overridden_by_tutor = true
All questions resolved → Bonus Round → POST /complete
  → completed_at set → photos deleted by the next daily job
```

#### Flow 5: Data deletion
```
DELETE /sessions/:id or /account/data
  → delete files from Storage immediately
  → delete database rows
```

---

## 8. AI/Vision Implementation Strategy

AI does three jobs: **extraction** (reading the graded test), **generation** (writing new versions of missed questions) and **grading** (judging the student's work). The model is Google Gemini 3.8 Flash ([002](decisions/002-ai-provider.md)). All prompts live in one folder and are tested against `test-data/` before any change goes live.

### 8.1 Image Processing Pipeline

**Step 1 — Intake & preprocessing** (as built: **in the adult's browser**, before anything is uploaded; Vercel's ~4.5 MB request limit rules out sending photos through the server):
- **Strip metadata**, including GPS location ([006](decisions/006-upload-retention.md)): every page is redrawn as a new JPEG, so metadata never leaves the device.
- **Convert PDFs** (including tablet notes) to one image per page.
- **Fix rotation:** the phone's own orientation in the browser; pages photographed with the paper turned are detected by the AI during extraction (no rotate buttons for the adult).
- **Resize** to 2400 px on the longest side.
- **For the AI only** (server, 2026-10-19): an optional contrast boost darkens faint pencil on the copy sent to the AI, keeping colors so student pencil and teacher pen stay distinct. The stored photo is unchanged.

**Step 2 — Send to the AI** as a structured request: instructions + all pages of the assignment (or submission) in order.

**Step 3 — Parse the response.** Always request structured JSON. Validate it before saving; if it's malformed, retry once, then show an error the educator can act on.

**Step 3b — Second look** (as built, 2026-10-20): any question whose student answer wasn't found gets one focused retry with only its own photo.

**Step 4 — Cross-check** (as built): the app compares the reading with the score written on the paper, and flags missed questions with no student answer and answers that contradict correct/missed. The adult sees warnings on Step 2 and fixes with one tap.

**Ungraded tests** (proposed, [012](decisions/012-ungraded-tests.md)): with no teacher marks or score, the AI also works out each answer with a calculation the app verifies (the [010](decisions/010-question-generation.md) checks), and the app compares the student's answer in code.

**Lessons from real samples** (see `test-data/`): tests span several photos that may overlap; teacher marks are subtle (a blue circle on the *correct* choice, "-1", partial credit); pictures carry meaning (base-ten blocks, place-value charts, shapes); the tutor and student may write on the same page in different colors; and children use invented spelling.

---

### 8.2 Prompts

**Extraction prompt (outline):**
```
You are reading photos of a graded elementary math assignment. The photos
may be rotated, crumpled, or overlap (the same question may appear on two
photos — count it once).

For every question, return:
- question_number, original_question_text (exactly as written)
- format: multiple_choice | multiple_select | fill_in | open_response
- choices (if any), picture_description (if a picture is part of the question)
- student_answer (the student's marks, usually pencil)
- correct_answer (from teacher marks, or worked out if not marked)
- points_possible, points_earned (teacher may give partial credit)
- marked_correct (from teacher marks: checks, X's, circles on the correct
  choice, "-1", scores)
- requires_work: true if the question says "show your work" or "explain"
- question_type (short label, e.g. "value_of_digit")
- confidence 0.0–1.0, notes for anything uncertain

Do not include the student's name, the teacher's name, or the school.
Return ONLY valid JSON.
```

Questions with confidence below ~0.75 are flagged in the review screen.

**Generation prompt (outline)** ([010](decisions/010-question-generation.md)):
```
Write a practice version that mirrors this missed question.
- Keep the intent, skill, wording, format, layout, visual type, names and
  objects. Change only what decides the answer: the numbers, and the
  diagram when the answer comes from it (block counts, side lengths, the
  shape, the underlined digit; letters if the letters are the puzzle).
- The new answer must differ from the original's (yes/no questions: let
  the new diagram decide). The correct multiple-choice letter may move.
- Keep the same skill (e.g., if it needs regrouping across a zero, the
  new one must too) and the same size of numbers.
- The answer must be valid (e.g., no negative results).
- Multiple choice: keep the pattern of wrong choices; exactly one right
  answer. Choose-all: same number of correct choices.
- Clue questions: clues must lead to exactly one answer.
- Describe any diagram as data (e.g. {"blocks": [3,2,9]}) so the app can
  draw it and check the answer from it.
Return JSON: question_text, choices, picture_spec, correct_answer,
steps_to_solve, hint.
```

The app then runs the **Validation Rules** (§3.1, entity 12). If the check fails, it asks again (a few retries), then flags the question for the educator.

**Grading prompt (outline)** ([003](decisions/003-grading-model.md) and Amendment 1):
```
You are grading a student's work on these practice questions.
For each question you are given: question_text, correct_answer,
requires_work.

For each question visible in the photos:
- Read the student's FINAL answer. Ignore crossed-out attempts.
- If the question is unanswered, return "skipped" (not "redo").
- pass: answer is right, and (if requires_work) work or an
  explanation is shown.
- redo: answer is wrong, or requires_work and no work is shown.
- needs_check: you can't read it, you're unsure, or the work and the
  answer disagree. When in doubt, choose needs_check, not redo.
- Choose-all questions: pass only if all correct choices and no wrong ones.
- Read explanations for meaning; young children use invented spelling.
- Only judge the student's marks, not the tutor's (tutor ink color may be
  provided).
Return JSON per question: result, student_answer_read, work_shown,
feedback (a short note for the adult, e.g. "614: likely added instead
of subtracting"). Do not address the student.
```

---

### 8.3 Cost & Feasibility

**Cost:** see §6. The April estimate (~$0.03–0.07 per session) is out of date and assumed single-page uploads and rule-based generation. Re-measure as samples are added.

**Main feasibility risk:** accuracy on real, messy material: teacher-mark conventions, overlapping photos, pictures, mixed tutor/student ink. Mitigations:
1. Educator review of extraction before anything is generated.
2. "Needs tutor check" instead of guessing during grading.
3. The math check on every generated question.
4. A growing `test-data/` benchmark, re-run on every prompt or model change.

---

## 9. Open Questions & Risks

### 9.1 Technical Feasibility
- **Faint pencil** is the main grading weakness found in the benchmark (faint circled choices, a faint drawn explanation). *Mitigation:* "needs tutor check," one-tap override, lighting tips on the upload screen.
- **Extraction accuracy** on varied teacher-marking styles and multi-photo uploads. *Mitigation:* benchmark on every change, educator review, confidence flags. Gemini 3.8 Flash found every missed question in 4/4 runs on sample 001.
- **Grading accuracy** on handwriting, tablet ink and invented spelling. *Mitigation:* "needs tutor check," easy overrides.
- **Mixed tutor/student ink** on the same page. *Open:* ask the tutor which color is the student's, or require student-only pages.
- **Long AI calls** may exceed normal request time limits. *Mitigation:* background tasks with a progress screen.
- **Questions with no numbers** (e.g., symmetry yes/no) can't be varied by swapping numbers. *Current plan:* reuse as-is, flagged; revisit if common.
- **Redrawing pictures** with new numbers (base-ten blocks, charts, shapes) needs a drawing component per picture type. *Open:* scope for Phase 2.

### 9.2 Cost Unknowns
- **Per-session AI cost:** ~$0.05–0.15 now; generation not yet measured; reported price increase on 2027-01-01.
- **Platform plans** once paid users exist (Vercel commercial use, Supabase limits).
- **Abuse at public launch.** *Mitigation:* spending cap from stage 1, per-user limits before stage 2.
- **Business model** (decision 004) is undecided: who pays for AI costs at stage 2.

### 9.3 Scope/Complexity
- **Google's terms on minors and children's privacy (COPPA):** Gemini's terms bar services "directed towards or likely to be accessed by" under-18s. The app is designed adult-only ([011](decisions/011-adult-only-audience.md)), and a **legal review happens before the invite-only launch (stage 1)**, re-checked before stage 2. Backup: switch to Claude after a benchmark run. Data minimization and retention rules are in place from stage 1 ([006](decisions/006-upload-retention.md)).
- **Name:** "Math Mission" is a working name. Kahoot! has an active K–5 product called "Math Missions"; choose the final name after a US trademark search before stage 2 ([005](decisions/005-name-and-domain.md)).
- **Rebuilding the prototype UI** in Next.js: the look carries over, the code is rewritten.
- **Not yet tested beyond elementary math.** The app has no grade limit, but all samples so far are elementary.

---

## 10. Implementation Roadmap

The roadmap lives in **[docs/roadmap.md](roadmap.md)**, the single live plan with checklists and a "done when" check for each phase. Summary:

| Phase | What it covers |
|---|---|
| 0: Decisions | Product and technical decisions (✅ done 2026-10-15; business model deferred) |
| 1: Foundation | Repo, Next.js, Supabase, Vercel, "Built for change" groundwork, schema, invite-only login |
| 2: Core product | Upload → extraction → review → generation → print → grading → review session → summary |
| 3: Invite-only launch (stage 1) | the student and a few invited families on a free Vercel address |
| 4: Public launch (stage 2) | Open sign-up, legal review, final name and domain: the definition of done |

---

## Appendix: Reference Links

- [Decision log](decisions/README.md)
- [Product Spec Document](Math%20Mission%20-%20Spec.docx)
- [Bug report (April prototype)](bug-report.md)
- [Test data](../test-data/README.md) (private: contains a child's information)
- [Roadmap](roadmap.md)
- [Latest handoff](../handoffs/2026-10-16-handoff.md)
- [Miro Board](https://miro.com/app/board/uXjVGnJ38tw=/?share_link_id=847279622783)
