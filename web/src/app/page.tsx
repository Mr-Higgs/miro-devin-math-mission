import { Card, Notice, PageShell } from "@/components/ui";
import { APP_NAME, APP_TAGLINE } from "@/theme/brand";

// Placeholder home page until the login step (Phase 1) replaces it.
export default function Home() {
  return (
    <PageShell title={APP_NAME} intro={APP_TAGLINE}>
      <Card title="Invite-only for now">
        <Notice>
          {APP_NAME} is being built and is open to invited adults only. Sign-in is coming soon.
        </Notice>
      </Card>
    </PageShell>
  );
}
