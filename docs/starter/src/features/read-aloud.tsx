"use client";

// Example feature: a "Read aloud" button on each practice question, using the
// browser's built-in speech (no dependencies). No-ops quietly when the
// browser can't speak.
import { useState } from "react";
import type { Feature } from "./types";

function textFor(question: { prompt: string; choices: Record<string, string> | null }): string {
  const choices = question.choices
    ? " " + Object.entries(question.choices).map(([k, v]) => `${k}. ${v}`).join(" ")
    : "";
  return question.prompt + choices;
}

function ReadAloudButton({ question }: { question: { prompt: string; choices: Record<string, string> | null } }) {
  const [speaking, setSpeaking] = useState(false);
  if (typeof window !== "undefined" && !("speechSynthesis" in window)) return null;

  const toggle = () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(textFor(question));
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="text-sm font-medium text-accent hover:underline"
      aria-pressed={speaking}
    >
      {speaking ? "Stop reading" : "Read aloud"}
    </button>
  );
}

export const readAloud: Feature = {
  id: "read-aloud",
  name: "Read aloud",
  Practice: ReadAloudButton,
};
