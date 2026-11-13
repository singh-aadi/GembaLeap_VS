# Build from the repository root: docker build -f apps/web/Dockerfile .
FROM node:22-slim AS build
RUN corepack enable
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY packages/schemas/package.json packages/schemas/
COPY packages/seed/package.json packages/seed/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @sutraos/web build

FROM node:22-slim
WORKDIR /app
COPY --from=build /repo/apps/web/.output ./.output
ENV NODE_ENV=production PORT=8080
CMD ["node", ".output/server/index.mjs"]
