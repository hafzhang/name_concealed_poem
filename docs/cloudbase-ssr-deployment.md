# 腾讯云 CloudBase SSR 部署指南

本文档记录了将 Next.js 应用（支持 API 路由）部署到腾讯云 CloudBase 的完整步骤。

## 部署架构

```
源代码 → Docker 构建 → Node.js 运行时 → CloudBase
```

- **运行方式**: SSR (Server-Side Rendering)
- **运行环境**: Node.js 18 Alpine
- **支持功能**: 前端页面 + API 路由

---

## 部署文件

### 1. Dockerfile

```dockerfile
FROM node:18-alpine AS deps
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tencent.com/g' /etc/apk/repositories
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY package*.json ./
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
RUN npm prune --omit=dev
EXPOSE 80
ENV NODE_ENV=production
ENV PORT=80
ENV TZ=Asia/Shanghai
CMD ["npm", "start"]
```

### 2. next.config.mjs

**不要**包含 `output: 'export'` 配置（API 路由需要 SSR）。

---

## 部署步骤

### 方式一：CloudBase 控制台

1. 登录腾讯云 CloudBase 控制台
2. 选择云托管服务
3. 新建版本，上传代码 ZIP 包
4. 配置：
   - Dockerfile 路径: `Dockerfile`
   - 端口: `80`
5. 部署

### 方式二：CloudBase CLI

```bash
# 安装 CLI
npm install -g @cloudbase/cli

# 登录
cloudbase login

# 部署（在项目根目录）
zip -r code.zip . -x "node_modules/*" ".next/*" ".git/*"
cloudbase cloudrun deploy
```

---

## 验证部署

### 1. 检查构建日志

成功日志应显示：
```
Route (pages)                              Size     First Load JS
┌ ○ /                                      12.6 kB        88.6 kB
├ λ /api/generate-poem                     0 B            75.9 kB
├ λ /api/render-image                      0 B            75.9 kB
└ λ /api/check-env                         0 B            75.9 kB
```

`λ` 标记表示 API 路由正常配置为服务器端渲染。

### 2. 测试 API

部署成功后，测试 API 端点：

```bash
# 测试环境检查
curl https://your-domain/api/check-env

# 测试诗词生成
curl -X POST https://your-domain/api/generate-poem \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello"}'
```

---

## 常见问题

### 1. API 404 错误

**错误**: `open() "/usr/share/nginx/html/api/xxx" failed`

**原因**: 使用了静态导出模式（`output: 'export'`）

**解决**: 确认 `next.config.mjs` 中没有 `output: 'export'` 配置

### 2. 构建缓存问题

**错误**: `failed to calculate checksum: "/.next": not found`

**解决**:
- 修改 Dockerfile 添加注释或其他内容触发重新构建
- 或在 CloudBase 控制台清除缓存

### 3. 内存不足

**现象**: 构建或运行时崩溃

**解决**:
- 升级云托管配置（建议 2 核 4G 起步）
- 或使用本地构建后上传镜像

---

## 与静态导出的选择

| 需求 | 推荐方案 |
|------|---------|
| 需要 API 路由 | **SSR 部署** |
| 纯静态展示页面 | 静态导出 + nginx |
| 需要服务端渲染 | **SSR 部署** |
| 需要图片生成等服务端功能 | **SSR 部署** |

**本项目推荐 SSR 部署**，因为依赖 API 路由进行诗词生成和图片渲染。
