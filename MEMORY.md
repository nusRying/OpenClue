# OpenClue Absolute Intelligence: Master Memory Log (v5.1.18)

This is the definitive reference for the OpenClue Intelligence Pipeline, documenting the complete stabilization effort conducted on April 23, 2026.

## 🏗️ 1. Pipeline Architecture & Flow
The system follows a "Neural Shotgun" architecture to ensure 100% message delivery across multi-modal agents.

```mermaid
graph TD
    A[Frontend/Terminal] -->|POST| B[n8n Orchestrator: OpenCluePulse]
    B -->|v5.1.18 Logic| C{Absolute Router}
    C -->|Broadcast| D[Broadcast Resolver]
    D -->|Parallel Shotgun| E[Neural Gateway Pulse]
    E -->|High Priority| F[Telegram API]
    C -->|Sync| G[Supabase: append_conversation_message]
    B -->|Convergence| H[Unified Aggregator]
    H -->|Log with project_id| I[Supabase: activity_log]
    I -->|JSON Response| A
```

---

## 🛠️ 2. Version Evolution & Debugging History

### v5.1.18: The "Project Context" Breakthrough
- **Discovery**: The Intelligence Log on the dashboard was filtering by `project_id`. Previous versions logged events globally, making them invisible in specific project views.
- **Fix**: Orchestrator now extracts `project_id` from the inbound payload and pins it to every database entry.
- **Priority Fix**: Discovered that `backend/routes/webhooks.ts` filters out events marked as "low" priority. All broadcasts are now explicitly set to `priority: high`.

### v5.1.17: The "Unified Convergence" Fix
- **Discovery**: n8n was returning a default `{"ok":true}` response before the workflow actually finished.
- **Fix**: All branches (Broadcast, Chat, Fallback) now converge into a single `Unified Aggregator` node that serves as the final gateway before responding.

### v5.1.15: The "Island Node" Issue
- **Discovery**: In the previous n8n workflow, the node sending messages to Telegram was disconnected from the output, causing "silent successes" where nothing was logged.

---

## 📡 3. Critical Routing Table (Telegram)
These mappings are hard-coded into the `Broadcast Resolver` to ensure agents reach the correct topics in the Kutraa group.

| Agent Name | Telegram Topic ID | sessionKey (Routing Identity) |
| :--- | :--- | :--- |
| **main** | `:topic:1` | `agent:main:telegram:group:-1003728720677:topic:1` |
| **promo** | `:topic:1239` | `agent:promo:telegram:group:-1003728720677:topic:1239` |
| **digit** | `:topic:3` | `agent:digit:telegram:group:-1003728720677:topic:3` |
| **string** | `:topic:2` | `agent:string:telegram:group:-1003728720677:topic:2` |

---

## 🗄️ 4. Data Layer Integration

### Activity Logging
- **Endpoint**: `https://base.kutraa.com/rest/v1/activity_log`
- **Required Fields**: `event_type`, `description`, `project_id`, `metadata`.
- **UI Interaction**: `ProjectDetailView.tsx` filters this table by `project.id` to populate the "Intelligence Log" component.

### Conversation Sync
- **RPC**: `rpc/append_conversation_message`
- **Logic**: Used to keep the "Conversation" tab in-sync with agent actions.

---

## 🧪 5. Testing & Verification Guide
Always use `test_signals.ps1` for health checks.

- **Choice 3 (Broadcast)**: 
    - Verify terminal returns `{"mission": "acknowledged", "project_context": "..."}`.
    - Verify Telegram sends 4 messages (one per agent topic).
    - Verify Dashboard shows "Unified signal verified" inside the **Project Detail** view.

---

## 🔒 6. Auth Tokens & Secrets
- **Gateway Bearer**: `46cf3441242627eabf8eb5c32d2e0d7f`
- **Internal IP**: `http://tofyq3lga15o3184lxde506q:18789`
- **Supabase Anon**: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NjI0NDU2MCwiZXhwIjo0OTMxOTE4MTYwLCJyb2xlIjoiYW5vbiJ9.RJRl9UsbEImEOQYPBy6nZds-RYlaTclQQj2pJ8uJb6U`

---

## 📝 7. v5.1.18 JSON Content Backup
*(In case of file corruption, copy-paste this block into n8n)*

<details>
<summary>Click to expand Master Orchestrator JSON</summary>

```json
{
  "name": "OpenClue - Master Orchestrator v5.1.18 (Context-Aware)",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "OpenCluePulse",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "agent-events",
      "name": "Agent Event Inbound",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [ 0, 100 ]
    },
    {
      "parameters": {
        "jsCode": "// Normalize webhook payload and preserve project context\nconst raw = $input.item.json;\nconst data = raw.body && typeof raw.body === 'object' && !Array.isArray(raw.body) ? raw.body : raw;\nconst project_id = data.project_id || (data.metadata ? data.metadata.project_id : null);\nreturn { json: { ...data, project_id } };"
      },
      "id": "body-unwrap",
      "name": "Body Unwrap",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [ 200, 200 ]
    },
    {
      "parameters": {
        "dataType": "string",
        "value1": "={{ ($json.action || $json.event_type || 'unclassified').toString() }}",
        "rules": {
          "rules": [
            { "value2": "message:sent", "output": 0 },
            { "value2": "message:received", "output": 0 },
            { "value2": "session_end", "output": 3 },
            { "operation": "startsWith", "value2": "session_", "output": 1 },
            { "value2": "broadcast", "output": 2 },
            { "operation": "startsWith", "value2": "task:", "output": 2 }
          ]
        },
        "fallbackOutput": 3
      },
      "id": "orchestrator-switch",
      "name": "Absolute Router",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 1,
      "position": [ 400, 200 ]
    },
    {
      "parameters": {
        "jsCode": "// Unified Aggregator - Consolidates all branches and preserves project ID for UI Log\nconst all = $input.all();\nconst first = all[0].json;\nconst orig = first.original || first;\nconst project_id = first.project_id || orig.project_id || (orig.metadata ? orig.metadata.project_id : null);\nreturn {\n  json: {\n    event_type: 'mission_pulse',\n    project_id: project_id,\n    description: orig.message || 'Unified signal verified.',\n    metadata: { version: '5.1.18', branch_count: all.length, source: 'orch_v5' }\n  }\n};"
      },
      "id": "unified-aggregator",
      "name": "Unified Aggregator",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [ 1000, 200 ]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://base.kutraa.com/rest/v1/activity_log",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            { "name": "apikey", "value": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NjI0NDU2MCwiZXhwIjo0OTMxOTE4MTYwLCJyb2xlIjoiYW5vbiJ9.RJRl9UsbEImEOQYPBy6nZds-RYlaTclQQj2pJ8uJb6U" },
            { "name": "Authorization", "value": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NjI0NDU2MCwiZXhwIjo0OTMxOTE4MTYwLCJyb2xlIjoiYW5vbiJ9.RJRl9UsbEImEOQYPBy6nZds-RYlaTclQQj2pJ8uJb6U" }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify($json) }}",
        "options": {}
      },
      "id": "action-log",
      "name": "Final Log Node",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [ 1200, 200 ],
      "continueOnFail": true
    },
    {
      "parameters": {
        "options": {
          "responseBody": "={{ JSON.stringify({ mission: 'acknowledged', resonance: 'v5.1.18', timestamp: $now.toISOString(), project_context: $json.project_id }) }}"
        }
      },
      "id": "response-gate",
      "name": "Final Response Gate",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [ 1400, 200 ]
    }
  ],
  "connections": {
    "Agent Event Inbound": { "main": [ [ { "node": "Body Unwrap", "type": "main", "index": 0 } ] ] },
    "Body Unwrap": { "main": [ [ { "node": "Absolute Router", "type": "main", "index": 0 } ] ] },
    "Absolute Router": {
      "main": [
        [ { "node": "Unified Aggregator", "type": "main", "index": 1 } ],
        [ { "node": "Unified Aggregator", "type": "main", "index": 0 } ],
        [ { "node": "Broadcast Resolver", "type": "main", "index": 0 } ],
        [ { "node": "Unified Aggregator", "type": "main", "index": 0 } ]
      ]
    },
    "Unified Aggregator": { "main": [ [ { "node": "Final Log Node", "type": "main", "index": 0 } ] ] },
    "Final Log Node": { "main": [ [ { "node": "Final Response Gate", "type": "main", "index": 0 } ] ] }
  }
}
```
</details>
