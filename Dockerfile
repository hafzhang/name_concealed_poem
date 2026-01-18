# 腾讯云 CloudBase 云托管 Dockerfile
# 使用 Node.js 18 镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 先复制所有文件（包括 scripts/ 目录）
COPY . .

# 安装依赖（跳过 postinstall，CloudBase 不需要 async_hooks mock）
RUN npm install --legacy-peer-deps --ignore-scripts

# 构建项目
RUN npm run build

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 启动应用
CMD ["npm", "start"]
