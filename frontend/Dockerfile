FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable
RUN pnpm config set registry https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml ./
COPY . .

RUN pnpm install || npm install
RUN pnpm build || npm run build

FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
