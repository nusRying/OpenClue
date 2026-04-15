FROM node:20-alpine

WORKDIR /app

# Build context is repo root (Coolify sets context to repo root, not backend/)
# All COPY paths use backend/ prefix
COPY backend/package.json ./backend/package.json
COPY backend/lib ./backend/lib
COPY backend/routes ./backend/routes
COPY backend/src/types.ts ./backend/src/types.ts
COPY backend/index.ts ./backend/index.ts
COPY backend/tsconfig.json ./backend/tsconfig.json

# Install dependencies
RUN cd ./backend && npm install

# Ensure curl is available for healthcheck
RUN apk add --no-cache curl

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=5s \
  CMD curl -f http://localhost:3001/health || exit 1

# Start
CMD cd ./backend && npx tsx index.ts
