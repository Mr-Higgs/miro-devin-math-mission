import { signOut } from "@/lib/auth-actions";
import { buttonClasses } from "@/components/ui";

/** For the app bar (PageShell's actions). */
export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className={buttonClasses({ variant: "quiet" }, "text-brand-ink hover:bg-transparent hover:underline")}
      >
        Sign out
      </button>
    </form>
  );
}
