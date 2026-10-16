import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, PageShell } from "@/components/ui";
import { APP_NAME } from "@/theme/brand";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <PageShell title="Sign in" intro={`${APP_NAME} is invite-only for now. We'll email you a sign-in link; there's no password.`}>
      <Card className="max-w-md">
        <Suspense>
          <LoginForm />
        </Suspense>
      </Card>
    </PageShell>
  );
}
