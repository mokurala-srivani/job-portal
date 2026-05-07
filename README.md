# 🚀 Jobify — AI Powered MERN Job Board

A modern full-stack Job Board platform built using the **MERN Stack (MongoDB, Express.js, React.js, Node.js)** with role-based authentication, recruiter dashboards, job applications, resume uploads, CI/CD automation, and Vercel deployment.

---

# 🌐 Live Demo

🔗 https://job-portal-alpha-amber.vercel.app

---

# 📂 GitHub Repository

🔗 https://github.com/mokurala-srivani/job-portal

---

# ✨ Features

## 👨‍💼 Job Seekers

* Browse jobs with advanced filters
* Search jobs by keyword/location
* Apply for jobs with resume upload
* Save & manage favorite jobs
* Track application status
* Responsive user dashboard

## 🏢 Recruiters

* Post new jobs
* Edit/Delete job listings
* View applicants for each job
* Manage hiring workflow
* Dashboard analytics

## 🔐 Authentication & Security

* JWT Authentication
* Role-based access control
* Protected routes
* Password hashing using bcrypt

## 🎨 UI/UX

* Modern SaaS-inspired UI
* Fully responsive design
* Tailwind CSS styling
* Mobile-friendly layouts
* Toast notifications & loaders

---

# 🛠️ Tech Stack

| Category       | Technologies                        |
| -------------- | ----------------------------------- |
| Frontend       | React.js, Vite, Tailwind CSS, Axios |
| Backend        | Node.js, Express.js                 |
| Database       | MongoDB, Mongoose                   |
| Authentication | JWT, bcryptjs                       |
| Deployment     | Vercel                              |
| CI/CD          | GitHub Actions                      |

---

# 📁 Project Structure

```bash id="j5w8k2"
Job-portal/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── server.js
│
├── frontend/
│   ├── src/
│   ├── pages/
│   ├── components/
│   ├── services/
│   └── App.jsx
│
└── .github/workflows/
    └── ci.yml
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash id="n2m9x1"
git clone https://github.com/mokurala-srivani/job-portal.git
cd Job-portal
```

---

## 2️⃣ Backend Setup

```bash id="g7q4v8"
cd backend
npm install
npm run dev
```

Backend runs on:

```bash id="y8c3n5"
http://localhost:5000
```

---

## 3️⃣ Frontend Setup

```bash id="t6p8m3"
cd frontend
npm install
npm run dev
```

Frontend runs on:

```bash id="v9r2k7"
http://localhost:5173
```

---

# 🔑 Environment Variables

## Backend `.env`

```env id="f3q8v6"
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLIENT_ORIGIN=http://localhost:5173
```

## Frontend `.env`

```env id="m7w1k4"
VITE_API_URL=http://localhost:5000
```

---

# 🔄 CI/CD Pipeline

GitHub Actions is configured for Continuous Integration & Deployment.

### Workflow Includes:

* Automatic dependency installation
* Frontend build validation
* Deployment workflow automation
* GitHub → Vercel integration

Workflow file:

```bash id="q4x7c1"
.github/workflows/ci.yml
```

---

# 🚀 Deployment

Frontend deployed using **Vercel**.

Live Project:
🔗 https://job-portal-alpha-amber.vercel.app

---

# 📌 Future Improvements

* AI Resume Matching
* Real-time Notifications
* Admin Analytics Dashboard
* Interview Scheduling
* Email Notifications
* Resume Parsing

---

# 👩‍💻 Developed By

**Srivani Mokurala**
Full Stack MERN Developer
