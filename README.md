# FieldCheck — AI-Powered Contractor Checklist App

A mobile-first checklist app where contractors complete job checklists using voice, photos, and natural language. Built for CompanyCam.

## Stack

| Layer | Technology |
|---|---|
| API | Ruby on Rails 7.1 (API mode), PostgreSQL |
| Frontend | React 18, Vite, Tailwind CSS |
| Auth | BCrypt + JWT |
| AI (Sprint 2) | Claude API, OpenAI Whisper |
| Dev | Docker Compose |

## Quick Start

### Prerequisites
- Docker Desktop
- Node.js 18+

### 1. Start the API + Database
```bash
docker compose up
```
This starts PostgreSQL, runs migrations, seeds demo data, and starts Puma on port 3000.

### 2. Start the React App
```bash
cd web
npm install
npm run dev
```
Opens at http://localhost:5173

### Demo Login
```
Email: demo@fieldcheck.app
Password: password123
```

### Demo Data
- **3 Projects**: Roofing (70% complete), HVAC (56%), Plumbing (75%)
- **5 Checklists** with 27 items — mix of complete and incomplete
- **7 Trade templates** (Roofing, HVAC, Plumbing, Electrical, General, Painting, Landscaping)

## Project Structure

```
CompanyCam/
├── api/                  # Rails 7 API
│   ├── app/
│   │   ├── controllers/api/v1/
│   │   ├── models/
│   │   ├── services/
│   │   └── errors/
│   ├── db/
│   │   ├── migrate/
│   │   └── seeds.rb
│   ├── spec/
│   └── Dockerfile
├── web/                  # React 18 + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/       # Primitives: Button, Input, Card, BottomSheet, Toast
│   │   │   ├── checklist/
│   │   │   └── project/
│   │   ├── pages/
│   │   ├── services/     # API calls (axios)
│   │   ├── stores/       # Zustand (auth state)
│   │   └── constants/
│   └── vite.config.js
├── docker-compose.yml
├── SPEC.md
└── USER_STORIES.md
```

## API Endpoints

```
POST /api/v1/auth/signup
POST /api/v1/auth/login
DELETE /api/v1/auth/logout
GET  /api/v1/auth/me

GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:id
PATCH  /api/v1/projects/:id
DELETE /api/v1/projects/:id

GET    /api/v1/projects/:id/checklists
POST   /api/v1/projects/:id/checklists
PATCH  /api/v1/checklists/:id
DELETE /api/v1/checklists/:id

GET    /api/v1/checklists/:id/items
POST   /api/v1/checklists/:id/items
PATCH  /api/v1/items/:id
DELETE /api/v1/items/:id
POST   /api/v1/items/:id/complete
POST   /api/v1/items/:id/uncomplete

GET    /api/v1/templates
GET    /api/v1/templates/:id
```

## Environment Variables

Copy `api/.env.example` → `api/.env` and `web/.env.example` → `web/.env`.

## Sprint Status

- ✅ **Sprint 1 Complete**: Auth, Projects CRUD, Checklists CRUD, Manual check-off, Templates
- 🚧 **Sprint 2 (AI Features)**: Voice check-off, Photo check-off, AI confidence UI
- 📋 **Sprint 3 (Polish)**: Q&A, Offline mode, Progress metrics
