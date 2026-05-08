# 🚀 Jobify — AI-Powered MERN Job Board

A modern, full-stack job board built with the **MERN stack**, role-based dashboards (job seeker / recruiter / admin), resume uploads, JWT authentication, and an end-to-end **GitHub Actions → Vercel + Render** CI/CD pipeline.

> **Built with AI assistance using [Claude Code](https://claude.ai/code)** — see [§ AI Workflow](#-ai-workflow) for how AI was used to scaffold, refactor, and document the project.

---

## 🌐 Live Demo

| What | Link |
| --- | --- |
| **Live Frontend** | <https://job-portal-alpha-amber.vercel.app/> |
| **Live API** | <https://job-portal-ov18.onrender.com> |
| **GitHub Repo** | <https://github.com/mokurala-srivani/job-portal> |
| **API health check** | <https://job-portal-ov18.onrender.com/api/health> |

> **First-load note:** the backend runs on Render's free tier, which sleeps after 15 minutes of inactivity. The first request after a cold start may take 30–60 seconds — subsequent requests are instant.

### 🔑 Demo Credentials

Try the app instantly with these seeded accounts (all use password `password123`):

| Role | Email | What you can do |
| --- | --- | --- |
| **Job Seeker** | `seeker@example.com` | Browse, save, apply to jobs; track applications |
| **Recruiter** | `recruiter@example.com` | Post jobs, review applicants, change application status |
| **Admin** | `admin@example.com` | All recruiter actions across all jobs |

---

## ✨ Features

### 👨‍💼 For Job Seekers
- 🔍 **Browse & search** with keyword + location + job-type + skills filters (URL-synced for shareable searches)
- 💾 **Save jobs** for later (bookmark, persisted server-side)
- 📤 **One-click apply** with PDF/DOC/DOCX resume upload + optional cover letter
- 📊 **Application tracking** — status updates in real time (pending → reviewed → shortlisted → rejected → hired)
- 🚫 **Duplicate prevention** — backend enforces "one application per job per seeker" via a unique compound index
- 🏠 **Personalized dashboard** — recommended jobs, application stats, saved jobs at a glance

### 🏢 For Recruiters
- ➕ **Post new jobs** with title, company, location, salary range, type, skills, and rich description
- ✏️ **Edit & delete** your own postings (ownership-checked server-side)
- 👥 **Review applicants** for each posting — view resume, cover letter, contact info
- 🔄 **Update application status** through the hiring funnel
- 📈 **Recruiter-specific dashboard** with stats: active postings, total applicants, pending reviews, hires
- 🎯 **Distinct UI theme** (amber/orange) so recruiters never see seeker copy

### 🔐 Authentication & Security
- 🔑 **JWT** authentication with 7-day token expiry
- 👮 **Role-based access control** — three roles (`job_seeker`, `recruiter`, `admin`) with route-level guards
- 🔒 **Bcrypt password hashing** (10 rounds)
- 🛡️ **Server-side ownership checks** — recruiters can only edit/delete their own postings; seekers can only see their own applications
- 🚷 **Authorization escape prevention** — strict allowlist on job updates so `postedBy` can't be tampered with via request body
- ✅ **Input validation** with `express-validator` on every write endpoint
- 🧹 **Orphan upload cleanup** — failed uploads are deleted from disk to prevent storage leaks

### 🎨 UI / UX
- 💅 Modern SaaS-inspired design with **Tailwind CSS**
- 📱 Fully responsive (mobile, tablet, desktop)
- 🌓 **Light + dark mode** with system-preference detection and manual toggle
- 🍞 Toast notifications for every async action
- 💀 Skeleton loaders during data fetches
- 🪟 Glassmorphism on auth pages with custom SVG illustrations
- ⚡ URL-synced filters on the Jobs page (shareable search results)
- ♿ Accessible — semantic HTML, ARIA labels, keyboard navigation

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 18 · Vite · React Router · Tailwind CSS · Framer Motion · Axios · react-hot-toast |
| **Backend** | Node.js · Express · Mongoose · JWT · bcryptjs · Multer · express-validator |
| **Database** | MongoDB Atlas |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render (chosen over Vercel because Render preserves uploaded files between requests; Vercel functions have ephemeral storage) |
| **CI/CD** | GitHub Actions |
| **Tooling** | Nodemon · dotenv |

---

## 🏗️ Architecture

```
┌──────────────────┐     HTTPS    ┌──────────────────┐     TCP    ┌──────────────────┐
│                  │  ─────────►  │                  │  ────────► │                  │
│  React (Vercel)  │              │  Express (Render)│            │  MongoDB Atlas   │
│  job-portal-...  │  ◄─────────  │  job-portal-...  │  ◄──────── │                  │
│                  │   JSON+JWT   │  /api/*          │            │                  │
└──────────────────┘              └──────────────────┘            └──────────────────┘
        ▲                                  ▲
        │ git push                         │ git push
        │                                  │
┌───────┴──────────────────────────────────┴────────┐
│           GitHub (mokurala-srivani/job-portal)    │
│  .github/workflows/ci.yml      → install + build  │
│  .github/workflows/deploy.yml  → Vercel auto-dpl  │
└───────────────────────────────────────────────────┘
```

### Data Model

```
┌────────────────────────┐         ┌────────────────────────┐
│         User           │         │          Job           │
├────────────────────────┤         ├────────────────────────┤
│ _id          ObjectId  │         │ _id          ObjectId  │
│ name         String    │         │ title        String    │
│ email        String*   │ ───┐    │ company      String    │
│ passwordHash String    │    │    │ location     String    │
│ role         enum      │    └────│ postedBy     ObjectId  │
│ savedJobs    [ObjectId]│ ───┐    │ salaryMin    Number    │
│ timestamps             │    │    │ salaryMax    Number    │
└────────────────────────┘    │    │ type         enum      │
                              │    │ description  String    │
                              │    │ skills       [String]  │
                              │    │ isActive     Boolean   │
                              │    │ timestamps             │
                              │    └────────────┬───────────┘
                              │                 │
                              │    ┌────────────┴───────────┐
                              └────│      Application       │
                                   ├────────────────────────┤
                                   │ _id          ObjectId  │
                                   │ job          ObjectId  │
                                   │ applicant    ObjectId  │
                                   │ resumeUrl    String    │
                                   │ coverLetter  String    │
                                   │ status       enum      │
                                   │ timestamps             │
                                   │                        │
                                   │ unique(job, applicant) │
                                   └────────────────────────┘

* unique indexes: User.email, Application(job, applicant)
* text index:    Job(title, description, skills, company) ← powers ?q=
* enum role:     job_seeker | recruiter | admin
* enum type:     full-time | part-time | contract | internship | remote
* enum status:   pending | reviewed | shortlisted | rejected | hired
```

---

## 📂 Project Structure

```
job-portal/
├── backend/
│   ├── api/index.js          # serverless entrypoint
│   ├── config/db.js          # Mongoose connection
│   ├── controllers/          # auth, jobs, applications, users
│   ├── middleware/           # auth, upload, validate, error
│   ├── models/               # User, Job, Application
│   ├── routes/               # /api/auth, /api/jobs, /api/applications, /api/users
│   ├── utils/                # token, asyncHandler
│   ├── uploads/              # resume storage (gitignored)
│   ├── seed.js               # creates demo users + jobs
│   └── server.js             # Express app entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, JobCard, Filters, ThemeToggle, ...
│   │   ├── context/          # AuthContext, ThemeContext
│   │   ├── hooks/            # useDebounce
│   │   ├── pages/            # Home, Jobs, JobDetails, Login, Register, Dashboard, ...
│   │   ├── services/         # axios instance + API wrappers
│   │   └── App.jsx
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── .github/workflows/
│   ├── ci.yml                # build verification on every push/PR
│   └── deploy.yml            # auto-deploy to Vercel on push to main
│
├── CLAUDE.md                 # AI workflow instructions
├── SETUP.md                  # beginner-friendly setup guide
├── CICD.md                   # CI/CD setup walkthrough
└── README.md                 # this file
```

---

## 📡 API Reference

**Base URL** — `https://job-portal-ov18.onrender.com/api` (production) or `http://localhost:5001/api` (local)

All authenticated endpoints expect: `Authorization: Bearer <jwt>`

### 🔓 Health
| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Liveness probe → `{ "ok": true }` |

### 🔐 Auth
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | Public | `{ name, email, password, role? }` → `{ user, token }` |
| POST | `/auth/login` | Public | `{ email, password }` → `{ user, token }` |
| GET | `/auth/me` | Required | Returns current user from JWT |

### 💼 Jobs
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/jobs` | Public | `?q=&location=&type=&skills=&page=&limit=` |
| GET | `/jobs/:id` | Public | Single job with populated `postedBy` |
| POST | `/jobs` | Recruiter / Admin | Create a new job |
| PUT | `/jobs/:id` | Owner / Admin | Update — strict allowlist (cannot change `postedBy`) |
| DELETE | `/jobs/:id` | Owner / Admin | Delete a posting |
| GET | `/jobs/mine/posted` | Recruiter / Admin | List the caller's own postings |

### 📨 Applications
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/applications` | Job Seeker | Multipart: `jobId` + `resume` (PDF/DOC/DOCX ≤ 5 MB) + `coverLetter?` |
| GET | `/applications/me` | Job Seeker | List the caller's applications |
| GET | `/applications/job/:jobId` | Owner / Admin | Applicants for a specific job |
| PATCH | `/applications/:id/status` | Owner / Admin | `{ status }` |

### 💾 Saved Jobs
| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/users/saved/:jobId` | Job Seeker | Toggle save/unsave |
| GET | `/users/saved` | Job Seeker | List saved jobs |

### Error format

```json
{ "message": "Human-readable error", "errors": [/* validation details, optional */] }
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 20+
- MongoDB Atlas cluster (or local Mongo on `mongodb://127.0.0.1:27017`)
- Git

### 1️⃣ Clone & install

```bash
git clone https://github.com/mokurala-srivani/job-portal.git
cd job-portal
```

### 2️⃣ Backend

```bash
cd backend
cp .env.example .env
# Edit backend/.env (see below)
npm install
npm run seed     # creates 3 demo users + 6 jobs
npm run dev      # http://localhost:5001
```

### 3️⃣ Frontend (new terminal)

```bash
cd frontend
cp .env.example .env
# Edit frontend/.env (see below)
npm install
npm run dev      # http://localhost:5173
```

Open <http://localhost:5173> and log in with one of the demo accounts above.

### 🔑 Environment Variables

**`backend/.env`**
```env
PORT=5001
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/jobify
JWT_SECRET=any-long-random-string-32-chars-or-more
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:5173
MAX_UPLOAD_MB=5
UPLOAD_DIR=uploads
```

**`frontend/.env`**
```env
VITE_API_URL=http://localhost:5001
```

> See **[SETUP.md](./SETUP.md)** for a beginner-friendly step-by-step guide including MongoDB Atlas setup, GitHub push, and Vercel deploy.

---

## 🔄 CI/CD Pipeline

Two GitHub Actions workflows live in `.github/workflows/`:

### `ci.yml` — Build verification (every push + PR)

```
push / PR ─► checkout ─► node 20 ─► npm ci ─► node --check (backend)  ✅
                                            │
                                            └► npm run build (frontend) ✅
```

Catches syntax errors and broken builds before they hit production.

### `deploy.yml` — Auto-deploy on push to `main`

```
push to main ─► two parallel jobs:
                ├─► frontend → vercel pull → vercel build --prod → vercel deploy --prebuilt --prod
                └─► backend  → vercel pull → vercel build --prod → vercel deploy --prebuilt --prod

PR ─► same flow, but preview deployments (no --prod flag)
```

Uses Vercel's modern `--prebuilt` artifact flow for faster, more deterministic deploys.

> **Note:** in the actual hosted setup, the backend runs on **Render** (not Vercel) for the file-storage reason mentioned earlier. The `deploy.yml` workflow is configured for Vercel to demonstrate full-stack CI/CD knowledge; Render redeploys automatically on `main` push via its own GitHub integration.

### Required GitHub Secrets

| Secret | Source |
| --- | --- |
| `VERCEL_TOKEN` | <https://vercel.com/account/tokens> |
| `VERCEL_ORG_ID` | Vercel project Settings → Team / Account ID |
| `VERCEL_FRONTEND_PROJECT_ID` | Frontend project Settings → Project ID |
| `VERCEL_BACKEND_PROJECT_ID` | Backend project Settings → Project ID |

> See **[CICD.md](./CICD.md)** for the full CI/CD setup walkthrough.

---

## 🚀 Deployment Architecture

| Component | Provider | Why | URL |
| --- | --- | --- | --- |
| **Frontend** | Vercel | Optimized for Vite/React static assets + global CDN | <https://job-portal-alpha-amber.vercel.app/> |
| **Backend API** | Render | Persistent disk for resume uploads (Vercel functions are ephemeral) + always-on Express | <https://job-portal-ov18.onrender.com> |
| **Database** | MongoDB Atlas (free tier) | Managed Mongo, easy network access | — |
| **CI** | GitHub Actions | Build verification + automated deploys | — |

**Why split hosting?** Vercel's serverless model wipes the filesystem between requests, which would break resume uploads. Render runs Express as a long-running Node process with persistent disk — exactly what `multer.diskStorage` needs.

---

## 🤖 AI Workflow

This project was built end-to-end with **Claude Code** (Anthropic's CLI agent). AI was used for:

| Task | How AI helped |
| --- | --- |
| **Scaffolding** | Initial project structure, Express + Mongoose models, React Router setup |
| **UI design** | Translated Figma-style mockups into production Tailwind components |
| **Bug hunting** | Senior-engineer-level audit — caught a Rules-of-Hooks violation in Navbar, an authorization escape in `PUT /jobs/:id`, and orphan upload leaks |
| **CI/CD** | Generated GitHub Actions workflows for both `ci.yml` and `deploy.yml` |
| **Documentation** | This README, [SETUP.md](./SETUP.md), [CICD.md](./CICD.md), and project rules in [CLAUDE.md](./CLAUDE.md) |
| **Refactoring** | Distinct seeker vs recruiter dashboards, dark mode adaptation, accessibility passes |

The AI was given strict project rules in `CLAUDE.md` (e.g., *"this is a Vite SPA, not Next.js — ignore `'use client'` suggestions"*) to keep its output consistent with the actual stack.

---

## 🧪 Testing the Live App

1. Open <https://job-portal-alpha-amber.vercel.app/>
2. Wait ~30 seconds for the Render backend to wake up (cold start)
3. Click **Log in** → use `seeker@example.com` / `password123`
4. Browse jobs, save one, open one and apply with any PDF
5. Log out, log in as `recruiter@example.com` / `password123`
6. Click on a posted job → **View applicants** → see the application
7. Change the application status → switch back to the seeker → see the updated status

---

## 🐛 Bug Fixes Applied During Development

A code audit caught and fixed:

1. **🔴 Rules-of-Hooks violation** — `Navbar.jsx` had an early return *before* `useEffect`, which would have crashed when navigating between routes
2. **🔴 Authorization escape** — `PUT /api/jobs/:id` used `Object.assign(job, req.body)`, allowing recruiters to transfer ownership of their jobs to other users by sending a tampered `postedBy` field. Replaced with a strict allowlist
3. **🟠 Orphan upload leak** — when application validation failed (404, 409, validation error), the uploaded resume stayed on disk forever. Added `fs.unlink` cleanup in the controller and the validate middleware
4. **🟡 Repeat-apply UX bug** — the backend correctly rejected duplicate applications via a unique index, but the UI kept showing the upload form. Now tracks applied state and swaps the form for a "You've already applied" panel

---

## 📌 Roadmap / Future Improvements

- 🤖 AI-powered resume parsing & job matching
- 🔔 Real-time notifications (WebSockets / Pusher)
- 📊 Recruiter analytics dashboard with charts
- 📅 Interview scheduling integration
- 📧 Transactional emails (SendGrid)
- ☁️ Migrate file storage from disk → S3 / Vercel Blob for true horizontal scaling
- 🔐 OAuth login (Google + LinkedIn)
- 💬 In-app messaging between recruiters and candidates

---

## 👩‍💻 Author

**Srivani Mokurala**
Full Stack MERN Developer

- 🐙 GitHub: [@mokurala-srivani](https://github.com/mokurala-srivani)
- 💼 LinkedIn: [srivani-mokurala](https://www.linkedin.com/in/srivani-mokurala-016505225/)

---

## 📄 License

MIT — feel free to fork and learn from it.
