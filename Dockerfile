# Build
FROM node:16 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src src
RUN npm run build

# Install
FROM node:16 AS runner
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY --from=builder /usr/src/app/dist /usr/src/app
USER node:node
CMD ["node", "bot.js"]
