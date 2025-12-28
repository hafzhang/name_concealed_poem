# 姓名藏诗·国风书法生成器 - 开发指南 (Development Guide)

本文档基于 `product_document.TXT` 编写，旨在为开发人员提供精确的实施细节。

---

## 1. 技术栈与环境 (Tech Stack)

### 核心框架
*   **Framework**: Next.js 14+ (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS + Shadcn/ui (Radix UI)
*   **Database**: Supabase (PostgreSQL)
*   **AI Provider**: DeepSeek V3 / OpenAI (兼容 OpenAI SDK)

### 图像引擎 (Satori)
*   **Core**: `satori` (HTML/CSS -> SVG)
*   **Rasterizer**: `@resvg/resvg-js` (SVG -> PNG)
*   **Fonts**: 需准备 `.ttf` / `.otf` 格式的免费商用字体文件。

### 目录结构规划
```bash
/app
  /api
    /generate-poem   # 文本生成 API
    /render-image    # 图片渲染 API
  /components
    /ui              # Shadcn 组件
    /feature         # 业务组件 (PoemCard, StyleSelector)
  /lib
    /supabase        # DB 客户端
    /ai              # LLM 调用封装
    /fonts           # 本地字体文件 (用于 Satori)
  /types             # TS 类型定义
```

---

## 2. 数据库设计 (Database Schema)

请直接在 Supabase SQL Editor 中运行以下命令建立数据表。

```sql
-- 1. 开启 UUID 扩展
create extension if not exists "uuid-ossp";

-- 2. 用户表 (Users) - 支持匿名游客
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  guest_id text unique, -- 浏览器指纹/LocalStorage ID (必需)
  openid text unique, -- 微信/三方登录 ID (可选)
  email text unique, -- 邮箱 (可选)
  credits int default 3, -- 免费次数
  is_vip boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. 诗词生成记录表 (Poems)
create table public.poems (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id), -- 关联到 Users 表 (即使是游客也有 User 记录)
  input_name text not null,
  poem_content jsonb not null, 
  style_config jsonb, 
  image_url text, 
  status text check (status in ('draft', 'completed')) default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. 索引优化
create index idx_poems_user_id on public.poems(user_id);
create index idx_poems_input_name on public.poems(input_name); -- 用于缓存查询
```

---

## 3. 环境变量 (.env.local)

```ini
# AI 模型配置 (以 DeepSeek 为例)
AI_API_KEY="sk-xxxx"
AI_BASE_URL="https://api.deepseek.com"
AI_MODEL_NAME="deepseek-chat"

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" # 仅用于后端 API (写入权限)
```

---

## 4. API 接口详解

### 4.1 生成藏头诗 (Step 1)
*   **Path**: `/api/generate-poem`
*   **Method**: `POST`

#### 逻辑流程
1.  **校验**: 检查用户 `credits > 0`。
2.  **缓存查重**: `SELECT * FROM poems WHERE input_name = ? AND status = 'completed'`。如果有，直接返回旧数据 (cached: true)。
3.  **调用 LLM**: 发送 System Prompt，强制 JSON 输出。
4.  **入库**: 插入 `poems` 表，状态为 `draft`。
5.  **扣费**: 暂时不扣费，生成图片时再扣（或者在此处预扣）。*建议：生成文本暂不扣费，防止生成质量差用户投诉，生成图片确认后扣费。*

#### Prompt Template (Dynamic Construction)

建议根据姓名长度动态构建 Prompt，以获得最佳效果。

```javascript
const generateSystemPrompt = (name, style) => {
  const nameLength = name.length;
  let headInstructions = "";
  
  // 针对不同字数的处理策略
  if (nameLength === 2) {
    headInstructions = "前两句首字必须依次为姓名中的字。后两句首字可结合意境自由发挥，或呼应主题，但必须保持五言绝句格式。";
  } else if (nameLength === 3) {
    headInstructions = "前三句首字必须依次为姓名中的字。第四句首字可自由发挥，起到收尾作用。";
  } else {
    // 4字或更多（通常截取前4字）
    headInstructions = "四句首字必须依次对应姓名中的四个字（若多于4字，取前4字）。";
  }

  return `
角色：精通中国传统文化、格律诗词的国学大师。
任务：为姓名 "${name}" 创作一首五言藏头诗（五言绝句）。

核心要求：
1. **藏头约束**：${headInstructions}
2. **格律要求**：
   - 严格遵守五言绝句格律。
   - 押韵（建议平水韵），韵脚自然。
   - 对仗工整，平仄协调。
3. **内容风格**：
   - 风格定位：${style}。
   - 意象选择：请根据风格选择合适的古典意象（如：若风格为“豪放”，可用“长剑、烈酒、关山”；若为“婉约”，可用“落花、流水、明月”）。
   - **绝对禁止**：出现现代词汇（如“手机、电脑、快乐”等大白话），必须文辞优美。
4. **输出格式**：
   - 必须返回纯 JSON 格式，不要包含 Markdown 代码块标记。
   - JSON 结构：
     {
       "poem": ["第一句", "第二句", "第三句", "第四句"],
       "explanation": "20字以内的简短唯美释义，解释诗中意象与名字的关联。"
     }
`;
};
```

### 4.2 生成书法图片 (Step 2)
*   **Path**: `/api/render-image`
*   **Method**: `POST`
*   **Body**: 
    ```json
    {
      "poem": [...], 
      "style": "kaishu", 
      "bg": "rice_paper", 
      "frame": "silk_scroll" // 对应产品文档的装裱选项
    }
    ```
    *   **Frame Options (装裱)**:
        *   `none`: 无框
        *   `silk_scroll`: 绫罗卷轴
        *   `redwood`: 红木画框
        *   `golden_wood`: 金丝楠木
        *   `cloud_brocade`: 云纹锦缎
        *   `modern_black`: 极简黑框

#### 逻辑流程 (Critical Logic Fixes)
1.  **接收参数**: `poem_id` (关联上一步的记录) 或 直接传 `poem` 数组 + `style` 配置。
2.  **前置校验 (Atomic Check)**: 
    *   **关键点**: 在开始渲染图片之前，必须**先检查并锁定**用户的积分。
    *   *SQL*: `UPDATE users SET credits = credits - 1 WHERE id = ? AND credits > 0 RETURNING id`。
    *   如果更新返回空，说明积分不足，直接报错，**不执行后续昂贵的渲染操作**。
3.  **Satori 渲染**:
    *   加载字体文件 (fs.readFileSync)。
    *   构建 React Element (HTML 结构)。
    *   **装裱处理**: 若 `frame` 不为空，则在外层包裹一个 Flex 容器，设置 `backgroundImage` 为边框素材，并增加 `padding`。
    *   `satori(element, { width: 800, height: 1200, fonts: [...] })` -> SVG。
4.  **Resvg 转图**: `new Resvg(svg).render().asPng()` -> Buffer。
5.  **上传存储**: Upload Buffer to Supabase Storage -> 获取 Public URL。
6.  **更新记录**: Update `poems` set `image_url = url, status = 'completed'`。
7.  **异常回滚**: 如果步骤 3-6 失败，必须把积分退还给用户 (`UPDATE users SET credits = credits + 1 ...`)。

#### Satori 布局伪代码 (含装裱)
```jsx
// 资源映射表
const FRAMES = {
  silk_scroll: { bg: 'url(silk_border.jpg)', padding: '40px', shadow: 'none' },
  redwood: { bg: 'url(redwood_frame.png)', padding: '20px', shadow: 'inset 0 0 20px rgba(0,0,0,0.5)' },
  golden_wood: { bg: 'url(golden_wood.png)', padding: '25px', shadow: '0 5px 15px rgba(0,0,0,0.2)' },
  cloud_brocade: { bg: 'url(cloud_brocade.png)', padding: '50px', shadow: 'none' },
  modern_black: { border: '10px solid #1a1a1a', padding: '10px', shadow: '0 0 0 1px #333' },
  none: { padding: '0px' }
};

const frameConfig = FRAMES[frame] || FRAMES.none;

// Frame Layer (外层装裱)
<div style={{ 
  display: 'flex', 
  width: '100%', height: '100%', 
  backgroundImage: frameConfig.bg,
  border: frameConfig.border,
  padding: frameConfig.padding,
  justifyContent: 'center', alignItems: 'center',
  backgroundColor: '#f5f5f5' // 兜底背景色
}}>
  // Paper Layer (宣纸核心区)
  <div style={{ 
    display: 'flex', flexDirection: 'column', alignItems: 'center', 
    width: '100%', height: '100%',
    backgroundImage: 'url(rice_paper.jpg)',
    boxShadow: frameConfig.shadow || '0 0 10px rgba(0,0,0,0.3)' // 默认纸张阴影
  }}>
    {/* 诗句竖排容器 */}
    <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: '20px', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {poemLines.map(line => (
        <div style={{ display: 'flex', flexDirection: 'column', fontFamily: 'MaoBiFont', fontSize: '48px', lineHeight: '1.2' }}>
          {line.split('').map(char => <span>{char}</span>)}
        </div>
      ))}
    </div>
    {/* 落款 */}
    <div style={{ position: 'absolute', bottom: 50, left: 50, fontFamily: 'KaiTi', fontSize: '24px', opacity: 0.8 }}>
      {name} 题于 乙巳年
    </div>
  </div>
</div>
```

---

## 5. 前端开发指南

### 5.1 状态管理 (Zustand / React Context)
建议使用简单的 `useState` 组合即可，或者 Zustand。

```typescript
type AppState = {
  step: 'input' | 'generating_poem' | 'poem_review' | 'generating_image' | 'result';
  inputName: string;
  poemData: { poem: string[], explanation: string } | null;
  imageUrl: string | null;
};
```

### 5.2 核心组件
1.  **InputSection**:
    *   包含 NameInput (Regex 校验中文)
    *   StyleSelector (Radio Group)
2.  **PoemReviewCard**:
    *   展示生成的诗句。
    *   提供 "重新生成" (Re-roll) 和 "生成书法" (Next) 按钮。
    *   *高级功能：允许用户点击修改诗句中的某个字。*
3.  **ResultCard**:
    *   展示最终图片。
    *   "长按保存" / "下载" 按钮。

---

## 6. 资源准备清单
1.  **字体文件**:
    *   `AlimamaDongFangDaKai.ttf` (阿里妈妈东方大楷 - 免费商用)
    *   `MaShanZheng.ttf` (马善政毛笔楷书 - Google Fonts 免费)
2.  **背景素材**:
    *   `rice_paper_01.jpg` (米黄宣纸)
    *   `red_paper_02.jpg` (洒金红纸)
    *   *需存放在 `/public/assets/bg/`*

---

## 7. 风险与注意事项
1.  **Vercel Serverless Timeout**: Satori 生成图片可能超过 10s。
    *   *解决方案*: 尽量优化字体大小，或者将 API `maxDuration` 设置为 60s (Pro 账号)；免费账号需保持代码轻量。
2.  **字体体积**: 中文字体动辄 5-10MB。
    *   *解决方案*: 使用 `font-spider` 或 `subset-font` 进行**字体截取** (Subset)，只保留常用 3500 字，将体积压到 500KB 左右。**这一步对于 Serverless 环境至关重要！**

---

## 8. 用户身份与登录策略 (Identity Strategy)

采用 **“极简游客模式” (Guest-First)**，最大化降低门槛。

### 8.1 核心原则
*   **默认不登录**：用户进入即可生成、预览、下载低清图。
*   **不强制绑定**：即使需要付费，如果支付渠道（如微信支付）能返回唯一 ID，也可以继续维持“匿名状态”。

### 8.2 触发登录/绑定的时机
仅在以下 2 种场景下，**引导**（而非强制）用户绑定手机/微信：

1.  **场景 A：跨设备找回记录**
    *   *用户行为*：点击“我的作品” -> “同步/找回”。
    *   *文案*：“绑定手机号，在任何设备上都能看到你的作品。”
2.  **场景 B：大额付费/订阅 (可选)**
    *   *用户行为*：购买“终身会员”或“大额套餐”。
    *   *原因*：防止用户清理浏览器缓存后丢失权益。
    *   *策略*：小额单次购买（如 3 元）可不登录（直接绑定到游客 ID）；大额购买前弹窗提示绑定。

### 8.3 游客 ID 实现细节
*   前端生成 UUID (`guest_uuid`) 存入 `localStorage`。
*   API 请求头携带 `X-Guest-ID: guest_uuid`。
*   后端根据 `guest_uuid` 在 `Users` 表查找或新建记录。
