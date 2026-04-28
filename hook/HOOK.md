# Mission Control Hook

Forwards OpenClaw session events to n8n OpenCluePulse or the Mission Control backend.

## Events Handled

| Event | Description |
|-------|-------------|
| `session_start` | Agent session started |
| `session_end` | Agent session ended |
| `session_error` | Agent session hit an error |

## Webhook Endpoint

Recommended production n8n webhook:
```
https://agents.kutraa.com/webhook/OpenCluePulse
```

Backend fallback:
```
http://mission-control-backend:3001/api/webhook/openclaw
```

## Environment

```bash
MISSION_CONTROL_WEBHOOK_URL=https://agents.kutraa.com/webhook/OpenCluePulse
# or
N8N_WEBHOOK_URL=https://agents.kutraa.com/webhook/OpenCluePulse
# or, if you only have the base n8n origin:
N8N_URL=https://agents.kutraa.com
# backend fallback:
MISSION_CONTROL_BACKEND_URL=http://mission-control-backend:3001
```

## Installation

```bash
mkdir -p ~/.openclaw/hooks/mission-control
cp HOOK.md handler.ts ~/.openclaw/hooks/mission-control/
openclaw gateway restart
```
