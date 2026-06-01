FROM --platform=$BUILDPLATFORM node:22-alpine AS build-base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM build-base AS builder
WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json vite.config.ts ./
COPY apps/backend/package.json ./apps/backend/package.json
COPY packages/utils/package.json ./packages/utils/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter @circles/backend pack

FROM node:22-alpine AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable \
  && apk add --no-cache tzdata \
  && cp /usr/share/zoneinfo/Asia/Almaty /etc/localtime \
  && echo "Asia/Almaty" > /etc/timezone

WORKDIR /workspace
COPY --from=builder /workspace ./

ENV NODE_ENV=production
ENV SERVICE_NAME=api

EXPOSE 8000

CMD ["sh", "-c", "case \"$SERVICE_NAME\" in api) pnpm --filter @circles/backend start:api ;; worker) pnpm --filter @circles/backend start:worker ;; migrate) pnpm --filter @circles/backend pg:migrate ;; *) echo \"Unknown SERVICE_NAME=$SERVICE_NAME\" >&2; exit 1 ;; esac"]
