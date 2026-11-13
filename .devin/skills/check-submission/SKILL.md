---
name: check-submission
description: Run and interpret the automated submission checklist.
---

# Check the submission

Run:

```bash
cd docs/starter && npm run check          # full: includes lint + build
npm run check -- --quick             # skip lint/build for a fast pass/fail
```

Exit code 1 means something required failed. Each line is `PASS`, `WARN` or `FAIL`.

## What each check means (and how to fix a FAIL)

| Check | Fix |
|---|---|
| `mission.config: appName / learner.name / topic customized` | Edit `docs/starter/mission.config.ts` — the app must be personalized, not the shipped defaults. |
| `route exists: ...` | A route folder was deleted or renamed. Restore the four screens (`/onboard`, `/sessions/new`, `material`, `practice`, `results`). |
| `data-step "..." hook present` | A flow button lost its `data-step` attribute (the video and check use them). Put it back on the control. |
| `core unchanged` | A core file changed, went missing, or a new file appeared in a core dir. The FAIL names them — restore each with `git checkout <file>` or ask a helper. New work belongs in `src/features/` or `src/app/`. |
| `fixtures/*.json passes checks` | The mock answers must pass the app's own validators against `mission.config.ts` (count, allowed types, key idea ids). Rewrite the fixtures for your learner — see the tutor-kit-rules skill. |
| `prompts personalized` | Edit `prompts/teaching-style.md` or `prompts/feedback.md` so the AI sounds like your team. |
| `README.md customized` | Rewrite `docs/starter/README.md` for your app (what it is, who it's for, how to run). |
| `no keys committed` | A tracked file looks like an API key or an `.env*` file other than `.env.example`. Remove it from git history and keep keys in `.env.local`. |
| `demo video present` | WARN only — run `npm run demo:record` (see the record-demo-video skill). |
| `npm run lint` / `npm run build` | Fix the reported errors; the app must build cleanly. |
