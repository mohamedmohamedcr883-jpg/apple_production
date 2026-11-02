# 🍎 Apple Store — Premium Stickers Shop

Full-stack e-commerce stickers shop built with **React + Vite** (frontend) and **Express + TypeScript + MongoDB** (backend).

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/moatazmohamedcr852-png/apple_store_mvp.git
cd apple_store_mvp

# 2. Install all dependencies (root + backend + frontend)
npm run setup

# 3. Start the development servers
npm run dev
```

> **That's it!** The `.env` files are already included in the repo — no manual configuration needed.

- 🌐 **Frontend:** http://localhost:5173
- ⚙️ **Backend API:** http://localhost:3000
- 🔐 **Admin Panel:** Login with the credentials in `BE/.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)

---

## 📦 Available Scripts

| Command          | Description                                      |
| ---------------- | ------------------------------------------------ |
| `npm run setup`  | Install root, BE, and FE dependencies in one go  |
| `npm run dev`    | Run backend + frontend concurrently              |
| `npm run build`  | Build BE (TypeScript) and FE (Vite) for production |

### Backend only

```bash
cd BE
npm run start:dev   # Dev mode with auto-reload
npm run build       # Compile TypeScript
npm start           # Run compiled output
```

### Frontend only

```bash
cd FE
npm run dev         # Vite dev server
npm run build       # Production build
npm run preview     # Preview production build
```

---

## 🗂️ Project Structure

```
apple-store-main/
├── BE/                  # Backend — Express + TypeScript
│   ├── src/
│   │   ├── config/      # Environment config loader
│   │   ├── controllers/ # Route handlers
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   └── index.ts     # Entry point
│   └── .env             # Backend environment variables
│
├── FE/                  # Frontend — React + Vite
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   └── styles/      # CSS styles
│   └── .env             # Frontend environment variables
│
├── .env.example         # Template reference for BE env vars
├── FE/.env.example      # Template reference for FE env vars
└── package.json         # Root scripts (setup, dev, build)
```

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | React 19, Vite 8, React Router 7   |
| Backend    | Express 5, TypeScript               |
| Database   | MongoDB Atlas (Mongoose)            |
| Storage    | Cloudinary (product images)         |
| Email      | Nodemailer (SMTP)                   |
| Auth       | JWT (JSON Web Tokens)               |
| Notifications | Telegram Bot API                 |

---

## 📋 Environment Variables

All environment variables are pre-configured in the tracked `.env` files:

### `BE/.env`

| Variable               | Purpose                        |
| ---------------------- | ------------------------------ |
| `PORT`                 | Backend server port            |
| `MONGODB_URI`          | MongoDB connection string      |
| `CLIENT_URL`           | Allowed CORS origin            |
| `CLOUDINARY_*`         | Image upload service           |
| `SMTP_EMAIL/PASSWORD`  | Email sending (order confirm)  |
| `JWT_SECRET`           | Auth token signing key         |
| `TELEGRAM_*`           | Order notification bot         |
| `ADMIN_EMAIL/PASSWORD` | Admin dashboard login          |

### `FE/.env`

| Variable       | Purpose                     |
| -------------- | --------------------------- |
| `VITE_API_URL` | Backend API base URL        |
