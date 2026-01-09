/**
 * 藏头诗生成器测试用例
 *
 * 基于 docs/modify_code.md 的需求文档编写
 * 涵盖：名字处理逻辑、风格分类、行数选择等功能
 */

import { renderHook, act } from '@testing-library/react';
import { usePoemGenerator } from './usePoemGenerator';

// ============================================
// 一、名字处理逻辑测试
// ============================================

describe('getProcessedName - 名字处理逻辑', () => {
  /**
   * 测试用例来源：docs/modify_code.md 三、名字处理逻辑说明
   *
   * 处理规则：
   * - 默认4行：使用完整名字
   * - 2行诗：如果名字是3-4个字，取最后两个字；如果名字是2个字，使用完整名字
   * - 6行诗：使用完整名字
   */

  test('2行诗 + 2字名字 → 返回完整名字', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('张三', 2);
    expect(processed).toBe('张三');
  });

  test('2行诗 + 3字名字 → 取最后2字', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('李小明', 2);
    expect(processed).toBe('小明');
  });

  test('2行诗 + 3字名字（欧阳修）→ 取最后2字', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('欧阳修', 2);
    expect(processed).toBe('阳修');
  });

  test('2行诗 + 4字名字 → 取最后2字', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('慕容复', 2);
    expect(processed).toBe('容复');
  });

  test('2行诗 + 4字名字（复姓测试）→ 取最后2字', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('司马相如', 2);
    expect(processed).toBe('相如');
  });

  test('4行诗 + 2字名字 → 返回完整名字', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('张三', 4);
    expect(processed).toBe('张三');
  });

  test('4行诗 + 3字名字 → 返回完整名字', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('李小明', 4);
    expect(processed).toBe('李小明');
  });

  test('4行诗 + 4字名字 → 返回完整名字', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('慕容复', 4);
    expect(processed).toBe('慕容复');
  });

  test('6行诗 + 2字名字 → 返回完整名字', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('张三', 6);
    expect(processed).toBe('张三');
  });

  test('6行诗 + 3字名字 → 返回完整名字', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('李小明', 6);
    expect(processed).toBe('李小明');
  });

  test('6行诗 + 4字名字 → 返回完整名字', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('慕容复', 6);
    expect(processed).toBe('慕容复');
  });

  // 边界情况测试
  test('空名字 → 返回空字符串', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('', 4);
    expect(processed).toBe('');
  });

  test('单字名字 + 2行诗 → 返回完整名字', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('李', 2);
    expect(processed).toBe('李');
  });

  test('超长名字 + 2行诗 → 取最后2字', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('王小明大帅哥', 2);
    expect(processed).toBe('帅哥');
  });
});

// ============================================
// 二、行数选择功能测试
// ============================================

describe('lineCount - 行数选择', () => {
  /**
   * 测试需求来源：docs/modify_code.md 一、2. 添加"几行诗"选择功能
   *
   * 默认值：4行
   * 可选值：2、4、6
   */

  test('初始状态：默认4行', () => {
    const { result } = renderHook(() => usePoemGenerator());
    expect(result.current.lineCount).toBe(4);
  });

  test('可以切换到2行', () => {
    const { result } = renderHook(() => usePoemGenerator());
    act(() => {
      result.current.setLineCount(2);
    });
    expect(result.current.lineCount).toBe(2);
  });

  test('可以切换到6行', () => {
    const { result } = renderHook(() => usePoemGenerator());
    act(() => {
      result.current.setLineCount(6);
    });
    expect(result.current.lineCount).toBe(6);
  });

  test('可以在不同行数之间切换', () => {
    const { result } = renderHook(() => usePoemGenerator());

    act(() => {
      result.current.setLineCount(2);
    });
    expect(result.current.lineCount).toBe(2);

    act(() => {
      result.current.setLineCount(4);
    });
    expect(result.current.lineCount).toBe(4);

    act(() => {
      result.current.setLineCount(6);
    });
    expect(result.current.lineCount).toBe(6);
  });

  // 边界测试
  test('设置无效行数应保持当前值', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const initialCount = result.current.lineCount;

    act(() => {
      result.current.setLineCount(8 as any); // 无效值
    });

    // 应该保持不变或使用默认值
    expect(result.current.lineCount).toBe(initialCount);
  });
});

// ============================================
// 三、风格分类功能测试
// ============================================

describe('STYLE_CATEGORIES - 风格分类', () => {
  /**
   * 测试需求来源：docs/modify_code.md 一、1. 扩展风格选项（分类展示）
   *
   * 分类结构：
   * - 气质风格：6个选项
   * - 美好品质：5个选项
   * - 祝福愿景：6个选项
   * - 情感主题：4个选项
   * - 节日时令：4个选项
   * - 特定场景：3个选项
   */

  test('风格分类包含6个主分类', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const categories = Object.keys(result.current.STYLE_CATEGORIES);
    expect(categories).toHaveLength(6);
  });

  test('气质风格分类包含6个选项', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const styles = result.current.STYLE_CATEGORIES['气质风格'];
    expect(styles).toEqual([
      '温文尔雅',
      '豪迈大气',
      '清新婉约',
      '儒雅风流',
      '空灵禅意',
      '田园闲适'
    ]);
    expect(styles).toHaveLength(6);
  });

  test('美好品质分类包含5个选项', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const styles = result.current.STYLE_CATEGORIES['美好品质'];
    expect(styles).toEqual([
      '蕙质兰心',
      '才华横溢',
      '气宇轩昂',
      '聪慧机智',
      '品德高尚'
    ]);
    expect(styles).toHaveLength(5);
  });

  test('祝福愿景分类包含6个选项', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const styles = result.current.STYLE_CATEGORIES['祝福愿景'];
    expect(styles).toEqual([
      '金榜题名',
      '财源广进',
      '前程似锦',
      '平安喜乐',
      '福寿安康',
      '心想事成'
    ]);
    expect(styles).toHaveLength(6);
  });

  test('情感主题分类包含4个选项', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const styles = result.current.STYLE_CATEGORIES['情感主题'];
    expect(styles).toEqual([
      '爱慕浪漫',
      '怀念思亲',
      '友情唱和',
      '情深意重'
    ]);
    expect(styles).toHaveLength(4);
  });

  test('节日时令分类包含4个选项', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const styles = result.current.STYLE_CATEGORIES['节日时令'];
    expect(styles).toEqual([
      '节日时令',
      '新春佳节',
      '中秋团圆',
      '端午安康'
    ]);
    expect(styles).toHaveLength(4);
  });

  test('特定场景分类包含3个选项', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const styles = result.current.STYLE_CATEGORIES['特定场景'];
    expect(styles).toEqual([
      '毕业离别',
      '新婚燕尔',
      '生日快乐'
    ]);
    expect(styles).toHaveLength(3);
  });

  test('所有风格选项总计28个', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const allStyles = Object.values(result.current.STYLE_CATEGORIES).flat();
    expect(allStyles).toHaveLength(28);
  });
});

// ============================================
// 四、风格选择功能测试
// ============================================

describe('styleKeyword - 风格选择', () => {
  /**
   * 测试需求来源：docs/modify_code.md 一、1. 扩展风格选项（分类展示）
   *
   * 功能：
   * - 点击风格按钮选中
   * - 点击"自由输入风格"清空选择
   * - 选中的风格有高亮样式
   */

  test('初始状态：无选中风格', () => {
    const { result } = renderHook(() => usePoemGenerator());
    expect(result.current.styleKeyword).toBe('');
  });

  test('可以选中气质风格', () => {
    const { result } = renderHook(() => usePoemGenerator());
    act(() => {
      result.current.setStyleKeyword('温文尔雅');
    });
    expect(result.current.styleKeyword).toBe('温文尔雅');
  });

  test('可以选中美好品质风格', () => {
    const { result } = renderHook(() => usePoemGenerator());
    act(() => {
      result.current.setStyleKeyword('才华横溢');
    });
    expect(result.current.styleKeyword).toBe('才华横溢');
  });

  test('可以选中祝福愿景风格', () => {
    const { result } = renderHook(() => usePoemGenerator());
    act(() => {
      result.current.setStyleKeyword('金榜题名');
    });
    expect(result.current.styleKeyword).toBe('金榜题名');
  });

  test('可以切换到不同风格的分类', () => {
    const { result } = renderHook(() => usePoemGenerator());

    act(() => {
      result.current.setStyleKeyword('温文尔雅');
    });
    expect(result.current.styleKeyword).toBe('温文尔雅');

    act(() => {
      result.current.setStyleKeyword('财源广进');
    });
    expect(result.current.styleKeyword).toBe('财源广进');
  });

  test('设置空字符串清空风格选择', () => {
    const { result } = renderHook(() => usePoemGenerator());

    act(() => {
      result.current.setStyleKeyword('温文尔雅');
    });
    expect(result.current.styleKeyword).toBe('温文尔雅');

    act(() => {
      result.current.setStyleKeyword('');
    });
    expect(result.current.styleKeyword).toBe('');
  });

  // 边界测试
  test('无效的风格名称也可以设置（自由输入）', () => {
    const { result } = renderHook(() => usePoemGenerator());
    act(() => {
      result.current.setStyleKeyword('自定义风格xyz');
    });
    expect(result.current.styleKeyword).toBe('自定义风格xyz');
  });
});

// ============================================
// 五、分类展开/收起功能测试
// ============================================

describe('expandedCategories - 分类展开/收起', () => {
  /**
   * 测试需求来源：docs/modify_code.md 一、1. 扩展风格选项（分类展示）
   *
   * 功能：
   * - 默认展开"气质风格"分类
   * - 每个分类可独立展开/收起
   * - 切换展开状态
   */

  test('初始状态：气质风格分类默认展开', () => {
    const { result } = renderHook(() => usePoemGenerator());
    expect(result.current.expandedCategories['气质风格']).toBe(true);
  });

  test('初始状态：其他分类默认未设置（收起状态）', () => {
    const { result } = renderHook(() => usePoemGenerator());
    expect(result.current.expandedCategories['美好品质']).toBeUndefined();
    expect(result.current.expandedCategories['祝福愿景']).toBeUndefined();
  });

  test('可以展开美好品质分类', () => {
    const { result } = renderHook(() => usePoemGenerator());
    act(() => {
      result.current.toggleCategory('美好品质');
    });
    expect(result.current.expandedCategories['美好品质']).toBe(true);
  });

  test('可以收起气质风格分类', () => {
    const { result } = renderHook(() => usePoemGenerator());
    act(() => {
      result.current.toggleCategory('气质风格');
    });
    expect(result.current.expandedCategories['气质风格']).toBe(false);
  });

  test('可以在展开和收起之间切换', () => {
    const { result } = renderHook(() => usePoemGenerator());

    // 第一次切换：展开
    act(() => {
      result.current.toggleCategory('祝福愿景');
    });
    expect(result.current.expandedCategories['祝福愿景']).toBe(true);

    // 第二次切换：收起
    act(() => {
      result.current.toggleCategory('祝福愿景');
    });
    expect(result.current.expandedCategories['祝福愿景']).toBe(false);

    // 第三次切换：再次展开
    act(() => {
      result.current.toggleCategory('祝福愿景');
    });
    expect(result.current.expandedCategories['祝福愿景']).toBe(true);
  });

  test('多个分类可以同时展开', () => {
    const { result } = renderHook(() => usePoemGenerator());

    act(() => {
      result.current.toggleCategory('美好品质');
      result.current.toggleCategory('祝福愿景');
      result.current.toggleCategory('情感主题');
    });

    expect(result.current.expandedCategories['气质风格']).toBe(true); // 默认展开
    expect(result.current.expandedCategories['美好品质']).toBe(true);
    expect(result.current.expandedCategories['祝福愿景']).toBe(true);
    expect(result.current.expandedCategories['情感主题']).toBe(true);
  });
});

// ============================================
// 六、生成请求参数测试
// ============================================

describe('generateRequestParams - 生成请求参数', () => {
  /**
   * 测试需求来源：docs/modify_code.md 一、4. 传递参数给后端
   *
   * 请求体结构：
   * {
   *   name: processedName,      // 处理后的名字
   *   originalName: name,        // 原始名字
   *   style: string,
   *   styleKeyword: string,
   *   lineCount: number
   * }
   */

  test('2行诗 + 3字名字 → 正确的请求参数', () => {
    const { result } = renderHook(() => usePoemGenerator());

    act(() => {
      result.current.setLineCount(2);
      result.current.setStyleKeyword('温文尔雅');
    });

    const params = result.current.generateRequestParams('李小明', 'kaishu');

    expect(params).toEqual({
      name: '小明',              // 处理后的名字（取最后2字）
      originalName: '李小明',    // 原始名字
      style: 'kaishu',
      styleKeyword: '温文尔雅',
      lineCount: 2
    });
  });

  test('4行诗 + 2字名字 → 正确的请求参数', () => {
    const { result } = renderHook(() => usePoemGenerator());

    act(() => {
      result.current.setLineCount(4);
      result.current.setStyleKeyword('豪迈大气');
    });

    const params = result.current.generateRequestParams('张三', 'kaishu');

    expect(params).toEqual({
      name: '张三',              // 完整名字
      originalName: '张三',      // 原始名字
      style: 'kaishu',
      styleKeyword: '豪迈大气',
      lineCount: 4
    });
  });

  test('6行诗 + 4字名字 → 正确的请求参数', () => {
    const { result } = renderHook(() => usePoemGenerator());

    act(() => {
      result.current.setLineCount(6);
      result.current.setStyleKeyword('财源广进');
    });

    const params = result.current.generateRequestParams('慕容复', 'kaishu');

    expect(params).toEqual({
      name: '慕容复',            // 完整名字
      originalName: '慕容复',    // 原始名字
      style: 'kaishu',
      styleKeyword: '财源广进',
      lineCount: 6
    });
  });

  test('自由输入风格 → styleKeyword为空字符串', () => {
    const { result } = renderHook(() => usePoemGenerator());

    act(() => {
      result.current.setLineCount(4);
      result.current.setStyleKeyword(''); // 清空风格
    });

    const params = result.current.generateRequestParams('张三', 'kaishu');

    expect(params.styleKeyword).toBe('');
  });

  test('自定义风格文字 → 保留自定义输入', () => {
    const { result } = renderHook(() => usePoemGenerator());

    act(() => {
      result.current.setLineCount(4);
      result.current.setStyleKeyword('超级帅气');
    });

    const params = result.current.generateRequestParams('张三', 'kaishu');

    expect(params.styleKeyword).toBe('超级帅气');
  });
});

// ============================================
// 七、综合场景测试
// ============================================

describe('综合场景 - 用户完整流程', () => {
  /**
   * 测试完整的用户交互流程
   */

  test('场景1：用户为"李小明"生成2行温文尔雅风格的诗', () => {
    const { result } = renderHook(() => usePoemGenerator());

    // 1. 选择2行诗
    act(() => {
      result.current.setLineCount(2);
    });
    expect(result.current.lineCount).toBe(2);

    // 2. 选择风格
    act(() => {
      result.current.setStyleKeyword('温文尔雅');
    });
    expect(result.current.styleKeyword).toBe('温文尔雅');

    // 3. 生成请求参数
    const params = result.current.generateRequestParams('李小明', 'kaishu');

    // 4. 验证结果
    expect(params.name).toBe('小明');           // 2行诗取最后2字
    expect(params.originalName).toBe('李小明');
    expect(params.lineCount).toBe(2);
    expect(params.styleKeyword).toBe('温文尔雅');
  });

  test('场景2：用户为"欧阳修"生成4行豪迈大气风格的诗', () => {
    const { result } = renderHook(() => usePoemGenerator());

    // 1. 保持默认4行诗
    expect(result.current.lineCount).toBe(4);

    // 2. 选择风格
    act(() => {
      result.current.setStyleKeyword('豪迈大气');
    });
    expect(result.current.styleKeyword).toBe('豪迈大气');

    // 3. 生成请求参数
    const params = result.current.generateRequestParams('欧阳修', 'kaishu');

    // 4. 验证结果
    expect(params.name).toBe('欧阳修');         // 4行诗用完整名字
    expect(params.originalName).toBe('欧阳修');
    expect(params.lineCount).toBe(4);
    expect(params.styleKeyword).toBe('豪迈大气');
  });

  test('场景3：用户浏览不同分类的风格', () => {
    const { result } = renderHook(() => usePoemGenerator());

    // 初始状态
    expect(result.current.expandedCategories['气质风格']).toBe(true);

    // 用户展开"美好品质"分类
    act(() => {
      result.current.toggleCategory('美好品质');
    });
    expect(result.current.expandedCategories['美好品质']).toBe(true);

    // 用户选择"才华横溢"
    act(() => {
      result.current.setStyleKeyword('才华横溢');
    });
    expect(result.current.styleKeyword).toBe('才华横溢');

    // 用户又展开"祝福愿景"分类
    act(() => {
      result.current.toggleCategory('祝福愿景');
    });
    expect(result.current.expandedCategories['祝福愿景']).toBe(true);

    // 用户改选"金榜题名"
    act(() => {
      result.current.setStyleKeyword('金榜题名');
    });
    expect(result.current.styleKeyword).toBe('金榜题名');
  });

  test('场景4：用户点击"自由输入风格"按钮', () => {
    const { result } = renderHook(() => usePoemGenerator());

    // 先选中一个风格
    act(() => {
      result.current.setStyleKeyword('温文尔雅');
    });
    expect(result.current.styleKeyword).toBe('温文尔雅');

    // 用户点击"自由输入风格"（清空选择）
    act(() => {
      result.current.setStyleKeyword('');
    });
    expect(result.current.styleKeyword).toBe('');

    // 用户手动输入自定义风格
    act(() => {
      result.current.setStyleKeyword('超级无敌霸气');
    });
    expect(result.current.styleKeyword).toBe('超级无敌霸气');
  });
});

// ============================================
// 八、边界情况和异常处理测试
// ============================================

describe('边界情况 - 异常处理', () => {
  test('名字为null时返回空字符串', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName(null as any, 4);
    expect(processed).toBe('');
  });

  test('名字为undefined时返回空字符串', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName(undefined as any, 4);
    expect(processed).toBe('');
  });

  test('lineCount为0时使用默认值4', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('张三', 0);
    expect(processed).toBe('张三'); // 应该返回完整名字
  });

  test('lineCount为负数时使用默认值4', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('张三', -1);
    expect(processed).toBe('张三');
  });

  test('包含空格的名字正常处理', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('李 小 明', 2);
    expect(processed).toBe(' 小'); // slice(-2) 包含空格
  });

  test('特殊字符名字正常处理', () => {
    const { result } = renderHook(() => usePoemGenerator());
    const processed = result.current.getProcessedName('李@小明', 2);
    expect(processed).toBe('@小明');
  });
});
