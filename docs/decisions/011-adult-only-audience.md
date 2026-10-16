# 011 — Adult-only audience

**Status:** Decided
**Date:** 2026-10-16
**Phase:** 0 (reopened)

## Question
Who uses Math Mission, and how does the design make that clear?

This came up when reconciling an October 12 plan in another folder. It pointed out that [Google's Gemini API terms](https://ai.google.dev/gemini-api/terms) (updated 2026-04-28) say:
- you must be 18 or older to use the APIs
- you won't use them in a service *"directed towards or is likely to be accessed by individuals under the age of 18"*

Math Mission uses Gemini ([002](002-ai-provider.md)), and its earlier design (the spec's stars, confetti and praise, the game look) was built for the student to watch.

## Decision
**Math Mission is for adults (18+) who support a student's learning:** parents, guardians, tutors, teachers and mentors. **Students never use, log in to, or operate the app.** The design makes this true, not just stated:

**Who can use it**
- Sign-up requires **confirming the user is 18 or older** and accepting terms that say the service is 18+ only. At the invite-only stage, invitations go only to adults.
- **No student accounts, ever:** no student login, no student email. The student exists only as a nickname the adult enters.
- The terms make the adult responsible for not letting a minor use the account.

**How it looks and reads**
- **Screens are designed for the adult:** plain, professional wording ("Missed questions," "Session results," "Grading notes"), with no cartoon characters and nothing addressed to the child. The space "mission" theme can stay as light, grown-up branding.
- **Student motivation moves off the screen and onto paper:** a printable certificate, star chart and "mission complete" page the adult hands over. No on-screen confetti, praise pop-ups or celebrations aimed at the student.
- **AI feedback is written for the adult** ([003 Amendment 2](003-grading-model.md)), e.g. "614: likely added instead of subtracting." The adult decides what to tell the student.

**Data**
- Photos are taken and uploaded by the adult, who is reminded to cover the student's name first ([006 Amendment 1](006-upload-retention.md)).
- No child personal data beyond what tutoring needs: a nickname plus schoolwork photos, deleted after the session.

**Marketing** (public launch): the landing page, copy and any ads speak to parents, tutors and mentors, never to children.

## Why
- **It matches what the app is:** a tool for the adult running a session. The tutor confirmed that the student never uploads photos or uses the app.
- **It gives the strongest position under Google's terms.** No design can guarantee how Google reads its own terms, so a legal review happens **before the invite-only launch** (moved up from the public launch).
- **It also lowers COPPA exposure:** the service is directed at adults and collects information from adults, not from children. The legal review still confirms this.

## Options considered (for student motivation)
1. **Printable rewards, adult-facing screens.** *Chosen.*
2. Keep on-screen celebrations for the student to watch. More fun on screen, but it weakens the adult-only position.

## What this means
- **Changes from earlier docs:** spec §2 (Users), §4.6 (Gamification) and §7.2 (Student Experience) are rewritten. The wireframe feedback's "engaging game" goal now applies to the printables and the adult's experience, not to an on-screen show for the student.
- **Phase 1 login** includes the 18+ confirmation and terms acceptance.
- **Phase 2** builds adult-facing screens plus printable rewards, and a name-covering reminder on upload.
- **Legal review** of Gemini's terms and COPPA comes before the Phase 3 invite-only launch.
- **Backup:** if the legal review says Gemini isn't allowed, the AI provider is one setting. The benchmark can test Claude (its published guidelines allow serving minors with safeguards) when needed.

Not legal advice.

## Affects
- **[002](002-ai-provider.md):** Amendment 1 (terms finding).
- **[003](003-grading-model.md):** Amendment 2 (feedback for the adult).
- **[006](006-upload-retention.md):** Amendment 1 (name covering, consent).
- **Spec, backend doc, roadmap.**
