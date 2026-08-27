FROM oven/bun:1 AS builder

WORKDIR /app

# Copy the entire workspace
COPY . .

# Install dependencies and generate prisma client
RUN bun install
RUN bunx prisma generate

# Build backend
WORKDIR /app/apps/server
RUN bun run build

# --- Runtime Stage ---
FROM oven/bun:1-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy node_modules (needed for prisma client and hoisted dependencies)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/prisma ./prisma

# Copy built server assets and GraphQL schemas (which aren't bundled by bun build)
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/
COPY --from=builder /app/apps/server/src/graphql/schema ./apps/server/dist/graphql/schema

WORKDIR /app/apps/server

EXPOSE 4000

# Ensure migrations are applied on startup (schema is in root /app), then run the app
CMD ["sh", "-c", "bunx prisma migrate deploy --schema=../../prisma/schema.prisma && bun run dist/server.js"]
