# 姓名藏诗·后端开发指南 (Backend Development Guide) - Pure Next.js 版

本文档基于 **Pure Next.js (Serverless)** 架构编写。鉴于本项目仅需调用标准 LLM API，采用全栈 Next.js 方案可大幅降低部署复杂度，实现**零运维成本**。

---

## 1. 系统架构 (System Architecture)

### 架构优势
*   **单体仓库 (Monorepo)**: 前后端同属一个项目，共享 TypeScript 类型定义。
*   **Serverless 部署**: 直接托管于 Vercel，无需管理服务器或 Python 进程。
*   **安全性**: API Key 存储在 Vercel 环境变量中，通过服务端 API 调用，前端不可见。

### 数据流向
```mermaid
graph TD
    User[用户前端] -->|1. POST /api/generate-poem| API_Poem[API: 文本生成]
    API_Poem -->|2. 鉴权 & 查重| DB[(Supabase)]
    API_Poem -->|3. 调用 LLM SDK| LLM[DeepSeek / OpenAI]
    API_Poem -->|4. 返回 JSON| User
    
    User -->|5. POST /api/render-image| API_Image[API: 图片渲染]
    API_Image -->|6. 扣除积分 (Atomic)| DB
    API_Image -->|7. Satori 渲染 SVG| Engine[Satori Engine]
    API_Image -->|8. Resvg 转 PNG| Engine
    API_Image -->|9. 上传存储| Storage[Supabase Storage]
    API_Image -->|10. 返回图片 URL| User
```

---

## 2. 核心技术栈

*   **Runtime**: Node.js 18+ (Next.js App Router)
*   **LLM SDK**: `openai` (Node.js version) - 兼容 DeepSeek
*   **Image Engine**: `satori` + `@resvg/resvg-js`
*   **Database**: `supabase-js`

---

## 3. 环境变量配置 (.env.local)

无需 Python 的 .env，直接在 Next.js 中配置。

```ini
# AI 模型配置
AI_API_KEY="sk-xxxxxxxx"
AI_BASE_URL="https://api.deepseek.com"
AI_MODEL_NAME="deepseek-chat"

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-key" # 用于后端扣费等特权操作
```

---

## 4. 接口开发指南

### 4.1 文本生成 (`src/app/api/generate-poem/route.ts`)

直接在 Route Handler 中调用 OpenAI SDK。

```typescript
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

// 初始化 (建议提取到 lib/ai.ts)
const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

export async function POST(req: Request) {
  const { name, style } = await req.json();

  // 1. 构造 Prompt
  const  = `角色：国学大师。任务：为"${name}"写一首藏头诗...`; // (参考产品文档)

  try {
    // 2. 调用 LLM
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL_NAME || 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: "json_object" } // 强制 JSON (如果模型支持)
    });

    const content = JSON.parse(completion.choices[0].message.content);

    // 3. 存入 Supabase (可选，用于缓存)
    // await supabase.from('poems').insert(...)

    return Response.json({ success: true, data: content });
    
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

### 4.2 图片渲染 (`src/app/api/render-image/route.ts`)

保持原设计，利用 Satori 在服务端生成图片。

**关键优化**:
*   字体文件建议放在 `public/fonts` 或项目根目录，读取时使用 `process.cwd()` 获取绝对路径。
*   Vercel Serverless 函数有 50MB 大小限制，尽量使用裁剪过的字体文件 (Subset Font)。

---

## 5. 数据库 Schema (保持不变)

```sql
create table public.poems (
  id uuid primary key default uuid_generate_v4(),
  input_name text not null,
  poem_content jsonb not null, 
  status text default 'draft',
  created_at timestamp with time zone default now()
);
```

---

## 6. 为什么放弃 Python？

1.  **减少维护**: 不用管 `pip install`，不用管 Python 版本兼容性。
2.  **原子性**: 可以在同一个 Next.js 事务中处理“扣费”和“生成”，一旦出错更容易回滚，不需要跨服务通信。
3.  **部署快**: `git push` 即上线，无需配置 Docker 或 Procfile。

---

## 7. 立即执行计划

1.  **删除 `python_backend` 文件夹** (如果已创建)。
2.  **安装 Node.js 依赖**:
    ```bash
    npm install openai satori @resvg/resvg-js @supabase/supabase-js
    ```
3.  **修改 `api/generate-poem/route.ts`**: 将之前的 Mock 代码替换为真实的 OpenAI SDK 调用。

