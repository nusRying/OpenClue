# Mission Control Platform

Real-time dashboard for Kutraa's multi-agent operations. Built with Fastify + Supabase.

## Architecture

```
OpenClaw Agents (string, digit, promo)
    ↓ webhook POSTs
Fastify Backend (port 3001)
    ↓ writes
Supabase PostgreSQL ← ← ← ← ← ← ← ←
    ↑ reads                              |
    ↑ real-time subscriptions             |
Next.js Frontend (port 3000) ← ← ← ← ← ←
```

## Backend Endpoints

### Webhooks (from OpenClaw hooks/plugins)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/webhook/openclaw` | Session events from OpenClaw hook |
| POST | `/api/webhook/tool_start` | Tool call started (from plugin) |
| POST | `/api/webhook/tool_end` | Tool call completed (from plugin) |

### Live Dashboard
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/live` | Full dashboard snapshot (agents + projects + tasks + activity) |
| GET | `/api/v1/live/agents` | All agents |
| GET | `/api/v1/live/projects` | All projects |
| GET | `/api/v1/live/tasks` | All tasks (filterable) |
| GET | `/api/v1/live/activity` | Activity feed (filterable) |
| GET | `/health` | Health check |

## Supabase Tables

- `agents` — agent registry (id, name, role, status, last_heartbeat)
- `projects` — projects (id, name, description, status, owner)
- `tasks` — tasks (id, project_id, title, status, assignee, priority)
- `activity_log` — event log (id, event_type, message, agent_id, metadata)
- `tool_calls` — tool execution tracking (id, agent_id, tool_name, duration_ms, success)
- `session_events` — session lifecycle events

## Environment Variables

### Backend
```
SUPABASE_URL=http://supabase-kong-l3a2tknbgy2ejacsyasfwxzc:8000
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
PORT=3001
HOST=0.0.0.0
TELEGRAM_BOT_TOKEN=<bot-token>
TELEGRAM_CHAT_ID=-1003728720677
AGENT_TOKEN_STRING=<secret>
AGENT_TOKEN_DIGIT=<secret>
AGENT_TOKEN_PROMO=<secret>
```

## Deployment (Coolify)

**Backend Dockerfile:** `src/backend/Dockerfile`
**Build context:** `src/backend`
**Port:** 3001

## OpenClaw Integration

See `INSTALL.md` for hook and plugin installation instructions.
