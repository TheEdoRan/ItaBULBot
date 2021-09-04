# Build stage
FROM node:14-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src src
RUN npm run build

# Launch stage
FROM node:14-alpine AS launcher
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY --from=builder /usr/src/app/dist/ .
CMD ["node", "bot.js"]