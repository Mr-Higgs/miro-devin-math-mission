import { event } from "@/content/event";
import Section from "./Section";

export default function Agenda() {
  return (
    <Section id="agenda" eyebrow="Agenda" title={`${event.date} · ${event.time}`}>
      <ol className="relative ml-2 border-l-2 border-accent">
        {event.agenda.map((item) => (
          <li key={item.time} className="relative pb-8 pl-8 last:pb-0">
            <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-accent ring-4 ring-white" />
            <p className="text-sm font-bold text-navy">{item.time}</p>
            <p className="mt-1 text-neutral-700">{item.title}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
