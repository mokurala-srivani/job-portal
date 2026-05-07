# Jobify — Setup & Deployment Guide

**Read this if you received the project as a `.zip` file** and want to run it locally, push it to your own GitHub, and deploy it to Vercel.

Each step has copy-pasteable commands. If you're new to terminals: open the **Terminal** app on Mac (or **PowerShell** on Windows), and paste one block at a time.

---

## ⚠️ Before you start — security note

The project zip **may include `.env` files with real database credentials** from the sender. **Do not push these to GitHub.** The bundled `.gitignore` already excludes them, so as long as you don't change `.gitignore`, you're safe. We'll create your own `.env` files in **Step 3**.

---

## Step 0 — Install the tools (one time)

You only do this the first time on a new computer.

| Tool | Why | Check it works |
| --- | --- | --- |
| [Node.js 20+](https://nodejs.org/) | Runs the app | `node -v` → should print `v20.x` or higher |
| [Git](https://git-scm.com/) | Pushes code to GitHub | `git --version` |
| [GitHub account](https://github.com/) | Hosts your code | — |
| [MongoDB Atlas account](https://www.mongodb.com/cloud/atlas) (free) | Stores users/jobs | — |
| [Vercel account](https://vercel.com/) (sign in with GitHub) | Hosts the live site | — |

---

## Step 1 — Unzip the project

1. Right-click the `.zip` → **Extract** (or **Open** on Mac).
2. Move the unzipped folder somewhere easy, e.g. `~/Desktop/jobify`.
3. Open a terminal and `cd` into it:

```bash
cd ~/Desktop/jobify     # adjust to wherever you unzipped it
```

The folder should contain `backend/`, `frontend/`, `README.md`, and this `SETUP.md`.

---

## Step 2 — Get a free MongoDB database

1. Go to <https://cloud.mongodb.com/> → sign in → **Create a free cluster** (M0).
2. While the cluster builds:
   - **Database Access** → **Add New Database User** → username `jobify`, set a password, **save it**.
   - **Network Access** → **Add IP Address** → choose **Allow access from anywhere** (`0.0.0.0/0`). Required for Vercel later.
3. Once the cluster is **ready**, click **Connect** → **Drivers** → copy the connection string. It looks like:

```
mongodb+srv://jobify:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
```

4. Replace `<password>` with the password from step 2, and add `/jobify` before the `?`:

```
mongodb+srv://jobify:YOUR_REAL_PASSWORD@cluster0.abcde.mongodb.net/jobify?retryWrites=true&w=majority
```

Keep this string handy — you'll paste it twice (once for local, once for Vercel).

---

## Step 3 — Create your own `.env` files

These hold your secrets. They are **never** pushed to GitHub (`.gitignore` blocks them).

### 3.1 Backend `.env`

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` in any editor and fill it in:

```env
PORT=5001
MONGO_URI=mongodb+srv://jobify:YOUR_REAL_PASSWORD@cluster0.abcde.mongodb.net/jobify?retryWrites=true&w=majority
JWT_SECRET=any-long-random-string-at-least-32-characters-long
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
MAX_UPLOAD_MB=5
UPLOAD_DIR=uploads
```

> Tip: for `JWT_SECRET`, just bash-mash 40+ random characters. Treat it like a password.

### 3.2 Frontend `.env`

```bash
cd ../frontend
cp .env.example .env
```

Open `frontend/.env` — for local dev it should be:

```env
VITE_API_URL=http://localhost:5001
```

---

## Step 4 — Run the app locally

You'll need **two terminal windows** — one for the backend, one for the frontend.

### Terminal 1 — backend

```bash
cd backend
npm install        # one-time, downloads dependencies
npm run seed       # one-time, creates demo users + jobs
npm run dev        # starts the API
```

Wait for `[api] listening on :5001`. **Leave this terminal open.**

### Terminal 2 — frontend

```bash
cd frontend
npm install
npm run dev
```

Wait for `Local: http://localhost:5173/` and open that URL in your browser.

### Try it

| Role | Email | Password |
| --- | --- | --- |
| Job seeker | `seeker@example.com` | `password123` |
| Recruiter | `recruiter@example.com` | `password123` |
| Admin | `admin@example.com` | `password123` |

✅ If you can log in, **you're done with local setup**. Stop here if you don't want to publish online yet.

---

## Step 5 — Push to your own GitHub

### 5.1 Create a new GitHub repo

Go to <https://github.com/new>:

- Repository name: `jobify` (any name)
- Public or Private — your choice
- **Leave everything else unchecked.** Don't add a README/license/.gitignore — the project already has them.
- Click **Create repository**.

GitHub will show a page with commands. **Don't follow theirs** — use ours below.

### 5.2 Initialize git and push

From the project root (the folder with `backend/` and `frontend/`):

```bash
cd ~/Desktop/jobify       # adjust path

git init -b main
git add .
git commit -m "Initial commit"

# Replace YOUR-USERNAME and REPO-NAME with yours:
git remote add origin https://github.com/YOUR-USERNAME/REPO-NAME.git
git push -u origin main
```

If git asks for a password, GitHub now requires a **personal access token**:
- <https://github.com/settings/tokens> → **Generate new token (classic)** → tick `repo` → copy.
- Use the token as the password when prompted.

### 5.3 Confirm

Refresh your GitHub repo URL. You should see all your files. The **Actions** tab will show a CI run — that's normal, it builds the project to verify.

✅ **Code is on GitHub.**

---

## Step 6 — Deploy to Vercel

You'll deploy **two projects**: one for the backend (`/backend`), one for the frontend (`/frontend`).

> **Heads up:** the backend uses local file storage for resumes (`backend/uploads/`). On Vercel, this storage is wiped between requests — so resume uploads in production will appear to upload but won't persist. For a portfolio demo this is fine. To fix it for real production, swap `multer` disk storage for [Vercel Blob](https://vercel.com/docs/storage/vercel-blob).

### 6.1 Deploy the **backend**

1. Go to <https://vercel.com/new> → **Import** your GitHub repo.
2. **Important** — change settings:
   - **Project Name**: `jobify-api` (or anything)
   - **Root Directory**: click **Edit** → select `backend`
   - **Framework Preset**: leave as **Other**
3. Expand **Environment Variables** and add **all four**:

   | Name | Value |
   | --- | --- |
   | `MONGO_URI` | the full connection string from Step 2 |
   | `JWT_SECRET` | the long random string from Step 3 |
   | `JWT_EXPIRES_IN` | `7d` |
   | `MAX_UPLOAD_MB` | `5` |
   | `CLIENT_ORIGIN` | leave blank for now — we'll set it after Step 6.2 |

4. Click **Deploy**. Wait ~1 minute.
5. **Copy the live URL** Vercel gives you, e.g. `https://jobify-api-abc123.vercel.app`. Test it: open `<that-url>/api/health` — you should see `{"ok":true}`.

### 6.2 Deploy the **frontend**

1. Back to <https://vercel.com/new> → **Import** the **same** GitHub repo (Vercel allows it).
2. Change settings:
   - **Project Name**: `jobify` (or anything)
   - **Root Directory**: click **Edit** → select `frontend`
   - **Framework Preset**: should auto-detect **Vite**
3. Expand **Environment Variables**:

   | Name | Value |
   | --- | --- |
   | `VITE_API_URL` | the backend URL from Step 6.1 (no trailing slash) |

4. Click **Deploy**. Wait ~1 minute.
5. **Copy the live URL**, e.g. `https://jobify-xyz.vercel.app`. Open it in a browser.

### 6.3 Tell the backend about the frontend

Now go back to the **backend** project in Vercel:

1. Open the `jobify-api` project → **Settings** → **Environment Variables**.
2. Add `CLIENT_ORIGIN` = your frontend URL from 6.2 (e.g. `https://jobify-xyz.vercel.app`).
3. **Deployments** tab → click the **⋯** on the latest deployment → **Redeploy**. (Env var changes only take effect on a new deploy.)

### 6.4 Seed the production database (one time)

The deploy ran the API code but didn't create the demo users in your Atlas database. From your computer:

```bash
cd backend
# Temporarily point local .env's MONGO_URI to your Atlas string (it already is, from Step 3)
npm run seed
```

This populates your Atlas DB with the 3 demo accounts.

✅ **Site is live.** Visit your frontend URL and log in with `seeker@example.com` / `password123`.

---

## Step 7 — Auto-deploy on every git push (optional)

After Step 6, **every push to `main` already auto-redeploys both projects on Vercel** — that's the default behavior of Vercel's GitHub integration. You don't need GitHub Actions for this.

The repo *also* has `.github/workflows/deploy.yml` for advanced users who want fine-grained control. To use it: add three secrets (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`) in **GitHub → Settings → Secrets and variables → Actions**. For most people, the built-in Vercel auto-deploy is enough — you can ignore this file.

---

## Common issues

### "I can't log in on the live site"
Open the browser dev tools (F12) → **Network** tab → try to log in → click the failed `/api/auth/login` request:

- **CORS error** → on Vercel, set `CLIENT_ORIGIN` on the **backend** project to your **frontend** URL exactly (no trailing slash), then redeploy the backend.
- **`Database unavailable`** → Atlas → **Network Access** → add `0.0.0.0/0`.
- **404 on `/api/...`** → the frontend's `VITE_API_URL` is wrong. Check the **frontend** project's env on Vercel.

### "Backend works locally but is empty on Vercel"
You haven't run `npm run seed` against your Atlas database yet (Step 6.4).

### "Resume uploads disappear on Vercel"
Expected — see the heads-up in Step 6. Vercel serverless functions have ephemeral storage.

### "git push asks for username/password"
GitHub requires a [personal access token](https://github.com/settings/tokens), not your account password. Generate one with `repo` scope and paste it when prompted.

### "Port 5001 already in use" when running `npm run dev`
Another node process is hogging the port. Free it:

```bash
# macOS / Linux
lsof -ti tcp:5001 | xargs kill -9

# Windows (PowerShell)
Get-NetTCPConnection -LocalPort 5001 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force
```

### "Frontend port 5173 is taken — Vite uses 5174"
Same idea — kill the old process, or just use whatever port Vite picks. The backend's `CLIENT_ORIGIN` only matters in production.

---

## Quick daily reference

```bash
# Run locally (in two terminals)
cd backend && npm run dev
cd frontend && npm run dev

# Re-seed the database
cd backend && npm run seed

# Ship a change
git add .
git commit -m "your message"
git push                     # Vercel auto-redeploys
```

That's the whole flow. Done. 🚀
