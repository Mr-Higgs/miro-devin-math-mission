// The local filesystem store. Sessions live as JSON + JPEG pages under
// starter/data/ — the app's whole state, so there's no database and no
// login. Replace this folder only if you change the store contract
// (the shapes below are what the pages and the checker rely on).
import "server-only";
import { mkdir, readFile, readdir, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { QuestionType } from "@mission";

export const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
const sessionsDir = () => path.join(DATA_DIR, "sessions");
const sessionDir = (id: string) => path.join(sessionsDir(), id);
const sessionFile = (id: string) => path.join(sessionDir(id), "session.json");
const pageFile = (id: string, n: number) => path.join(sessionDir(id), "pages", `page-${n}.jpg`);

// ---------------------------------------------------------------------------
// Shapes (the four screens rely on these; keep names stable)
// ---------------------------------------------------------------------------

export type JobStatus = "none" | "working" | "ready" | "failed";

export interface Profile {
  learnerName: string;
  persona: string;
  goal: string;
  topic: string;
  level: string;
  createdAt: string;
}

export interface KeyIdea {
  id: string;
  title: string;
  explanation: string;
}

/** The material the learner is studying (screen 2): pasted text and/or page photos. */
export interface Material {
  kind: "text" | "pages";
  title: string;
  text: string | null;
  page_count: number;
  status: JobStatus;
  started_at: string | null;
  error: string | null;
  summary: string | null;
  key_ideas: KeyIdea[];
}

export interface PracticeQuestion {
  id: string;
  position: number;
  type: QuestionType;
  key_idea_id: string | null;
  prompt: string;
  choices: Record<string, string> | null;
  answer: string;
  explanation: string;
  hint: string | null;
  check_status: "passed" | "flagged";
  check_notes: string | null;
}

export type ResultKind = "right" | "almost" | "not_yet" | "skipped" | "needs_look";

export interface AnswerResult {
  question_id: string;
  learner_answer: string;
  result: ResultKind;
  feedback: string;
  graded_by: "app" | "ai" | "self";
}

export interface PracticeJob {
  status: JobStatus;
  started_at: string | null;
  error: string | null;
  questions: PracticeQuestion[];
}

export interface ResultsJob {
  status: JobStatus;
  started_at: string | null;
  error: string | null;
  items: AnswerResult[];
  summary: string | null;
  next_steps: string[];
}

export interface Session {
  id: string;
  status: "in_progress" | "completed";
  started_at: string;
  updated_at: string;
  material: Material;
  practice: PracticeJob;
  answers: Record<string, string>;
  results: ResultsJob;
}

export interface SessionSummary {
  id: string;
  status: Session["status"];
  started_at: string;
  updated_at: string;
  title: string;
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

export async function readPage(id: string, n: number): Promise<Buffer> {
  return readFile(pageFile(id, n));
}

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
    const p = JSON.parse(await readFile(path.join(DATA_DIR, "profile.json"), "utf8")) as Profile;
    p.goal ??= "";
    return p;
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
    if (!s.material || typeof s.material !== "object") return null; // old-shape session
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
      out.push({ id: s.id, status: s.status, started_at: s.started_at, updated_at: s.updated_at, title: s.material.title });
    }
  }
  return out.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export async function getSession(id: string): Promise<Session | null> {
  return readSession(id);
}

export async function createSession(input: {
  kind: Material["kind"];
  title: string;
  text?: string | null;
  pageCount?: number;
}): Promise<Session> {
  const now = new Date().toISOString();
  const session: Session = {
    id: randomUUID(),
    status: "in_progress",
    started_at: now,
    updated_at: now,
    material: {
      kind: input.kind,
      title: input.title,
      text: input.text ?? null,
      page_count: input.pageCount ?? 0,
      status: "none",
      started_at: null,
      error: null,
      summary: null,
      key_ideas: [],
    },
    practice: { status: "none", started_at: null, error: null, questions: [] },
    answers: {},
    results: { status: "none", started_at: null, error: null, items: [], summary: null, next_steps: [] },
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
