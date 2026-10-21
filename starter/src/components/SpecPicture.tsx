// Renders a generated question's picture_spec using the active subject's
// Picture component; when the subject can't draw it (e.g. generic), the
// spec's "other" text (or the whole spec) is shown instead.
import { subject } from "@/subjects";

export function SpecPicture({ spec }: { spec: Record<string, unknown> }) {
  const Picture = subject.Picture;
  if (Picture) return <Picture spec={spec} />;
  const other = typeof spec.other === "string" ? spec.other : JSON.stringify(spec);
  return <p className="text-sm italic text-ink-muted">[Picture: {other}]</p>;
}
