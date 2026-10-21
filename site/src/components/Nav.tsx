import Container from "./Container";
import RegisterButton from "./RegisterButton";

const links = [
  { href: "#overview", label: "Overview" },
  { href: "#demos", label: "Demos" },
  { href: "#agenda", label: "Agenda" },
  { href: "#audience", label: "Who it's for" },
  { href: "#hosts", label: "Hosts" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <Container className="flex h-14 items-center justify-between gap-4">
        <a href="#top" className="text-sm font-bold text-navy">
          Miro x Devin
        </a>
        <nav className="hidden items-center gap-5 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-neutral-600 hover:text-navy"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <RegisterButton className="px-4 py-2">Register</RegisterButton>
      </Container>
    </header>
  );
}
