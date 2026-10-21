// The active subject, chosen by mission.subject. Core code imports only from
// "@/subjects" — never from a subject folder directly.
import { mission } from "@mission";
import { generic } from "./generic";
import { math } from "./math";
import type { Subject } from "./types";

const subjects: Record<string, Subject> = { math, generic };

export const subject: Subject = subjects[mission.subject] ?? generic;
