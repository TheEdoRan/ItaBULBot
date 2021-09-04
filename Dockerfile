FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

# Install packages
RUN npm ci --legacy-peer-deps

COPY . .

# Build
RUN npm run build

# Start
CMD ["npm", "start"]