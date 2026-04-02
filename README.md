# 🔐 AccessHub

Welcome to **AccessHub**. This is a role-based dashboard application built with **Next.js**, **TypeScript**, and **MongoDB**. AccessHub provides secure authentication, three distinct roles (**Super Admin**, **Admin**, **User**), and CRUD APIs with strict role-based access control. The UI is intentionally minimal but functional: login, registration (first Super Admin only), and separate dashboards per role.

## Login credentials

There is **no default seeded account**. Use one of these flows:

1. **First Super Admin (one-time)**  
   Open `/register/super-admin` when no Super Admin exists in the database, submit **Name**, **Email**, **Phone**, and **Password**, then you are logged in and redirected to the dashboard.

2. **After that**  
   Log in at `/login` with accounts created by a Super Admin (Admins / Users) or your Super Admin email/password.

_Example (after you create users in your own DB):_  
`email: your-admin@example.com` · `password: (the password you set)`

## Demo link

Visit the app locally after install: [http://localhost:3000](http://localhost:3000)

_Deployed demo (optional):_ add your Vercel URL here when published.

## Demo video

Watch the short walkthrough (optional): _add your Loom/YouTube link here_

---

## 📦 Project overview

AccessHub is designed for **organization-style access control**:

- **Authenticate** with email and password; passwords are stored as **bcrypt** hashes.
- **Session** uses a **JWT** stored in an **http-only cookie** (bonus requirement).
- **Super Admin** can CRUD **Admins** and CRUD **Users** under any Admin (fields: name, email, phone, password).
- **Admin** can CRUD only **Users they created**; cannot see other Admins or their Users.
- **User** gets a personal dashboard with a **Notes** CRUD module (example domain data).

---

## 🧰 Tech stack

| Layer | Choice |
|--------|--------|
| Frontend framework | Next.js (App Router) |
| Language | TypeScript |
| Styling & UI | Tailwind CSS |
| Database | MongoDB (Mongoose) |
| Authentication | JWT (http-only cookie) + bcrypt password hashing |
| HTTP client (browser) | Axios (`src/lib/api-client.ts`) |
| Deployment | Vercel (typical) |

**Environment variables (`.env`):**

- `MONGO_URI` — MongoDB connection string  
- `JWT_SECRET` — secret used to sign and verify JWTs  

---

## 🚀 Key features

### 🔐 Authentication

- Single **login** page (`/login`) — email + password.
 — allowed only while **no** Super Admin exists; sets JWT cookie.
- **Logout** clears the session cookie.
- **Middleware** protects `/dashboard/*` and redirects logged-in users away from `/login`.

### 👑 Super Admin

- CRUD **Admins** (`/api/admins`, `/api/admins/[id]`).
- CRUD **Users** under a chosen Admin (`/api/users?adminId=...`, `/api/users` with `adminId` in body for create, `/api/users/[id]` for one user).

### 🧑‍💼 Admin

- CRUD **Users** they created only (`/api/users`, `/api/users/[id]`).

### 👤 User (end user)

- Personal dashboard.
- **Notes** CRUD: `/api/notes`, `/api/notes/[id]` (own notes only).

---

## 🛠️ AccessHub API documentation

All routes are **Next.js Route Handlers** under `/api`. The browser sends the JWT via the **cookie** `accesshub_token` (not the `Authorization` header).

### 🔐 Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register-super-admin` | GET | Returns `{ allowed: boolean }` — whether first Super Admin registration is open. |
| `/api/auth/register-super-admin` | POST | Creates the first Super Admin; sets JWT cookie. |
| `/api/auth/login` | POST | Email + password; sets JWT cookie. |
| `/api/auth/me` | GET | Current user profile (from cookie). |
| `/api/auth/logout` | POST | Clears JWT cookie. |

### 👑 Admins (Super Admin only)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admins` | GET | List all Admins. |
| `/api/admins` | POST | Create an Admin (name, email, phone, password). |
| `/api/admins/[id]` | GET | Get one Admin. |
| `/api/admins/[id]` | PATCH | Update Admin (optional new password). |
| `/api/admins/[id]` | DELETE | Delete Admin and Users they owned (cascade). |

### 👥 Users (Super Admin + Admin)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users` | GET | **Admin:** list own Users. **Super Admin:** requires `?adminId=` to list Users under that Admin. |
| `/api/users` | POST | **Admin:** create User under self. **Super Admin:** body must include `adminId`. |
| `/api/users/[id]` | GET | Get one User (if permitted). |
| `/api/users/[id]` | PATCH | Update User (if permitted). |
| `/api/users/[id]` | DELETE | Delete User (if permitted). |

### 📝 Notes (User role only)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notes` | GET | List current user’s notes. |
| `/api/notes` | POST | Create a note (`title`, `body`). |
| `/api/notes/[id]` | GET | Get one note (own only). |
| `/api/notes/[id]` | PATCH | Update note (own only). |
| `/api/notes/[id]` | DELETE | Delete note (own only). |

---

## Installation

```bash
git clone https://github.com/YOUR_USERNAME/accesshub.git
cd accesshub
npm install
```

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-long-random-secret
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/login`. If no Super Admin exists, use `/register/super-admin` first.

---

## Project structure (high level)

- `src/app/api/**` — REST-style route handlers  
- `src/models/**` — Mongoose models (`User`, `Note`)  
- `src/lib/**` — DB connection, auth, RBAC, axios client  
- `src/middleware.ts` — auth cookie gate for dashboard / auth pages  
- `src/app/dashboard/**` — role dashboards + CRUD UI  

---

## License

Private / as per your organization’s policy.
