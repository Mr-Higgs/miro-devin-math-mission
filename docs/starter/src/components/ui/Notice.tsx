import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

export type Tone = "info" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  info: "border-accent bg-accent-soft",
  success: "border-success bg-success-soft",
  warning: "border-warning bg-warning-soft",
  danger: "border-danger bg-danger-soft",
};

type NoticeProps = ComponentProps<"div"> & { tone?: Tone; title?: ReactNode };

/** A message box, e.g. "Cover the student's name before taking photos." */
export function Notice({ tone = "info", title, className, children, ...props }: NoticeProps) {
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cx("rounded-control border-l-4 px-4 py-3 text-sm text-ink", tones[tone], className)}
      {...props}
    >
      {title && <p className="mb-0.5 font-semibold">{title}</p>}
      {children}
    </div>
  );
}
