# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Two-package MERN job board (no monorepo tooling — `backend/` and `frontend/` are independent npm projects). Roles: `job_seeker`, `recruiter`, `admin`.

## Commands

```bash
# Backend (from backend/)
npm install
npm run dev      # nodemon, http://localhost:5001 (configurable via PORT in backend/.env)
npm start        # node server.js
npm run seed     # wipes & reseeds Users/Jobs/Applications, prints test creds

# Frontend (from frontend/)
npm install
npm run dev      # vite, http://localhost:5173
npm run build
```

Run `npm run seed` whenever the data model changes — it clears all three collections.

There is no test suite, no linter, and no TypeScript. Don't introduce them unless the user asks.

## Architecture

**Backend (Express + Mongoose, CommonJS):**
- `server.js` wires middleware, mounts routers under `/api/*`, serves resume uploads from `/uploads`.
- MVC: `routes/` → `controllers/` → `models/`. Controllers are wrapped in `utils/asyncHandler.js`; the central error handler in `middleware/error.js` formats responses.
- Auth: JWT in `Authorization: Bearer …`. `middleware/auth.js` exports `requireAuth` (loads `req.user` from DB) and `requireRole(...roles)`. Ownership checks live in controllers (compare `job.postedBy` against `req.user._id`, with `admin` always allowed).
- Validation: `express-validator` chains in route files, terminated by `middleware/validate.js`.
- Resume upload: `multer` disk storage in `middleware/upload.js`, accepts only `.pdf/.doc/.docx`, size capped via `MAX_UPLOAD_MB`.

**Models & indexes:**
- `User`: unique `email`; `setPassword`/`verifyPassword` use bcrypt; `toJSON` strips `passwordHash`.
- `Job`: text index on `(title, description, skills, company)` powers `?q=`; secondary indexes on `location`, `type`, `createdAt`, `postedBy`.
- `Application`: unique compound `(job, applicant)` enforces "one application per seeker per job".

**Frontend (Vite + React 18 + Tailwind):**
- Plain SPA — **not Next.js**. Ignore tooling suggestions about `"use client"`, App Router, server components, `proxy.ts`, etc.
- `services/api.js` is a single axios instance; request interceptor injects the JWT from `localStorage`, response interceptor clears it on 401.
- `context/AuthContext.jsx` is the source of truth for the current user; rehydrates on mount via `GET /api/auth/me`.
- `pages/Dashboard.jsx` is a thin role switch into `SeekerDashboard` or `RecruiterDashboard` — keep role-specific UI in those, not in `Dashboard`.
- `pages/Jobs.jsx` syncs filter state to the URL via `useSearchParams` and debounces text inputs (`hooks/useDebounce.js`); when adding filters, route them through this same `queryParams` memo so URL ↔ state stays in sync.

## Conventions

- Job types live in `backend/models/Job.js` as `JOB_TYPES`; application statuses in `backend/models/Application.js` as `STATUSES`. Mirror any changes in the frontend (`Filters.jsx`, `RecruiterDashboard.jsx`, `SeekerDashboard.jsx`).
- All env access goes through `process.env` (backend) or `import.meta.env.VITE_*` (frontend). No hardcoded URLs/secrets.
- Resume URLs returned by the API are server-relative (`/uploads/...`); the frontend prepends `fileBase` (`services/api.js`) when rendering links.
