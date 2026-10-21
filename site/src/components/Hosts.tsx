import { event } from "@/content/event";
import Section from "./Section";

export default function Hosts() {
  return (
    <Section id="hosts" eyebrow="Hosts" title="Your hosts">
      <div className="grid gap-4 sm:grid-cols-2">
        {event.hosts.map((host) => (
          <div
            key={host.name}
            className="rounded-2xl border border-neutral-200 p-6"
          >
            <h3 className="text-lg font-bold text-navy">{host.name}</h3>
            <p className="mt-1 text-sm font-medium text-neutral-500">
              {host.role}
            </p>
            <p className="mt-3 text-sm text-neutral-600">{host.bio}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
