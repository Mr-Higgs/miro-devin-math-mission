import { event } from "@/content/event";
import Section from "./Section";

export default function Bring() {
  return (
    <Section id="bring" eyebrow="What to bring" title="Come ready to build">
      <ul className="grid gap-3 sm:grid-cols-2">
        {event.bring.map((item) => (
          <li
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-neutral-200 p-4 text-neutral-700"
          >
            <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-accent" />
            {item}
          </li>
        ))}
      </ul>
    </Section>
  );
}
