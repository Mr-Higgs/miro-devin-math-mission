# 006 — Upload retention

**Status:** Decided (amended 2026-10-16, see Amendment 1)
**Date:** 2026-10-15
**Phase:** 0

## Question
How long does the app keep what's uploaded and what it produces?

The sources disagreed:
- **Spec (§6.5):** uploads used only for the current session; nothing kept beyond the browser session.
- **Backend doc (§3.4):** keep original images, student submissions and results permanently.

## Decision

| Data | Kept | Then |
|---|---|---|
| **Photos and PDFs:** graded tests, student work, redo re-uploads | While the session is in progress | **Deleted automatically** when the session is completed, or **30 days** after upload if it never is |
| **Text and results:** extracted questions, practice questions, answer keys, pass/redo, stars | Until the tutor deletes them | — |

The tutor can delete any single session, or everything, at any time. Deletion removes photos and text immediately.

## Why
- **Photos are the sensitive part.** They show a child's handwriting, name and school, and phone photos can carry GPS location. Holding them only as long as the session needs them keeps the risk small, especially at public launch ([001](001-launch-audience.md)).
- **Photos are needed during the session.** The review screen shows the student's work next to each result (wireframe feedback, [003](003-grading-model.md)), so they can't be deleted right after the AI reads them.
- **Text and results are low-risk and useful.** They let the tutor look back, and later support tracking problem areas across sessions (like the regrouping-across-zero pattern in the [tutoring session](../../test-data/tutoring-sessions/README.md)).

## Safeguards that come with this
- **Strip photo metadata on upload,** including GPS location, before storing or sending to the AI.
- **Don't copy the student's real name from the paper.** The tutor enters a first name or nickname; the extracted text leaves out names, teacher names and school names written on the page.
- **AI provider terms:** uploads must not be used for training, and the provider should keep them as briefly as possible. This becomes a requirement in [002](002-ai-provider.md).
- **Private storage:** photos are stored encrypted, and links to them are private and expire.
- **Clear wording in the app:** the upload screen says photos are deleted when the session ends.

## What this means
- A completed session still shows its questions, practice set and results, but no photos ("Photo deleted after session").
- Sessions left unfinished for 30 days lose their photos but keep their text; the tutor can still finish them, with grading by hand for any photo-dependent step.
- The `test-data/` folder in this project is separate: it's local benchmark material, not app data, and these rules don't apply to it (it has its own privacy note).

## Affects
- **Spec §6.5:** replace "nothing persisted beyond the browser session" with the table above.
- **Backend doc §3.4:** photos move from "store permanently" to "deleted at session end / 30 days"; the data model's image URL fields must allow "deleted"; `student_name` becomes a tutor-entered nickname.
- **Decision 002:** add AI provider data terms (no training, short retention) to the comparison.
- **Phase 3:** privacy policy describes these rules; deletion controls in the app.
- **Phase 1/2 build:** automatic deletion job, metadata stripping on upload.

---

## Amendment 1 — 2026-10-16: photos come from the adult; cover names

- **Only the adult takes and uploads photos** ([decision 011](011-adult-only-audience.md)); the student never uses the app.
- **The upload screen reminds the adult to cover or crop the student's name** before taking the photo. Metadata stripping removes hidden data like GPS, but not a name written on the page. Later: automatic name blurring.
- **Consent:** the test samples in `test-data/` were taken and provided by Gabe's parent, who consents to their use (confirmed 2026-10-16). At public launch, the terms make clear that the adult uploading is responsible for having the right to share the student's work.
