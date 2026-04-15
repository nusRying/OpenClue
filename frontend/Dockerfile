FROM node:20-alpine

RUN addgroup -g 1001 -S nodejs && adduser -S node -u 1001

WORKDIR /app

# Copy package.json FIRST (layer caching)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY app ./app
COPY components ./components
COPY hooks ./hooks
COPY lib ./lib
COPY types ./types
COPY next.config.js .
COPY tailwind.config.ts .
COPY postcss.config.js .
COPY tsconfig.json .
COPY next-env.d.ts .

# Build
RUN npm run build

# Switch to non-root user
USER node

# Start
CMD ["npm", "start"]
