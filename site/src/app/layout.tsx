import type { Metadata } from "next";
import "./globals.css";
import { event } from "@/content/event";

export const metadata: Metadata = {
  title: `${event.title}: ${event.subtitle}`,
  description: event.positioning,
  openGraph: {
    title: `${event.title}: ${event.subtitle}`,
    description: event.positioning,
    siteName: event.subtitle,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
