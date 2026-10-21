import { event } from "@/content/event";
import Section from "./Section";

export default function Series() {
  return (
    <Section id="series" eyebrow="The series" title="Part of a series">
      <p className="max-w-3xl leading-relaxed text-neutral-700">
        {event.series}
      </p>
    </Section>
  );
}
