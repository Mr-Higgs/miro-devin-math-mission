// Every shared building block on one page, to check the look after changing
// the theme or a block. Shown on this Mac and on preview links, never on the
// live site.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Badge, Button, ButtonLink, Card, Checkbox, GradeBadge, Notice, PageShell, ProgressDots, TextField,
} from "@/components/ui";
import { GRADE_RESULTS } from "@/lib/grading";
import { Picture } from "@/components/pictures/Picture";

export const metadata: Metadata = { title: "Building blocks", robots: { index: false } };

export default function BlocksPage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  return (
    <PageShell
      title="Building blocks"
      intro="Every shared piece of the interface. Colors, fonts and effects come from src/theme/."
      actions={<Button variant="secondary">Sign out</Button>}
    >
      <div className="grid gap-6">
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

        <Card title="Grading results" aside="Badges and progress dots">
          <div className="flex flex-wrap gap-2">
            {GRADE_RESULTS.map((r) => <GradeBadge key={r} result={r} />)}
            <Badge tone="accent">Work required</Badge>
            <Badge>Question 4</Badge>
          </div>
          <ProgressDots
            className="mt-5"
            states={["pass", "pass", "redo", "needs_check", "skipped", "current", "upcoming", "upcoming"]}
          />
        </Card>

        <Card title="Messages">
          <div className="grid gap-3">
            <Notice title="Before you take photos">Cover the student&apos;s name on each page.</Notice>
            <Notice tone="success">Practice sheet ready to print.</Notice>
            <Notice tone="warning">Two answers need your check.</Notice>
            <Notice tone="danger">The photo couldn&apos;t be read. Try again in better light.</Notice>
          </div>
        </Card>

        <Card title="Pictures (drawn from data)">
          <div className="flex flex-wrap items-start gap-8 text-ink">
            <Picture spec={{ place_value_chart: { hundreds: 3, tens: 8, ones: 5 } }} />
            <Picture spec={{ underlined: { number: 447, place: "tens" } }} />
            <Picture spec={{ rectangle: { length: 9, width: 5, units: "cm" } }} />
            <Picture spec={{ polygon: { sides: [3, 3, 5, 5, 5], units: "cm" } }} />
            <Picture spec={{ letters: "TOM" }} />
            <Picture spec={{ blocks: { hundreds: 1, tens: 3, ones: 8 } }} />
            <Picture spec={{ bundles: { count: 6, each: 100 } }} />
            <Picture spec={{ symmetry: { shape: "isosceles_trapezoid", line: "vertical" } }} />
            <Picture spec={{ symmetry: { shape: "heart", line: "horizontal" } }} />
            <Picture spec={{ other: "a sea star with five arms" }} />
          </div>
        </Card>

        <Card title="Form fields">
          <form className="grid max-w-md gap-4">
            <TextField label="Email" type="email" placeholder="you@example.com" hint="We'll send a sign-in link." />
            <TextField label="Student nickname" defaultValue="G" error="Use at least 2 characters." />
            <Checkbox label="I am 18 or older." />
            <Checkbox label="I accept the terms." error="Please accept the terms to continue." />
          </form>
        </Card>
      </div>
    </PageShell>
  );
}
