# OpenClue Intelligence Pipeline: Memory & Architecture Log

This document serves as the persistent memory for the OpenClue Orchestrator and Telegram Gateway stabilization project.

## 📡 Pipeline Architecture
**Frontend/Hook** → `OpenCluePulse` (Orchestrator) → `Gateway Pulse` (Shotgun) → **Telegram**

- **Orchestrator Hub**: `https://agents.kutraa.com/webhook/OpenCluePulse`
- **Gateway Endpoint**: `http://tofyq3lga15o3184lxde506q:18789/hooks/n8n-{{agent}}`
- **Auth Pattern**: Bearer Token `46cf3441242627eabf8eb5c32d2e0d7f`

---

## 🛠 Evolution History

### v5.1.18 (Current: Contextual Resonance)
- **Project Context**: Extracts `project_id` from metadata and pins it to the `activity_log` table.
- **Result**: Intelligence Logs now appear in the Project Detail view (which filters by ID).
- **Priority Uplift**: Forced `priority: high` for all broadcasts to ensure they pass backend filters.

### v5.1.17 (Unified Convergence)
- **Fixed Silent Responses**: Resolved the issue where n8n returned `{"ok":true}` instead of specific mission data.
- **Universal Aggregator**: Every branch (Broadcast, Chat, Fallback) now converges at a single node to ensure atomic logging and response.

### v5.1.16 (Signal Aggregation)
- **Problem**: Parallel branches triggered multiple responses, causing n8n to fail.
- **Solution**: Implemented first-stage aggregation to collect pulses before returning data to the user.

### v5.1.15 (The "Island" Bug)
- **Critical Failure**: The Gateway node was disconnected from the rest of the flow.
- **Status**: Signals were being sent, but no logs or responses were generated.

---

## 🎯 Telegram Routing Map (Shotgun Pattern)
To ensure 100% delivery, the orchestrator triggers four parallel agents. The Gateway routes them using these pinned topics:

| Agent | Telegram Topic ID | Session Key (Routing ID) |
| :--- | :--- | :--- |
| **Main** | `:topic:1` | `agent:main:telegram:group:-1003728720677:topic:1` |
| **Promo** | `:topic:1239` | `agent:promo:telegram:group:-1003728720677:topic:1239` |
| **Digit** | `:topic:3` | `agent:digit:telegram:group:-1003728720677:topic:3` |
| **String** | `:topic:2` | `agent:string:telegram:group:-1003728720677:topic:2` |

---

## 🧪 Testing Protocol
Use the `test_signals.ps1` script to verify pipeline health:
1. **Choice 1**: Verify Conversation Sync (Database write).
2. **Choice 2**: Verify Activity Log (Global dashboard).
3. **Choice 3**: Verify Broadcast (Shotgun Telegram delivery + Project-specific log).

---

## ⚠️ Known Blockers & Gotchas
- **Duplicate Pathing**: If `ok:true` returns but no log appears, check for a "ghost" workflow in n8n sharing the same path.
- **Bearer Tokens**: If the response shows an error, check if the gateway bearer token is still valid.
- **Backend Priority**: Never send signals with `low` priority if they are intended for Telegram.
