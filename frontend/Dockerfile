FROM node:20-alpine

WORKDIR /app

# Build context is repo root (Coolify sets context to repo root, not frontend/)
# All COPY paths use frontend/ prefix
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

# Start
CMD ["cd", "./frontend", "&&", "npm", "start"]
