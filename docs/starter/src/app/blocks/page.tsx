// Every shared building block on one page, to check the look after changing
// the theme or a block. Shown on this Mac and on preview links, never on the
// live site.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge, Button, ButtonLink, Card, Checkbox, Notice, PageShell, ProgressDots, ResultBadge, TextField } from "@/components/ui";

export const metadata: Metadata = { title: "Building blocks", robots: { index: false } };

const RESULTS = ["right", "almost", "not_yet", "skipped", "needs_look"] as const;

export default function BlocksPage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  return (
    <PageShell
      title="Building blocks"
      intro="Every shared piece of the interface. Colors, fonts and effects come from src/theme/theme.css."
      actions={<Button variant="secondary">Sign out</Button>}
    >
      <div className="grid gap-6">
        <Card title="Sample screen: Practice" aside="How a real page reads">
          <div className="grid gap-4">
            <fieldset data-question-type="multiple_choice" className="card rounded-card border border-line bg-surface p-5">
              <legend className="sr-only">Question 1</legend>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-display font-semibold text-ink">Question 1</span>
                <Badge tone="warning">Needs a look</Badge>
              </div>
              <p className="text-ink">Which is the value of the 8 in the number 287?</p>
              <div className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
                {["800", "80", "8", "8,000"].map((text, i) => (
                  <label key={text} className="flex items-center gap-2 rounded-control border border-line px-3 py-1.5 text-ink">
                    <input type="radio" name="demo" value={String.fromCharCode(65 + i)} className="accent-accent" />
                    <span>
                      <span className="font-semibold">{String.fromCharCode(65 + i)}.</span> {text}
                    </span>
                  </label>
                ))}
              </div>
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-medium text-accent">Show hint</summary>
                <p className="mt-1 text-ink-muted">Say the number out loud: two hundred eighty-seven.</p>
              </details>
            </fieldset>
            <div>
              <Button size="lg" data-step="submit-answers">How did I do?</Button>
            </div>
          </div>
        </Card>

        <Card title="Buttons">
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="quiet">Quiet</Button>
            <Button variant="danger">Delete session</Button>
            <Button disabled>Disabled</Button>
            <Button size="lg">Large</Button>
            <ButtonLink href="/" variant="secondary">Link as button</ButtonLink>
          </div>
        </Card>

        <Card title="Results" aside="Badges and progress dots">
          <div className="flex flex-wrap gap-2">
            {RESULTS.map((r) => <ResultBadge key={r} result={r} />)}
            <Badge tone="accent">Feature</Badge>
            <Badge>Question 4</Badge>
          </div>
          <ProgressDots
            className="mt-5"
            states={["right", "right", "almost", "not_yet", "skipped", "needs_look", "current", "upcoming"]}
          />
        </Card>

        <Card title="Messages">
          <div className="grid gap-3">
            <Notice title="Reading the material…">The app is picking out the key ideas to practice.</Notice>
            <Notice tone="success">You got 4 of 5 right.</Notice>
            <Notice tone="warning">One question needs a look.</Notice>
            <Notice tone="danger">The answers couldn&apos;t be marked. Try again.</Notice>
          </div>
        </Card>

        <Card title="Form fields">
          <form className="grid max-w-md gap-4">
            <TextField label="Email" type="email" placeholder="you@example.com" hint="We'll send a sign-in link." />
            <TextField label="Learner's name" defaultValue="Alex" error="Use at least 2 characters." />
            <Checkbox label="I am 18 or older." />
            <Checkbox label="I accept the terms." error="Please accept the terms to continue." />
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
