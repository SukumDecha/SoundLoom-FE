# Step 1: Build the Next.js app
FROM node:18-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
COPY pnpm-lock.yaml package.json ./
RUN pnpm install 

# Copy source code and environment variables
COPY . .
COPY .env .env

# Build the Next.js app
RUN pnpm build

# Step 2: Production image
FROM node:18-alpine

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Install production dependencies
COPY pnpm-lock.yaml package.json ./
RUN pnpm install

# Copy built app and public assets
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/.env .env

# Expose the application port
EXPOSE 3000

# Start the Next.js application
CMD ["pnpm", "start"]
