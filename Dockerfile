# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm install --production

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copy backend source
COPY backend/ ./

# Expose port (Fly.io will map 8080 to this)
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3002', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start server
CMD ["node", "server.js"]
