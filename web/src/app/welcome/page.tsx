import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Card, PageShell } from "@/components/ui";
import { SignOutButton } from "@/components/SignOutButton";
import { getAdult } from "@/lib/auth";
import { APP_NAME } from "@/theme/brand";
import { WelcomeForm } from "./WelcomeForm";

export const metadata: Metadata = { title: "Welcome" };

// Shown once after the first sign-in, and again if the terms change.
export default function WelcomePage() {
  return (
    <PageShell
      title={`Welcome to ${APP_NAME}`}
      intro="One step before you start. This app is for adults who support a student's math: parents, guardians, tutors and mentors."
      actions={<SignOutButton />}
    >
      <Card className="max-w-xl">
        <Suspense fallback={<p className="text-ink-muted">Loading…</p>}>
          <WelcomeGate />
        </Suspense>
      </Card>
    </PageShell>
  );
}

async function WelcomeGate() {
  const adult = await getAdult();
  if (!adult) redirect("/login");
  if (adult.onboarded) redirect("/");
  return <WelcomeForm />;
}
