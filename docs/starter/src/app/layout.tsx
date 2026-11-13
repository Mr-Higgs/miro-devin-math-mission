import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { mission } from "@mission";
import { APP_NAME, APP_TAGLINE } from "@/theme/brand";
import { fontVariables } from "@/theme/fonts";
import { GalaxyBackground } from "@/components/GalaxyBackground";

export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: APP_TAGLINE,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontVariables} h-full antialiased`}
      style={{ "--mission-accent": mission.theme.accent } as CSSProperties}
    >
      <body className="min-h-full flex flex-col font-sans">
        <GalaxyBackground />
        {children}
      </body>
    </html>
  );
}
