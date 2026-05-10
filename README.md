<div align="center">

<img src="https://raw.githubusercontent.com/AmineNT25/stochos/main/public/banner.png" alt="Stochos Banner" width="100%" />

<br/>

# ⚡ Stochos

### Focus. Track. Achieve.

*A modern productivity & focus-session tracker built for deep work.*

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Neon](https://img.shields.io/badge/Neon_PostgreSQL-00E5BF?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/AmineNT25/stochos/pulls)
[![Made with ❤️](https://img.shields.io/badge/Made_with-❤️-red?style=for-the-badge)](https://github.com/AmineNT25)

</div>

---

## 📖 Overview

**Stochos** is a sleek, full-stack productivity app that helps you run focused work sessions, track your progress over time, earn badges, and compete on leaderboards. Built with the latest Next.js App Router, server-side auth, and a Neon PostgreSQL backend — all wrapped in a pixel-perfect dark/light UI.

> *"Stochos" (στόχος) means **goal** in Greek.*

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Focus Sessions** | Start timed work sessions with custom goals per subject |
| 📊 **Stats Dashboard** | Weekly charts, streaks, total time, and completion rates |
| 🏅 **Badge System** | Earn achievement badges as you hit milestones |
| 🏆 **Leaderboard** | Track your rank and weekly performance |
| 👤 **Profile & Avatar** | Upload a profile picture, edit display name and password |
| 🔐 **Auth** | Email/password sign-up, bcrypt-hashed, JWT sessions via NextAuth v5 |
| 🛡️ **Admin Panel** | Manage users, promote/demote roles, delete accounts |
| 🌗 **Theme Toggle** | System-aware dark/light mode |
| 📱 **Responsive** | Full mobile support with a bottom nav bar |

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="33%">

**Frontend**
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Lucide React icons
- Recharts (activity charts)
- Three.js (landing visuals)
- canvas-confetti

</td>
<td valign="top" width="33%">

**Backend / Auth**
- Next.js Route Handlers
- NextAuth v5 (JWT strategy)
- bcryptjs (password hashing)
- Neon PostgreSQL
- `@neondatabase/serverless`

</td>
<td valign="top" width="33%">

**UI Components**
- Radix UI (Tabs, Progress, Slot)
- class-variance-authority
- tailwind-merge
- Custom CSS variables (theming)

</td>
</tr>
</table>

---

## 📸 Screenshots

<div align="center">

| Dashboard | Profile | Admin |
|---|---|---|
| ![Dashboard](https://placehold.co/380x220/1a1a2e/fb923c?text=Dashboard) | ![Profile](https://placehold.co/380x220/1a1a2e/fb923c?text=Profile) | ![Admin](https://placehold.co/380x220/1a1a2e/fb923c?text=Admin+Panel) |

</div>

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/AmineNT25/stochos.git
cd stochos

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# → fill in the values (see below)

# 4. Run the database migration
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
// see /scripts/migrate.sql
"

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
# Neon PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# NextAuth — generate with: openssl rand -base64 32
AUTH_SECRET=your_super_secret_here

# App URL (no trailing slash)
NEXTAUTH_URL=http://localhost:3000
```

> **Never commit `.env.local`** — it's in `.gitignore`.

---

## 🗄️ Database Schema

<details>
<summary>Click to expand</summary>

```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user',  -- 'user' | 'admin'
  avatar        TEXT,                           -- base64 data-URL
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

</details>

---

## 🗺️ Project Structure

```
src/
├── app/
│   ├── (main)/           # Authenticated app shell (Navbar layout)
│   │   ├── dashboard/    # Home stats & recent sessions
│   │   ├── session/      # New session wizard & active timer
│   │   ├── profile/      # User profile & avatar upload
│   │   ├── leaderboard/  # Rankings
│   │   └── admin/        # Admin user management
│   ├── auth/             # Sign-in / Sign-up pages
│   └── api/
│       ├── user/
│       │   ├── profile/  # PATCH name/password
│       │   └── avatar/   # PATCH profile picture
│       └── admin/
│           └── users/    # GET list, PATCH role, DELETE user
├── components/
│   ├── Navbar.tsx
│   └── ThemeToggle.tsx
├── lib/
│   ├── db.ts             # Neon sql client
│   ├── storage.ts        # localStorage session helpers
│   ├── data.ts           # Badge definitions, subject config
│   └── types.ts
├── auth.ts               # NextAuth Node.js config
└── auth.config.ts        # NextAuth edge middleware config
```

---

## 📡 API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `PATCH` | `/api/user/profile` | User | Update name or password |
| `PATCH` | `/api/user/avatar` | User | Upload profile picture |
| `GET` | `/api/admin/users` | Admin | List all users |
| `PATCH` | `/api/admin/users/:id` | Admin | Change user role |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete user account |

---

## 🤝 Contributing

Contributions are welcome!

```bash
# Fork & clone, then:
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
# → open a Pull Request
```

Please keep PRs focused — one feature or fix per PR.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<div align="center">

Built by [AmineNT25](https://github.com/AmineNT25) · Give it a ⭐ if you find it useful!

</div>
