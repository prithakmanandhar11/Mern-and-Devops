# Student Management System

[![CI](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME/actions/workflows/ci.yml)

A complete MERN stack application for managing student records. It includes a REST API built with Express and Mongoose, a React single-page frontend, full create/read/update/delete flows, form validation, confirmation before deletion, and a responsive card/table UI using plain CSS.

---

## Features

- View all students in a responsive table
- Add a new student with a validated form
- Edit an existing student (data is loaded from the API)
- Delete a student after a confirmation dialog
- Success and error messages on every operation
- Loading, empty, and not-found states
- Responsive navbar, forms, and table (turns into cards on small screens)
- Centralised API error handling on the frontend
- Centralised async error handling on the backend

## Tech Stack

| Layer    | Technology                                         |
| -------- | -------------------------------------------------- |
| Frontend | React 18, Vite, React Router DOM, Axios, plain CSS |
| Backend  | Node.js, Express.js, Mongoose                      |
| Database | MongoDB Atlas                                      |
| Config   | dotenv, CORS                                       |
| CI/CD    | GitHub Actions (Ubuntu runners, Node.js 20)        |
| Language | JavaScript (no TypeScript, no Tailwind)            |

## CI/CD with GitHub Actions

### What is CI/CD?

**Continuous Integration (CI)** is the practice of automatically installing, checking, and building a project whenever code changes. Every push and pull request is validated in a clean environment, so syntax errors, broken imports, and failed builds are caught before they reach `main`.

**Continuous Delivery/Deployment (CD)** is the next stage: automatically delivering every validated change to a staging or production environment. This project implements CI; the same workflow can be extended later with a deployment job.

### How GitHub Actions works

GitHub Actions is GitHub's built-in automation platform. It reads workflow files from `.github/workflows/` and runs them when their configured events occur.

- **Workflow** — the automation file, `.github/workflows/ci.yml` in this repository.
- **Event / trigger** — the activity that starts the workflow, such as a push or pull request.
- **Job** — a group of steps that run on the same runner. This workflow has separate `backend` and `frontend` jobs.
- **Runner** — a fresh GitHub-hosted Ubuntu virtual machine, discarded after the job.
- **Step** — an individual command or reusable action. Steps run in order, and a non-zero exit code fails the step and the job.
- **Action** — a reusable step such as `actions/checkout@v4` or `actions/setup-node@v4`.

### When the workflow is triggered

`.github/workflows/ci.yml` runs when:

| Event        | Condition                                                       |
| ------------ | --------------------------------------------------------------- |
| Push         | Any commit is pushed to the `main` branch                       |
| Pull request | A pull request targeting `main` is opened, reopened, or updated |

Pushes to other branches do not run CI by themselves; open a pull request into `main` to validate them.

### What the workflow checks

| Job        | Runner          | Steps                                                                                                                 |
| ---------- | --------------- | --------------------------------------------------------------------------------------------------------------------- |
| `backend`  | `ubuntu-latest` | Checkout, Node.js 20, `npm install`, syntax-check every backend `.js` file, start the Express app and request `GET /` |
| `frontend` | `ubuntu-latest` | Checkout, Node.js 20, `npm install`, `npm run build`                                                                  |

The backend startup test uses `backend/scripts/ci-start-check.js`. It boots the Express app on an ephemeral port and verifies that the health endpoint responds with HTTP 200. It does not need a database or Docker, so the workflow stays fast and self-contained.

If any command exits with a non-zero status, the step fails, the job fails, and the workflow is marked as failed. GitHub blocks a pull request from merging when the repository's branch protection rules require the `CI` status checks.

### Viewing results

1. Open the **Actions** tab of the GitHub repository.
2. Select the **CI** workflow and a run to inspect each job and step.
3. The badge at the top of this README shows the latest result for `main`.

### Badge setup

The badge already points at `.github/workflows/ci.yml`. Before publishing, replace `prithakmanandhar11` and `Mern-and-Devops` in the badge URL with your repository's owner and name.

### Running the same checks locally

```bash
# Backend
cd backend
npm install
node scripts/ci-start-check.js

# Frontend
cd ../frontend
npm install
npm run build
```

## Project Structure

```text
student-management-system/
│
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions CI workflow
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   └── studentController.js  # CRUD logic
│   ├── middleware/
│   │   ├── asyncHandler.js       # Async error wrapper
│   │   └── errorHandler.js       # 404 + central error handler
│   ├── models/
│   │   └── Student.js            # Mongoose schema
│   ├── routes/
│   │   └── studentRoutes.js      # Express router
│   ├── scripts/
│   │   └── ci-start-check.js     # CI startup smoke test
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── app.js                    # Express app (middleware + routes)
│   ├── package.json
│   └── server.js                 # Server entry point (DB + listen)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── Message.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── StudentForm.jsx
│   │   ├── pages/
│   │   │   ├── AddStudent.jsx
│   │   │   ├── EditStudent.jsx
│   │   │   ├── Home.jsx
│   │   │   └── NotFound.jsx
│   │   ├── services/
│   │   │   ├── api.js            # Axios instance + interceptors
│   │   │   └── studentService.js # API functions
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer (npm included)
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account
- A terminal (PowerShell, Command Prompt, or Bash)

---

## 1. MongoDB Atlas Setup

1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Click **Create** and build a **free (M0) cluster**.
3. Under **Database Access**, click **Add New Database User**:
   - Choose **Password** authentication.
   - Create a username and password and save them somewhere safe.
   - Give the user the **Read and write to any database** role.
4. Under **Network Access**, click **Add IP Address**:
   - For local development, **Add Current IP Address** is best.
   - For quick testing from anywhere, `0.0.0.0/0` works (not recommended for production).
5. Click **Connect** on your cluster and choose **Drivers**.
6. Copy the connection string. It looks like:

   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

7. Add the database name `studentdb` before the `?`:

   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/studentdb?retryWrites=true&w=majority
   ```

8. Replace `<username>` and `<password>` with your database user credentials. If your password contains special characters such as `@`, `#`, or `/`, URL-encode them (for example, `@` becomes `%40`).

The `students` collection and database are created automatically on the first insert.

---

## 2. Backend Setup

```bash
cd student-management-system/backend
npm install
```

Open `backend/.env` and set your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/studentdb?retryWrites=true&w=majority&appName=Cluster0
```

> The repository ships with a `.env` file containing placeholders. Replace `USERNAME`, `PASSWORD`, and the cluster host with your own Atlas credentials. Never commit real credentials to a public repository.

Start the backend:

```bash
npm run dev
```

You should see:

```text
MongoDB connected: cluster0-shard-00-00.xxxxx.mongodb.net
Server running on http://localhost:5000
```

Quick check: open <http://localhost:5000/api/students> — you should get `{"success":true,"count":0,"data":[]}`.

### Backend command

| Command       | Description                       |
| ------------- | --------------------------------- |
| `npm run dev` | Start with nodemon (auto-restart) |

---

## 3. Frontend Setup

In a **new terminal**:

```bash
cd student-management-system/frontend
npm install
```

`frontend/.env` already points at the local API:

```env
VITE_API_URL=http://localhost:5000/api
```

If your backend runs on a different host or port, update this value. Vite only exposes variables prefixed with `VITE_`.

Start the frontend:

```bash
npm run dev
```

Open <http://localhost:5173> in your browser.

### Frontend scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite dev server            |
| `npm run build`   | Create a production build in `dist/` |
| `npm run preview` | Preview the production build         |

---

## 4. Running Both Apps

Two terminals are required:

| Terminal | Directory   | Command       | URL                   |
| -------- | ----------- | ------------- | --------------------- |
| 1        | `backend/`  | `npm run dev` | http://localhost:5000 |
| 2        | `frontend/` | `npm run dev` | http://localhost:5173 |

The frontend calls the backend using the URL in `frontend/.env`. CORS is enabled on the backend, so no proxy is required.

---

---

## Environment Variables

### Backend (`backend/.env`)

| Variable      | Required | Default | Description                                                      |
| ------------- | -------- | ------- | ---------------------------------------------------------------- |
| `MONGODB_URI` | Yes      | —       | MongoDB Atlas connection string, including the `studentdb` name. |
| `PORT`        | No       | `5000`  | Port the Express server listens on.                              |

### Frontend (`frontend/.env`)

| Variable       | Required | Default                     | Description               |
| -------------- | -------- | --------------------------- | ------------------------- |
| `VITE_API_URL` | No       | `http://localhost:5000/api` | Base URL of the REST API. |

---

## API Reference

Base URL: `http://localhost:5000/api`

| Method   | Endpoint        | Description      | Success Status |
| -------- | --------------- | ---------------- | -------------- |
| `POST`   | `/students`     | Create a student | `201`          |
| `GET`    | `/students`     | Get all students | `200`          |
| `GET`    | `/students/:id` | Get one student  | `200`          |
| `PUT`    | `/students/:id` | Update a student | `200`          |
| `DELETE` | `/students/:id` | Delete a student | `200`          |

Error responses use `400` (validation / invalid id / duplicate email), `404` (student or route not found), or `500` (server error).

### Create a student

```http
POST /api/students
Content-Type: application/json

{
  "name": "Aarav Sharma",
  "email": "aarav.sharma@example.com",
  "course": "B.Sc. Computer Science",
  "semester": 3,
  "phone": "+91 98765 43210"
}
```

Response (`201 Created`):

```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "_id": "674f...",
    "name": "Aarav Sharma",
    "email": "aarav.sharma@example.com",
    "course": "B.Sc. Computer Science",
    "semester": 3,
    "phone": "+91 98765 43210",
    "createdAt": "2026-01-01T10:00:00.000Z",
    "updatedAt": "2026-01-01T10:00:00.000Z"
  }
}
```

### Get all students

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "674f...",
      "name": "Aarav Sharma",
      "email": "aarav.sharma@example.com",
      "course": "B.Sc. Computer Science",
      "semester": 3,
      "phone": "+91 98765 43210"
    }
  ]
}
```

### Validation error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "email is required",
    "Semester must be a whole number between 1 and 12"
  ]
}
```

---

## Data Model

| Field      | Type   | Rules                                                           |
| ---------- | ------ | --------------------------------------------------------------- |
| `name`     | String | Required, trimmed, max 100 characters                           |
| `email`    | String | Required, unique, lowercase, valid email format                 |
| `course`   | String | Required, trimmed, max 100 characters                           |
| `semester` | Number | Required, whole number from 1 to 12                             |
| `phone`    | String | Required, 7–20 characters (`0-9`, `+`, `-`, space, parentheses) |

`createdAt` and `updatedAt` timestamps are added automatically.

---

## Routes (Frontend)

| Path        | Page                                |
| ----------- | ----------------------------------- |
| `/`         | Students list (table, edit, delete) |
| `/add`      | Add Student form                    |
| `/edit/:id` | Edit Student form                   |
| `*`         | 404 Not Found page                  |

---

## Troubleshooting

**`MONGODB_URI is not defined`**
Create `backend/.env` and add the variable. Restart the server after changing `.env`.

**`Failed to start server: ...` / connection timeout**
Check the Atlas **Network Access** allow-list for your current IP, confirm the username and password, and make sure the cluster is running. Passwords with special characters must be URL-encoded.

**`A student with this email already exists`**
Emails must be unique. Use a different email or edit the existing student.

**Frontend shows "Cannot reach the server"**
Start the backend on port 5000 and confirm `frontend/.env` has the correct `VITE_API_URL`. Restart Vite after changing `.env`.

**CORS error in the browser**
CORS is enabled with `app.use(cors())`. If you changed the backend, keep that middleware before the routes.

**Port already in use**
Change `PORT` in `backend/.env`, then update `VITE_API_URL` in `frontend/.env` to match.

---

## Notes

- The API has no authentication by design; this is a learning/demo project.
- `.env` files are git-ignored in a typical setup. The included files are starting templates — replace the credentials before deploying.
- For production, restrict CORS to your deployed frontend origin, add authentication, and use environment-specific build settings.
