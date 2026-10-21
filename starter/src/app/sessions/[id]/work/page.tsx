import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ButtonLink, Card, PageShell } from "@/components/ui";
import { getPractice } from "@/lib/sessions";
import { WorkForm } from "./WorkForm";

export const metadata: Metadata = { title: "Upload work" };

// Step 4 of a session: photos of the student's finished practice sheet.
export default function WorkPage({ params }: PageProps<"/sessions/[id]/work">) {
  return (
    <Suspense
      fallback={
        <PageShell title="Upload work">
          <p className="text-ink-muted">Loading…</p>
        </PageShell>
      }
    >
      {params.then(({ id }) => <Work id={id} />)}
    </Suspense>
  );
}

async function Work({ id }: { id: string }) {
  const session = await getPractice(id);
  if (!session) notFound();
  if (session.practice_status !== "ready") redirect(`/sessions/${id}/practice`);

  return (
    <PageShell
      title={`${session.assignment.student_nickname}${session.assignment.assignment_name ? `: ${session.assignment.assignment_name}` : ""}`}
      intro="Step 4 of 5: upload the student's finished work so the app can grade it."
    >
      <div className="grid gap-6">
        <div>
          <ButtonLink href={`/sessions/${id}/practice`} variant="quiet">
            ← Back to the practice set
          </ButtonLink>
        </div>
        <Card className="max-w-xl">
          <WorkForm sessionId={id} />
        </Card>
      </div>
    </PageShell>
  );
}
