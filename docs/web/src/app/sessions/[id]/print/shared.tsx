// Pieces shared by the practice sheet and the answer key.
import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdult } from "@/lib/auth";
import { getPractice } from "@/lib/sessions";
import { PrintButton } from "./PrintButton";
import "./print.css";

export type PracticeSet = NonNullable<Awaited<ReturnType<typeof getPractice>>>;

/** Loads the practice set for printing, or explains why it can't be printed yet. */
export async function loadForPrint(id: string): Promise<PracticeSet | ReactNode> {
  await requireAdult();
  const session = await getPractice(id);
  if (!session) return <p>This session wasn&apos;t found.</p>;
  if (session.practice_status !== "ready" || !session.practice.length) {
    return (
      <p>
        The practice set isn&apos;t ready yet. <Link href={`/sessions/${id}/practice`}>Go to the practice set</Link>.
      </p>
    );
  }
  return session;
}

export const isPracticeSet = (v: PracticeSet | ReactNode): v is PracticeSet =>
  typeof v === "object" && v !== null && "practice" in (v as object);

export function PrintFrame({ id, label, children, other }: { id: string; label: string; children: ReactNode; other: { href: string; label: string } }) {
  return (
    <div className="print-root">
      <div className="print-page">
        <div className="print-toolbar">
          <PrintButton label={`Print ${label}`} />
          <Link href={other.href}>{other.label}</Link>
          <Link href={`/sessions/${id}/practice`}>Back to the practice set</Link>
          <span>Tip: in the print dialog, choose &quot;Save as PDF&quot; to keep a copy.</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export function sheetTitle(s: PracticeSet) {
  return s.assignment.assignment_name ? `Practice: ${s.assignment.assignment_name}` : "Math practice";
}

export const letters = (answer: string | null) => new Set(answer?.split("(")[0].match(/\b[A-Z]\b/g) ?? []);
export const isYesNo = (answer: string | null) => /^\s*(yes|no)\b/i.test(answer ?? "");
