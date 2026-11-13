import type { Metadata } from "next";
import { Suspense } from "react";
import { Button, Card, PageShell, TextField } from "@/components/ui";
import { mission } from "@mission";
import { getProfile } from "@/lib/store";
import { saveOnboarding } from "./actions";

export const metadata: Metadata = { title: "Get to know me" };

// Screen 1 of 4: who the app is for. Prefilled from mission.config.ts; saved
// to data/profile.json. Home redirects here until it's done.
export default function OnboardPage() {
  return (
    <PageShell title="Get to know me" intro="Step 1 of 4: a few details, once. The app uses them to pitch its practice questions.">
      <Card className="max-w-xl">
        <Suspense fallback={<p className="text-ink-muted">Loading…</p>}>
          <OnboardForm />
        </Suspense>
      </Card>
    </PageShell>
  );
}

async function OnboardForm() {
  const profile = await getProfile();
  const defaults = {
    name: profile?.learnerName ?? mission.learner.name,
    persona: profile?.persona ?? mission.learner.persona,
    goal: profile?.goal ?? mission.learner.goal,
    topic: profile?.topic ?? mission.topic,
    level: (profile?.level ?? mission.level) as string,
  };

  return (
    <form action={saveOnboarding} className="grid gap-5">
      <TextField
        label="Learner's name or nickname"
        name="name"
        required
        maxLength={40}
        defaultValue={defaults.name}
        autoComplete="off"
      />
      <TextField
        label="About the learner (optional)"
        name="persona"
        maxLength={200}
        defaultValue={defaults.persona}
        hint="e.g. a 3rd grader who loves dinosaurs — used to pitch the questions."
        autoComplete="off"
      />
      <TextField
        label="Why are they learning this? (optional)"
        name="goal"
        maxLength={200}
        defaultValue={defaults.goal}
        hint="e.g. to feel confident on next week's quiz."
        autoComplete="off"
      />
      <TextField
        label="What they're learning"
        name="topic"
        maxLength={120}
        defaultValue={defaults.topic}
        autoComplete="off"
      />
      <div className="grid gap-2">
        <label htmlFor="level" className="field-label">
          Level
        </label>
        <select
          id="level"
          name="level"
          defaultValue={defaults.level}
          className="rounded-control border border-line bg-surface-muted px-3 py-2 text-ink"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <Button type="submit" size="lg" data-step="save-profile">
        Save and continue
      </Button>
    </form>
  );
}
