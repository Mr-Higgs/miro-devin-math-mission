import { event } from "@/content/event";
import Section from "./Section";

export default function Audience() {
  return (
    <Section id="audience" eyebrow="Who it's for" title="Who should come">
      <div className="grid gap-8 md:grid-cols-2">
        {event.audience.map((group) => (
          <div key={group.group}>
            <h3 className="mb-4 text-lg font-bold text-navy">{group.group}</h3>
            <div className="flex flex-col gap-4">
              {group.segments.map((seg) => (
                <div
                  key={seg.name}
                  className="rounded-2xl border border-neutral-200 p-5"
                >
                  <p className="mb-1 font-semibold text-navy">{seg.name}</p>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    {seg.blurb}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
