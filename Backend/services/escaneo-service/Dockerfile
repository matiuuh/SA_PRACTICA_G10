FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable
RUN pnpm config set registry https://registry.npmmirror.com
RUN pnpm config set fetch-timeout 120000
RUN pnpm config set fetch-retries 5

COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml* ./
COPY .npmrc* ./
COPY nest-cli.json* ./
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN pnpm install
RUN pnpm build

FROM node:24-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

EXPOSE 3007

CMD ["node", "dist/main.js"]
