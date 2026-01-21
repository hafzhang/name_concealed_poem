# 静态导出 + Nginx 部署指南

本文档记录了将 Next.js 应用配置为静态导出，并使用 nginx 托管部署到腾讯云 CloudBase 的完整步骤。

## 部署架构

```
本地构建 → 静态文件(out/) → 打包上传 → CloudBase → nginx:alpine
```

- **构建方式**: 本地执行 `npm run build`
- **输出产物**: `out/` 目录（纯静态文件）
- **运行环境**: nginx:alpine
- **最终镜像大小**: ~93.5MB

---

## 第一步：配置静态导出

### 1. 修改 `next.config.mjs`

添加静态导出配置：

```javascript
const nextConfig = {
  // 静态导出配置
  output: 'export',
  // 静态导出时禁用图片优化
  images: {
    unoptimized: true,
  },
  // ... 其他配置
};
```

### 2. 创建 `Dockerfile`

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 第二步：本地构建

在项目根目录执行：

```bash
npm run build
```

构建成功后会生成 `out/` 目录，包含以下内容：

```
out/
├── index.html          # 首页
├── 404.html            # 404页面
├── _next/              # Next.js 静态资源（JS、CSS）
├── demo/               # demo页面
├── flags/              # flag图片资源
├── fonts/              # 字体文件
├── Dockerfile          # nginx配置
└── _headers            # Cloudflare Pages 配置（可选）
```

---

## 第三步：准备部署文件

### 1. 复制 Dockerfile 到 out 目录

```bash
cp Dockerfile out/
```

### 2. 确认文件结构

```bash
ls out/
# 应该看到: Dockerfile, index.html, 404.html, _next/, demo/, flags/, fonts/
```

---

## 第四步：上传部署

### 方式一：腾讯云 CloudBase 控制台

1. 登录腾讯云 CloudBase 控制台
2. 选择你的云托管服务
3. 上传 `out/` 目录的 ZIP 压缩包
4. 配置 Dockerfile 路径为 `Dockerfile`（根目录）
5. 点击部署

### 方式二：使用 CloudBase CLI

```bash
# 安装 CloudBase CLI
npm install -g @cloudbase/cli

# 登录
cloudbase login

# 部署
cd out
zip -r ../code.zip .
cloudbase cloudrun deploy
```

---

## 部署验证

### 成功日志示例

```
[2026-01-21 17:07:47] Archive: code.zip
[2026-01-21 17:07:47] inflating: index.html
[2026-01-21 17:07:47] inflating: Dockerfile
[2026-01-21 17:07:47] creating: _next/
...
[2026-01-21 17:07:52] 镜像的大小是：93.5MB
[2026-01-21 17:07:52] Pushing Docker image to TCR...
```

### 访问验证

部署成功后，访问你的服务域名，应该能看到首页正常显示。

---

## 常见问题

### 1. 构建时报错 `"/.next": not found`

**原因**: Docker 缓存了旧的构建步骤

**解决**: 删除 Dockerfile 中的缓存层，重新构建。确保 Dockerfile 中只有静态文件复制：

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. 静态资源 404

**原因**: nginx 配置问题

**解决**: 确保 Dockerfile 中 `COPY . /usr/share/nginx/html` 复制了所有文件，包括 `_next/` 目录。

### 3. API 路由不工作

**原因**: 静态导出不支持 API 路由

**解决**: 将 API 逻辑迁移到其他服务（如云函数、独立后端）

---

## 镜像优化建议

当前镜像大小 ~93.5MB，可进一步优化：

1. **使用更小的基础镜像**: 考虑使用 `busybox` 或 `scratch`
2. **压缩静态资源**: 使用 gzip 压缩 JS/CSS 文件
3. **移除不必要的文件**: 检查 `out/` 目录中是否有未使用的资源

---

## 与 SSR 部署的对比

| 特性 | 静态导出 | SSR (Docker + Node.js) |
|------|---------|----------------------|
| 镜像大小 | ~93.5MB | ~200MB+ |
| 启动速度 | 秒级 | 分钟级 |
| 资源消耗 | 极低 | 较高 |
| API 路由 | 不支持 | 支持 |
| 动态渲染 | 不支持 | 支持 |

**推荐**: 如果是纯静态内容展示（如本诗词生成器的前端部分），静态导出是最优方案。
