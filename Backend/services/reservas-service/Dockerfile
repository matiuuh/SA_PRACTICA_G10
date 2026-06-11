FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable
RUN pnpm config set registry https://registry.npmmirror.com
RUN pnpm config set fetch-timeout 120000
RUN pnpm config set fetch-retries 5

COPY package.json pnpm-lock.yaml ./
COPY tsconfig.json* ./
COPY src ./src

RUN pnpm install --ignore-scripts

RUN pnpm build

FROM node:24-alpine AS runner

WORKDIR /app

RUN corepack enable
RUN pnpm config set registry https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --prod --ignore-scripts

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
