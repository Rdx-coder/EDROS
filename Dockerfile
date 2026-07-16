# Multi-stage build for Enterprise Debt Recovery Operating System (EDROS)

# Stage 1: Build client and server bundles
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency specifications and Prisma schema for build-time generation
COPY package*.json tsconfig.json vite.config.ts ./
COPY prisma ./prisma/

# Install packages (triggers prisma generate automatically via postinstall)
RUN npm ci

# Copy full application codebase
COPY . .

# Build Vite client assets and compile backend Express bundle
RUN npm run build

# Stage 2: Prune development modules and prepare lean runtime
FROM node:22-alpine AS runner
WORKDIR /app

# Enforce secure production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create secure system group and user
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy package definitions, prisma schema, and startup helper
COPY package*.json ./
COPY prisma ./prisma/
COPY startup.sh ./

# Install ONLY production dependencies (triggers prisma generate automatically via postinstall)
RUN npm ci --only=production

# Explicitly generate Prisma Client to ensure it is built in the runner stage with correct binary engine
RUN npx prisma generate

# Copy compiled bundles and assets from the builder stage
COPY --from=builder /app/dist ./dist

# Give ownership of application folder to non-root user
RUN chown -R nextjs:nodejs /app && chmod +x ./startup.sh

# Switch to standard unprivileged user
USER nextjs

# Expose ingress routing port
EXPOSE 3000

# Run pending migrations and start compiled CommonJS server bundle using startup script
CMD ["sh", "./startup.sh"]
