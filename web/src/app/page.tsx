import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Badge, ButtonLink, Card, PageShell } from "@/components/ui";
import { SignOutButton } from "@/components/SignOutButton";
import { getAdult } from "@/lib/auth";
import { listSessions } from "@/lib/sessions";
import { APP_NAME, APP_TAGLINE } from "@/theme/brand";

// Home: a sign-in prompt when signed out; the adult's sessions when signed in.
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
  const sessions = await listSessions();
  const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <PageShell title="Your sessions" intro={`Signed in as ${adult.email}.`} actions={<SignOutButton />}>
      <div className="grid gap-6">
        <div>
          <ButtonLink href="/sessions/new" size="lg">
            Start a new session
          </ButtonLink>
        </div>
        {sessions.length === 0 ? (
          <Card>
            <p className="text-ink-muted">
              No sessions yet. Start one by uploading a graded test; the app builds a practice sheet from the questions
              the student missed.
            </p>
          </Card>
        ) : (
          <Card title="Past and current sessions">
            <ul className="divide-y divide-line">
              {sessions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/sessions/${s.id}/questions`}
                    className="flex items-center justify-between gap-4 py-3 hover:text-accent"
                  >
                    <span>
                      <span className="font-medium">{s.assignment?.student_nickname}</span>
                      {s.assignment?.assignment_name && <span className="text-ink-muted">: {s.assignment.assignment_name}</span>}
                      <span className="block text-sm text-ink-muted">Started {date(s.started_at)}</span>
                    </span>
                    <Badge tone={s.status === "completed" ? "success" : "accent"}>
                      {s.status === "completed" ? "Completed" : "In progress"}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
