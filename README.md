# Student Management System

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

| Layer      | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Frontend   | React 18, Vite, React Router DOM, Axios, plain CSS     |
| Backend    | Node.js, Express.js, Mongoose                          |
| Database   | MongoDB Atlas                                          |
| Config     | dotenv, CORS                                           |
| Language   | JavaScript (no TypeScript, no Tailwind)               |

## Project Structure

```text
student-management-system/
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
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js                 # App entry point
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

or, without nodemon:

```bash
npm start
```

You should see:

```text
MongoDB connected: cluster0-shard-00-00.xxxxx.mongodb.net
Server running on http://localhost:5000
```

Quick check: open <http://localhost:5000/api/students> — you should get `{"success":true,"count":0,"data":[]}`.

### Backend scripts

| Command       | Description                          |
| ------------- | ------------------------------------ |
| `npm run dev` | Start with nodemon (auto-restart)    |
| `npm start`   | Start with plain Node.js             |

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

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the Vite dev server            |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build       |

---

## 4. Running Both Apps

Two terminals are required:

| Terminal | Directory            | Command       | URL                     |
| -------- | -------------------- | ------------- | ----------------------- |
| 1        | `backend/`           | `npm run dev` | http://localhost:5000   |
| 2        | `frontend/`          | `npm run dev` | http://localhost:5173   |

The frontend calls the backend using the URL in `frontend/.env`. CORS is enabled on the backend, so no proxy is required.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable      | Required | Default | Description                                                      |
| ------------- | -------- | ------- | ---------------------------------------------------------------- |
| `MONGODB_URI` | Yes      | —       | MongoDB Atlas connection string, including the `studentdb` name. |
| `PORT`        | No       | `5000`  | Port the Express server listens on.                              |

### Frontend (`frontend/.env`)

| Variable       | Required | Default                     | Description                 |
| -------------- | -------- | --------------------------- | --------------------------- |
| `VITE_API_URL` | No       | `http://localhost:5000/api` | Base URL of the REST API.   |

---

## API Reference

Base URL: `http://localhost:5000/api`

| Method   | Endpoint            | Description        | Success Status |
| -------- | ------------------- | ------------------ | -------------- |
| `POST`   | `/students`         | Create a student   | `201`          |
| `GET`    | `/students`         | Get all students   | `200`          |
| `GET`    | `/students/:id`     | Get one student    | `200`          |
| `PUT`    | `/students/:id`     | Update a student   | `200`          |
| `DELETE` | `/students/:id`     | Delete a student   | `200`          |

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

| Field      | Type   | Rules                                              |
| ---------- | ------ | -------------------------------------------------- |
| `name`     | String | Required, trimmed, max 100 characters              |
| `email`    | String | Required, unique, lowercase, valid email format    |
| `course`   | String | Required, trimmed, max 100 characters              |
| `semester` | Number | Required, whole number from 1 to 12                |
| `phone`    | String | Required, 7–20 characters (`0-9`, `+`, `-`, space, parentheses) |

`createdAt` and `updatedAt` timestamps are added automatically.

---

## Routes (Frontend)

| Path         | Page                                      |
| ------------ | ----------------------------------------- |
| `/`          | Students list (table, edit, delete)       |
| `/add`       | Add Student form                          |
| `/edit/:id`  | Edit Student form                         |
| `*`          | 404 Not Found page                        |

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
