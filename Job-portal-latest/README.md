# Jobify — MERN Job Board

A production-style job board built with **MongoDB · Express · React · Node** (MERN), featuring three roles — **job seekers, recruiters, admins** — with JWT auth, resume uploads, search/filter, saved jobs, role-aware dashboards, and a polished Tailwind UI.

| Stack | Versions |
| --- | --- |
| Backend | Node 20 · Express 4 · Mongoose 8 · bcryptjs · jsonwebtoken · multer |
| Frontend | React 18 · Vite 5 · Tailwind 3 · React Router 6 · Axios · react-hot-toast |
| Database | MongoDB (local or Atlas) |
| CI/CD | GitHub Actions → Vercel |

---

## 1. Quick start (local)

```bash
git clone <your-repo>
cd Job-portal

# Backend
cd backend
cp .env.example .env          # fill MONGO_URI + JWT_SECRET
npm install
npm run seed                  # seeds users, jobs, applications + prints test creds
npm run dev                   # http://localhost:5000

# Frontend (new terminal)
cd ../frontend
npm install
npm run dev                   # http://localhost:5173
```

After seeding, log in with any of:

| Role | Email | Password |
| --- | --- | --- |
| Recruiter | `recruiter@example.com` | `password123` |
| Seeker | `seeker@example.com` | `password123` |
| Admin | `admin@example.com` | `password123` |

---

## 2. Architecture

```
Job-portal/
├── backend/                   # Express + Mongoose API
│   ├── api/index.js           # Vercel serverless entry (lazy-connects to Mongo)
│   ├── server.js              # Express app (exports app, listens only when run directly)
│   ├── routes/                # /api/auth, /api/jobs, /api/applications, /api/users
│   ├── controllers/           # asyncHandler-wrapped handlers
│   ├── models/                # User, Job, Application (with indexes)
│   ├── middleware/            # auth, validate, upload, error
│   └── vercel.json            # serverless build config
├── frontend/                  # Vite SPA
│   ├── src/
│   │   ├── pages/             # Home, Jobs, JobDetails, Login, Register, Dashboard
│   │   ├── components/        # JobCard, Filters, Logo, Navbar, …
│   │   ├── context/           # AuthContext (JWT in localStorage, rehydrate via /me)
│   │   ├── services/          # axios instance + per-resource API calls
│   │   └── hooks/
│   └── vercel.json            # SPA rewrite config
├── .github/workflows/
│   ├── ci.yml                 # install + build on every PR/push
│   └── deploy.yml             # Vercel prebuilt deploy on main + previews on PR
└── README.md
```

### Request flow

```
[React] → axios (Bearer JWT) → /api/* → Express router → middleware → controller → Mongoose → MongoDB
                                            │
                                            └─ requireAuth → requireRole(...) → validate (express-validator)
```

### Auth model
- JWT signed with `JWT_SECRET`, sent as `Authorization: Bearer <token>`.
- `middleware/auth.js` exposes `requireAuth` (loads `req.user`) and `requireRole(...roles)`.
- Ownership is enforced in controllers (`job.postedBy === req.user._id`, with `admin` always allowed).

### Data model

| Model | Notable fields | Indexes |
| --- | --- | --- |
| `User` | `name`, `email` (unique), `passwordHash`, `role`, `savedJobs[]` | `email` |
| `Job` | `title`, `company`, `location`, `description`, `type`, `salaryMin/Max`, `skills[]`, `postedBy` | text on `(title, description, skills, company)`, plus `location`, `type`, `createdAt` |
| `Application` | `job`, `applicant`, `resumeUrl`, `coverLetter`, `status` | unique compound `(job, applicant)` |

`type` and `status` enums live in the models (`JOB_TYPES`, `STATUSES`) — mirror them in the frontend if you change them.

---

## 3. Features

### Job seekers
- Browse jobs with full-text search, location filter, type filter, debounced URL-synced state.
- Apply with a resume (PDF/DOC/DOCX up to `MAX_UPLOAD_MB`); one application per (job, seeker) enforced at the DB level.
- Save / unsave jobs from anywhere a job appears.
- Dashboard shows real-time stats: applications submitted, saved count, status breakdown (pending / reviewed / shortlisted / rejected / hired), latest jobs, featured roles.
- `/dashboard?tab=applied` and `/dashboard?tab=saved` deep-link into focused lists with empty states.

### Recruiters
- Post / edit / delete jobs (only their own; admin can edit any).
- View applicants per job with resume download links.
- Move applications through `pending → reviewed → shortlisted → rejected | hired`.

### UI
- Tailwind purple/indigo design system (Jobify), responsive from 320 px to wide desktop.
- Sidebar dashboard layout with mobile hamburger nav, sticky search toolbar, role-aware menu.
- Polished empty states, skeleton loaders, toast feedback.

### Honesty principle
Every visible button is wired to a real API. No decorative placeholders.

---

## 4. API reference

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | — | `{ name, email, password, role? }` |
| `POST` | `/api/auth/login` | — | returns `{ token, user }` |
| `GET`  | `/api/auth/me` | bearer | rehydrate session |
| `GET`  | `/api/jobs` | — | `?q=&location=&type=&page=&limit=` |
| `GET`  | `/api/jobs/:id` | — | |
| `POST` | `/api/jobs` | recruiter\|admin | |
| `PUT`  | `/api/jobs/:id` | owner\|admin | |
| `DELETE` | `/api/jobs/:id` | owner\|admin | |
| `GET`  | `/api/jobs/mine/posted` | recruiter\|admin | |
| `POST` | `/api/applications` | seeker | multipart: `jobId`, `resume`, `coverLetter?` |
| `GET`  | `/api/applications/me` | seeker | |
| `GET`  | `/api/applications/job/:jobId` | recruiter\|admin | |
| `PATCH`| `/api/applications/:id/status` | recruiter\|admin | `{ status }` |
| `POST` | `/api/users/saved/:jobId` | seeker | toggles |
| `GET`  | `/api/users/saved` | seeker | |
| `GET`  | `/api/health` | — | uptime check |

---

## 5. Environment variables

### `backend/.env`
```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster/jobify
JWT_SECRET=change_me_to_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
MAX_UPLOAD_MB=5
UPLOAD_DIR=uploads
```

### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000
```

In production, set `VITE_API_URL` to your deployed backend URL.

---

## 6. CI/CD — GitHub Actions → Vercel

Two workflows under `.github/workflows/`:

### `ci.yml`
Runs on every push and PR:
1. **Backend** — `npm ci` + Node syntax check on every `.js` file.
2. **Frontend** — `npm ci` + `npm run build`, uploads `dist/` artifact.

### `deploy.yml`
- **Production** (`main` push): `vercel pull --environment=production` → `vercel build --prod` → `vercel deploy --prebuilt --prod`.
- **Preview** (PR): same flow with `--environment=preview`, no `--prod`.

Uses the `--prebuilt` pattern so the build runs in GitHub Actions (cached, transparent) and only the artifact is shipped to Vercel.

### One-time setup

1. **Create the Vercel projects**

   ```bash
   npm i -g vercel
   cd frontend  && vercel link        # creates .vercel/project.json
   cd ../backend && vercel link       # separate Vercel project for the API
   ```

2. **Set environment variables on each Vercel project** (dashboard or `vercel env add`):
   - Backend project: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `MAX_UPLOAD_MB`.
   - Frontend project: `VITE_API_URL`.

3. **Add GitHub repo secrets** (Settings → Secrets → Actions):
   - `VERCEL_TOKEN` — <https://vercel.com/account/tokens>
   - `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` — read from `frontend/.vercel/project.json`.

4. **Push to GitHub**

   ```bash
   git init -b main
   git add .
   git commit -m "feat: jobify redesign + ci/cd"
   git remote add origin git@github.com:<you>/<repo>.git
   git push -u origin main
   ```

CI runs immediately. After it goes green, the deploy workflow ships to Vercel and prints the production URL in the Actions log.

> **Note on file uploads:** Vercel serverless functions have an ephemeral filesystem. The current resume upload (`multer.diskStorage`) works locally; in production swap to **Vercel Blob** or S3. Drop-in change: replace `middleware/upload.js`'s storage with `@vercel/blob`'s upload helper and store the returned URL on `Application.resumeUrl`.

---

## 7. Deployment topology

```
            ┌──────────────────────────┐
   user ──▶ │  jobify.vercel.app       │  ← Vite static SPA
            └────────────┬─────────────┘
                         │  axios → VITE_API_URL
                         ▼
            ┌──────────────────────────┐
            │  jobify-api.vercel.app   │  ← Express via @vercel/node
            │  (backend/api/index.js)  │
            └────────────┬─────────────┘
                         │
                         ▼
                   MongoDB Atlas
```

Mongo connections are pooled across warm serverless invocations (`mongoose.connection.readyState === 1` short-circuit in `api/index.js`).

---

## 8. Scripts

```bash
# Backend
npm run dev      # nodemon
npm start        # node server.js
npm run seed     # wipes & reseeds Users / Jobs / Applications

# Frontend
npm run dev      # vite
npm run build    # vite build → dist/
npm run preview  # vite preview
```

---

## 9. Roadmap (post-MVP)

- [ ] OAuth providers (Google, Apple) with `passport`
- [ ] Password reset (token-based, email via Resend)
- [ ] Recruiter ↔ seeker messaging
- [ ] Email notifications on status changes
- [ ] Resume parsing (skills extraction)
- [ ] Vercel Blob for resumes
- [ ] Rate limiting (`express-rate-limit`)

---

## 10. License

MIT.
