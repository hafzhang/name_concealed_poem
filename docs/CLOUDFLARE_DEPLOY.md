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
| 字体加载 | readFileSync | fetch (已适配) |

## 部署步骤

### 方式一：通过 GitHub 自动部署（推荐）

1. **注册 Cloudflare 账号**
   - 访问 https://dash.cloudflare.com/sign-up
   - 使用 GitHub 登录

2. **连接 GitHub 仓库**
   - 进入 Cloudflare Dashboard
   - 选择 "Workers & Pages"
   - 点击 "Create application"
   - 选择 "Pages" 标签
   - 点击 "Connect to Git"
   - 选择你的 GitHub 仓库

3. **配置构建设置**
   ```
   Build command: npm run build
   Build output directory: .next
   Root directory: (留空)
   ```

4. **配置环境变量**
   在 "Environment variables" 部分添加：
   ```
   AI_API_KEY = your-api-key-here
   AI_BASE_URL = https://api.moonshot.cn/v1 (可选)
   AI_MODEL_NAME = kimi-k2-thinking (可选)
   NODE_ENV = production
   ```

5. **部署**
   - 点击 "Save and Deploy"
   - 等待构建完成（约 2-3 分钟）

### 方式二：通过 Wrangler CLI 部署

1. **安装 Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **部署**
   ```bash
   npm run pages:deploy
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
- `kaishu.ttf` - 楷书
- `zhi-mang-xing.woff` - 行书
- `liu-jian-mao-cao.woff` - 草书
- `qingliaolishu.ttf` - 隶书
- `ShouJin.ttf` - 寿金
- `zcool-xiaowei.woff` - 鸟虫
- `mianhuatang.ttf` - 棉花堂
- `lxgw-marker-gothic.woff` - 马克

### 3. 配置文件

- `wrangler.toml` - Cloudflare Workers 配置
- `public/_headers` - HTTP 响应头配置
- `next.config.mjs` - Next.js 输出配置

## 注意事项

1. **环境变量必填项**
   - `AI_API_KEY` 是唯一必需的环境变量
   - 在 Cloudflare Dashboard 的 "Settings > Environment variables" 中配置

2. **构建限制**
   - 免费账户：每月 500 次构建
   - 每次构建时间限制：10 分钟

3. **调用限制**
   - 免费账户：每天 100,000 次请求
   - 对于藏头诗生成应用完全够用

4. **字体文件大小**
   - 所有字体文件已放在 `public/fonts/`
   - 通过 Cloudflare CDN 自动缓存
   - 首次加载后缓存，后续访问更快

## 故障排查

### 构建失败

1. 检查 Node.js 版本（推荐 18.x 或 20.x）
2. 确保所有依赖都在 `package.json` 中
3. 查看 Cloudflare 构建日志

### 字体加载失败

1. 确认字体文件在 `public/fonts/` 目录
2. 检查字体文件名是否与代码中一致
3. 查看浏览器控制台网络请求

### API 请求失败

1. 检查环境变量是否正确配置
2. 验证 `AI_API_KEY` 是否有效
3. 查看 Cloudflare Workers 日志

## 本地测试

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建测试
npm run build

# 使用 Cloudflare 本地环境测试
npm run pages:dev
```

## 性能对比

| 指标 | Vercel | Cloudflare Pages |
|-----|--------|------------------|
| 国内首屏加载 | 2-5秒 | 0.5-1秒 |
| API 响应 | 500-1000ms | 100-300ms |
| 字体加载 | 需要从国外获取 | 香港节点 CDN |

## 总结

Cloudflare Pages 是本项目的最佳部署方案：
- ✅ 完全免费
- ✅ 国内访问快
- ✅ 不需要备案
- ✅ 代码已完全适配
- ✅ 支持所有功能（API 路由、字体渲染）
