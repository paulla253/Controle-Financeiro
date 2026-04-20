
# Stage 1: Install dependencies and build the application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve the application
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy the built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3001

CMD ["npm", "run", "start", "--", "-p", "3001"]
