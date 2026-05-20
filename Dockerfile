# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml .npmrc* ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Production API defaults (override for local docker: --build-arg API_URL=http://localhost:6010)
ARG API_URL=https://apiearthquake.yonasproject.cloud
ARG NEXT_PUBLIC_API_URL=https://apiearthquake.yonasproject.cloud
ENV API_URL=${API_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

RUN rm -f pnpm-workspace.yaml
RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=6011
ENV HOSTNAME=0.0.0.0
ENV API_URL=https://apiearthquake.yonasproject.cloud
ENV NEXT_PUBLIC_API_URL=https://apiearthquake.yonasproject.cloud

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 6011

CMD ["node", "server.js"]
