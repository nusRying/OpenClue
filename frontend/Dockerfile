FROM node:20-alpine

RUN addgroup -g 1001 -S nodejs && adduser -S node -u 1001

WORKDIR /app

# Build context is repo root (Coolify sets context to repo root, not frontend/)
# So all COPY paths must use frontend/ prefix
COPY frontend/package.json ./frontend/package.json
COPY frontend/app ./frontend/app
COPY frontend/components ./frontend/components
COPY frontend/hooks ./frontend/hooks
COPY frontend/lib ./frontend/lib
COPY frontend/types ./frontend/types
COPY frontend/next.config.js ./frontend/next.config.js
COPY frontend/tailwind.config.ts ./frontend/tailwind.config.ts
COPY frontend/postcss.config.js ./frontend/postcss.config.js
COPY frontend/tsconfig.json ./frontend/tsconfig.json
COPY frontend/next-env.d.ts ./frontend/next-env.d.ts

# Install dependencies and build
RUN cd ./frontend && npm install && npm run build

# Switch to non-root user
USER node

# Start
CMD ["cd", "./frontend", "&&", "npm", "start"]
