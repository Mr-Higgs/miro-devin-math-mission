import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, PageShell } from "@/components/ui";
import { SignOutButton } from "@/components/SignOutButton";
import { requireAdult } from "@/lib/auth";
import { UploadForm } from "./UploadForm";

export const metadata: Metadata = { title: "New session" };

// Step 1 of a session (site map): upload the graded test.
export default function NewSessionPage() {
  return (
    <PageShell
      title="New session"
      intro="Step 1 of 7: upload the student's graded test. The app finds the questions they missed."
      actions={<SignOutButton />}
    >
      <Card className="max-w-xl">
        <Suspense fallback={<p className="text-ink-muted">Loading…</p>}>
          <UploadGate />
        </Suspense>
      </Card>
    </PageShell>
  );
}

async function UploadGate() {
  const adult = await requireAdult();
  return <UploadForm userId={adult.id} />;
}
