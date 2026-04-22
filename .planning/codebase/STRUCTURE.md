# Codebase Structure

**Analysis Date:** 2025-01-24

## Directory Layout

```
OpenClue/
├── backend/                # Fastify API server
│   ├── lib/              # Database & External clients
│   ├── routes/           # API endpoints (Webhooks, Live data)
│   ├── src/              # TypeScript source code (Types)
│   ├── index.ts          # Server entry point
│   └── Dockerfile        # Container definition
├── frontend/               # Next.js Dashboard
│   ├── app/              # App Router pages and global CSS
│   ├── components/       # UI Components (modularized by feature)
│   ├── hooks/            # Custom hooks (Queries & Realtime)
│   ├── lib/              # Shared library clients (Supabase)
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Helper functions (Formatting, Status logic)
│   └── Dockerfile        # Container definition
├── hook/                   # OpenClaw Hook (Session/Message monitoring)
│   └── handler.ts        # Main hook logic
├── plugin/                 # OpenClaw Plugin (Tool call tracking)
│   ├── src/              # Plugin source code
│   └── openclaw.plugin.json # Plugin manifest
├── supabase-schema.sql     # Database schema and seed data
└── README.md               # Project documentation
```

## Directory Purposes

**backend/routes/:**
- Purpose: Defines the API surface for incoming webhooks.
- Contains: Fastify route definitions.
- Key files: `backend/routes/webhooks.ts`, `backend/routes/live.ts`.

**frontend/components/:**
- Purpose: Reusable UI components organized by domain.
- Contains: React components (TSX).
- Key files: `frontend/components/agents/AgentCard.tsx`, `frontend/components/tasks/TaskBoard.tsx`.

**frontend/hooks/features/:**
- Purpose: Feature-specific data fetching and realtime logic.
- Contains: TanStack Query and Supabase Realtime hooks.
- Key files: `frontend/hooks/features/useRealtime.ts`, `frontend/hooks/features/useTaskQueries.ts`.

**hook/ & plugin/:**
- Purpose: External modules that integrate with OpenClaw agents.
- Contains: TypeScript logic to capture and forward events.
- Key files: `hook/handler.ts`, `plugin/src/index.ts`.

## Key File Locations

**Entry Points:**
- `backend/index.ts`: Backend Fastify server start.
- `frontend/app/page.tsx`: Frontend dashboard main page.
- `hook/handler.ts`: Entry point for OpenClaw hook events.

**Configuration:**
- `backend/package.json`: Backend dependencies and scripts.
- `frontend/tailwind.config.ts`: Tailwind CSS styling configuration.
- `plugin/openclaw.plugin.json`: Metadata for the OpenClaw plugin.

**Core Logic:**
- `backend/routes/webhooks.ts`: Business logic for event ingestion.
- `frontend/utils/status.ts`: Shared logic for agent/task status mapping.

**Testing:**
- Not detected (No dedicated test directory).

## Naming Conventions

**Files:**
- Components: PascalCase (`AgentCard.tsx`).
- Hooks: camelCase starting with "use" (`useRealtime.ts`).
- Routes/Utils: kebab-case or snake_case (`webhooks.ts`, `format.ts`).

**Directories:**
- Feature-based naming: `frontend/components/tasks`, `frontend/hooks/features`.

## Where to Add New Code

**New Feature (Dashboard):**
- Primary code: `frontend/components/[feature]/`
- Queries: `frontend/hooks/features/use[Feature]Queries.ts`

**New API Endpoint:**
- Implementation: `backend/routes/` (register in `backend/index.ts`)

**New Agent Event:**
- Hook logic: `hook/handler.ts`
- Backend processing: `backend/routes/webhooks.ts`
- Database schema: `supabase-schema.sql`

## Special Directories

**.planning/codebase/:**
- Purpose: Internal project documentation and analysis.
- Generated: Yes (by GSD codebase mapper).
- Committed: Yes.

---

*Structure analysis: 2025-01-24*
