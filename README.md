# 🕵️‍♂️ OpenClue — Mission Control Platform

> **The Central Intelligence Hub for Multi-Agent Operations.**

OpenClue is a high-performance, real-time dashboard designed to monitor, manage, and orchestrate a fleet of autonomous AI agents. Built with a "Gateway First" philosophy, it leverages **Next.js**, **Supabase**, and **n8n** to provide a seamless bridge between human operators and AI agents working across Telegram and WhatsApp.

---

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![n8n](https://img.shields.io/badge/Automation-n8n-orange?style=flat-square&logo=n8n)](https://n8n.io/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-blue?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

---

## 🏗️ Architectural Overview (n8n-Centric)

OpenClue utilizes a modern **Gateway Architecture**. Instead of a bulky custom backend, we use **n8n** as the intelligent routing layer. This ensures that agents remain decoupled and the system remains resilient to changes.

### Data Flow
1.  **Frontend → Supabase:** Direct, low-latency reads and Realtime Postgres subscriptions.
2.  **Frontend → n8n:** High-level actions (Task assignments, project updates) trigger n8n webhooks.
3.  **n8n → Agents:** n8n routes instructions to specific Agent Topics (Telegram/WhatsApp) based on the client's mapping configuration.
4.  **Agents → Supabase:** Agents log their internal thoughts, tool calls, and client conversations directly into the database.

---

## ✨ Core Features

### 📊 Mission Control Dashboard
*   **Real-time Activity Feed:** See exactly what your agents are doing as it happens.
*   **Agent Status Cards:** Instant visibility into agent health (Online/Idle), current tasks, and roles.
*   **Global Stats:** Track active projects, pending tasks, and overall completion progress at a glance.

### 🗂️ Project & Task Management
*   **Multi-Page Navigation:** Dedicated views for deep-diving into specific projects.
*   **Kanban/Board Views:** Manage the full lifecycle of tasks from `pending` to `completed`.
*   **Intelligent Triggers:** Creating or updating a task automatically notifies the assigned agent via n8n.

### 📅 Visual Timeline
*   **Gantt-style Progress:** Track task duration and deadlines across multiple projects.
*   **Overdue Alerts:** Visual indicators for tasks that need immediate attention.

### 💬 Live Conversation Monitoring
*   **Session-Based Tracking:** Every client interaction is treated as a unique session.
*   **Clean-View Logic:** Advanced regex filtering strips JSON metadata from Telegram messages, showing only the raw, human-readable conversation.
*   **Multi-Channel Support:** Monitor Telegram, WhatsApp, and Web chats in a unified interface.

---

## 🚀 Quick Start

### 1. Prerequisites
*   Node.js (v18+)
*   A Supabase Project
*   An n8n Instance

### 2. Environment Setup
Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_N8N_BASE_URL=https://your-n8n.com/webhook
```

### 3. Database Initialization
Run the contents of `supabase-schema.sql` in your Supabase SQL Editor. This will:
*   Create all necessary tables (`agents`, `tasks`, `conversations`, etc.).
*   Enable **Realtime** for instant UI updates.
*   Setup **Row Level Security (RLS)** for data protection.

### 4. Installation
```bash
# Install dependencies
npm install

# Start the dashboard
npm run dev
```

---

## 🤖 The Agents

OpenClue is built to manage a specialized team:
*   **Mehzam (CEO):** The primary orchestrator.
*   **Promo (CMO):** Handles marketing and client outreach.
*   **Digit (CFO):** Manages financial data and reporting.
*   **String (COO):** Handles technical operations and infrastructure.

Each agent is mapped to a specific **Telegram Topic** via n8n, ensuring that conversations never get crossed.

---

## 📂 Project Structure

```bash
OpenClue/
├── frontend/             # Next.js Application
│   ├── app/             # Router & Pages (Dashboard, Projects, etc.)
│   ├── components/      # Reusable UI (Modals, Panels, Cards)
│   ├── hooks/           # Realtime & Data fetching logic
│   └── lib/             # API clients (Supabase, n8n)
├── plugin/               # Agent-side plugin for tool tracking
├── hook/                 # Agent-side hook for session events
├── supabase-schema.sql  # Ground-truth database schema
└── CLIENT_TASKS.md      # Roadmap & Requirement tracking
```

---

## 🐳 Deployment
The platform is designed to be deployed via Docker. To deploy the frontend:

```bash
docker build -t openclue-frontend -f frontend/Dockerfile .
```

---
*Created and maintained by the OpenClue Development Team.*
