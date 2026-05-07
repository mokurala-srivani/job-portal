# CI/CD Setup — Auto-deploy to Vercel via GitHub Actions

Every push to `main` will deploy **both** the backend and frontend to production. Pull requests get preview deployments. This takes ~10 minutes to set up the first time, then it's automatic forever.

---

## What's already in the repo

- `.github/workflows/ci.yml` — installs and builds both apps on every push/PR (no secrets needed).
- `.github/workflows/deploy.yml` — deploys both apps to Vercel. **Needs 4 secrets to work.**

If you skip the deploy setup, CI still runs and shows green ticks on your commits.

---

## Prerequisites

You should already have:

- ✅ Code pushed to your own GitHub repo (see [SETUP.md](./SETUP.md) Step 5)
- ✅ A Vercel account, signed in with GitHub
- ✅ A Vercel **frontend** project created (via dashboard import or CLI)
- ✅ A Vercel **backend** project created (same)

If both projects exist on Vercel, continue. Otherwise do [SETUP.md Step 6](./SETUP.md) first to create them once via the dashboard — then come back here for the automated flow.

---

## Step 1 — Get your Vercel token

1. Open <https://vercel.com/account/tokens>
2. Click **Create Token**
   - **Name**: `github-actions`
   - **Scope**: Full Account
   - **Expiration**: No expiration (or 1 year)
3. **Copy the token** — you only see it once.

---

## Step 2 — Get your project IDs

You need two project IDs (frontend + backend) and one org ID (shared).

### Easy way — via Vercel dashboard

1. Open your **frontend** project on Vercel → **Settings** → scroll to **Project ID**. Copy it.
2. While in **Settings**, scroll to **Team ID** (or **Account ID** if it's a personal account). Copy it — this is your `VERCEL_ORG_ID`.
3. Open your **backend** project → **Settings** → **Project ID**. Copy it.

### CLI way (alternative)

```bash
npm i -g vercel
vercel login

cd frontend
vercel link               # answer the prompts to link to your existing frontend project
cat .vercel/project.json  # shows {"orgId": "...", "projectId": "..."}

cd ../backend
vercel link               # link to your backend project
cat .vercel/project.json
```

---

## Step 3 — Add the four GitHub secrets

In your repo on GitHub: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.

Add these one by one:

| Name | Value |
| --- | --- |
| `VERCEL_TOKEN` | the token from Step 1 |
| `VERCEL_ORG_ID` | the org/team/account ID from Step 2 |
| `VERCEL_FRONTEND_PROJECT_ID` | frontend's projectId |
| `VERCEL_BACKEND_PROJECT_ID` | backend's projectId |

> All four are **required**. If any is missing, the deploy job will fail with `Project not found` or `Invalid token`.

---

## Step 4 — Set environment variables on Vercel (once)

The workflow runs `vercel pull` to fetch env vars from Vercel. So your env vars must live on Vercel itself, not in GitHub secrets.

Go to each Vercel project's **Settings** → **Environment Variables** and add for the **Production** environment:

### Backend project

| Name | Value |
| --- | --- |
| `MONGO_URI` | your MongoDB Atlas connection string |
| `JWT_SECRET` | long random string (32+ chars) |
| `JWT_EXPIRES_IN` | `7d` |
| `MAX_UPLOAD_MB` | `5` |
| `CLIENT_ORIGIN` | your frontend URL (no trailing slash) |

### Frontend project

| Name | Value |
| --- | --- |
| `VITE_API_URL` | your backend URL (no trailing slash) |

> Repeat with the **Preview** environment if you also want pull-request deploys to work end-to-end.

---

## Step 5 — Trigger the pipeline

Push anything to `main`:

```bash
git commit --allow-empty -m "ci: trigger first deploy"
git push
```

Then open your repo → **Actions** tab. You'll see two workflows kick off:

1. **CI** — installs + builds both apps (proves the code is green).
2. **Deploy** — runs two parallel jobs (`Frontend → Vercel`, `Backend → Vercel`).

Both should turn green in 2–4 minutes. When they do, your live URLs serve the new code.

---

## What happens going forward

| Event | Result |
| --- | --- |
| You push to `main` | Both apps redeploy to **production** automatically |
| You open a pull request | Both apps deploy as **previews** with unique URLs (great for review) |
| You merge a PR | Production deploy runs |
| You push to any other branch | CI runs (build/test only) — no deploy |
| You click **Re-run jobs** in Actions | Manual redeploy without a code change |

---

## Troubleshooting

### `Error: Project not found` or `Invalid token`
One of the four secrets is wrong. Re-check spelling exactly — `VERCEL_FRONTEND_PROJECT_ID` not `VERCEL_PROJECT_ID_FRONTEND`. If you regenerated the token, update the secret.

### `vercel pull` succeeds but the app crashes at runtime
You haven't set environment variables on Vercel itself (Step 4). The workflow downloads them from Vercel — they must already be there.

### Deploy succeeds but login fails on the live site
On the **backend** project, `CLIENT_ORIGIN` must exactly match the frontend URL (https + no trailing slash). After updating, redeploy: Actions → Deploy → **Re-run jobs**.

### Only the frontend deploys, not the backend
You're using an old version of `deploy.yml`. Pull the latest version from this repo — it has both `frontend` and `backend` jobs.

### "I don't want PR previews, only production deploys"
Edit `.github/workflows/deploy.yml` and remove the `pull_request:` trigger:

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:
```

### Force a redeploy without code changes
GitHub repo → **Actions** → click **Deploy** workflow → **Run workflow** → **Run**.

---

## Why this flow?

This is the [Vercel-recommended CI pattern](https://vercel.com/docs/git/vercel-for-github):

```
vercel pull   →  fetch project config + env vars
vercel build  →  build locally on the GitHub runner (full Node.js, no time limit)
vercel deploy --prebuilt  →  upload the artifact (faster, more deterministic than remote build)
```

Alternative — and equally valid for beginners — is to use **Vercel's built-in GitHub integration** (no Actions at all). Just import each project in the Vercel dashboard and it auto-deploys on push. The GitHub Actions flow above is more explicit, gives you build logs in GitHub, and lets you add gates (tests, linters) before deploy.

---

## Quick reference

```bash
# Force a new deploy
git commit --allow-empty -m "ci: redeploy"
git push

# Skip CI for a commit (e.g., docs-only change)
git commit -m "docs: README typo [skip ci]"
git push
```
