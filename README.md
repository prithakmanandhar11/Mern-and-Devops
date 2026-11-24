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

| Layer      | Technology                                         |
| ---------- | -------------------------------------------------- |
| Frontend   | React 18, Vite, React Router DOM, Axios, plain CSS |
| Backend    | Node.js, Express.js, Mongoose                      |
| Database   | MongoDB Atlas                                      |
| Config     | dotenv, CORS                                       |
| CI/CD      | GitHub Actions (Ubuntu runners, Node.js 20)        |
| Deployment | AWS EC2 (Ubuntu), Nginx, PM2                       |
| Language   | JavaScript (no TypeScript, no Tailwind)            |

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

> **Deployment is manual:** the workflow validates code only; it does not deploy to EC2. After a green CI run, follow the [AWS EC2 deployment guide](#deploying-to-aws-ec2-ubuntu-no-docker). The workflow file is unchanged by the deployment setup.

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
│   │   ├── db.js                 # MongoDB connection + fallback logic
│   │   └── mongoUri.js           # URI validation/sanitising helpers
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
│   │   ├── ci-start-check.js     # CI startup smoke test
│   │   └── diagnose-db.js        # MongoDB/SRV diagnostics (no secrets printed)
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── app.js                    # Express app (middleware + routes)
│   ├── ecosystem.config.js       # PM2 production process config
│   ├── package.json
│   └── server.js                 # Server entry point (DB + listen)
│
├── deploy/
│   └── nginx/
│       └── student-management-system.conf  # Nginx site + API proxy
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
│   ├── .env.production           # Production build (VITE_API_URL=/api)
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
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/studentdb?retryWrites=true&w=majority&appName=Cluster0
```

> The repository ships with a `.env` file containing placeholders. Replace `USERNAME`, `PASSWORD`, and the cluster host with your own Atlas credentials. Never commit real credentials to a public repository. On EC2, set `HOST=127.0.0.1` so the API is reachable only through Nginx.

Start the backend:

```bash
npm run dev
```

You should see:

```text
MongoDB connected: cluster0-shard-00-00.xxxxx.mongodb.net
Server running on http://localhost:5000
Environment: development
```

Quick check: open <http://localhost:5000/api/students> — you should get `{"success":true,"count":0,"data":[]}`.

### Backend commands

| Command       | Description                           |
| ------------- | ------------------------------------- |
| `npm run dev` | Start with nodemon (auto-restart)     |
| `npm start`   | Start with plain Node.js (production) |

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

`npm run build` also loads `frontend/.env.production`, which sets `VITE_API_URL=/api` for same-origin Nginx hosting. `npm run dev` continues to use `frontend/.env`.

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

> The production build uses `VITE_API_URL=/api`. `npm run preview` serves the build but does not proxy `/api`, so use `npm run dev` for local API development or test the build behind Nginx.

---

## 4. Running Both Apps

Two terminals are required:

| Terminal | Directory   | Command       | URL                   |
| -------- | ----------- | ------------- | --------------------- |
| 1        | `backend/`  | `npm run dev` | http://localhost:5000 |
| 2        | `frontend/` | `npm run dev` | http://localhost:5173 |

The frontend calls the backend using the URL in `frontend/.env`. CORS is enabled on the backend, so no proxy is required.

---

## Deploying to AWS EC2 (Ubuntu, No Docker)

This guide deploys the frontend and backend to one Ubuntu EC2 instance. No Docker, container registry, or managed frontend host is required.

```text
Browser
  │
  ▼
Nginx (ports 80 / 443)
  ├── /            → React build files in frontend/dist
  └── /api/*       → Express API on 127.0.0.1:5000 (PM2)
                            │
                            ▼
                      MongoDB Atlas
```

Nginx serves the React production build and proxies API requests to the Express server. PM2 keeps the backend running and restarts it automatically. The GitHub Actions workflow remains CI-only; deployment is performed manually with the steps below.

### 1. Launch the EC2 instance

1. Open the **EC2** console in AWS.
2. Click **Launch instance**.
3. Configure:
   - **Name:** `student-management-system`
   - **AMI:** Ubuntu Server 24.04 LTS (22.04 LTS also works)
   - **Instance type:** `t3.micro` or `t2.micro` for a small demo
   - **Key pair:** create or select an existing `.pem` key
   - **Storage:** 8–16 GB gp3
4. Create a security group with these inbound rules:

   | Type  | Port | Source                    |
   | ----- | ---- | ------------------------- |
   | SSH   | 22   | Your IP address           |
   | HTTP  | 80   | `0.0.0.0/0` (or `::/0`)   |
   | HTTPS | 443  | `0.0.0.0/0` (or `::/0`)   |

   **Do not open port 5000.** The API will bind to `127.0.0.1` and be reached only through Nginx.

5. Launch the instance.
6. Allocate an **Elastic IP** and associate it with the instance. This keeps the public address stable for DNS and the MongoDB Atlas allow-list.
7. Connect from your computer:

   ```bash
   chmod 400 /path/to/your-key.pem
   ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
   ```

### 2. Allow the EC2 instance in MongoDB Atlas

1. In Atlas, open your cluster → **Network Access**.
2. Click **Add IP Address**.
3. Add `YOUR_EC2_PUBLIC_IP/32` (the Elastic IP if you created one).
4. Save the change.

If the instance is stopped and started without an Elastic IP, its public IP can change and Atlas access will fail until the new address is added.

### 3. Install Node.js, PM2, Nginx, and Git

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y git nginx curl ufw

# Node.js 20 from NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Process manager for the backend
sudo npm install -g pm2

node -v   # v20.x
npm -v
pm2 -v
nginx -v
```

Optionally enable the Ubuntu firewall. Keep SSH allowed before enabling it:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
sudo ufw status
```

The AWS security group is still the primary firewall. UFW provides a second layer.

### 4. Put the project on the server

```bash
sudo mkdir -p /var/www
sudo chown -R "$USER":"$USER" /var/www

cd /var/www
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git student-management-system
cd student-management-system
```

Replace the clone URL with your repository. For a private repository, configure a GitHub deploy key or a personal access token on the server.

If the code is not on GitHub yet, copy it with `scp` instead:

```bash
scp -i /path/to/your-key.pem -r ./student-management-system ubuntu@YOUR_EC2_PUBLIC_IP:/var/www/
```

### 5. Configure and test the backend

```bash
cd /var/www/student-management-system/backend

# Production dependencies only (nodemon is not needed on the server)
npm ci --omit=dev

# Create the environment file
cp .env.example .env
chmod 600 .env
mkdir -p logs
nano .env
```

Set these values in `backend/.env`:

```env
NODE_ENV=production
PORT=5000
HOST=127.0.0.1
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/studentdb?retryWrites=true&w=majority&appName=Cluster0
```

Notes:

- `PORT` and `MONGODB_URI` are read from the environment by `server.js` / `config/db.js`.
- `HOST=127.0.0.1` prevents the API from listening on the public network interface.
- Leave `CLIENT_ORIGIN` unset because Nginx serves the frontend and the API on the same origin.
- URL-encode special characters in the Atlas password (`@` becomes `%40`, for example).

Test the API manually before starting PM2:

```bash
node server.js
```

In a second SSH session:

```bash
curl http://127.0.0.1:5000/
curl http://127.0.0.1:5000/api/students
```

The first request returns the health message and the second returns the student list. Press `Ctrl+C` in the first session to stop the test server.

If the server cannot connect, see [Troubleshooting](#troubleshooting-the-ec2-deployment).

### 6. Run the backend continuously with PM2

`backend/ecosystem.config.js` defines the production process, log files, memory limit, and `NODE_ENV=production`. Application secrets stay in `.env`.

```bash
cd /var/www/student-management-system/backend
pm2 start ecosystem.config.js
pm2 status
pm2 logs student-management-api --lines 50
```

Useful PM2 commands:

| Command                                      | Description                                          |
| -------------------------------------------- | ---------------------------------------------------- |
| `pm2 status`                                 | Show process state, CPU, memory, and restart count   |
| `pm2 logs student-management-api`            | Follow live logs (Ctrl+C to exit)                    |
| `pm2 restart student-management-api`         | Restart after code changes                           |
| `pm2 restart student-management-api --update-env` | Restart and reload environment variables       |
| `pm2 reload student-management-api`          | Zero-downtime reload (or graceful restart in fork mode) |
| `pm2 stop student-management-api`            | Stop the process                                     |
| `pm2 delete student-management-api`          | Remove it from the PM2 process list                  |
| `pm2 save`                                   | Save the current process list for reboot             |

Persist the process across reboots:

```bash
pm2 save
pm2 startup systemd
```

`pm2 startup` prints a `sudo env PATH=... pm2 startup ...` command. Copy and run that exact command, then run `pm2 save` again. After a reboot, verify with:

```bash
pm2 status
curl http://127.0.0.1:5000/
```

### 7. Build the React frontend for production

```bash
cd /var/www/student-management-system/frontend
npm ci
npm run build
```

This creates `frontend/dist/`. The committed `frontend/.env.production` sets:

```env
VITE_API_URL=/api
```

Because the API path is relative, the browser calls `http://YOUR_DOMAIN/api/...`, and Nginx forwards those requests to the backend. This avoids CORS and hard-coded EC2 addresses.

Do not use `npm run dev` on the production server. Nginx serves the static `dist/` files directly.

If the API will live on a different domain, change `VITE_API_URL` in `frontend/.env.production`, rebuild, and set `CLIENT_ORIGIN` in `backend/.env` to that frontend origin.

### 8. Configure Nginx

The repository includes a production-ready site file at `deploy/nginx/student-management-system.conf`. It serves the React build, adds SPA fallback for React Router, caches hashed assets, and proxies `/api/` to port 5000.

```bash
cd /var/www/student-management-system

sudo cp deploy/nginx/student-management-system.conf \
  /etc/nginx/sites-available/student-management-system

sudo ln -sfn /etc/nginx/sites-available/student-management-system \
  /etc/nginx/sites-enabled/student-management-system

# Disable the default Nginx welcome page
sudo rm -f /etc/nginx/sites-enabled/default

sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx
```

The config assumes the project is at `/var/www/student-management-system`. If you used another path, update `root` in the site file. If you have a domain, replace `server_name _;` with your domain.

Verify:

```bash
curl -I http://localhost
curl http://localhost/api/students
```

`curl -I http://localhost` should return `200 OK`, and the API request should return JSON.

### 9. Add HTTPS (recommended)

HTTPS requires a domain whose DNS **A record** points to the Elastic IP.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d example.com -d www.example.com
sudo certbot renew --dry-run
```

Certbot updates the Nginx site file, obtains a certificate, and configures HTTP-to-HTTPS redirection. Ensure port 443 is open in the security group.

### 10. Final verification

Open `http://YOUR_EC2_PUBLIC_IP` (or `https://your-domain.com`) and confirm:

- The student list loads.
- Add, edit, and delete work.
- Refreshing `/add` or `/edit/:id` does not produce a 404.
- Browser requests go to `/api/students`, not `localhost:5000`.

Useful checks:

```bash
pm2 status
pm2 logs student-management-api --lines 100
curl http://127.0.0.1:5000/api/students
curl -I http://localhost
sudo tail -n 100 /var/log/nginx/student-management-system.error.log
sudo tail -n 100 /var/log/nginx/student-management-system.access.log
```

### 11. Deploying updates

GitHub Actions CI validates pushes and pull requests but does not deploy. After CI is green on `main`, update the server manually:

```bash
cd /var/www/student-management-system
git pull origin main

# Backend
cd backend
npm ci --omit=dev
mkdir -p logs
pm2 restart student-management-api --update-env

# Frontend
cd ../frontend
npm ci
npm run build
```

Nginx serves the new `dist/` files immediately. Reload Nginx only if its configuration changed:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

If `ecosystem.config.js` changed, restart it explicitly:

```bash
cd /var/www/student-management-system/backend
pm2 delete student-management-api
pm2 start ecosystem.config.js
pm2 save
```

### Troubleshooting the EC2 deployment

| Symptom | Checks |
| --- | --- |
| **502 Bad Gateway** | `pm2 status`; `pm2 logs student-management-api`; `curl http://127.0.0.1:5000/`; confirm Nginx proxies to port 5000 |
| **MongoDB connection failure** | EC2 public/Elastic IP is in Atlas Network Access; username/password are correct; password is URL-encoded; cluster is running |
| **404 when refreshing `/add` or `/edit/:id`** | `try_files $uri $uri/ /index.html;` exists in the `location /` block; reload Nginx |
| **Blank page or missing assets** | `frontend/dist/index.html` exists; Nginx `root` points to `.../frontend/dist`; directories are readable by `www-data` |
| **API requests go to localhost** | `frontend/.env.production` contains `VITE_API_URL=/api`; rebuild with `npm run build` |
| **CORS error** | Use same-origin Nginx proxying; if using a separate API domain, set `CLIENT_ORIGIN` and rebuild the frontend |
| **Port 5000 is publicly reachable** | Set `HOST=127.0.0.1`, restart PM2, and remove port 5000 from the security group |
| **App does not return after reboot** | Run the command printed by `pm2 startup systemd`, then `pm2 save` |
| **Nginx 403 Forbidden** | Verify `sudo chmod o+x /var/www` and read permissions on `frontend/dist` |
| **Certificate issuance fails** | DNS A record points to the Elastic IP; ports 80 and 443 are open; `server_name` matches the domain |

### EC2 security checklist

- SSH port 22 is restricted to your IP.
- Only ports 80 and 443 are public; port 5000 is closed.
- `backend/.env` is `chmod 600` and never committed.
- Atlas access is restricted to the EC2 Elastic IP.
- HTTPS is enabled with a valid certificate.
- `HOST=127.0.0.1` on the backend.
- Keep Ubuntu packages patched with `sudo apt update && sudo apt upgrade`.
- This demo API has no authentication; add authentication before exposing sensitive data.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable               | Required | Default       | Description                                                                 |
| ---------------------- | -------- | ------------- | --------------------------------------------------------------------------- |
| `MONGODB_URI`          | Yes      | —             | MongoDB Atlas URI, including the `studentdb` name. SRV or non-SRV.          |
| `PORT`                 | No       | `5000`        | Port the Express server listens on.                                         |
| `HOST`                 | No       | `0.0.0.0`     | Interface to bind. Use `127.0.0.1` on EC2 so only Nginx can reach the API.  |
| `NODE_ENV`             | No       | `development` | PM2 sets `production` on EC2; production hides internal 500 error details.  |
| `CLIENT_ORIGIN`        | No       | all origins   | Optional comma-separated CORS allow-list when the frontend is on another domain. |
| `MONGODB_URI_FALLBACK` | No       | —             | Non-SRV URI retried automatically when `MONGODB_URI` is SRV and its DNS lookup fails. |
| `MONGODB_DNS_SERVERS`  | No       | system DNS    | Comma-separated DNS servers for Node's SRV lookups, e.g. `1.1.1.1,1.0.0.1`. |
| `MONGODB_SHARD_HOSTS`  | No       | —             | Shard hostnames `scripts/diagnose-db.js` uses to build a non-SRV URI.       |
| `MONGODB_REPLICA_SET`  | No       | —             | Atlas replica set name used when generating a non-SRV URI.                  |

On EC2, keep `HOST=127.0.0.1` and leave `CLIENT_ORIGIN` unset for same-origin Nginx hosting.

#### Diagnosing the database connection

`backend/scripts/diagnose-db.js` checks `.env`, the URI characters, the SRV/TXT
records Node actually sees, and (optionally) a real mongoose connection. It never
prints the password.

```bash
cd backend
npm run diagnose:db            # static checks + SRV/TXT DNS
npm run diagnose:db -- --connect   # also connects with mongoose
```

If the SRV lookup fails, the script prints a non-SRV URI you can paste into
`backend/.env` as `MONGODB_URI`.

### Frontend (`frontend/.env` and `frontend/.env.production`)

| Variable       | Required | Default                     | Description                                                    |
| -------------- | -------- | --------------------------- | -------------------------------------------------------------- |
| `VITE_API_URL` | No       | `http://localhost:5000/api` | Base URL of the REST API.                                     |

- `npm run dev` loads `frontend/.env` and calls the local Express server.
- `npm run build` loads `frontend/.env.production`, which sets `VITE_API_URL=/api` so Nginx can proxy requests on the same origin.

---

## API Reference

Base URL (local): `http://localhost:5000/api`
Base URL (through Nginx on EC2): `/api`

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

**`querySrv ECONNREFUSED _mongodb._tcp...`**

This is a DNS failure inside Node, not a credentials or Atlas problem. Node's internal resolver (c-ares) is using a DNS server it cannot reach — `node -e "console.log(require('dns').getServers())"` returning `['127.0.0.1']` is the classic case — while the OS resolver used by `nslookup` and Compass still works. The SRV lookup fails before any TCP connection is attempted.

Fix it with a standard (non-SRV) URI built from the three Atlas shard hosts:

```env
MONGODB_URI=mongodb://USERNAME:PASSWORD@ac-xxxxx-shard-00-00.xxxxx.mongodb.net:27017,ac-xxxxx-shard-00-01.xxxxx.mongodb.net:27017,ac-xxxxx-shard-00-02.xxxxx.mongodb.net:27017/studentdb?ssl=true&authSource=admin&retryWrites=true&w=majority&replicaSet=atlas-xxxxx-shard-0
```

Get the hostnames and replica set name from `nslookup -type=SRV _mongodb._tcp.CLUSTER_HOST` and `nslookup -type=TXT CLUSTER_HOST`. Alternatively keep the SRV URI and set `MONGODB_DNS_SERVERS=1.1.1.1,1.0.0.1`, or set `MONGODB_URI_FALLBACK` so `config/db.js` switches automatically. Run `npm run diagnose:db -- --connect` to confirm which option works.

**`A student with this email already exists`**
Emails must be unique. Use a different email or edit the existing student.

**Frontend shows "Cannot reach the server"**
Start the backend on port 5000 and confirm `frontend/.env` has the correct `VITE_API_URL`. Restart Vite after changing `.env`.

**CORS error in the browser**
CORS is configured in `backend/app.js`. Local development allows any origin. On EC2, serve the frontend and API on the same origin through Nginx, or set `CLIENT_ORIGIN` to the deployed frontend URL and restart PM2.

**Port already in use**
Change `PORT` in `backend/.env` and restart PM2. In production, also update `proxy_pass` in the Nginx site configuration and reload Nginx. In development, update `VITE_API_URL` in `frontend/.env` if needed.

---

## Notes

- The API has no authentication by design; this is a learning/demo project. Add authentication before exposing sensitive data.
- `.env` files are git-ignored. The included `.env` and `.env.example` files are starting templates — replace the credentials before deploying.
- Production uses Nginx to serve `frontend/dist` and proxy `/api` to the Express server; PM2 keeps the backend running. See [Deploying to AWS EC2](#deploying-to-aws-ec2-ubuntu-no-docker).
- `frontend/.env.production` contains only a relative API path (`/api`), never secrets, and is safe to commit.
- GitHub Actions CI validates pushes and pull requests. It does not deploy; the EC2 update commands are in the deployment guide.
