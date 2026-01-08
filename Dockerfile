# Use the official Bun image
FROM oven/bun:1.0-slim as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

# Copy source code
COPY src ./src

# Run the application
USER bun
ENTRYPOINT [ "bun", "run", "src/index.ts" ]
