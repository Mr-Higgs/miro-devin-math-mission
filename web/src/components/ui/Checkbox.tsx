import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx";

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label: ReactNode;
  error?: ReactNode;
};

export function Checkbox({ label, error, id, className, ...props }: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cx("flex flex-col gap-1", className)}>
      <label htmlFor={inputId} className="flex items-start gap-3 text-sm text-ink">
        <input
          id={inputId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className="mt-0.5 size-4 shrink-0 accent-accent"
          {...props}
        />
        <span>{label}</span>
      </label>
      {error && <p id={errorId} className="pl-7 text-sm text-danger">{error}</p>}
    </div>
  );
}
