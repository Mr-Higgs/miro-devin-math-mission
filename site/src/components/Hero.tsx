import { event } from "@/content/event";
import Container from "./Container";
import RegisterButton from "./RegisterButton";

export default function Hero() {
  return (
    <div id="top" className="bg-white py-16 sm:py-24">
      <Container>
        <p className="mb-3 text-sm font-semibold tracking-widest uppercase text-neutral-500">
          {event.subtitle}
        </p>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-navy sm:text-6xl">
          {event.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-neutral-700">
          {event.positioning}
        </p>
        <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-navy">
          <span className="rounded-full border border-neutral-300 px-4 py-2">
            {event.date}
          </span>
          <span className="rounded-full border border-neutral-300 px-4 py-2">
            {event.time}
          </span>
          <span className="rounded-full border border-neutral-300 px-4 py-2">
            {event.venue.name} · {event.venue.address}
          </span>
        </div>
        <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <RegisterButton className="px-8 py-4 text-base" />
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-600">
            {event.perks.map((perk) => (
              <li key={perk} className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </div>
  );
}
