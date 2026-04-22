# Technology Stack

**Analysis Date:** 2025-01-24

## Languages

**Primary:**
- TypeScript 5.x - Used across Frontend, Backend, Plugin, and Hook.
- SQL - Supabase schema and database logic.

**Secondary:**
- Python 3.x - Used in `transcribe.py` for video transcription (WhisperX).

## Runtime

**Environment:**
- Node.js (via Docker) - Frontend and Backend runtimes.
- Docker - Containerization for Frontend and Backend.

**Package Manager:**
- npm - Frontend, Backend, and Plugin.
- Lockfile: `package-lock.json` present in `frontend/` and `plugin/`.

## Frameworks

**Core:**
- Next.js 14.1.0 - Frontend framework (App Router).
- Fastify 4.26.0 - Backend API framework.
- React 18.2.0 - Frontend UI library.

**Testing:**
- Not detected (No dedicated test framework in `package.json`).

**Build/Dev:**
- Tailwind CSS 3.4.0 - Utility-first CSS framework.
- TanStack React Query 5.17.0 - Data fetching and state management.
- tsx 4.7.0 - TypeScript execution for backend development.

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.39.0 - Core integration for database and realtime.
- `@tremor/react` 3.14.0 - UI components for dashboards.
- `lucide-react` 0.312.0 - Icon set for the frontend.

**Infrastructure:**
- `@fastify/cors` 9.0.0 - CORS support for the backend.
- `@fastify/sensible` 5.5.0 - Standard HTTP errors for Fastify.

## Configuration

**Environment:**
- Configured via `.env` files (not committed).
- Backend requires `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AGENT_TOKEN_*`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
- Frontend requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Build:**
- `tsconfig.json` in root, `backend/`, `frontend/`, and `plugin/`.
- `tailwind.config.ts` and `postcss.config.js` in `frontend/`.

## Platform Requirements

**Development:**
- Node.js and npm.
- Supabase account/project.

**Production:**
- Deployment target: Likely Coolify or similar Docker-based hosting (as per `README.md`).

---

*Stack analysis: 2025-01-24*
