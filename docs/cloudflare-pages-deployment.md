# Cloudflare Pages 部署 Next.js 完整指南

## 项目概述

**姓名藏诗** - 国风书法定制应用

- 输入姓名，生成专属藏头诗
- 支持多种书法风格和装裱效果
- 使用 AI 自动生成诗歌内容
- 生成可下载的书法图片

---

## 最终技术栈版本

| 依赖项 | 版本 | 说明 |
|--------|------|------|
| Next.js | 13.4.19 | Pages Router 模式 |
| React | 18.3.1 | |
| @cloudflare/next-on-pages | 1.13.16 | Cloudflare 适配器 |
| Node.js | 20 | 运行时环境 |
| TypeScript | 5.x | |

---

## 部署架构

```
GitHub 仓库 → GitHub Actions → Cloudflare Pages
                              ↓
                         @cloudflare/next-on-pages
                              ↓
                         Edge Runtime 构建
```

---

## 完整配置文件

### 1. package.json (关键部分)

```json
{
  "dependencies": {
    "next": "13.4.19",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@cloudflare/next-on-pages": "^1.13.16"
  }
}
```

### 2. .npmrc

```
legacy-peer-deps=true
```

**重要**：这个文件让 npm 忽略 peer 依赖版本冲突，`@cloudflare/next-on-pages` 要求 Next.js >= 14.3.0，但 13.4.19 也能工作。

### 3. .github/workflows/cloudflare-pages.yml

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      deployments: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          rm -rf node_modules package-lock.json
          npm install --legacy-peer-deps

      - name: Build Next.js
        run: npm run build

      - name: Build with @cloudflare/next-on-pages
        run: npx @cloudflare/next-on-pages
        env:
          NPM_FLAGS: --legacy-peer-deps

      - name: Deploy to Cloudflare Pages
        run: wrangler pages deploy .vercel/output/static --project-name=name-concealed-poem
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### 4. API 路由配置 (pages/api/*)

所有 API 路由必须包含 Edge Runtime 配置：

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // ...
}
```

### 5. tailwind.config.ts

```typescript
const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // ...
};
```

---

## 遇到的错误和解决方案

### 错误 1: async_hooks 模块找不到

**错误信息：**
```
Error: Could not resolve "async_hooks"
The package "async_hooks" wasn't found on the file system but is built into node.
```

**原因：**
- Next.js 14.3+ 和 15.x 内部使用 `@next/request-context`，依赖 Node.js 的 `async_hooks` 模块
- Cloudflare Pages Edge Runtime 不支持 Node.js 原生模块

**解决方案：**
降级到 Next.js 13.4.19（最后一个不强制使用 async_hooks 的稳定版本）

**版本尝试历程：**
```
15.0.3 ❌ → 14.2.3 ❌ → 13.5.6 ❌ → 13.4.19 ✅ → 12.3.4 ❌ → 13.4.19 ✅
```

---

### 错误 2: App Router 导致 async_hooks 依赖

**错误信息：**
```
Route (app) / was not configured to run with the Edge Runtime
```

**原因：**
- 项目同时使用 App Router (`src/app/`) 和 Pages Router (`pages/`)
- App Router 内部使用 `@next/request-context`

**解决方案：**
完全移除 App Router，只使用 Pages Router

**文件迁移：**
```
src/app/page.tsx → pages/index.tsx
src/app/layout.tsx → pages/_app.tsx
src/app/demo/auto-mounting/page.tsx → pages/demo/auto-mounting.tsx
src/app/globals.css → src/styles/globals.css
```

---

### 错误 3: npm ci 依赖冲突

**错误信息：**
```
npm error ERESOLVE could not resolve
peer next@">=14.3.0 && <=15.5.2" from @cloudflare/next-on-pages@1.13.16
```

**原因：**
- `@cloudflare/next-on-pages` 要求 Next.js >= 14.3.0
- 使用 Next.js 13.4.19 时，npm ci 严格检查 peer 依赖

**解决方案：**
1. 创建 `.npmrc` 文件设置 `legacy-peer-deps=true`
2. 在 GitHub Actions 中使用 `npm install --legacy-peer-deps`

---

### 错误 4: Tailwind CSS 样式不生效

**现象：**
页面只有纯文字，没有任何样式效果

**原因：**
Tailwind 配置的 `content` 路径没有包含 `pages/` 目录

**解决方案：**
更新 `tailwind.config.ts`：
```typescript
content: [
  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",  // 添加这一行
  "./src/**/*.{js,ts,jsx,tsx,mdx}",
],
```

---

### 错误 5: 装裱组件被当作路由

**错误信息：**
```
The following routes were not configured to run with the Edge Runtime:
- /api/render-image/AzurePorcelain
- /api/render-image/Redwood
- ...
```

**原因：**
装裱组件 (`.tsx` 文件) 放在 `pages/api/render-image/` 目录下，被当作路由处理

**解决方案：**
将装裱组件移到 `src/lib/render-image/` 目录：
```
pages/api/render-image/mountings/*.tsx
→ src/lib/render-image/*.tsx
```

---

### 错误 6: _worker.js 文件找不到

**错误信息：**
```
Could not resolve "/home/runner/.../.vercel/output/static/_worker.js/index.js"
```

**原因：**
`@cloudflare/next-on-pages` 没有正确生成 Cloudflare Pages 需要的 `_worker.js` 文件

**解决方案：**
- 确保 GitHub Actions 中运行 `npx @cloudflare/next-on-pages`
- 设置 `NPM_FLAGS: --legacy-peer-deps` 环境变量

---

## 核心经验总结

### 1. 版本选择

**最稳定的配置：**
```
Next.js: 13.4.19
@cloudflare/next-on-pages: 1.13.16
使用 Pages Router（不是 App Router）
```

**避免的版本：**
- Next.js 14.3+ - 强制使用 async_hooks
- Next.js 15.x - 同上
- Next.js 12.x - @cloudflare/next-on-pages 不支持

### 2. 架构选择

**必须使用 Pages Router：**
```
pages/
├── _app.tsx
├── index.tsx
├── api/
│   ├── check-env.ts
│   ├── generate-poem.ts
│   └── render-image.ts
```

**不能使用 App Router：**
- `src/app/` 目录结构会触发 async_hooks
- 如果项目使用了 App Router，需要迁移到 Pages Router

### 3. API 路由配置

**每个 API 路由都必须包含：**
```typescript
export const config = {
  runtime: 'edge',
};
```

### 4. 依赖管理

**使用 .npmrc 文件：**
```
legacy-peer-deps=true
```

**在 CI/CD 中：**
```yaml
- name: Install dependencies
  run: npm install --legacy-peer-deps
```

### 5. 文件组织

**组件不要放在 pages/api/ 下：**
- `pages/api/` 只存放 API 路由文件
- 组件放在 `src/lib/` 或 `src/components/`

### 6. 部署流程

**推荐使用 GitHub Actions：**
1. push 到 GitHub
2. GitHub Actions 自动触发
3. 运行构建和部署
4. Cloudflare Pages 自动更新

---

## 手动部署步骤（可选）

如果需要在本地手动部署：

```bash
# 1. 安装依赖
npm install --legacy-peer-deps

# 2. 构建 Next.js
npm run build

# 3. 生成 Cloudflare Pages 构建输出
npx @cloudflare/next-on-pages

# 4. 部署到 Cloudflare Pages
wrangler pages deploy .vercel/output/static --project-name=your-project-name
```

---

## 环境变量配置

在 Cloudflare Pages 设置中添加以下环境变量：

```
AI_API_KEY=your_openai_api_key
AI_BASE_URL=your_api_base_url
AI_MODEL_NAME=gpt-4
AI_TIMEOUT=120000
```

---

## 故障排查清单

如果部署失败，按以下顺序检查：

- [ ] Next.js 版本是 13.4.19
- [ ] 使用 Pages Router（不是 App Router）
- [ ] 所有 API 路由包含 `runtime: 'edge'` 配置
- [ ] `.npmrc` 文件包含 `legacy-peer-deps=true`
- [ ] `tailwind.config.ts` 包含 `./pages/**/*.{js,ts,jsx,tsx,mdx}`
- [ ] 组件文件不在 `pages/api/` 目录下
- [ ] GitHub Actions 使用 `npm install --legacy-peer-deps`

---

## 相关资源

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [@cloudflare/next-on-pages GitHub](https://github.com/cloudflare/next-on-pages)
- [Next.js Edge Runtime 文档](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)

---

## 更新日志

- **2025-01-14**: 初始文档，记录完整的部署流程和问题解决方案
