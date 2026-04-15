# Mission Control Hook

Forwards OpenClaw session events to the Mission Control backend.

## Events Handled

| Event | Description |
|-------|-------------|
| `session_start` | Agent session started |
| `session_end` | Agent session ended |
| `session_error` | Agent session hit an error |

## Backend Endpoint

All events are POSTed to:
```
http://mission-control-backend:3001/api/webhook/openclaw
```

## Environment

```bash
MISSION_CONTROL_BACKEND_URL=http://mission-control-backend:3001
```

## Installation

```bash
mkdir -p ~/.openclaw/hooks/mission-control
cp HOOK.md handler.ts ~/.openclaw/hooks/mission-control/
openclaw gateway restart
```
