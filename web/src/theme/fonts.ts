// The app's fonts. Change a font here; theme.css maps these to Tailwind's
// font-sans (body), font-display (headings) and font-mono classes.
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";

const body = Geist({ variable: "--font-body", subsets: ["latin"] });
const heading = Space_Grotesk({ variable: "--font-heading", subsets: ["latin"] });
const code = Geist_Mono({ variable: "--font-code", subsets: ["latin"] });

export const fontVariables = `${body.variable} ${heading.variable} ${code.variable}`;
