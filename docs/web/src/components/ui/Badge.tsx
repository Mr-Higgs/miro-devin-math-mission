import type { ComponentProps } from "react";
import type { GradeResult } from "@/lib/grading";
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

// Wording is for the adult running the session (decision 011).
const grades: Record<GradeResult, { label: string; tone: BadgeTone }> = {
  pass: { label: "Pass", tone: "success" },
  redo: { label: "Redo", tone: "danger" },
  needs_check: { label: "Needs your check", tone: "warning" },
  skipped: { label: "Skipped", tone: "neutral" },
};

export function GradeBadge({ result }: { result: GradeResult }) {
  const { label, tone } = grades[result];
  return <Badge tone={tone}>{label}</Badge>;
}
