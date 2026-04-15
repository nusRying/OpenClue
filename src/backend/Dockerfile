FROM node:20-alpine

# Add node group for non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S node -u 1001

WORKDIR /app

# Copy package.json FIRST (layer caching)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY lib ./lib
COPY routes ./routes
COPY index.ts ./
COPY tsconfig.json ./

# Switch to non-root user
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=5s \
  CMD wget -qO- http://localhost:3001/health || exit 1

# Start
CMD ["tsx", "./index.ts"]
