import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ButtonLink, Card, Notice, PageShell } from "@/components/ui";
import { SignOutButton } from "@/components/SignOutButton";
import { getAdult } from "@/lib/auth";
import { APP_NAME, APP_TAGLINE } from "@/theme/brand";

// Home: a sign-in prompt when signed out; the adult's start page when signed in.
export default function Home() {
  return (
    <Suspense fallback={<PageShell title={APP_NAME} intro={APP_TAGLINE}>{null}</PageShell>}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const adult = await getAdult();

  if (!adult) {
    return (
      <PageShell title={APP_NAME} intro={APP_TAGLINE}>
        <Card title="Invite-only for now" className="max-w-xl">
          <p className="text-ink-muted">If you&apos;ve been invited, sign in with your email address.</p>
          <ButtonLink href="/login" size="lg" className="mt-5">
            Sign in
          </ButtonLink>
        </Card>
      </PageShell>
    );
  }

  if (!adult.onboarded) redirect("/welcome");

  return (
    <PageShell title="Your sessions" intro={`Signed in as ${adult.email}.`} actions={<SignOutButton />}>
      <Card className="max-w-xl">
        <Notice title="Coming soon">
          Uploading a graded test and building a practice sheet arrive in the next phase.
        </Notice>
      </Card>
    </PageShell>
  );
}
