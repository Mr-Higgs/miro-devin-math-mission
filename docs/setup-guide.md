# Phase 1 Setup Guide: Accounts

Everything the tutor needs to create before Claude can set up the project ([roadmap Phase 1](roadmap.md#phase-1--foundation)). About 20–30 minutes. All three accounts are **free** for now.

**Ground rules**
- **Do these yourself.** Claude never creates accounts or handles passwords.
- **Never paste passwords, keys or secret tokens into the chat.** When a key is needed, Claude will create a file for you to paste it into, like the `.env` file for the Google key.
- **Use the same email for all three** (e.g., miapenbiz@gmail.com). It keeps things simple.
- **Save every password in a password manager** (Apple Passwords, 1Password, etc.).

## Checklist

| # | Account | Why the project needs it | Cost |
|---|---|---|---|
| 1 | **GitHub** | Stores the code (private repo) and its history | Free |
| 2 | **Vercel** | Hosts the app on the web; updates it automatically from GitHub | Free (Hobby plan) |
| 3 | **Supabase** | Database, logins, and private photo storage | Free tier |
| — | Google Cloud | Gemini AI. **Already done** (billing on, $5 limit) | Pay as you go |

Do them **in order**: Vercel and Supabase both let you sign up *with* your GitHub account, which saves a password each.

---

## 1. GitHub

**You may already have one.** The old repo was at `github.com/miapen-snail/gabe-math-app`, so try signing in as **miapen-snail** first. If that works, skip to step 5.

1. Go to **github.com/signup**.
2. Enter your email, a password (save it), and a username.
3. Solve the puzzle and enter the code GitHub emails you.
4. Choose the **Free** plan if asked. Skip any personalization questions.
5. **Turn on two-factor authentication:** profile picture (top right) → **Settings** → **Password and authentication** → **Enable two-factor authentication**. Use an authenticator app, or a passkey on your Mac/iPhone. GitHub requires this for people who push code, and it protects the account that holds the project. **Save the recovery codes** it shows you in your password manager.

✅ **Done when:** you can sign in to github.com and 2FA is on.

---

## 2. Vercel

1. Go to **vercel.com/signup**.
2. Choose **Hobby** (free, personal projects). The Hobby plan is for non-commercial use, which fits the invite-only stage. Upgrading comes later if the app charges money (roadmap Phase 4).
3. Enter your name, then click **Continue with GitHub**.
4. GitHub asks you to **authorize Vercel**. Click **Authorize**. This lets Vercel see your repos so it can publish the app when the code changes.
5. If Vercel asks you to **import a project** or **install the GitHub app**, **skip it for now**. The repo doesn't exist yet; Claude connects it during setup.

✅ **Done when:** you see the Vercel dashboard (an empty "Overview" page).

---

## 3. Supabase

1. Go to **supabase.com** → **Start your project**.
2. Click **Continue with GitHub** and authorize Supabase.
3. **Create an organization** when asked:
   - Name: `Math Mission` (anything works)
   - Type: **Personal**
   - Plan: **Free**
4. **Create a project:**
   - Name: `math-mission`
   - **Database password:** click **Generate a password**, then **save it in your password manager right away.** Supabase won't show it again. **Don't send it to Claude.**
   - Region: **East US** (closest to Florida)
   - Leave the other settings as they are and click **Create new project**. It takes a minute or two to finish.
5. Leave the project's keys (API settings page) alone for now. Claude will create a private file for you to paste them into during setup, the same way as the Google key.

**Note (2026-10-15):** the tutor's Supabase account uses a **different email** from the other accounts, because it holds credits. That's fine. Create the project inside the **organization that holds the credits**, and sign in with that Supabase account everywhere, including the CLI.

**Heads-up:** free Supabase projects **pause after about a week with no activity**. If that happens, open the project in the Supabase dashboard and click **Restore**. Nothing is lost.

✅ **Done when:** the `math-mission` project shows as active in the Supabase dashboard, and the database password is in your password manager.

---

## 4. Tools on this Mac

The accounts come with command-line tools Claude uses during setup. You'll need to **sign in to each one yourself** in a browser window it opens. Claude will give you each command with a Run button when it's time.

| Tool | Status on this Mac | What happens |
|---|---|---|
| `git` | ✅ Installed | Nothing to do |
| **Node.js** | Version 20.3, **too old** for current Next.js (needs 20.9+) | Claude updates it (with your OK) |
| **GitHub CLI** (`gh`) | Not installed | Claude installs it; **you** run `gh auth login` and approve in the browser |
| **Vercel CLI** | Not installed | Runs on demand; **you** run `vercel login` and approve in the browser |
| **Supabase CLI** | Not installed | Runs on demand; **you** run `supabase login` and approve in the browser |

Each sign-in opens a browser page asking you to approve access. **Approve only pages that open from a command you just ran.**

---

## Not needed yet
- **Domain name:** Phase 4, with the final name ([decision 005](decisions/005-name-and-domain.md)).
- **Error tracking service:** Phase 3.
- **Anthropic / OpenAI keys:** not needed; Gemini was chosen ([decision 002](decisions/002-ai-provider.md)).
- **Google spending alert:** worth setting before Phase 3 (Google Cloud console → Billing → Budgets & alerts).

## When you're done
Tell Claude **"accounts are ready"** and which GitHub username you used. Setup continues from roadmap Phase 1.
