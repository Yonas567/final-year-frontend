# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time (client hints + fallback). For production pass your public API host:
#   --build-arg NEXT_PUBLIC_API_URL=https://apiearthquake.yonasproject.cloud
ARG NEXT_PUBLIC_API_URL=http://localhost:6010
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ARG API_URL=http://localhost:6010
ENV API_URL=${API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# pnpm-workspace.yaml without `packages` breaks pnpm 9 (often auto-created by approve-builds).
RUN rm -f pnpm-workspace.yaml

RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=6011
ENV HOSTNAME=0.0.0.0
# REQUIRED in production deploy panel (runtime, no rebuild):
#   API_URL=https://apiearthquake.yonasproject.cloud
# Do not use localhost — the API is not inside this container.

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 6011

CMD ["node", "server.js"]
