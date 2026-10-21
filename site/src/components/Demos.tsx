import { event } from "@/content/event";
import Section from "./Section";

export default function Demos() {
  return (
    <Section id="demos" eyebrow="Live demos" title="What you'll see">
      <div className="grid gap-4 sm:grid-cols-2">
        {event.demos.map((demo) => (
          <div
            key={demo.name}
            className="rounded-2xl border border-neutral-200 p-6"
          >
            <h3 className="mb-2 font-bold text-navy">{demo.name}</h3>
            <p className="text-sm leading-relaxed text-neutral-600">
              {demo.blurb}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}
