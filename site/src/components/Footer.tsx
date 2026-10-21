import { event } from "@/content/event";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="bg-navy py-12 text-white">
      <Container className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-lg font-extrabold tracking-tight">
          Miro <span className="text-accent">x</span> Devin
        </p>
        <div className="flex flex-col gap-2 text-sm text-neutral-300">
          <a
            href={event.lumaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent hover:underline"
          >
            Register on Luma
          </a>
          <p>Part of Miro Meetups</p>
        </div>
      </Container>
    </footer>
  );
}
