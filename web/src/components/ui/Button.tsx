import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "./cx";

type Variant = "primary" | "secondary" | "quiet" | "danger";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium transition-colors " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:shadow-glow",
  secondary: "border border-line bg-surface text-ink hover:bg-surface-muted",
  quiet: "text-accent hover:bg-accent-soft",
  danger: "bg-danger text-surface hover:opacity-90",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

type StyleProps = { variant?: Variant; size?: Size };

export function buttonClasses({ variant = "primary", size = "md" }: StyleProps = {}, extra?: string) {
  return cx(base, variants[variant], sizes[size], extra);
}

export function Button({ variant, size, className, type = "button", ...props }: StyleProps & ComponentProps<"button">) {
  return <button type={type} className={buttonClasses({ variant, size }, className)} {...props} />;
}

/** A link that looks like a button. */
export function ButtonLink({ variant, size, className, ...props }: StyleProps & ComponentProps<typeof Link>) {
  return <Link className={buttonClasses({ variant, size }, className)} {...props} />;
}
