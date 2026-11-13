"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

/** Flashcard answer: reveal the back of the card, then self-mark. */
export function FlashcardInput({ name, answer }: { name: string; answer: string }) {
  const [shown, setShown] = useState(false);

  return (
    <div className="mt-3 grid gap-3">
      {!shown ? (
        <div>
          <Button variant="secondary" onClick={() => setShown(true)}>
            Show answer
          </Button>
        </div>
      ) : (
        <>
          <p className="rounded-control border border-line bg-surface-muted px-3 py-2 text-sm text-ink">{answer}</p>
          <div className="flex flex-wrap gap-4 text-sm text-ink">
            <label className="flex items-center gap-2">
              <input type="radio" name={name} value="knew" className="accent-accent" />
              I knew it
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name={name} value="not_yet" className="accent-accent" />
              Not yet
            </label>
          </div>
        </>
      )}
    </div>
  );
}
