# Use the official Bun image
FROM oven/bun:1.0-slim as base
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN bun install --production --no-frozen-lockfile

# Copy source code
COPY src ./src

# Run the application
USER bun
ENTRYPOINT [ "bun", "run", "src/index.ts" ]
