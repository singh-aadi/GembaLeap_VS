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
RUN pnpm --filter @gembaleap/web build && pnpm --filter @gembaleap/web deploy --legacy --prod /out

FROM node:22-slim
WORKDIR /app
COPY --from=build /out ./
COPY --from=build /repo/apps/web/dist ./dist
ENV NODE_ENV=production PORT=8080
CMD ["node_modules/.bin/srvx", "--prod", "-s", "../client", "dist/server/server.js"]
