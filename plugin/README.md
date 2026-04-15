# Kutraa Mission Control Plugin

## Overview

This OpenClaw plugin intercepts `before_tool_call` and `after_tool_call` events to track tool usage across all agents. It forwards data to the Mission Control backend for real-time dashboard display.

## What It Tracks

- Every tool call (exec, read, web_fetch, etc.)
- Which skill triggered the tool
- Execution duration
- Success/failure status
- Which session/agent is using it

## Installation

### Option 1: From npm (when published)

```bash
openclaw plugins install @kutraa/mission-control-plugin
openclaw gateway restart
```

### Option 2: From local directory

```bash
cd /path/to/kutraa-mission-control/plugin
openclaw plugins install ./plugin
openclaw gateway restart
```

### Option 3: From GitHub

```bash
openclaw plugins install github:alnassar1/kutraa-mission-control/tree/main/plugin
openclaw gateway restart
```

## Hook Files (Internal Hook)

The hook files are separate from the plugin:

```
~/.openclaw/hooks/mission-control/
├── HOOK.md
└── handler.ts
```

These capture session-level events (gateway:startup, message:received, etc.)

The plugin captures tool-level events (before_tool_call, after_tool_call).

## Files

```
plugin/
├── package.json           # npm package manifest
├── openclaw.plugin.json  # OpenClaw plugin manifest
├── tsconfig.json         # TypeScript config
├── src/
│   └── index.ts          # Plugin entry (before_tool_call + after_tool_call)
└── README.md            # This file
```

## Backend Endpoints

The plugin POSTs to these backend endpoints:

- `POST /api/webhook/tool_start` — tool call started
- `POST /api/webhook/tool_end` — tool call completed

## Requirements

- OpenClaw Gateway >= 2026.3.24-beta.2
- Node.js >= 18
- Mission Control backend running on `mission-control-backend:3001`
