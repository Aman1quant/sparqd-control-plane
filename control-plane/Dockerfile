# ---------- Prisma Builder (with CLI and migrations) ----------
FROM node:22-slim AS builder-prisma

WORKDIR /app

# Install specific pnpm tagged to a specific version
# v10.10.0 is @latest as of May 2025
RUN npm install -g pnpm@10.10.0

# Copy dependency files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN pnpm build

# ---------- Runtime (minimal) ----------
FROM node:22-slim AS runner

# Allow build-time toggle for hardening
ARG HARDEN=true

# label metadata for the image
LABEL name="sparqd-control-plane-api" \
      version="1.0.0" \
      maintainer="taufiq.ibrahim@gmail.com" \
      summary="Sparqd Control Plane API" \
      description="Sparqd Control Plane API" 

WORKDIR /app

COPY --from=builder-prisma /app/dist ./dist
COPY --from=builder-prisma /app/node_modules ./node_modules

# Harden the image conditionally
RUN if [ "$HARDEN" = "true" ]; then \
    groupadd -r appuser && useradd -r -g appuser -d /app appuser && \
    chown -R appuser:appuser /app && chmod -R g+rw /app ; \
  fi

# Always run as non-root (safe default)
USER 1001

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/index.js"]
