// The app's fonts. Change a font here; theme.css maps these to Tailwind's
// font-sans (body), font-display (headings) and font-mono classes.
import { Geist, Geist_Mono, Orbitron } from "next/font/google";

const body = Geist({ variable: "--font-body", subsets: ["latin"] });
// Headings: Orbitron, the HUD look (decision 011, Amendment 1).
const heading = Orbitron({ variable: "--font-heading", subsets: ["latin"] });
const code = Geist_Mono({ variable: "--font-code", subsets: ["latin"] });

export const fontVariables = `${body.variable} ${heading.variable} ${code.variable}`;
