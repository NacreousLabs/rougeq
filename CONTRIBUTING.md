# Working on RougeQ

RougeQ runs live on Railway, auto-deploying from the `master` branch. To change the
app safely, **don't push to `master` directly** — work on a branch and merge via a
pull request, so CI checks the change before it can deploy.

## The loop

```bash
# 1. start from an up-to-date master
git checkout master
git pull

# 2. branch
git checkout -b my-change

# 3. edit, then test locally (runs against your local puckq.db — never prod)
npm run dev            # http://localhost:3000
npx tsc --noEmit       # quick type check
npm run build          # optional: catch build errors the way Railway will

# 4. push the branch and open a PR
git add -A && git commit -m "describe the change"
git push -u origin my-change
# then open the PR on GitHub (or: gh pr create)
```

When the PR is opened, **CI** (`.github/workflows/ci.yml`) runs `tsc` + `next build`.
Merge to `master` only when it's green — and that merge is what deploys to
production. Railway only promotes a deploy whose build succeeds, and you can roll
back any deploy from the Railway dashboard.

## Recommended: protect `master`

So a broken change can't be pushed straight to production:
GitHub repo → **Settings → Branches → Add branch ruleset** (or "Add rule") for
`master` → require a pull request and require the **CI / check** status to pass.

## What does NOT need a deploy

- **Content** — recaps, contracts, prospects: edit them live at `/admin`.
- **Daily data** — scores/standings/stats refresh automatically via the GitHub
  Actions cron (`.github/workflows/refresh.yml`).

## ⚠️ Database schema changes

Deploying code does **not** change the production database's structure. The DB
lives on the Railway volume at `/data/puckq.db`; nothing runs migrations on boot
(see `src/db/index.ts`). If you edit `src/db/schema.ts` (add/alter a table or
column), the new code will expect a shape the live DB doesn't have yet.

To apply a schema change to production you must run `drizzle-kit push` against the
volume DB **from inside the Railway container** (drizzle-kit is a runtime
dependency for this reason), with `DATABASE_FILE=/data/puckq.db`. Locally it's just
`npm run db:push`. Don't change the schema without planning this step — test it on a
throwaway copy of the DB first.

## Never commit

- `.env.local` or any real secrets (it's gitignored; `.env.example` documents the
  variables).
- `*.db` snapshots (also gitignored).
