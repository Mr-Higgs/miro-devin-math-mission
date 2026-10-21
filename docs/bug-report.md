# 🐛 the earlier prototype — Bug Report
**Repo:** https://github.com/miapen-snail/gabe-math-app
**Files audited:** `index.html`, `v2b-hologram.html`
**Date:** April 6, 2026

---

## 🔴 Critical Bugs (Broken Core Functionality)

### BUG-01 — Upload Zones Have No File Input
**Where:** Setup screen (Screen 2) and Practice Sheet screen (Screen 4)
**What:** Both "Beam Test File" and "Upload Completed Worksheet" areas are plain `<div>` elements with no `<input type="file">` inside. Clicking them does absolutely nothing.
**Fix:** Wrap a hidden `<input type="file" accept=".pdf,image/*">` inside each upload zone and trigger it on click.

---

### BUG-02 — "Calculation Field" Is Not Editable
**Where:** Practice Sheet screen (Screen 4), all 3 question cards
**What:** The `.calc-field` box that says "Show your work here..." is a regular `<div>`. Kids can't click into it and type their work — it's read-only.
**Fix:** Add `contenteditable="true"` to the `.calc-field` div, or replace it with a `<textarea>`.

---

### BUG-03 — "Generate Printable" Button Does Nothing
**Where:** Practice Sheet screen (Screen 4)
**What:** The "🖨️ GENERATE PRINTABLE" button has no `onclick` handler. Pressing it does nothing.
**Fix:** Wire it to a `window.print()` call, ideally with a print-specific CSS stylesheet.

---

### BUG-04 — "Beam Up File" Button Does Nothing
**Where:** Practice Sheet screen (Screen 4)
**What:** The "🚀 BEAM UP FILE" button has no `onclick` handler and no connected file input. Pressing it does nothing.
**Fix:** Connect it to the upload input and a handler function.

---

### BUG-05 — Review Action Buttons Are Dead
**Where:** Review screen (Screen 5)
**What:** Both "✅ OBJECTIVE CLEARED +20⭐" and "🔄 RETRY OBJECTIVE" have no `onclick` handlers. They do nothing when clicked — no stars are awarded, no objective is marked, nothing resets.
**Fix:** Add handler functions that update state (mark question correct/incorrect, add stars, navigate to next question).

---

### BUG-06 — Can Only Review Question 3 — No Navigation Between Questions
**Where:** Review screen (Screen 5)
**What:** Only one question (24 ÷ 4, hardcoded as question 3) is shown. There's no way to navigate to questions 1, 2, 4, or 5. The progress dots (1–5) are decorative only and can't be clicked.
**Fix:** Make the dots clickable and render the review card dynamically based on the selected question index.

---

### BUG-07 — Only 3 of 5 Questions Appear in Practice Sheet
**Where:** Practice Sheet screen (Screen 4)
**What:** The AI Extraction screen identifies 5 "threats" (24÷4, 15+8, 7×5, 18−6, 3×9), but the Practice Sheet only shows 3 questions. Questions 4 and 5 (18−6 and 3×9) are missing entirely.
**Fix:** Generate practice questions dynamically from the same threat list array, not a separate hardcoded block.

---

## 🟡 Significant Bugs (Logic & Data Integrity)

### BUG-08 — Threat Toggle Switches Have No Effect
**Where:** AI Extraction screen (Screen 3)
**What:** Each threat row has a toggle switch to presumably include/exclude it from the practice session. Toggling them changes their visual appearance but has zero effect on which questions show up in the Practice Sheet.
**Fix:** Store toggle state per question and filter the practice sheet questions based on active toggles.

---

### BUG-09 — Setup Name Fields Are Never Used
**Where:** Setup screen (Screen 2) → entire app
**What:** The "Cadet Name" and "Tutor Name" inputs are never read or stored. "COMMANDER" on the welcome screen and "the tutor" in the prize beacon are hardcoded strings — filling in the setup form has zero effect.
**Fix:** Read the input values via `document.querySelector` and store them in variables. Inject them into the relevant screens dynamically.

---

### BUG-10 — Progress Bar Shows Animation Instead of Actual Progress
**Where:** Welcome screen (Screen 1)
**What:** The `.progress-fill` element has `style="width: 65%"` set inline, but the CSS animation `slide` (which loops 0% → 100% → 0%) overrides this completely. The bar never shows a true 65% — it just pulses endlessly. This makes the progress bar meaningless.
**Fix:** Remove the `slide` animation from `.progress-fill` and only use the inline width to display real progress. Use a different animation (e.g., shimmer) that doesn't affect width.

---

### BUG-11 — Celebration Screen Stats Are All Hardcoded Fake Data
**Where:** Celebration screen (Screen 6)
**What:** All four stat boxes show fabricated values ("5", "100⭐", "8:42", "4 → 5") regardless of what actually happened in the session. No actual tracking of score, time, stars, or level occurs anywhere in the app.
**Fix:** Implement a simple state object (e.g., `appState`) to track stars earned, correct answers, elapsed time, and level. Display these on the celebration screen.

---

### BUG-12 — Progress Dot Is Always Hardcoded to Question 3
**Where:** Review screen (Screen 5)
**What:** `initProgressDots()` hardcodes dot 3 as active. The "OBJECTIVE 3 OF 5 — 2 COMPLETE" header text is also hardcoded and never changes.
**Fix:** Track current question index in state and pass it to `initProgressDots()`. Update the header dynamically.

---

### BUG-13 — "Add Ghost Threat" Just Shows an Alert
**Where:** AI Extraction screen (Screen 3)
**What:** Clicking "+ ADD GHOST THREAT" only calls `alert('Ghost Threat added to matrix!')` and does nothing to the actual list.
**Fix:** Replace the alert with a real UI prompt and push the new threat into the `threats` array, then re-render.

---

## 🟠 UI/UX Issues

### BUG-14 — `index.html` and `v2b-hologram.html` Are Identical Files
**What:** Both files contain the exact same code. Having two copies is confusing — it's unclear which is canonical, and any fix applied to one must be manually duplicated to the other.
**Fix:** Delete the duplicate. Keep only `index.html` as the main file.

---

### BUG-15 — No Back Button on Screens 3, 4, and 5
**Where:** AI Extraction (Screen 3), Practice Sheet (Screen 4), Review (Screen 5)
**What:** Once you navigate past the Setup screen, there is no way to go back to a previous screen. Users are stuck going forward only. If they navigate to the wrong screen by accident, they can't recover without reloading the page (losing all entered data).
**Fix:** Add a back button (like the one on Screen 2) to each screen.

---

### BUG-16 — Scanning Ring Has No Icon
**Where:** AI Extraction screen (Screen 3)
**What:** The `.scanning-ring` spinning circle is empty — unlike the welcome screen's rocket ring (🚀), nothing is centered inside it. Visually it just looks like a spinning empty ring with no context.
**Fix:** Add a relevant emoji or icon (e.g., 🧠, ⚙️, 🔍) inside the scanning ring.

---

### BUG-17 — `overflow: hidden` on Body Can Cut Off Content
**Where:** Entire app
**What:** `body { overflow: hidden; height: 100vh; }` means if a screen's content is taller than the viewport, it gets clipped. The Practice Sheet screen is particularly at risk — it has 3 question cards + two action sections which could overflow on shorter screens or mobile.
**Fix:** The individual `.screen` elements already have `overflow-y: auto`, but the body's `overflow: hidden` can still interfere. Test on smaller screens and adjust as needed.

---

## Summary Table

| # | Bug | Severity | Screen |
|---|-----|----------|--------|
| 01 | Upload zones non-functional | 🔴 Critical | Setup, Practice |
| 02 | Calc field not editable | 🔴 Critical | Practice |
| 03 | Generate Printable does nothing | 🔴 Critical | Practice |
| 04 | Beam Up File does nothing | 🔴 Critical | Practice |
| 05 | Review action buttons dead | 🔴 Critical | Review |
| 06 | No question navigation in review | 🔴 Critical | Review |
| 07 | Only 3 of 5 questions shown | 🔴 Critical | Practice |
| 08 | Toggles don't affect question list | 🟡 Significant | AI Screen |
| 09 | Names from setup never used | 🟡 Significant | App-wide |
| 10 | Progress bar animation overrides real value | 🟡 Significant | Welcome |
| 11 | Celebration stats all fake/hardcoded | 🟡 Significant | Celebration |
| 12 | Progress dot always hardcoded to Q3 | 🟡 Significant | Review |
| 13 | Add Threat only shows alert | 🟡 Significant | AI Screen |
| 14 | Duplicate files (index.html = v2b-hologram.html) | 🟠 UI/UX | Repo |
| 15 | No back navigation on screens 3–5 | 🟠 UI/UX | Multiple |
| 16 | Scanning ring has no icon | 🟠 UI/UX | AI Screen |
| 17 | Overflow clipping on small screens | 🟠 UI/UX | App-wide |

---

*Report generated by automated testing agent — April 6, 2026*
