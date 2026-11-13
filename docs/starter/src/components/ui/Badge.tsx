import type { ComponentProps } from "react";
import type { ResultKind } from "@/lib/store";
import { cx } from "./cx";

type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-ink-muted",
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}
      {...props}
    />
  );
}

const results: Record<ResultKind, { label: string; tone: BadgeTone }> = {
  right: { label: "Right", tone: "success" },
  almost: { label: "Almost", tone: "warning" },
  not_yet: { label: "Not yet", tone: "danger" },
  skipped: { label: "Skipped", tone: "neutral" },
  needs_look: { label: "Needs a look", tone: "warning" },
};

export function ResultBadge({ result }: { result: ResultKind }) {
  const { label, tone } = results[result];
  return <Badge tone={tone}>{label}</Badge>;
}
