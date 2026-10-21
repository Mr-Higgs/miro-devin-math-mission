// The local filesystem store. Sessions live as JSON + JPEG pages under
// starter/data/ — the app's whole state, so there's no database and no
// login. Replace this folder only if you change the store contract
// (the shapes below are what the pages and the checker rely on).
import "server-only";
import { mkdir, readFile, readdir, rename, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const sessionsDir = () => path.join(DATA_DIR, "sessions");
const sessionDir = (id: string) => path.join(sessionsDir(), id);
const sessionFile = (id: string) => path.join(sessionDir(id), "session.json");
const pageFile = (id: string, n: number) => path.join(sessionDir(id), "pages", `page-${n}.jpg`);
const workPageFile = (id: string, n: number) => path.join(sessionDir(id), "work", `page-${n}.jpg`);

// ---------------------------------------------------------------------------
// Shapes (mirror web's entities; keep field names the pages already use)
// ---------------------------------------------------------------------------

export interface Profile {
  learnerName: string;
  persona: string;
  topic: string;
  level: string;
  createdAt: string;
}

export interface SessionPage {
  page_order: number;
  rotation: number;
  url: string | null;
}

export interface Question {
  id: string;
  position: number;
  question_number: string;
  original_question_text: string;
  format: "multiple_choice" | "multiple_select" | "fill_in" | "open_response";
  choices: Record<string, string> | null;
  picture_description: string | null;
  question_type: string | null;
  student_answer: string | null;
  correct_answer: string | null;
  points_possible: number | null;
  points_earned: number | null;
  marked_correct: boolean;
  requires_work: boolean;
  confidence: number | null;
}

export type GradeResult = "pass" | "redo" | "needs_check" | "skipped";

export interface Grade {
  result: GradeResult;
  student_answer_read: string | null;
  work_shown: boolean | null;
  feedback: string | null;
  overridden: boolean;
}

export interface GeneratedQuestionRecord {
  id: string;
  question_id: string | null;
  position: number;
  question_text: string;
  choices: Record<string, string> | null;
  picture_spec: Record<string, unknown> | null;
  correct_answer: string;
  steps_to_solve: string | null;
  hint: string | null;
  requires_work: boolean;
  check_status: "passed" | "flagged";
  check_notes: string | null;
  answer_check: unknown;
  generation_attempts: number;
  grade: Grade | null;
}

export interface WorkUpload {
  page_count: number;
  grading_status: "none" | "grading" | "done" | "failed";
  grading_started_at: string | null;
  grading_error: string | null;
}

export interface Assignment {
  id: string;
  student_nickname: string;
  assignment_name: string | null;
  extraction_status: "pending" | "processing" | "done" | "failed";
  extraction_started_at: string | null;
  extraction_error: string | null;
  page_count: number;
  page_rotations: Record<number, number>;
  questions: Question[];
  notes: string | null;
  scoreAsWritten: string | null;
}

export interface Session {
  id: string;
  status: "in_progress" | "completed";
  started_at: string;
  updated_at: string;
  practice_status: "none" | "generating" | "ready" | "failed";
  practice_started_at: string | null;
  practice_error: string | null;
  work: WorkUpload;
  assignment: Assignment;
  practice: GeneratedQuestionRecord[];
}

export interface SessionSummary {
  id: string;
  status: Session["status"];
  started_at: string;
  updated_at: string;
  assignment: { student_nickname: string; assignment_name: string | null };
}

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

async function writeJsonAtomic(file: string, value: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${randomUUID()}`;
  await writeFile(tmp, JSON.stringify(value, null, 2));
  await rename(tmp, file);
}

export async function savePage(id: string, n: number, buf: Buffer) {
  const file = pageFile(id, n);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file + ".tmp", buf);
  await rename(file + ".tmp", file);
}

export async function copyPage(id: string, n: number, from: string) {
  const file = pageFile(id, n);
  await mkdir(path.dirname(file), { recursive: true });
  await copyFile(from, file);
}

export async function readPage(id: string, n: number): Promise<Buffer> {
  return readFile(pageFile(id, n));
}

export async function saveWorkPage(id: string, n: number, buf: Buffer) {
  const file = workPageFile(id, n);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file + ".tmp", buf);
  await rename(file + ".tmp", file);
}

export async function copyWorkPage(id: string, n: number, from: string) {
  const file = workPageFile(id, n);
  await mkdir(path.dirname(file), { recursive: true });
  await copyFile(from, file);
}

export async function readWorkPage(id: string, n: number): Promise<Buffer> {
  return readFile(workPageFile(id, n));
}

export const workPageUrl = (id: string, n: number) => `/api/sessions/${id}/work-pages/${n}`;

export async function pageCountOnDisk(id: string): Promise<number> {
  const dir = path.join(sessionDir(id), "pages");
  if (!existsSync(dir)) return 0;
  return (await readdir(dir)).filter((f) => /^page-\d+\.jpg$/.test(f)).length;
}

export const pageUrl = (id: string, n: number) => `/api/sessions/${id}/pages/${n}`;

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function getProfile(): Promise<Profile | null> {
  try {
    return JSON.parse(await readFile(path.join(DATA_DIR, "profile.json"), "utf8")) as Profile;
  } catch {
    return null;
  }
}

export async function saveProfile(p: Profile) {
  await writeJsonAtomic(path.join(DATA_DIR, "profile.json"), p);
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

async function readSession(id: string): Promise<Session | null> {
  if (!isUuid(id)) return null;
  try {
    const s = JSON.parse(await readFile(sessionFile(id), "utf8")) as Session;
    // Default fields added after older sessions were written.
    s.work ??= { page_count: 0, grading_status: "none", grading_started_at: null, grading_error: null };
    for (const p of s.practice ?? []) p.grade ??= null;
    return s;
  } catch {
    return null;
  }
}

async function writeSession(session: Session) {
  session.updated_at = new Date().toISOString();
  await writeJsonAtomic(sessionFile(session.id), session);
}

export async function listSessions(): Promise<SessionSummary[]> {
  if (!existsSync(sessionsDir())) return [];
  const out: SessionSummary[] = [];
  for (const id of await readdir(sessionsDir())) {
    const s = await readSession(id);
    if (s) {
      out.push({
        id: s.id,
        status: s.status,
        started_at: s.started_at,
        updated_at: s.updated_at,
        assignment: {
          student_nickname: s.assignment.student_nickname,
          assignment_name: s.assignment.assignment_name,
        },
      });
    }
  }
  return out.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

/** One session, with each page's view URL filled in (pages live on disk). */
export async function getSession(id: string): Promise<(Session & { assignment: Assignment & { pages: SessionPage[] } }) | null> {
  const s = await readSession(id);
  if (!s) return null;
  const pages: SessionPage[] = Array.from({ length: s.assignment.page_count }, (_, i) => ({
    page_order: i + 1,
    rotation: s.assignment.page_rotations?.[i + 1] ?? 0,
    url: pageUrl(id, i + 1),
  }));
  return { ...s, assignment: { ...s.assignment, pages } };
}

export async function createSession(input: {
  studentNickname: string;
  assignmentName: string;
  pageCount: number;
}): Promise<Session> {
  const now = new Date().toISOString();
  const session: Session = {
    id: randomUUID(),
    status: "in_progress",
    started_at: now,
    updated_at: now,
    practice_status: "none",
    practice_started_at: null,
    practice_error: null,
    work: { page_count: 0, grading_status: "none", grading_started_at: null, grading_error: null },
    assignment: {
      id: randomUUID(),
      student_nickname: input.studentNickname,
      assignment_name: input.assignmentName || null,
      extraction_status: "pending",
      extraction_started_at: null,
      extraction_error: null,
      page_count: input.pageCount,
      page_rotations: {},
      questions: [],
      notes: null,
      scoreAsWritten: null,
    },
    practice: [],
  };
  await writeSession(session);
  return session;
}

/** Read-modify-write one session. */
export async function updateSession(id: string, fn: (s: Session) => Session): Promise<Session> {
  const s = await readSession(id);
  if (!s) throw new Error("Session not found");
  const next = fn(s);
  await writeSession(next);
  return next;
}

/** The session that owns a question or generated question, if any. */
export async function findSessionFor(pred: (s: Session) => boolean): Promise<Session | null> {
  if (!existsSync(sessionsDir())) return null;
  for (const id of await readdir(sessionsDir())) {
    const s = await readSession(id);
    if (s && pred(s)) return s;
  }
  return null;
}
