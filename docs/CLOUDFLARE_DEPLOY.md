# Cloudflare Pages 部署指南

## 概述

本项目已适配 Cloudflare Pages，可在香港节点部署，国内访问速度快，且**不需要备案**。

## 部署优势

| 特性 | Vercel | Cloudflare Pages |
|-----|--------|------------------|
| 免费 | ✅ | ✅ |
| 国内访问 | ❌ 慢 | ✅ 快（香港节点） |
| 备案 | 不需要 | 不需要 |
| API 路由 | ✅ | ✅ |

## 部署步骤（GitHub 自动部署）

### 1. 注册 Cloudflare 账号

访问 https://dash.cloudflare.com/sign-up，使用 GitHub 登录。

### 2. 连接 GitHub 仓库

1. 进入 Cloudflare Dashboard
2. 选择 **"Workers & Pages"**
3. 点击 **"Create application"**
4. 选择 **"Pages"** 标签
5. 点击 **"Connect to Git"**
6. 选择你的 GitHub 仓库：`hafzhang/name_concealed_poem`

### 3. 部署方式

#### 推荐方式：使用 Wrangler CLI 部署

这是最稳定的方式，完全支持 Next.js API 路由。

**步骤**：

1. **安装 Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **构建项目**
   ```bash
   npm install
   npm run build
   npx @cloudflare/next-on-pages
   ```

4. **部署到 Cloudflare Pages**
   ```bash
   npx wrangler pages deploy .vercel/output/static --project-name=name-concealed-poem
   ```

5. **配置环境变量**（首次部署后在 Dashboard 设置）
   - 访问 Cloudflare Dashboard
   - 进入项目 → Settings → Environment variables
   - 添加：`AI_API_KEY = your-api-key-here`

#### 备选方式：GitHub 自动部署

**注意**：此方式可能不稳定，不推荐用于生产环境。

在设置页面填写以下内容：

| 设置项 | 值 |
|-------|-----|
| **Project name** | `name-concealed-poem`（或自定义） |
| **Production branch** | `master` |
| **Framework preset** | `None` |
| **Build command** | `npm run build && npx @cloudflare/next-on-pages` |
| **Build output directory** | `.vercel/output/static` |
| **Root directory** | `/` |

### 4. 配置环境变量

点击 **"Environment variables"** 添加：

```
AI_API_KEY = your-api-key-here
```

可选变量：
```
AI_BASE_URL = https://api.moonshot.cn/v1
AI_MODEL_NAME = kimi-k2-thinking
NODE_ENV = production
```

### 5. 部署

点击 **"Save and Deploy"**，等待构建完成（约 3-5 分钟）。

### 6. 获取部署地址

部署成功后，你会得到一个地址：
```
https://name-concealed-poem.pages.dev
```

## 代码修改说明

### 1. 字体加载（已适配）

```typescript
// 之前：使用 readFileSync（Node.js 专有）
const fontData = readFileSync(fontPath);

// 现在：使用 fetch（Web 标准 API）
const response = await fetch(fontConfig.url);
const arrayBuffer = await response.arrayBuffer();
```

### 2. 字体文件位置

字体文件已复制到 `public/fonts/` 目录：

| 文件 | 字体样式 |
|-----|---------|
| `kaishu.ttf` | 楷书 |
| `zhi-mang-xing.woff` | 行书 |
| `liu-jian-mao-cao.woff` | 草书 |
| `qingliaolishu.ttf` | 隶书 |
| `ShouJin.ttf` | 寿金 |
| `zcool-xiaowei.woff` | 鸟虫 |
| `mianhuatang.woff2` | 棉花堂 |
| `lxgw-marker-gothic.woff` | 马克 |

### 3. 配置文件

| 文件 | 说明 |
|-----|------|
| `public/_headers` | HTTP 响应头配置（CORS） |

## 故障排查

### 构建失败：`Build command failed`

**原因**：构建命令错误或缺少依赖

**解决**：
1. 确认构建命令为 `npx @cloudflare/next-on-pages`
2. 确认输出目录为 `.vercel/output/static`
3. 查看构建日志中的错误信息

### API 请求失败

**原因**：环境变量未配置或 API Key 无效

**解决**：
1. 在 Cloudflare Dashboard 的 **Settings > Environment variables** 中配置
2. 确认 `AI_API_KEY` 值正确
3. 确保 API Key 对应的服务可用

### 字体加载失败

**原因**：字体文件路径错误

**解决**：
1. 确认字体文件在 `public/fonts/` 目录
2. 检查字体文件名与代码中一致
3. 查看浏览器控制台网络请求

### 错误：`Workers runtime error`

**原因**：代码使用了 Node.js 专有 API

**解决**：
- 本项目已适配，所有代码使用 Web 标准 API
- 如有新增代码，避免使用：`fs`, `path`, `process.cwd()` 等

## 本地测试

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建测试（Vercel/本地）
npm run build
```

## 性能对比

| 指标 | Vercel | Cloudflare Pages |
|-----|--------|------------------|
| 国内首屏加载 | 2-5秒 | 0.5-1秒 |
| API 响应 | 500-1000ms | 100-300ms |
| 字体加载 | 需从国外获取 | 香港节点 CDN |

## 免费额度

| 资源 | 限制 |
|-----|------|
| 请求次数 | 100,000 次/天 |
| 带宽 | 无限制 |
| 构建次数 | 500 次/月 |

对于藏头诗生成应用，免费额度完全够用。

## 总结

Cloudflare Pages 是本项目的最佳部署方案：
- ✅ 完全免费
- ✅ 国内访问快
- ✅ 不需要备案
- ✅ 代码已完全适配
- ✅ 支持 API 路由
- ✅ GitHub 自动部署
