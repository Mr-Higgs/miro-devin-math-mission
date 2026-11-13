import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx";

type TextFieldProps = ComponentProps<"input"> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
};

export function TextField({ label, hint, error, id, className, ...props }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="field-label font-medium text-ink">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className={cx(
          "h-11 rounded-control border bg-surface px-3 text-ink placeholder:text-ink-muted",
          error ? "border-danger" : "border-line focus:border-accent",
        )}
        {...props}
      />
      {hint && <p id={hintId} className="text-sm text-ink-muted">{hint}</p>}
      {error && <p id={errorId} className="text-sm text-danger">{error}</p>}
    </div>
  );
}
