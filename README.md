# HireSmartAI

Job portal with an employer dashboard and a job seeker side.

**Stack:** React, Tailwind, Axios, React Router, Framer Motion, Lucide, React Hot Toast · Node, Express, MySQL, Multer, JWT, bcryptjs, dotenv, CORS

## Setup

### 1. Database
```bash
mysql -u root -p < backend/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env     # fill in DB credentials and a long random JWT_SECRET
npm install
npm run dev              # http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:5173
```

## How it works

- Register as **Employer** or **Job seeker** (role chosen at signup).
- Employers land on `/employer` (dashboard, post job, manage jobs, applicants, company profile).
- Anyone can browse jobs at `/` with search (title, city), filters (category, type, salary range) and grid/list view.
- Applying and saving require a seeker login. A resume must be uploaded in the profile before applying.

## API

| Method | Route | Access |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | public |
| GET | /api/jobs (search, city, category, type, minSalary, maxSalary, page) | public |
| GET | /api/jobs/:id | public |
| GET | /api/jobs/mine | employer |
| POST / DELETE | /api/jobs, /api/jobs/:id | employer |
| PATCH | /api/jobs/:id/status | employer |
| POST | /api/applications/:jobId | seeker |
| GET | /api/applications/mine | seeker |
| GET | /api/applications/job/:jobId | employer |
| PATCH | /api/applications/:id/status | employer |
| GET / POST | /api/saved, /api/saved/:jobId (toggle) | seeker |
| GET / PUT | /api/profile (multipart) | logged in |
| GET | /api/employer/dashboard | employer |

## Not built yet

- The "AI" part (resume-to-job match score, AI job description writer, smart recommendations)
- Password reset, email notifications
- Moving uploads to S3/Cloudinary for production
