# Mission Control Platform

Real-time dashboard for Kutraa's multi-agent operations. Built with Fastify + Next.js + Supabase.

## Structure

```
kutraa-mission-control/
├── backend/                # Fastify API server
│   ├── src/
│   │   ├── lib/           # Supabase client, Telegram sender
│   │   ├── routes/         # API routes (webhooks, live)
│   │   └── types.ts        # TypeScript types
│   ├── index.ts            # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/               # Next.js dashboard
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── hooks/              # TanStack Query + realtime hooks
│   ├── lib/                # Supabase client, API client
│   ├── types/              # TypeScript types
│   ├── package.json
│   ├── Dockerfile
│   └── ...
├── plugin/                 # OpenClaw plugin (tool call tracking)
│   ├── src/index.ts
│   ├── package.json
│   └── openclaw.plugin.json
├── hook/                   # OpenClaw hook (session events)
│   ├── handler.ts
│   └── HOOK.md
├── supabase-schema.sql      # Database schema
├── INSTALL.md              # Integration guide
└── README.md
```

## Quick Start

### 1. Apply Supabase Schema
```bash
psql $SUPABASE_URL -f supabase-schema.sql
```

### 2. Deploy Backend
- Dockerfile: `backend/Dockerfile`
- Build context: `backend`
- Port: 3001

### 3. Deploy Frontend
- Dockerfile: `frontend/Dockerfile`
- Build context: `frontend`
- Port: 3000

### 4. Install OpenClaw Integration
See `INSTALL.md`

## API Endpoints

### Webhooks
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/webhook/openclaw` | Session events from hook |
| POST | `/api/webhook/tool_start` | Tool call started |
| POST | `/api/webhook/tool_end` | Tool call completed |

### Live Dashboard
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/live` | Full snapshot |
| GET | `/api/v1/live/agents` | All agents |
| GET | `/api/v1/live/projects` | All projects |
| GET | `/api/v1/live/tasks` | All tasks |
| GET | `/api/v1/live/activity` | Activity feed |
| GET | `/health` | Health check |

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
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_URL=http://mission-control-backend:3001
PORT=3000
```
