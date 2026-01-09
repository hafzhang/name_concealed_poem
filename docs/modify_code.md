# 代码修改文档：实现风格扩展与多行诗生成

本文档详细说明如何根据设计图（UI截图）修改现有代码，以支持更丰富的风格选择和多行诗生成功能。

## 一、 前端修改 (`src/app/page.tsx`)

### 1. 扩展风格选项（分类展示）
修改 `src/app/page.tsx` 中的风格列表，使用分类结构展示，每个分类可独立展开/收起。

**修改位置**：
查找 `['清新婉约', '豪放旷达', '空灵禅意', '边塞苍凉', '田园闲适']` 所在的数组。

**修改代码**：
```typescript
// 定义分类风格列表
const STYLE_CATEGORIES = {
  气质风格: ['温文尔雅', '豪迈大气', '清新婉约', '儒雅风流', '空灵禅意', '田园闲适'],
  美好品质: ['蕙质兰心', '才华横溢', '气宇轩昂', '聪慧机智', '品德高尚'],
  祝福愿景: ['金榜题名', '财源广进', '前程似锦', '平安喜乐', '福寿安康', '心想事成'],
  情感主题: ['爱慕浪漫', '怀念思亲', '友情唱和', '情深意重'],
  节日时令: ['节日时令', '新春佳节', '中秋团圆', '端午安康'],
  特定场景: ['毕业离别', '新婚燕尔', '生日快乐']
};

// 在组件内添加展开状态（每个分类独立控制）
const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
  气质风格: true,  // 默认展开第一个分类
});

// 切换分类展开状态
const toggleCategory = (category: string) => {
  setExpandedCategories(prev => ({
    ...prev,
    [category]: !prev[category]
  }));
};

// 在渲染部分替换原有的风格选择
<div className="space-y-4">
  {/* 标题栏带蓝色竖线 */}
  <div className="flex items-center gap-2">
    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
    <h3 className="font-medium text-stone-800">风格</h3>
  </div>

  {/* 自定义按钮 */}
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      setStyleKeyword('');
    }}
    className={cn(
      "px-4 py-2 rounded-lg text-sm border transition-colors w-full",
      !styleKeyword && "bg-stone-800 text-white border-stone-800"
    )}
  >
    自由输入风格
  </button>

  {/* 按分类渲染风格选项 */}
  {Object.entries(STYLE_CATEGORIES).map(([category, styles]) => (
    <div key={category} className="space-y-2">
      {/* 分类标题（可点击展开/收起） */}
      <button
        type="button"
        onClick={() => toggleCategory(category)}
        className="flex items-center justify-between w-full text-left px-2 py-1 hover:bg-stone-50 rounded"
      >
        <span className="text-sm font-medium text-stone-700">{category}</span>
        <span className={cn(
          "text-stone-400 transition-transform",
          expandedCategories[category] ? "rotate-180" : ""
        )}>
          ▼
        </span>
      </button>

      {/* 风格按钮网格 */}
      {expandedCategories[category] !== false && (
        <div className="grid grid-cols-4 gap-2">
          {styles.map((s) => (
            <button
              key={s}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setStyleKeyword(s);
              }}
              className={cn(
                "px-3 py-2 rounded-lg text-sm border transition-colors cursor-pointer select-none",
                styleKeyword === s
                  ? "bg-stone-800 text-white border-stone-800"
                  : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  ))}
</div>
```

### 2. 添加“几行诗”选择功能
需要新增状态变量来存储行数选择，并在界面上添加选择按钮。
默认 4行诗句。
如果名字是3个字或者4个字，但是选择2行诗句，那么就取出名字后面的两个字作诗。

**修改位置**：
1.  在组件顶部添加状态：
    ```typescript
    const [lineCount, setLineCount] = useState<number>(4); // 默认4行
    ```
2.  在风格选择区域下方，添加“几行诗”选择区：

**修改代码**：
```typescript
<div className="space-y-4 mt-6">
  {/* 标题栏带蓝色竖线 */}
  <div className="flex items-center gap-2">
    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
    <h3 className="font-medium text-stone-800">几行诗</h3>
  </div>

  <div className="flex gap-3">
    <button
       type="button"
       className="px-4 py-2 rounded-lg border bg-white text-stone-600 border-stone-200 w-24" // 固定宽度
       onClick={() => alert('暂支持固定行数，自定义功能待开发')} 
    >
      自定义
    </button>
    {[2, 4, 6].map((num) => (
      <button
        key={num}
        type="button"
        onClick={() => setLineCount(num)}
        className={cn(
          "px-4 py-2 rounded-lg border text-sm transition-all flex-1",
          lineCount === num
            ? "bg-stone-800 text-white border-stone-800"
            : "bg-white text-stone-600 border-stone-200 hover:border-stone-400"
        )}
      >
        {num}行
      </button>
    ))}
  </div>
</div>
```

### 3. 名字处理逻辑（前端）
在发送请求前，根据行数选择处理名字。

**处理规则**：
- **默认4行**：使用完整名字
- **2行诗**：如果名字是3-4个字，取**最后两个字**；如果名字是2个字，使用完整名字
- **6行诗**：使用完整名字

**修改代码**：
在 `handleGeneratePoem` 函数开头添加名字处理逻辑：

```typescript
// 根据行数处理名字
const getProcessedName = (originalName: string, lineCount: number): string => {
  if (lineCount === 2 && originalName.length >= 3) {
    // 2行诗：取名字最后两个字
    return originalName.slice(-2);
  }
  // 其他情况使用完整名字
  return originalName;
};

// 在 handleGeneratePoem 函数中使用
const processedName = getProcessedName(name, lineCount);

console.log(`原始名字: ${name}, 行数: ${lineCount}, 处理后名字: ${processedName}`);
```

### 4. 传递参数给后端
修改 `handleGeneratePoem` 函数，将 `lineCount` 和 `processedName` 包含在请求体中。

**修改代码**：
```typescript
const res = await fetch('/api/generate-poem', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: processedName,  // 使用处理后的名字
    originalName: name,    // 保留原始名字用于显示
    style,
    styleKeyword,
    lineCount
  })
});
```

---

## 二、 后端修改 (`src/app/api/generate-poem/route.ts`)

### 1. 接收并处理参数
后端需要接收 `lineCount` 和 `name`（前端已处理过的名字）。

**重要**：前端已经处理好了名字长度与行数的匹配关系，后端只需要直接使用接收到的 `name` 即可。

**修改位置**：
`POST` 函数内部。

**修改代码**：
```typescript
export async function POST(req: Request) {
  try {
    const { name, originalName, style, styleKeyword, lineCount = 4 } = await req.json();

    // 注意：name 是前端已经处理过的名字，与 lineCount 匹配
    // - lineCount=2 时，name 长度一定是 2
    // - lineCount=4 时，name 长度可能是 2-4
    // - lineCount=6 时，name 长度可能是 2-4
    //
    // 后端无需判断名字长度，直接使用即可

    // ... 校验逻辑 ...

    // 动态构建 Prompt（根据行数调整格式）
    let formatInstruction = "五言绝句";
    let lineInstruction = "共四句。";

    if (lineCount === 2) {
      formatInstruction = "五言对联";
      lineInstruction = "共两句。";
    } else if (lineCount === 6) {
      formatInstruction = "六句五言诗";
      lineInstruction = "共六句。";
    }
    // lineCount === 4 时使用默认值

    const prompt = `你是一个国学大师。请为"${name}"创作一首${formatInstruction}藏头诗。

要求：
1. 必须是藏头诗，${lineInstruction}每句的第一个字依次是"${name}"中的字。
2. 意境：${literaryStyle}，要求意境优美、寓意深远、格调高雅
3. 内容：整体积极向上，含赞美、祝福或美好期许之意
4. 语义：诗句之间衔接自然，前后贯通，避免生硬拼凑

【返回格式】
仅返回纯JSON对象，不要添加任何解释性文字：
{
    "poem": ["第一句", "第二句", ...],
    "explanation": "对这首诗的简短意境赏析"
}`;

    // ... 后续 OpenAI 调用代码 ...
```

### 2. 返回原始名字（用于显示）
在后端返回数据时，保留 `originalName` 以便前端显示时使用原始完整名字。

**修改代码**：
```typescript
return NextResponse.json({
  success: true,
  data: {
    poem: parsed.poem,
    explanation: parsed.explanation,
    originalName: originalName || name,  // 返回原始名字用于显示
    processedName: name,                 // 返回处理后的名字
    lineCount
  }
});
```

## 三、 名字处理逻辑说明

### 处理规则示例

| 原始名字 | 选择行数 | 传给AI的名字 | 说明 |
|---------|---------|-------------|------|
| 张三 | 2行 | 张三 | 2字名字，用完整名字 |
| 李小明 | 2行 | 小明 | 3字名字，取最后2字 |
| 欧阳修 | 2行 | 阳修 | 3字名字，取最后2字 |
| 慕容复 | 2行 | 容复 | 4字名字，取最后2字 |
| 张三 | 4行 | 张三 | 使用完整名字 |
| 李小明 | 4行 | 李小明 | 使用完整名字 |
| 张三 | 6行 | 张三 | 使用完整名字 |
| 李小明 | 6行 | 李小明 | 使用完整名字 |

### 代码逻辑流程

```
用户输入名字 → 用户选择行数
       ↓
   前端处理逻辑
       ↓
   lineCount === 2 && name.length >= 3 ?
   取 name.slice(-2) : 使用完整名字
       ↓
   发送 { name: 处理后名字, originalName: 原名字, lineCount }
       ↓
   后端接收并生成藏头诗（直接使用name，无判断）
       ↓
   返回 { poem, explanation, originalName, processedName, lineCount }
       ↓
   前端显示（使用 originalName 标题，展示藏头诗）
```

### 优势

1. **Prompt 更简洁** - AI 专注于写诗，不做逻辑判断
2. **可控性更强** - 名字处理逻辑在前端，易于调试
3. **降低 Token 消耗** - Prompt 更短，成本更低
4. **生成质量更高** - 指令更清晰，减少歧义

## 四、 注意事项

1.  **前端处理优势**：
    *   名字处理在前端完成，用户可以立即看到最终效果
    *   后端逻辑简化，只需要接收处理好的名字即可
    *   减少AI Prompt复杂度，提高生成质量

2.  **图片渲染适配**：
    *   目前的图片生成 (`render-image`) 可能针对 4 行诗进行了硬编码布局（如高度计算）。
    *   如果生成 2 行或 6 行诗，可能需要检查 `src/app/api/render-image/route.ts` 或相关装裱组件，确保文字不会溢出或留白过多。
    *   *建议*：在 `render-image` 中根据 `poem.length` 动态调整字体大小或容器高度。

2.  **Satori 渲染限制**：
    *   如果 6 行诗导致内容过长，Satori 可能会截断。建议针对 6 行诗稍微减小字号。
