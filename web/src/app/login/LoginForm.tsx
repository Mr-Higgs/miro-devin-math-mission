"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Button, Notice, TextField } from "@/components/ui";
import { login, type LoginState } from "./actions";

const start: LoginState = { step: "email" };

export function LoginForm() {
  const [state, action, pending] = useActionState(login, start);
  const linkFailed = useSearchParams().get("link") === "failed";

  if (state.step === "email") {
    return (
      <form action={action} className="grid gap-4">
        {linkFailed && (
          <Notice tone="warning" title="That sign-in link didn't work">
            Links work once, expire after an hour, and must be opened in the same browser you asked from. Send a new
            one below.
          </Notice>
        )}
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          error={state.error}
          hint="Use the email address you were invited with."
        />
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Sending…" : "Email me a sign-in link"}
        </Button>
      </form>
    );
  }

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="email" value={state.email} />
      <Notice title="Check your email">
        If <strong>{state.email}</strong> has been invited, a sign-in link is on its way. It can take a minute; check
        your spam folder too. <strong>Open the link in this browser</strong>, on this device.
      </Notice>

      <details className="rounded-control border border-line px-4 py-3" open={Boolean(state.error)}>
        <summary className="cursor-pointer text-sm font-medium text-ink">Got a code instead?</summary>
        <div className="mt-3 grid gap-3">
          <TextField
            label="Sign-in code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            error={state.error}
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Checking…" : "Sign in with code"}
          </Button>
        </div>
      </details>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="resend" value="1" variant="quiet" disabled={pending}>
          Send a new link
        </Button>
        <Button type="submit" name="restart" value="1" variant="quiet" disabled={pending}>
          Use a different email
        </Button>
      </div>
    </form>
  );
}
