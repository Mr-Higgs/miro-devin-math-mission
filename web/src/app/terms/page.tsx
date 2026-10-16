import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Card, Notice, PageShell } from "@/components/ui";
import { TERMS_VERSION } from "@/lib/terms";
import { APP_NAME } from "@/theme/brand";

export const metadata: Metadata = { title: "Terms" };

// Plain-language draft from decisions 006 and 011. Not legal advice: a lawyer
// reviews it before other families are invited (roadmap, Phase 3). Change
// TERMS_VERSION in src/lib/terms.ts whenever this page changes.
export default function TermsPage() {
  return (
    <PageShell title="Terms of use" intro={`Version ${TERMS_VERSION}`}>
      <Card className="max-w-2xl">
        <Notice tone="warning" title="Draft">
          These terms are a draft for invited testers and will be reviewed before {APP_NAME} opens to more people.
        </Notice>
        <div className="mt-6 grid gap-5 text-ink">
          <Section title="Who can use it">
            {APP_NAME} is only for adults aged 18 or older who support a student&apos;s learning, such as parents,
            guardians, tutors, teachers and mentors. There are no student accounts.
          </Section>
          <Section title="Your account">
            Only you use your account. Don&apos;t let a student or anyone under 18 use it, sign in, or upload work. You
            are responsible for what is uploaded from your account.
          </Section>
          <Section title="Photos and the student's privacy">
            Before taking photos, cover the student&apos;s name and any other personal details. Enter only a nickname
            for the student. Photos are deleted when a session is finished, or 30 days after upload at the latest.
            The questions and results are kept until you delete them, and you can delete a session or all your data
            at any time.
          </Section>
          <Section title="AI">
            {APP_NAME} uses an AI service (Google Gemini) to read uploaded work, write practice questions and suggest
            grades. AI can make mistakes: check its results, and you decide what to tell the student.
          </Section>
          <Section title="Invite-only testing">
            The app is being tested and may change, have errors or be unavailable. Access may be withdrawn at any time.
          </Section>
        </div>
      </Card>
    </PageShell>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-ink-muted">{children}</p>
    </section>
  );
}
