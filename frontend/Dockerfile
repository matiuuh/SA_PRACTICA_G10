FROM node:22-alpine AS builder

WORKDIR /app

ARG VITE_API_GATEWAY_URL=
ARG VITE_RESERVAS_WS_URL=

ENV VITE_API_GATEWAY_URL=$VITE_API_GATEWAY_URL
ENV VITE_RESERVAS_WS_URL=$VITE_RESERVAS_WS_URL

RUN corepack enable
RUN pnpm config set registry https://registry.npmmirror.com

COPY package.json pnpm-lock.yaml ./
COPY . .

RUN pnpm install || npm install
RUN pnpm build || npm run build

FROM nginx:alpine AS runner

RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
      -keyout /etc/nginx/certs/selfsigned.key \
      -out    /etc/nginx/certs/selfsigned.crt \
      -subj "/CN=filmstars-develop"

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
