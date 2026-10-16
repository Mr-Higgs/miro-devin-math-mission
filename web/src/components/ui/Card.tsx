import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

type CardProps = ComponentProps<"section"> & {
  title?: ReactNode;
  /** Small text or controls on the right of the title row. */
  aside?: ReactNode;
};

export function Card({ title, aside, className, children, ...props }: CardProps) {
  return (
    <section className={cx("rounded-card border border-line bg-surface p-5 shadow-card sm:p-6", className)} {...props}>
      {(title || aside) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          {title && <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>}
          {aside && <div className="text-sm text-ink-muted">{aside}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
