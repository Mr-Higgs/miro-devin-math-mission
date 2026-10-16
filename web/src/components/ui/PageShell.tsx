import Link from "next/link";
import type { ReactNode } from "react";
import { APP_NAME } from "@/theme/brand";

/** The frame around every screen: the app bar, then the page's title and content. */
export function PageShell({
  title,
  intro,
  actions,
  children,
}: {
  title?: ReactNode;
  intro?: ReactNode;
  /** Controls on the right of the app bar, e.g. a sign-out button. */
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <header className="bg-brand text-brand-ink">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight">
            {APP_NAME}
          </Link>
          {actions}
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {(title || intro) && (
          <div className="mb-8">
            {title && <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">{title}</h1>}
            {intro && <p className="mt-2 max-w-2xl text-ink-muted">{intro}</p>}
          </div>
        )}
        {children}
      </main>
    </>
  );
}
