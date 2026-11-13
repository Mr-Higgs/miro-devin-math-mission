"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button, Checkbox, Notice } from "@/components/ui";
import { confirmAdult, type WelcomeState } from "./actions";

export function WelcomeForm() {
  const [state, action, pending] = useActionState(confirmAdult, {} as WelcomeState);

  return (
    <form action={action} className="grid gap-5">
      <Checkbox name="age" value="yes" label="I am 18 or older." error={state.ageError} />
      <Checkbox
        name="terms"
        value="yes"
        error={state.termsError}
        label={
          <>
            I accept the{" "}
            <Link href="/terms" target="_blank" className="text-accent underline">
              terms
            </Link>
            , including that only I use this account, and never the student.
          </>
        }
      />
      {state.error && <Notice tone="danger">{state.error}</Notice>}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
