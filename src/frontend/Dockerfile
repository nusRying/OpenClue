FROM node:20-alpine

RUN addgroup -g 1001 -S nodejs && adduser -S node -u 1001

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

USER node

CMD ["npm", "start"]
