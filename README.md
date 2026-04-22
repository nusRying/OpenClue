# OpenClue — Mission Control Platform

Real-time dashboard for multi-agent operations. Built with Next.js, Supabase, and n8n.

## Architecture (n8n-Centric)

OpenClue has transitioned to a "Gateway" architecture where **n8n** handles business logic and agent communication, while the frontend interacts directly with **Supabase**.

```
Frontend (Next.js) ← ← → → Supabase (PostgreSQL + Realtime)
      ↓                           ↑
      ↓ (Task Triggers)           ↑ (Writes)
      ↓                           ↑
   n8n Gateway  → → → → → → → OpenClaw Agents (Promo, Digit, String)
```

**Key Data Flows:**
- **Frontend → Supabase:** Direct reads and realtime subscriptions for all data.
- **Frontend → n8n:** Mutations (like creating tasks) trigger n8n webhooks to notify agents.
- **Agents → Supabase:** Agents log their activity, tool calls, and conversations directly to Supabase.
- **n8n → Agents:** n8n routes system requests to the appropriate agent channels.

## Structure

```
OpenClue/
├── frontend/              # Next.js 14 Dashboard
│   ├── app/              # Multi-page layout (Dashboard, Projects, Timeline, Conversations)
│   ├── components/       # UI components (AgentCard, TaskBoard, ConversationsPanel)
│   ├── hooks/            # TanStack Query + Supabase realtime hooks
│   ├── lib/              # Supabase & n8n clients
│   └── Dockerfile
├── plugin/                # OpenClaw plugin (tool call tracking)
├── hook/                  # OpenClaw hook (session events)
├── supabase-schema.sql   # Latest database schema (includes 'conversations')
├── CLIENT_TASKS.md       # Compiled client requirements & status
└── README.md
```

## Environment Variables

### Frontend
```env
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_N8N_BASE_URL=http://localhost:5678/webhook
PORT=3000
```

## Features

### 1. Multi-Page Dashboard
- **Overview:** High-level system health and agent status.
- **Projects:** Full lifecycle management of projects and tasks.
- **Timeline:** Visual progress tracking of all operations.
- **Conversations:** Real-time monitoring of agent-client chat sessions.

### 2. Conversation Monitoring
- Treat every client interaction as a distinct **Session**.
- Store full message history in Supabase `conversations` table.
- Automatic cleaning of JSON metadata for human-readable chat views.

### 3. Automated Workflows
- Integrated n8n webhook triggers for task assignment and status changes.
- Standardized `sessionKey` mapping for seamless cross-platform communication.

## Supabase Tables

- `agents` — Registry of active agents (Promo, Digit, etc.)
- `projects` — Top-level project containers.
- `tasks` — Atomic units of work assigned to agents.
- `conversations` — **(New)** Live session and chat history tracking.
- `activity_log` — Global system event log.
- `tool_calls` — Tracking of agent tool executions.

## Deployment

The platform is designed to be deployed via Docker.
- **Frontend Dockerfile:** `frontend/Dockerfile`
- **Build Context:** `.` (repository root)
