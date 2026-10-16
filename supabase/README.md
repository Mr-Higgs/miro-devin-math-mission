# Database (Supabase)

Linked to the Supabase project **Math Mission** (ref `mnlhcdxsobppgymkwcqi`, US East / Ohio).

## Every database change is a migration file
Decision 007, "Built for change": what the database stores only changes through numbered SQL files in `supabase/migrations/`, kept in git. **Never change tables by hand in the Supabase dashboard.** The same files build every copy of the database, so they can't drift apart.

Run these from the `web/` folder:

| Command | What it does |
|---|---|
| `npm run db:new -- add_sessions` | Creates an empty, dated file like `migrations/20261016120000_add_sessions.sql` to write the change in |
| `npm run db:status` | Lists which migration files the live database already has |
| `npm run db:test` | Builds a throwaway copy of the database from the migration files and checks the privacy rules (24 checks). **Run before every `npm run db:push`.** When you add a migration, add its privacy checks to `supabase/tests/privacy.test.mjs` |
| `npm run db:push` | Applies new migration files to the live database. **Changes real data: only after the tutor says yes** |
| `npm run db:types` | Rewrites `web/src/lib/supabase/database.types.ts` so the app's code knows the tables. Run after each push |

## Rules for a migration file
- **Never edit a file that has been pushed.** Fix it with a new file.
- **Turn on row-level security for every new table**, with rules so each adult sees only their own data. The publishable key in the browser relies on this.
- **Existing data must keep working:** add columns with defaults, and move data in the same file when renaming.
- Photos go in a **private** storage bucket (decision 006); create buckets and their access rules in migrations too.

`config.toml` holds settings for running Supabase locally. It doesn't change the live project.
