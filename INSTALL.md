# Mission Control — OpenClaw Integration

## Files to Install on OpenClaw Host

### Part 1: Hook (Session Events)

Create directory and copy files:

```bash
mkdir -p ~/.openclaw/hooks/mission-control
```

**Copy these 2 files to `~/.openclaw/hooks/mission-control/`:**
- `HOOK.md`
- `handler.ts`

### Part 2: Plugin (Tool Calls)

**Option A: From GitHub (recommended)**

```bash
openclaw plugins install github:alnassar1/kutraa-mission-control/plugin
```

**Option B: From local files**

```bash
# On the OpenClaw host:
cd /path/to/kutraa-mission-control/plugin
npm install
npm run build
openclaw plugins install .
```

### Part 3: Restart Gateway

```bash
openclaw gateway restart
```

## Verify Installation

```bash
openclaw hooks list
# Should show: mission-control-hook

openclaw plugins list
# Should show: kutraa-mission-control
```

## Environment

The hook and plugin need to reach the Mission Control backend:

```
http://mission-control-backend:3001
```

This must be on the same Docker network as OpenClaw.

## Files Location Summary

```
~/.openclaw/hooks/mission-control/
├── HOOK.md       ← copy this
└── handler.ts     ← copy this

~/.openclaw/plugins/
└── kutraa-mission-control/  ← installed by openclaw plugins install
```

## Uninstall

```bash
openclaw plugins uninstall kutraa-mission-control
rm -rf ~/.openclaw/hooks/mission-control
openclaw gateway restart
```
