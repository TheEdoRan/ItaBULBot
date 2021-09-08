# Build stage
FROM node:14-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src src
RUN npm run build

# Launch
FROM node:14-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
RUN chown node:node .
USER node
COPY --chown=node:node package*.json ./
RUN npm ci
COPY --chown=node:node --from=builder /usr/src/app/dist/ .
CMD ["node", "bot.js"]
