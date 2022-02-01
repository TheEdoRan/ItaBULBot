# Build stage
FROM node:16-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src src
RUN npm run compile

# Run
FROM node:16-alpine AS runner
ENV NODE_ENV=production
WORKDIR /usr/src/app
RUN chown node:node .
USER node
COPY --chown=node:node package*.json ./
RUN npm ci --ignore-scripts
COPY --chown=node:node --from=builder /usr/src/app/dist/ .
EXPOSE 8080
CMD ["node", "bot.js"]
