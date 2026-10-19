import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Card, Notice, PageShell } from "@/components/ui";
import { SignOutButton } from "@/components/SignOutButton";
import { requireAdult } from "@/lib/auth";
import { getSession } from "@/lib/sessions";

export const metadata: Metadata = { title: "Missed questions" };

// Step 2 of a session (site map): review the missed questions. For now it shows
// the uploaded pages; reading the test (extraction) is the next thing built.
export default function QuestionsPage({ params }: PageProps<"/sessions/[id]/questions">) {
  return (
    <Suspense fallback={<PageShell title="Missed questions" actions={<SignOutButton />}><p className="text-ink-muted">Loading…</p></PageShell>}>
      {params.then(({ id }) => <Questions id={id} />)}
    </Suspense>
  );
}

async function Questions({ id }: { id: string }) {
  await requireAdult();
  const session = await getSession(id);
  if (!session) notFound();
  const { assignment } = session;

  return (
    <PageShell
      title={`${assignment.student_nickname}${assignment.assignment_name ? `: ${assignment.assignment_name}` : ""}`}
      intro="Step 2 of 7: review the missed questions."
      actions={<SignOutButton />}
    >
      <div className="grid gap-6">
        <Notice title="Uploaded">
          {assignment.pages.length} {assignment.pages.length === 1 ? "page" : "pages"} saved privately, with location
          and other hidden photo data removed. Next, the app will read the test and list the missed questions here
          (being built next).
        </Notice>
        <Card title="Pages">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {assignment.pages.map((p) => (
              <li key={p.page_order} className="overflow-hidden rounded-control border border-line bg-surface-muted">
                {p.url ? (
                  // Private photos behind short-lived signed links, so not next/image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.url} alt={`Page ${p.page_order}`} className="aspect-[3/4] w-full object-contain" />
                ) : (
                  <div className="flex aspect-[3/4] items-center justify-center text-sm text-ink-muted">Photo deleted</div>
                )}
                <p className="px-2 py-1 text-xs text-ink-muted">Page {p.page_order}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageShell>
  );
}
