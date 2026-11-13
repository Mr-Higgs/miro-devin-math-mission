# Prompts

Every instruction the app gives the AI lives here, one file per job:

| File | Job |
|---|---|
| `read-material.ts` | Read the study material → title, summary, 2–8 key ideas |
| `generate-practice.ts` | Write the practice questions from the key ideas |
| `evaluate-answers.ts` | Mark the answers that need the AI + write the summary |
| `local.ts` | Loads the plain-text files below |

The participant-editable files live at `starter/prompts/` (`teaching-style.md`,
`feedback.md`) — plain text appended to the core instructions every call — edits apply without a restart.
Change the wording there to change how the AI writes, no code needed.

The learner's name is never sent to the AI — only persona, goal, topic and
level. Keep it that way when editing these prompts.
