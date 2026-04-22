# External Integrations

**Analysis Date:** 2025-01-24

## APIs & External Services

**Agent Platform:**
- OpenClaw - Source of agent activity and tool calls.
  - Integration: `hook/handler.ts` (Session/Message events) and `plugin/src/index.ts` (Tool call tracking).
  - Auth: `X-Agent-Token` header for backend webhooks.

**Messaging:**
- Telegram - Sends notifications for high-priority events.
  - SDK/Client: Custom fetch in `backend/lib/telegram.ts`.
  - Auth: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

## Data Storage

**Databases:**
- Supabase (PostgreSQL)
  - Connection: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Backend), `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Frontend).
  - Client: `@supabase/supabase-js`.

**File Storage:**
- Local filesystem only (used by `transcribe.py` for video processing).

**Caching:**
- None detected (Frontend uses TanStack Query for client-side caching).

## Authentication & Identity

**Auth Provider:**
- Custom Token-based Auth for webhooks.
  - Implementation: `verifyAgentToken` in `backend/routes/webhooks.ts` checks `X-Agent-Token` against hardcoded environment secrets.

## Monitoring & Observability

**Error Tracking:**
- None detected.

**Logs:**
- Fastify logger in `backend/index.ts`.
- Console logs in backend webhooks.

## CI/CD & Deployment

**Hosting:**
- Likely Docker-based (Coolify mentioned in `README.md`).

**CI Pipeline:**
- None detected.

## Environment Configuration

**Required env vars:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AGENT_TOKEN_STRING`, `AGENT_TOKEN_DIGIT`, `AGENT_TOKEN_PROMO`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Secrets location:**
- Not detected (likely managed by the deployment platform or local `.env` files).

## Webhooks & Callbacks

**Incoming:**
- `/api/webhook/openclaw` - Receives session events from OpenClaw hook.
- `/api/webhook/tool_start` - Receives tool start events from OpenClaw plugin.
- `/api/webhook/tool_end` - Receives tool end events from OpenClaw plugin.

**Outgoing:**
- Telegram API - Notifications sent from `backend/lib/telegram.ts`.

---

*Integration audit: 2025-01-24*
