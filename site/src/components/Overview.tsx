import { event } from "@/content/event";
import Section from "./Section";

export default function Overview() {
  return (
    <Section id="overview" eyebrow="Session overview" title="What this is">
      <p className="max-w-3xl text-lg leading-relaxed text-neutral-700">
        {event.overview}
      </p>
    </Section>
  );
}
