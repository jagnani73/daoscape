# Multi-stage Dockerfile for vlayer client with Foundry setup
FROM ghcr.io/foundry-rs/foundry:latest AS foundry-builder

# Set working directory
WORKDIR /app

# Copy Foundry configuration files
COPY foundry.toml .
COPY remappings.txt .
COPY soldeer.lock .
COPY .gitmodules .

# Copy source directories
COPY src/ src/
COPY script/ script/
COPY test/ test/
COPY lib/ lib/
COPY dependencies/ dependencies/

# Install Foundry dependencies and build contracts
RUN forge install --no-commit
RUN forge build

# Node.js stage for the vlayer client
FROM node:18-alpine AS client-builder

# Install system dependencies
RUN apk add --no-cache git python3 make g++

# Set working directory
WORKDIR /app

# Copy the built contracts from foundry stage
COPY --from=foundry-builder /app/out ./out

# Copy vlayer client package files first for better caching
COPY vlayer/package.json ./package.json
COPY vlayer/bun.lock ./bun.lock

# Install dependencies
RUN npm install

# Copy vlayer client configuration files
COPY vlayer/tsconfig.json ./tsconfig.json
COPY vlayer/vite.config.ts ./vite.config.ts
COPY vlayer/tailwind.config.js ./tailwind.config.js
COPY vlayer/postcss.config.js ./postcss.config.js
COPY vlayer/components.json ./components.json
COPY vlayer/index.html ./index.html

# Copy source code
COPY vlayer/src/ ./src/
COPY vlayer/public/ ./public/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install serve to serve the built application
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=client-builder /app/dist ./dist

# Copy the out folder for runtime access to contract ABIs
COPY --from=foundry-builder /app/out ./out

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"] 