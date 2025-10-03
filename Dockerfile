FROM --platform=$BUILDPLATFORM node:slim AS base

RUN apt update && \
  apt install -y ca-certificates

FROM --platform=$BUILDPLATFORM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM --platform=$BUILDPLATFORM base AS builder

ARG VERSION=0.0.1

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g pnpm

ENV SENTRY_RELEASE=${VERSION}
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN \
  pnpm build
RUN find /app/dist/client/assets -type f -name '*.map' -exec rm -vf {} +

FROM node:slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/docs ./docs

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
