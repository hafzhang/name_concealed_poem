# 项目代码改进方案

## 项目概述

这是一个基于 Next.js 14 的藏头诗生成应用，支持多种书法风格和装裱样式。

**技术栈**:
- Next.js 14.2.16 (App Router)
- TypeScript
- Tailwind CSS + Framer Motion
- Satori + @resvg/resvg-js (字体渲染)
- OpenAI API
- Jest + React Testing Library

---

## 一、高优先级改进项

### 1. 安全性问题

#### 1.1 API 认证与限流
**问题**: API 路由缺乏认证机制和频率限制
**位置**: `src/app/api/generate-poem/route.ts`, `src/app/api/render-image/route.ts`

**改进方案**:
```typescript
// 添加请求频率限制
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

// 在 API 处理函数中
const { success } = await ratelimit.limit(userId);
if (!success) {
  return NextResponse.json({ error: "请求过于频繁" }, { status: 429 });
}
```

#### 1.2 环境变量管理
**问题**: 缺少 `.env.example` 模板，环境变量验证不足

**改进方案**:
- 创建 `.env.example` 文件
- 使用 `zod` 验证环境变量

```typescript
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  AI_API_KEY: z.string().min(1),
  AI_BASE_URL: z.string().url().optional(),
  AI_MODEL_NAME: z.string().default('gpt-4'),
  AI_TIMEOUT: z.string().default('60000'),
});

export const env = envSchema.parse(process.env);
```

---

### 2. 性能优化

#### 2.1 字体加载优化
**问题**: 每次请求都重新加载字体，影响性能
**位置**: `src/app/api/render-image/route.ts`

**改进方案**:
```typescript
// 添加字体缓存
let cachedFonts: Map<string, ArrayBuffer> | null = null;

async function loadFontsOnce() {
  if (cachedFonts) return cachedFonts;

  cachedFonts = new Map();
  const fontPaths = {
    notoSerifSC: '/fonts/NotoSerifSC-Bold.otf',
    maShanZheng: '/fonts/MaShanZheng-Regular.ttf',
  };

  for (const [name, path] of Object.entries(fontPaths)) {
    const buffer = await readFile(join(process.cwd(), 'public', path));
    cachedFonts.set(name, buffer);
  }

  return cachedFonts;
}
```

#### 2.2 图片缓存机制
**问题**: 生成的图片没有缓存，重复请求浪费资源

**改进方案**:
- 使用 Redis 缓存生成的图片
- 设置合理的缓存过期时间（如 24 小时）

---

### 3. 代码质量

#### 3.1 组件拆分
**问题**: `src/app/page.tsx` 过大（351 行），职责不清晰

**改进方案**:
```
src/components/
├── PoemGenerator/
│   ├── NameInput.tsx       # 姓名输入组件
│   ├── StyleSelector.tsx   # 风格选择组件
│   ├── LineCountSelector.tsx  # 行数选择组件
│   ├── PoemDisplay.tsx     # 诗歌展示组件
│   └── ImageDownloader.tsx # 图片下载组件
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Card.tsx
```

#### 3.2 类型定义完善
**问题**: 部分组件缺少严格的类型定义

**改进方案**:
```typescript
// src/types/poem.ts
export interface PoemRequest {
  name: string;
  originalName?: string;
  style: FontStyle;
  styleKeyword?: string;
  lineCount: 2 | 4 | 6;
}

export interface PoemResponse {
  success: boolean;
  data?: {
    poem: string[];
    explanation: string;
    originalName: string;
    processedName: string;
    lineCount: number;
    cached: boolean;
  };
  error?: string;
}

export type FontStyle = 'kaishu' | 'xingshu' | 'caoshu' | 'lishu' | 'shoujin' | 'niaochong';
```

---

## 二、中优先级改进项

### 1. 配置化改造

#### 1.1 风格配置提取
**问题**: 风格映射硬编码在代码中
**位置**: `src/app/api/generate-poem/route.ts:13-20`

**改进方案**:
```typescript
// src/config/poem-styles.ts
export const POEM_STYLES = {
  kaishu: { label: '楷书', literary: '端正平实' },
  xingshu: { label: '行书', literary: '飘逸洒脱' },
  caoshu: { label: '草书', literary: '豪放狂野' },
  lishu: { label: '隶书', literary: '古朴典雅' },
  shoujin: { label: '瘦金', literary: '清冷孤傲' },
  niaochong: { label: '鸟虫', literary: '华丽绮靡' }
} as const;
```

#### 1.2 装裱样式配置
**问题**: 装裱组件代码重复度高

**改进方案**:
- 将装裱样式抽取为配置文件
- 使用数据驱动的方式生成组件

---

### 2. 错误处理优化

#### 2.1 统一错误处理
**问题**: 错误处理方式不一致

**改进方案**:
```typescript
// src/lib/api-error.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  // 未知错误
  return NextResponse.json(
    { success: false, error: '服务器内部错误' },
    { status: 500 }
  );
}
```

#### 2.2 添加错误边界
**问题**: 前端缺少错误边界处理

**改进方案**:
```typescript
// src/app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2>出错了</h2>
        <p>{error.message}</p>
        <button onClick={reset}>重试</button>
      </div>
    </div>
  );
}
```

---

### 3. 测试完善

**问题**: 测试覆盖率低，仅有 1 个测试文件

**改进方案**:
```typescript
// src/__tests__/api/generate-poem.test.ts
import { POST } from '@/app/api/generate-poem/route';

describe('Poem Generation API', () => {
  it('should generate poem with valid name', async () => {
    const request = new Request('http://localhost:3000/api/generate-poem', {
      method: 'POST',
      body: JSON.stringify({ name: '李白', style: 'kaishu', lineCount: 4 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.poem).toHaveLength(4);
  });

  it('should reject name with less than 2 characters', async () => {
    const request = new Request('http://localhost:3000/api/generate-poem', {
      method: 'POST',
      body: JSON.stringify({ name: '李', style: 'kaishu', lineCount: 4 }),
    });

    const response = await POST(request);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: '名字至少需要2个字符'
    });
  });
});
```

---

## 三、低优先级改进项

### 1. 用户体验增强

- 添加加载骨架屏
- 实现暗色模式
- 添加动画过渡效果
- 支持图片分享功能
- 添加历史记录功能

### 2. 功能扩展

- 支持自定义Prompt
- 添加更多字体选择
- 支持多种图片格式导出
- 添加诗歌收藏功能
- 实现批量生成

### 3. 开发体验

- 添加 ESLint 规则
- 配置 Prettier
- 添加 Git Hooks (husky)
- 完善 README 文档

---

## 四、具体修改建议

### 最近需要修改的问题

#### 1. 主组件拆分
**文件**: `src/app/page.tsx`

将 351 行的大组件拆分为:
- `NameInput` - 姓名输入
- `StyleSelector` - 风格选择
- `PoemCard` - 诗歌卡片展示
- `ImageActions` - 图片操作按钮

#### 2. 提取常量配置
**创建**: `src/config/constants.ts`

```typescript
export const FONT_STYLES = [
  { value: 'kaishu', label: '楷书' },
  { value: 'xingshu', label: '行书' },
  // ...
] as const;

export const LINE_COUNTS = [
  { value: 2, label: '对联' },
  { value: 4, label: '绝句' },
  { value: 6, label: '六句' },
] as const;
```

#### 3. 环境变量验证
**创建**: `src/lib/env.ts`

使用 zod 验证所有环境变量，启动时检查配置完整性。

#### 4. 添加 API 限流
**位置**: `src/middleware.ts`

```typescript
export async function middleware(request: NextRequest) {
  // IP 限流逻辑
  // 防止 API 滥用
}
```

---

## 五、技术债务清单

| 优先级 | 问题 | 影响 | 建议处理时间 |
|--------|------|------|--------------|
| 高 | 缺少 API 认证 | 安全风险 | 立即 |
| 高 | 字体重复加载 | 性能问题 | 1周内 |
| 高 | 组件过大 | 可维护性 | 1周内 |
| 中 | 缺少错误边界 | 用户体验 | 2周内 |
| 中 | 测试覆盖率低 | 代码质量 | 2周内 |
| 中 | 配置硬编码 | 可维护性 | 2周内 |
| 低 | 缺少暗色模式 | 用户体验 | 有空时 |
| 低 | 注释不足 | 可读性 | 有空时 |

---

## 六、后续优化路线图

### Phase 1: 安全与稳定性 (1-2周)
- [ ] 添加环境变量验证
- [ ] 实现 API 限流
- [ ] 添加错误边界
- [ ] 完善错误处理

### Phase 2: 性能优化 (1-2周)
- [ ] 字体缓存
- [ ] 图片缓存
- [ ] 组件懒加载
- [ ] 优化包大小

### Phase 3: 代码重构 (2-3周)
- [ ] 组件拆分
- [ ] 配置化改造
- [ ] 类型定义完善
- [ ] 测试补充

### Phase 4: 功能增强 (按需)
- [ ] 暗色模式
- [ ] 历史记录
- [ ] 更多字体
- [ ] 分享功能
