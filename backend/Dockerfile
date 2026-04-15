FROM node:20-alpine

RUN addgroup -g 1001 -S nodejs && adduser -S node -u 1001

WORKDIR /app

# Copy package.json FIRST (layer caching)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY src/lib ./src/lib
COPY src/routes ./src/routes
COPY src/types.ts ./src/types.ts
COPY index.ts ./
COPY tsconfig.json ./

# Switch to non-root user
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=5s \
  CMD wget -qO- http://localhost:3001/health || exit 1

# Start
CMD ["tsx", "./index.ts"]
