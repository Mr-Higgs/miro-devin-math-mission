"use client";

/** Opens the browser's print dialog (where "Save as PDF" also lives). */
export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()}>
      {label}
    </button>
  );
}
