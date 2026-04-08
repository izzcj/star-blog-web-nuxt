# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base
LABEL authors="Alea"

RUN corepack enable

WORKDIR /app

ARG BUILD_NODE_OPTIONS=--max-old-space-size=6144
ENV PNPM_STORE_DIR=/pnpm/store

FROM base AS deps

ENV NODE_OPTIONS=$BUILD_NODE_OPTIONS

COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm config set store-dir $PNPM_STORE_DIR \
  && pnpm fetch --frozen-lockfile \
  && pnpm install --frozen-lockfile --offline

FROM deps AS build

ENV NODE_OPTIONS=$BUILD_NODE_OPTIONS

COPY . .

RUN pnpm exec nuxt build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/.output /app/.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
