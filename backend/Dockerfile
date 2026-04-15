FROM node:20-alpine

RUN addgroup -g 1001 -S nodejs && adduser -S node -u 1001

WORKDIR /app

# Build context is repo root (Coolify sets context to repo root, not backend/)
# So all COPY paths must use backend/ prefix
COPY backend/package.json ./backend/package.json
COPY backend/lib ./backend/lib
COPY backend/routes ./backend/routes
COPY backend/src/types.ts ./backend/src/types.ts
COPY backend/index.ts ./backend/index.ts
COPY backend/tsconfig.json ./backend/tsconfig.json

# Install dependencies
RUN cd ./backend && npm install

# Switch to non-root user
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=5s \
  CMD wget -qO- http://localhost:3001/health || exit 1

# Start
CMD ["cd", "./backend", "&&", "tsx", "./index.ts"]
