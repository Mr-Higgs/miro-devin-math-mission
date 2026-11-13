// The feature slot contract. A feature can add a small component to each
// practice question (screen 3) and/or to the results screen (screen 4). Add a
// feature in src/features/, then turn it on with its id in
// mission.config.ts → features.
import type { ComponentType } from "react";
import type { PracticeQuestion, Session } from "@/lib/store";

export interface Feature {
  id: string;
  name: string;
  Practice?: ComponentType<{ question: PracticeQuestion }>;
  Results?: ComponentType<{ session: Session }>;
}
