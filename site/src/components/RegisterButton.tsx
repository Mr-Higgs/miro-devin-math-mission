import { event } from "@/content/event";

export default function RegisterButton({
  children = "Register on Luma",
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={event.lumaUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block rounded-full bg-accent px-6 py-3 text-sm font-bold text-navy transition hover:brightness-95 ${className}`}
    >
      {children}
    </a>
  );
}
