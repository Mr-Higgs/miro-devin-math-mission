import type { Database } from "@/lib/supabase/database.types";

// The four grading results (decision 003). The AI returns one per question;
// the adult can override it.
export const GRADE_RESULTS = ["pass", "redo", "needs_check", "skipped"] as const;
export type GradeResult = (typeof GRADE_RESULTS)[number];

// Fails to compile if this list and the database's grade_result list drift apart.
type DbGradeResult = Database["public"]["Enums"]["grade_result"];
const sameAsDatabase: [GradeResult, DbGradeResult] extends [DbGradeResult, GradeResult] ? true : never = true;
void sameAsDatabase;
