# ---------- Build stage ----------
FROM node:22-slim AS builder

WORKDIR /app

# Install specific pnpm tagged to a specific version
# v10.10.0 is @latest as of May 2025
RUN npm install -g pnpm@10.10.0

# Copy dependency files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src
RUN pnpm build

# ---------- Runtime stage ----------
FROM node:22-slim AS runner

# label metadata for the image
LABEL name="tsel-search-service" \
      version="1.0.0" \
      maintainer="j.choong@accenture.com" \
      summary="TSEL Global Search Service" \
      description="Provides global search functionality for TSEL Digital Channels" 

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# harden the image
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    redis-tools \
    dnsutils \
    iproute2 \
    unzip \
    && rm -rf /var/lib/apt/lists/*
RUN groupadd -r appuser && useradd -r -g appuser -d /app appuser
RUN chown -R appuser:appuser /app && chmod -R g+rw /app

# Install AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip" \
  && unzip /tmp/awscliv2.zip -d /tmp \
  && /tmp/aws/install \
  && rm -rf /tmp/aws /tmp/awscliv2.zip

USER 1001

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/index.js"]
