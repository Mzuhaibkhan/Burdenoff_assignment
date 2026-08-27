FROM oven/bun:1 AS builder

WORKDIR /app

# Copy the entire workspace
COPY . .

# Install dependencies (workspaces automatically link)
RUN bun install

# Build frontend
WORKDIR /app/apps/web
RUN bun run build

# --- Runtime Stage (Nginx) ---
FROM nginx:alpine

# Copy built static files from builder
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
