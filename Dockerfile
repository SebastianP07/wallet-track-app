# The web image, also the one Railway builds in Phase 13. It runs server.mjs, never `next start`: only the custom
# server establishes the client address, and the BFF refuses requests without it. That also rules out Next.js's
# `standalone` output, so the image carries the normal build output with production node_modules.
# Base images are pinned by tag and multi-arch index digest (T1). No cache mounts: Railway requires its own ids.

FROM docker.io/library/node:26.13.0-trixie-slim@sha256:5adad64f9a1fca2d51972caa65983634c8a774eb300d72b20f7f2a0f60368072 AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Node 25 and later ship without Corepack, so pnpm is installed at the version packageManager pins. Its own
# install scripts are optional and npm would not run them without an allowlist anyway.
FROM base AS pnpm
RUN npm install --global --no-fund --no-audit --ignore-scripts pnpm@12.16.1

FROM pnpm AS build
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# The build cache is only useful to the next build.
RUN pnpm build && rm -rf .next/cache

FROM pnpm AS prod-deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

FROM base AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000

# Everything is owned by root and read-only to the app. server.mjs loads next.config.ts at start, which reads
# public/ and the offline page's CSP to recompute the service worker's version, so both ship with the build.
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY package.json server.mjs next.config.ts ./
COPY src/shared/security/content-security-policy.ts ./src/shared/security/
# The one place Next.js may write at runtime.
RUN mkdir .next/cache && chown node:node .next/cache

USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
