import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ButtonLink, Card, Notice, PageShell } from "@/components/ui";
import { getSession, pageUrl } from "@/lib/store";
import { ReadingMaterial } from "./ReadingMaterial";

export const metadata: Metadata = { title: "What I'm studying" };

// Screen 2 of 4, continued: the app reads the material, then shows its summary
// and the key ideas it will build practice from.
export default function MaterialPage({ params }: PageProps<"/sessions/[id]/material">) {
  return (
    <Suspense
      fallback={
        <PageShell title="What I'm studying">
          <p className="text-ink-muted">Loading…</p>
        </PageShell>
      }
    >
      {params.then(({ id }) => <Material id={id} />)}
    </Suspense>
  );
}

async function Material({ id }: { id: string }) {
  const session = await getSession(id);
  if (!session) notFound();
  const { material } = session;
  const ready = material.status === "ready";
  const pages = Array.from({ length: material.page_count }, (_, i) => i + 1);

  return (
    <PageShell
      title={material.title || "What I'm studying"}
      intro="Step 2 of 4: what the app found in the material."
    >
      <div className="grid gap-6">
        {!ready ? (
          <ReadingMaterial sessionId={id} status={material.status} error={material.error} />
        ) : (
          <>
            {material.summary && (
              <Notice title="In short">
                <p>{material.summary}</p>
              </Notice>
            )}
            <Card title={`Key ideas (${material.key_ideas.length})`} aside="Practice comes from these">
              <ol className="grid gap-3">
                {material.key_ideas.map((k, i) => (
                  <li key={k.id} className="flex gap-3">
                    <span className="font-display font-semibold text-accent">{i + 1}.</span>
                    <span>
                      <span className="font-medium text-ink">{k.title}.</span>{" "}
                      <span className="text-ink-muted">{k.explanation}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
            <div>
              <ButtonLink href={`/sessions/${id}/practice`} size="lg" data-step="start-practice">
                Start practice
              </ButtonLink>
            </div>
          </>
        )}

        {pages.length > 0 && (
          <Card title="Pages">
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {pages.map((n) => (
                <li key={n} className="overflow-hidden rounded-control border border-line bg-surface-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={pageUrl(id, n)} alt={`Page ${n}`} className="aspect-square w-full object-contain" />
                  <p className="px-2 py-1 text-xs text-ink-muted">Page {n}</p>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </PageShell>
  );
}
