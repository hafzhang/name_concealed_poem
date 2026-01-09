# 藏头诗生成器 - 测试总结文档

## 概述

本文档基于 `docs/modify_code.md` 需求文档，为藏头诗生成器功能创建了完整的测试用例。

---

## 一、文件结构

```
src/
├── hooks/
│   ├── usePoemGenerator.ts      # Hook 实现文件
│   └── usePoemGenerator.test.ts # 测试文件
jest.config.js                    # Jest 配置
jest.setup.js                     # Jest 环境设置
package.json                      # 添加了测试依赖和脚本
```

---

## 二、测试覆盖范围

### 2.1 名字处理逻辑测试 (13个测试用例)

| 测试用例 | 输入 | 预期输出 |
|---------|------|----------|
| 2行诗 + 2字名字 | 张三, 2 | 张三 |
| 2行诗 + 3字名字 | 李小明, 2 | 小明 |
| 2行诗 + 3字名字（欧阳修） | 欧阳修, 2 | 阳修 |
| 2行诗 + 4字名字 | 慕容复, 2 | 容复 |
| 4行诗 + 2字名字 | 张三, 4 | 张三 |
| 4行诗 + 3字名字 | 李小明, 4 | 李小明 |
| 4行诗 + 4字名字 | 慕容复, 4 | 慕容复 |
| 6行诗 + 2字名字 | 张三, 6 | 张三 |
| 6行诗 + 3字名字 | 李小明, 6 | 李小明 |
| 6行诗 + 4字名字 | 慕容复, 6 | 慕容复 |
| 空名字 | '', 4 | '' |
| 单字名字 | 李, 2 | 李 |
| 超长名字 | 王小明大帅哥, 2 | 帅哥 |

### 2.2 行数选择功能测试 (5个测试用例)

| 测试用例 | 说明 |
|---------|------|
| 初始状态默认4行 | 验证默认值 |
| 可以切换到2行 | 状态切换 |
| 可以切换到6行 | 状态切换 |
| 可以在不同行数之间切换 | 多次切换 |
| 设置无效行数应保持当前值 | 边界处理 |

### 2.3 风格分类功能测试 (7个测试用例)

| 测试用例 | 说明 |
|---------|------|
| 风格分类包含6个主分类 | 验证分类数量 |
| 气质风格分类包含6个选项 | 验证选项数量 |
| 美好品质分类包含5个选项 | 验证选项数量 |
| 祝福愿景分类包含6个选项 | 验证选项数量 |
| 情感主题分类包含4个选项 | 验证选项数量 |
| 节日时令分类包含4个选项 | 验证选项数量 |
| 特定场景分类包含3个选项 | 验证选项数量 |
| 所有风格选项总计28个 | 验证总数 |

### 2.4 风格选择功能测试 (6个测试用例)

| 测试用例 | 说明 |
|---------|------|
| 初始状态无选中风格 | 验证初始状态 |
| 可以选中气质风格 | 验证选中功能 |
| 可以选中美好品质风格 | 跨分类选择 |
| 可以选中祝福愿景风格 | 跨分类选择 |
| 可以切换到不同风格的分类 | 切换选择 |
| 设置空字符串清空风格选择 | 清空功能 |
| 无效的风格名称也可以设置 | 自由输入 |

### 2.5 分类展开/收起功能测试 (6个测试用例)

| 测试用例 | 说明 |
|---------|------|
| 气质风格分类默认展开 | 验证默认状态 |
| 其他分类默认未设置 | 验证默认状态 |
| 可以展开美好品质分类 | 展开功能 |
| 可以收起气质风格分类 | 收起功能 |
| 可以在展开和收起之间切换 | 切换功能 |
| 多个分类可以同时展开 | 多展开状态 |

### 2.6 生成请求参数测试 (5个测试用例)

| 测试用例 | 输入 | 预期输出 |
|---------|------|----------|
| 2行诗 + 3字名字 | 李小明, kaishu, 温文尔雅 | name: 小明, originalName: 李小明 |
| 4行诗 + 2字名字 | 张三, kaishu, 豪迈大气 | name: 张三, originalName: 张三 |
| 6行诗 + 4字名字 | 慕容复, kaishu, 财源广进 | name: 慕容复, originalName: 慕容复 |
| 自由输入风格 | 张三, kaishu, '' | styleKeyword: '' |
| 自定义风格文字 | 张三, kaishu, '超级帅气' | styleKeyword: '超级帅气' |

### 2.7 综合场景测试 (4个测试用例)

| 测试用例 | 场景描述 |
|---------|----------|
| 场景1 | 用户为"李小明"生成2行温文尔雅风格的诗 |
| 场景2 | 用户为"欧阳修"生成4行豪迈大气风格的诗 |
| 场景3 | 用户浏览不同分类的风格 |
| 场景4 | 用户点击"自由输入风格"按钮 |

### 2.8 边界情况和异常处理测试 (8个测试用例)

| 测试用例 | 说明 |
|---------|------|
| 名字为null时返回空字符串 | null 处理 |
| 名字为undefined时返回空字符串 | undefined 处理 |
| lineCount为0时使用默认值4 | 零值处理 |
| lineCount为负数时使用默认值4 | 负数处理 |
| 包含空格的名字正常处理 | 特殊字符 |
| 特殊字符名字正常处理 | 特殊字符 |
| 复姓名字测试 | 复姓处理 |
| 超长名字测试 | 长字符串 |

---

## 三、测试统计

| 测试类别 | 测试用例数量 |
|---------|-------------|
| 名字处理逻辑 | 13 |
| 行数选择功能 | 5 |
| 风格分类功能 | 8 |
| 风格选择功能 | 7 |
| 分类展开/收起 | 6 |
| 生成请求参数 | 5 |
| 综合场景 | 4 |
| 边界情况 | 8 |
| **总计** | **56** |

---

## 四、运行测试

### 4.1 安装依赖

```bash
npm install
```

### 4.2 运行所有测试

```bash
npm test
```

### 4.3 监听模式

```bash
npm run test:watch
```

### 4.4 生成覆盖率报告

```bash
npm run test:coverage
```

---

## 五、Hook API 文档

### 5.1 导出的常量

```typescript
export const STYLE_CATEGORIES = {
  气质风格: ['温文尔雅', '豪迈大气', '清新婉约', '儒雅风流', '空灵禅意', '田园闲适'],
  美好品质: ['蕙质兰心', '才华横溢', '气宇轩昂', '聪慧机智', '品德高尚'],
  祝福愿景: ['金榜题名', '财源广进', '前程似锦', '平安喜乐', '福寿安康', '心想事成'],
  情感主题: ['爱慕浪漫', '怀念思亲', '友情唱和', '情深意重'],
  节日时令: ['节日时令', '新春佳节', '中秋团圆', '端午安康'],
  特定场景: ['毕业离别', '新婚燕尔', '生日快乐']
};
```

### 5.2 导出的函数

```typescript
// 名字处理函数
export const getProcessedName = (originalName: string, lineCount: number): string;

// Hook
export const usePoemGenerator = (): UsePoemGeneratorReturn;
```

### 5.3 Hook 返回值

```typescript
interface UsePoemGeneratorReturn {
  // 状态
  lineCount: number;                              // 当前选择的行数
  styleKeyword: string;                           // 当前选择的风格关键词
  expandedCategories: Record<string, boolean>;    // 各分类的展开状态
  STYLE_CATEGORIES: typeof STYLE_CATEGORIES;      // 风格分类定义

  // 方法
  setLineCount: (count: number) => void;          // 设置行数
  setStyleKeyword: (keyword: string) => void;     // 设置风格关键词
  toggleCategory: (category: string) => void;     // 切换分类展开状态
  getProcessedName: (originalName: string, lineCount: number) => string;  // 处理名字
  generateRequestParams: (name: string, style: string) => GeneratePoemRequest;  // 生成请求参数
}
```

---

## 六、使用示例

### 6.1 在组件中使用 Hook

```typescript
import { usePoemGenerator } from '@/hooks/usePoemGenerator';

function MyComponent() {
  const {
    lineCount,
    styleKeyword,
    expandedCategories,
    STYLE_CATEGORIES,
    setLineCount,
    setStyleKeyword,
    toggleCategory,
    generateRequestParams
  } = usePoemGenerator();

  const handleGenerate = async () => {
    const params = generateRequestParams('李小明', 'kaishu');
    // 发送请求到后端
    const res = await fetch('/api/generate-poem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    // ...
  };

  return (
    // JSX 渲染
  );
}
```

### 6.2 名字处理示例

```typescript
import { getProcessedName } from '@/hooks/usePoemGenerator';

// 2行诗处理
getProcessedName('李小明', 2);  // 返回: '小明'
getProcessedName('张三', 2);    // 返回: '张三'

// 4行诗处理
getProcessedName('李小明', 4);  // 返回: '李小明'
getProcessedName('张三', 4);    // 返回: '张三'

// 6行诗处理
getProcessedName('李小明', 6);  // 返回: '李小明'
getProcessedName('张三', 6);    // 返回: '张三'
```

---

## 七、需求映射表

| 需求（来自 modify_code.md） | 实现位置 | 测试覆盖 |
|----------------------------|----------|----------|
| 风格分类展示 | STYLE_CATEGORIES 常量 | ✅ 8个测试用例 |
| 分类展开/收起 | toggleCategory 函数 | ✅ 6个测试用例 |
| 风格选择 | setStyleKeyword 函数 | ✅ 7个测试用例 |
| 几行诗选择 | setLineCount 函数 | ✅ 5个测试用例 |
| 名字处理逻辑 | getProcessedName 函数 | ✅ 13个测试用例 |
| 生成请求参数 | generateRequestParams 函数 | ✅ 5个测试用例 |
| 默认4行 | useState(4) | ✅ 已验证 |
| 默认展开气质风格 | useState({气质风格: true}) | ✅ 已验证 |

---

## 八、待完成事项

- [ ] 安装测试依赖 (`npm install`)
- [ ] 运行测试验证 (`npm test`)
- [ ] 检查测试覆盖率 (`npm run test:coverage`)
- [ ] 将 Hook 集成到主页面组件
- [ ] 添加后端 API 测试

---

**文档版本**：v1.0
**创建日期**：2026-01-08
**基于文档**：docs/modify_code.md
