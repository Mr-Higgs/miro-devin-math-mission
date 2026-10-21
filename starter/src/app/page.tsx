import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Badge, ButtonLink, Card, PageShell } from "@/components/ui";
import { getProfile, listSessions } from "@/lib/store";
import { APP_NAME, APP_TAGLINE } from "@/theme/brand";

// Home: onboarding until there's a profile, then the sessions list.
export default function Home() {
  return (
    <Suspense fallback={<PageShell title={APP_NAME} intro={APP_TAGLINE}>{null}</PageShell>}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const profile = await getProfile();
  if (!profile) redirect("/onboard");

  const sessions = await listSessions();
  const date = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <PageShell
      title="Your sessions"
      intro={`Tutoring ${profile.learnerName} in ${profile.topic} · ${profile.level}`}
      actions={
        <Link href="/onboard" className="text-sm text-ink-muted hover:text-ink">
          Change
        </Link>
      }
    >
      <div className="grid gap-6">
        <div>
          <ButtonLink href="/sessions/new" size="lg">
            Start a new session
          </ButtonLink>
        </div>
        {sessions.length === 0 ? (
          <Card>
            <p className="text-ink-muted">
              No sessions yet. Start one by uploading a graded test; the app builds a practice sheet from the
              questions the student missed.
            </p>
          </Card>
        ) : (
          <Card title="Past and current sessions">
            <ul className="divide-y divide-line">
              {sessions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={s.status === "completed" ? `/sessions/${s.id}/review` : `/sessions/${s.id}/questions`}
                    className="flex items-center justify-between gap-4 py-3 hover:text-accent"
                  >
                    <span>
                      <span className="font-medium">{s.assignment?.student_nickname}</span>
                      {s.assignment?.assignment_name && (
                        <span className="text-ink-muted">: {s.assignment.assignment_name}</span>
                      )}
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
