# DoubtConnect (Student Community Platform)

Full-stack student community platform inspired by Stack Overflow, with **MongoDB + secure JWT session management** (access + refresh), protected routes, full form validation, and a reputation system.

## Requirements

- Node.js (LTS recommended)
- MongoDB running locally at `mongodb://localhost:27017`

## Setup

### Backend

```bash
cd server
copy .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:4000`

### Frontend

```bash
cd client
copy .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## What’s implemented

- **Auth**
  - Single signup only, unique email + roll number
  - bcrypt password hashing
  - **JWT access token** (validated on every protected request)
  - **Refresh token** stored as **HttpOnly cookie** + refresh endpoint
  - Automatic logout behavior when session expires (frontend guards redirect to login)
- **Community**
  - Ask question (validated, stored in MongoDB)
  - Question feed with search and categories
  - Answer posting
  - Accept answer (question owner only) + highlight + reorder
  - Like/unlike answers + reputation impact
- **Reputation**
  - Posting question: +2
  - Posting answer: +5
  - Accepted answer: +15 (and removal if changed)
  - Answer likes: +2 (toggle)
- **Top Contributors**
  - Ranked by reputation / accepted answers / contributions

