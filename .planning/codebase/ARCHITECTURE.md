# Architecture

**Analysis Date:** 2025-01-24

## Pattern Overview

**Overall:** Event-Driven Real-time Dashboard.

**Key Characteristics:**
- **Push-based Ingestion:** Agents push events via webhooks to a central backend.
- **Shared Real-time Database:** Supabase acts as both the source of truth and the real-time synchronization layer.
- **Bypass Architecture:** Frontend reads directly from Supabase for efficiency, bypassing the backend API for read operations.

## Layers

**Ingestion Layer (Hooks & Plugins):**
- Purpose: Monitors OpenClaw agents and captures session/tool events.
- Location: `hook/`, `plugin/`
- Contains: TypeScript event handlers.
- Depends on: OpenClaw SDK.
- Used by: OpenClaw Gateway/Agents.

**Processing Layer (Backend):**
- Purpose: Receives webhooks, validates tokens, resolves agent identities, and writes to the database.
- Location: `backend/`
- Contains: Fastify routes, Supabase client, Telegram integration.
- Depends on: Supabase, Telegram API.
- Used by: Ingestion Layer (via HTTP POST).

**Storage & Sync Layer (Supabase):**
- Purpose: Stores projects, tasks, agents, and activity logs. Provides real-time updates via PostgreSQL publications.
- Location: `supabase-schema.sql` (Schema definition)
- Contains: Relational tables, RLS policies, Realtime triggers.
- Depends on: PostgreSQL.
- Used by: Backend (Write), Frontend (Read + Subscribe).

**Presentation Layer (Frontend):**
- Purpose: Displays real-time status of agents, projects, and tasks.
- Location: `frontend/`
- Contains: Next.js components, TanStack Query hooks, Supabase Realtime subscriptions.
- Depends on: Supabase.
- Used by: End-users (CEO/Operators).

## Data Flow

**Event Logging Flow:**

1. **Capture:** OpenClaw Hook/Plugin detects an event (e.g., tool call start).
2. **Transmit:** Hook/Plugin POSTs to `backend/api/webhook`.
3. **Ingest:** Backend validates the token and resolves the `agent_id`.
4. **Persist:** Backend inserts the event into `activity_log` or `tool_calls` table in Supabase.
5. **Broadcast:** Supabase Realtime broadcasts the change to all subscribed clients.
6. **Update:** Frontend receives the update via `useRealtime` hook and refreshes the UI.

**State Management:**
- Database state is managed in Supabase.
- Client-side state is managed via TanStack Query and React hooks.

## Key Abstractions

**Webhook Handler:**
- Purpose: Standardized processing of incoming agent events.
- Examples: `backend/routes/webhooks.ts`
- Pattern: Strategy pattern (different endpoints for different event types).

**Realtime Subscription:**
- Purpose: Abstracting Supabase's realtime listener for React.
- Examples: `frontend/hooks/features/useRealtime.ts`
- Pattern: Observer pattern.

## Entry Points

**Backend Server:**
- Location: `backend/index.ts`
- Triggers: HTTP requests.
- Responsibilities: Server initialization, plugin registration, route mounting.

**Frontend Application:**
- Location: `frontend/app/page.tsx`
- Triggers: User browser access.
- Responsibilities: Main dashboard layout and component mounting.

## Error Handling

**Strategy:** Fail-soft on ingestion, Error boundaries on UI.

**Patterns:**
- **Swallowed Errors:** `hook/handler.ts` swallows fetch errors to avoid disrupting agent execution.
- **Sensible Errors:** `backend/` uses `@fastify/sensible` for standardized API error responses.
- **UI Error Boundaries:** `frontend/components/ui/ErrorBoundary.tsx` catches React rendering errors.

## Cross-Cutting Concerns

**Logging:** Fastify logger for backend; console logs for webhooks.
**Validation:** Token-based authentication for webhooks; TypeScript for type safety.
**Authentication:** Environment-variable-based secret tokens for agents.

---

*Architecture analysis: 2025-01-24*
