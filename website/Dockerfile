FROM --platform=$BUILDPLATFORM node:slim AS base

RUN apt update && \
  apt install -y ca-certificates

FROM --platform=$BUILDPLATFORM base AS deps
WORKDIR /app/website

COPY website/package.json website/pnpm-lock.yaml website/pnpm-workspace.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM --platform=$BUILDPLATFORM base AS builder

ARG VERSION=0.0.1

WORKDIR /app/website
COPY --from=deps /app/website/node_modules ./node_modules
COPY website .
COPY docs /app/docs

RUN npm install -g pnpm

ENV SENTRY_RELEASE=${VERSION}
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN \
  pnpm build
RUN find /app/website/.output/public/assets -type f -name '*.map' -exec rm -vf {} +

FROM node:slim AS runner
WORKDIR /app/website

ENV NODE_ENV=production

COPY --from=builder /app/website/.output ./.output
COPY --from=builder /app/docs /app/docs

EXPOSE 3000

ENTRYPOINT ["node", ".output/server/index.mjs"]
