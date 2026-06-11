FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable
RUN pnpm config set registry https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml* ./
COPY tsconfig.json* ./
COPY src ./src

RUN pnpm install || npm install

RUN pnpm build || npm run build

FROM node:24-alpine AS runner

WORKDIR /app

RUN corepack enable
RUN pnpm config set registry https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml* ./

RUN pnpm install --prod || npm install --production

COPY --from=builder /app/dist ./dist

EXPOSE 3006

CMD ["node", "dist/main.js"]
