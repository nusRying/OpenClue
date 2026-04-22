# OpenClue - Client Requirements & Task List

This list was compiled from the screen recording transcription dated April 22, 2026.

## 1. Architectural Shift
- [x] **Deprecate Backend:** Stop using the dedicated backend server (deemed unreliable for agent updates).
- [x] **n8n as Gateway:** Use **n8n** as the primary logic gateway. Frontend connects directly to **Supabase**.
- [x] **Direct Webhooks:** Actions (like task creation) should trigger n8n webhooks.

## 2. Frontend Refactoring (Multi-Page Layout)
- [x] **Multi-Page Structure:** Transition from single-view to a navigation-based system.
- [x] **Dashboard Overview:** Main page with stats (Active projects, Agents online, Open tasks).
- [x] **Projects Page:** Dedicated view for project and task management.
- [x] **Timeline View:** Visual timeline/calendar for tracking task progress.
- [x] **Conversations Page:** Dedicated view to monitor live chat sessions (Telegram/WhatsApp).

## 3. Monitoring & Conversations
- [x] **New "Conversations" Table:** Created `conversations` table in Supabase.
- [x] **Session tracking:** Group messages by `session_key`.
- [x] **JSON Storage:** Store message history in a JSONB column (role, content, timestamp).
- [x] **Message Cleanup:** (Completed) Implemented robust recursive JSON stripping logic in `ConversationsPanel.tsx`.

## 4. Integration & Automation
- [x] **n8n Webhook Library:** Created `frontend/lib/n8n.ts` for standardized triggers.
- [x] **Automatic Notifications:** Integrated triggers into `useCreateTask`, `useUpdateTask`, and `useUpdateTaskStatus`.
- [x] **Dynamic Mappings:** Refined n8n mappings in the config to be dynamic (moved to `mappings.json`).

## 5. Deployment & Security
- [x] **Dockerization:** Verify/Update `frontend/Dockerfile`.
- [ ] **Basic Authentication:** Implement basic auth layer via Docker/Nginx configuration.

## 6. UI/UX Improvements
- [x] **Agent Status Cards:** Display emoji, role, name, and current task.
- [x] **Activity Feed:** Real-time log of system events.
- [x] **Live Indicators:** Show "Live" status and online agent counts.

---
*Last updated: 2026-04-22*
