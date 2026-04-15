# Mission Control Platform

Real-time dashboard for Kutraa's multi-agent operations. Built with Fastify + Next.js + Supabase.

## Architecture

```
OpenClaw Agents (string, digit, promo)
    ↓ webhook POSTs
Fastify Backend (port 3001)
    ↓ writes
Supabase PostgreSQL ← ← ← ← ← ← ← ←
    ↑ reads + realtime                 |
Next.js Frontend (port 3000) ← ← ← ← ←
```

**Data flow:**
- Agents → OpenClaw hook/plugin → Backend → Supabase (write path)
- Frontend → Supabase direct (read + realtime subscribe)

## Structure

```
kutraa-mission-control/
├── backend/                # Fastify API server
│   ├── lib/              # Supabase client, Telegram sender
│   ├── routes/           # Webhook + live endpoints
│   ├── src/types.ts      # TypeScript types
│   ├── index.ts
│   ├── package.json
│   └── Dockerfile
├── frontend/              # Next.js dashboard
│   ├── app/              # App router pages
│   ├── components/       # AgentCard, ProjectCard, TaskBoard, ActivityFeed
│   ├── hooks/            # TanStack Query + Supabase realtime hooks
│   ├── lib/              # Supabase client
│   ├── types/
│   ├── package.json
│   └── Dockerfile
├── plugin/                # OpenClaw plugin (tool call tracking)
├── hook/                  # OpenClaw hook (session events)
├── supabase-schema.sql   # Database schema
├── INSTALL.md
└── README.md
```

## Environment Variables

### Backend
```
SUPABASE_URL=<supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
PORT=3001
HOST=0.0.0.0
TELEGRAM_BOT_TOKEN=<bot-token>
TELEGRAM_CHAT_ID=-1003728720677
AGENT_TOKEN_STRING=<secret>
AGENT_TOKEN_DIGIT=<secret>
AGENT_TOKEN_PROMO=<secret>
```

### Frontend
```
NEXT_PUBLIC_SUPABASE_URL=<supabase-public-https-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
PORT=3000
```

## API Endpoints (Backend)

Backend handles ingestion only. Frontend reads directly from Supabase.

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/webhook/openclaw` | Session events from hook |
| POST | `/api/webhook/tool_start` | Tool call started |
| POST | `/api/webhook/tool_end` | Tool call completed |
| GET | `/health` | Health check |

## Supabase Tables

- `agents` — agent registry
- `projects` — projects
- `tasks` — tasks
- `activity_log` — event log
- `tool_calls` — tool execution tracking
- `session_events` — session lifecycle events

## Deployment (Coolify)

### Backend
- Dockerfile: `backend/Dockerfile`
- Build context: `.` (repo root)
- Port: 3001 (internal only)

### Frontend
- Dockerfile: `frontend/Dockerfile`
- Build context: `.` (repo root)
- Port: 3000 (public)
