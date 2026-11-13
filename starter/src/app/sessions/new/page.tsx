import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Button, Card, PageShell } from "@/components/ui";
import { getProfile } from "@/lib/store";
import { mission } from "@mission";
import { MaterialForm } from "./MaterialForm";
import { useSample } from "./actions";

export const metadata: Metadata = { title: "What I'm studying" };

// Screen 2 of 4: the material to practice from — pasted text and/or photos or
// a PDF, or the bundled sample material.
export default function NewSessionPage() {
  return (
    <PageShell
      title="What I'm studying"
      intro={`Step 2 of 4: ${mission.material.prompt}`}
    >
      <Card className="max-w-xl">
        <Suspense fallback={<p className="text-ink-muted">Loading…</p>}>
          <MaterialGate />
        </Suspense>
      </Card>
    </PageShell>
  );
}

async function MaterialGate() {
  const profile = await getProfile();
  if (!profile) redirect("/onboard");
  return (
    <div className="grid gap-5">
      <MaterialForm kinds={mission.material.kinds} />
      <div className="rounded-control border border-line bg-surface-muted p-4">
        <p className="mb-2 text-sm text-ink-muted">Nothing handy? Try the bundled sample material.</p>
        <form action={useSample}>
          <Button variant="secondary" type="submit" data-step="use-sample">
            Use the sample material
          </Button>
        </form>
      </div>
    </div>
  );
}
