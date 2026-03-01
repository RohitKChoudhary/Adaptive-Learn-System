# 🧠 LearnAI — Adaptive Learning Platform

An AI-powered platform that turns any syllabus into a full structured course with adaptive quizzes, progress tracking, and document/video comprehension tools.

![LearnAI](https://img.shields.io/badge/LearnAI-Adaptive%20Learning-red?style=for-the-badge&logo=brain)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

---

## ✨ Features

- **AI Course Generation** — Upload any syllabus (PDF, DOCX, TXT) and get a fully structured course with chapters, content, and AI summaries generated in seconds
- **Two Course Modes** — Full Course (detailed chapters, 800-1200 words each) or OneShot (quick revision mode)
- **Adaptive Quizzes** — Quiz difficulty (Easy → Medium → Hard) adjusts based on your performance after each chapter
- **Chapter Locking** — Chapters unlock progressively as you complete quizzes, keeping you on track
- **Progress Tracking** — Per-chapter accuracy bars, difficulty levels, and overall course completion %
- **Document Comprehension** — Upload any PDF/DOCX and chat with it using AI
- **Video Comprehension** — Paste a YouTube URL, extract transcript, and ask questions about it
- **Notebook Viewer** — Jupyter-style inline code notebooks per chapter
- **Multilingual UI** — English, Hindi, Spanish, French, Arabic

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| AI | Groq API (Llama 3.3 70B) |
| Auth | JWT (jsonwebtoken) |
| Build | Vite, tsx, esbuild |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or use [Neon](https://neon.tech) free tier)
- [Groq API key](https://console.groq.com) (free)

### 1. Clone the repo

```bash
git clone https://github.com/RohitKChoudhary/Adaptive-Learn-System.git
cd Adaptive-Learn-System
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:5432/learnai
JWT_SECRET=your_long_random_secret_here
GROQ_API_KEY=your_groq_api_key_here
```

### 4. Push database schema

```bash
npm run db:push
```

### 5. Run the dev server

```bash
npm run dev
```

App runs at `http://localhost:5000`

---

## 📁 Project Structure

```
├── client/               # React frontend
│   └── src/
│       ├── pages/        # Route pages (Dashboard, CourseView, Quiz, etc.)
│       ├── components/   # UI components
│       ├── hooks/        # React Query hooks
│       └── lib/          # API client, utilities
├── server/               # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # All API routes + AI logic
│   ├── storage.ts        # Database access layer
│   └── db.ts             # Drizzle DB connection
├── shared/               # Shared types and schema
│   ├── schema.ts         # Drizzle table definitions + Zod types
│   └── routes.ts         # API contract (shared between client & server)
└── .env.example          # Environment variable template
```

---

## 🔌 API Overview

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login → returns JWT |
| GET | `/api/auth/me` | Get current user |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/fullcourse/create` | Upload syllabus → generate full course |
| POST | `/api/oneshot/create` | Upload syllabus → generate revision course |
| GET | `/api/fullcourse/` | List user's full courses |
| GET | `/api/fullcourse/:id` | Get course with all topics |

### Quiz
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quiz/chapter/:topic_id` | Get adaptive chapter quiz |
| POST | `/api/quiz/submit` | Submit answers → saves progress + returns next difficulty |
| GET | `/api/quiz/progress/:course_id` | Get per-chapter progress |

### Comprehension
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/doc-comprehension/upload` | Upload doc → extract text |
| POST | `/api/doc-comprehension/ask` | Ask question about doc |
| POST | `/api/video-comprehension/extract` | Extract YouTube transcript |
| POST | `/api/video-comprehension/ask` | Ask question about video |

All endpoints except login/register require `Authorization: Bearer <token>` header.

---

## 🧠 How the Adaptive System Works

1. First quiz attempt starts at **Medium** difficulty
2. Score ≥ 80% → next chapter quiz is **Hard**
3. Score < 50% → next chapter quiz is **Easy**
4. Score 50-79% → stays at **Medium**
5. Progress is saved to DB — chapters unlock only after completing the previous chapter's quiz

---

## 🌐 GitHub Codespaces

This repo is fully configured for GitHub Codespaces. Just open in a Codespace, fill in your `.env`, run `npm run db:push` then `npm run dev`.

Port 5000 is auto-forwarded and will open in your browser.

---

## 📄 License

MIT
