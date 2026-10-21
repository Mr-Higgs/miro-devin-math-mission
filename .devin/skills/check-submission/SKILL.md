---
name: check-submission
description: Run and interpret the automated submission checklist.
---

# Check the submission

Run:

```bash
cd starter && npm run check          # full: includes lint + build
npm run check -- --quick             # skip lint/build for a fast pass/fail
```

Exit code 1 means something required failed. Each line is `PASS`, `WARN` or `FAIL`.

## What each check means (and how to fix a FAIL)

| Check | Fix |
|---|---|
| `mission.config: appName / learner.name / topic customized` | Edit `starter/mission.config.ts` — the app must be personalized, not the shipped defaults. |
| `route exists: ...` | A core route folder was deleted or renamed. Restore the 5-step structure (`/onboard`, `/sessions/new`, `questions`, `practice`, `print/sheet`, `work`, `review`). |
| `store exports <fn>` | `src/lib/store/index.ts` must keep `getSession`, `createSession`, `updateSession`, `listSessions`, `getProfile`, `saveProfile`. Restore the export. |
| `AiProvider interface` / `Subject interface` | `src/lib/ai/types.ts` and `src/subjects/types.ts` must keep those exported interfaces. |
| `fixtures/<name>.json parses` | Invalid JSON — fix the file so `AI_PROVIDER=mock` keeps working. |
| `README.md customized` | Rewrite `starter/README.md` for your app (what it is, who it's for, how to run). |
| `demo video present` | WARN only — run `npm run demo:record` (see the record-demo-video skill). |
| `npm run lint` / `npm run build` | Fix the reported errors; the app must build cleanly. |
