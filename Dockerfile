FROM node:lts-slim as base

FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm install -g pnpm

RUN pnpm build

FROM node:lts-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.output ./.output
COPY --from=builder /app/docs ./docs

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
