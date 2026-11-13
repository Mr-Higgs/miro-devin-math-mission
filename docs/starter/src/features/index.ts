// The features a team can turn on in mission.config.ts → features. Add your
// own here; keep the contract in types.ts.
import { mission } from "@mission";
import { readAloud } from "./read-aloud";
import type { Feature } from "./types";

const all: Feature[] = [readAloud];

/** The features enabled in mission.config.ts. */
export const features: Feature[] = all.filter((f) => mission.features.includes(f.id));
