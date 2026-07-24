# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /app
# Install pnpm
RUN npm install -g pnpm@11.13.0
# Copy only package file first
COPY package.json ./
# Install dependencies without frozen lockfile
RUN pnpm install --no-frozen-lockfile
# Copy source code
COPY . .

# ---- YEH NAYA PART ADD KIYA ----
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_WS_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_WS_BASE_URL=$NEXT_PUBLIC_WS_BASE_URL
# ---------------------------------

# Build the application
RUN pnpm run build
# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
# Install pnpm
RUN npm install -g pnpm@11.13.0
# Copy package file
COPY package.json ./
# Install only production dependencies
RUN pnpm install --prod --no-frozen-lockfile
# Copy built app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
# Expose port
EXPOSE 3000
# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => { if (r.statusCode !== 200) process.exit(1) }).on('error', () => process.exit(1))"
# Start app
CMD ["pnpm", "start"]
