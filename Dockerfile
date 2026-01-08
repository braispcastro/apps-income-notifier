# Use the official Bun image
FROM oven/bun:latest as base
WORKDIR /app

# Disable CI mode to prevent forced frozen lockfile issues
ENV CI=0

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --production

# Copy source code
COPY src ./src

# Run the application
USER bun
ENTRYPOINT [ "bun", "run", "src/index.ts" ]
