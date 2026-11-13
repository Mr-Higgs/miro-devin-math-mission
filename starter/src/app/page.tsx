import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Badge, ButtonLink, Card, PageShell } from "@/components/ui";
import { getProfile, listSessions, getSession } from "@/lib/store";
import { APP_NAME, APP_TAGLINE } from "@/theme/brand";

// Home: onboarding until there's a profile, then the sessions list.
export default function Home() {
  return (
    <Suspense fallback={<PageShell title={APP_NAME} intro={APP_TAGLINE}>{null}</PageShell>}>
      <HomeContent />
    </Suspense>
  );
}

/** Where a session picks back up: results when done, else its current step. */
async function sessionHref(id: string): Promise<string> {
  const s = await getSession(id);
  if (!s) return "/";
  if (s.status === "completed" || s.results.status === "ready") return `/sessions/${id}/results`;
  if (s.practice.status === "ready" || s.practice.status !== "none") return `/sessions/${id}/practice`;
  return `/sessions/${id}/material`;
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
              No sessions yet. Start one by sharing what&apos;s being studied — the app builds practice from it.
            </p>
          </Card>
        ) : (
          <Card title="Past and current sessions">
            <ul className="divide-y divide-line">
              {await Promise.all(
                sessions.map(async (s) => (
                  <li key={s.id}>
                    <Link
                      href={await sessionHref(s.id)}
                      className="flex items-center justify-between gap-4 py-3 hover:text-accent"
                    >
                      <span>
                        <span className="font-medium">{s.title || "Untitled session"}</span>
                        <span className="block text-sm text-ink-muted">Started {date(s.started_at)}</span>
                      </span>
                      <Badge tone={s.status === "completed" ? "success" : "accent"}>
                        {s.status === "completed" ? "Completed" : "In progress"}
                      </Badge>
                    </Link>
                  </li>
                )),
              )}
            </ul>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
