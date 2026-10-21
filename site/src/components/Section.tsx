import Container from "./Container";

export default function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20 py-12 sm:py-16">
      <Container>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold tracking-widest uppercase text-neutral-500">
            {eyebrow}
          </p>
        )}
        <h2 className="mb-6 text-2xl font-bold text-navy sm:text-3xl">
          {title}
        </h2>
        {children}
      </Container>
    </section>
  );
}
