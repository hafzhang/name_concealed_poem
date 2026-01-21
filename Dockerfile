FROM node:18-alpine AS deps
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tencent.com/g' /etc/apk/repositories
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY package*.json ./
COPY scripts ./scripts
COPY mocks ./mocks
RUN npm config set registry https://mirrors.cloud.tencent.com/npm/
RUN npm install --legacy-peer-deps

FROM node:18-alpine AS builder
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tencent.com/g' /etc/apk/repositories
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:18-alpine AS runner
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tencent.com/g' /etc/apk/repositories
RUN apk add --no-cache tzdata ca-certificates && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo Asia/Shanghai > /etc/timezone && \
    apk del tzdata
WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/src ./src
COPY --from=builder /app/pages ./pages
EXPOSE 80
ENV NODE_ENV=production
ENV PORT=80
ENV TZ=Asia/Shanghai
CMD ["npm", "start"]
