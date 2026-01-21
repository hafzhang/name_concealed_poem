# 腾讯云 CloudBase 云托管 Dockerfile
# 使用 Node.js 18 镜像作为基础镜像
FROM node:18-alpine

# 使用国内镜像源加速 apk 安装
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tencent.com/g' /etc/apk/repositories

# 设置时区为上海时间
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo Asia/Shanghai > /etc/timezone && \
    apk del tzdata

# 安装 ca-certificates（HTTPS 请求需要）
RUN apk add --no-cache ca-certificates

# 设置工作目录
WORKDIR /app

# 拷贝包管理文件（利用 Docker 缓存）
COPY package*.json ./

# 使用腾讯云 npm 镜像源加速
RUN npm config set registry https://mirrors.cloud.tencent.com/npm/

# 只安装生产依赖（不构建，使用本地构建产物）
RUN npm install --production --legacy-peer-deps --ignore-scripts

# 复制本地构建产物和必要文件
COPY .next/ .next/
COPY public/ public/
COPY next.config.mjs ./
COPY src/ src/
COPY pages/ pages/

# 暴露端口
EXPOSE 80

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=80
ENV TZ=Asia/Shanghai

# 启动应用
CMD ["npm", "start"]
