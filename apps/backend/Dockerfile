# Stage 1: Build the application
FROM node:20-slim AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN apt-get update && apt-get install -y procps
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Create the production image
FROM node:20-slim

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules

# USER nestjs

CMD ["node", "dist/main"]
