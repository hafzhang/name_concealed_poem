/**
 * 藏头诗生成器 Hook
 *
 * 基于 docs/modify_code.md 需求文档实现
 * 功能：
 * - 名字处理逻辑（根据行数截取名字）
 * - 风格分类选择
 * - 行数选择（2/4/6行）
 * - 分类展开/收起
 */

import { useState, useCallback } from 'react';

// 风格分类定义
export const STYLE_CATEGORIES = {
  气质风格: ['温文尔雅', '豪迈大气', '清新婉约', '儒雅风流', '空灵禅意', '田园闲适'],
  美好品质: ['蕙质兰心', '才华横溢', '气宇轩昂', '聪慧机智', '品德高尚'],
  祝福愿景: ['金榜题名', '财源广进', '前程似锦', '平安喜乐', '福寿安康', '心想事成'],
  情感主题: ['爱慕浪漫', '怀念思亲', '友情唱和', '情深意重'],
  节日时令: ['节日时令', '新春佳节', '中秋团圆', '端午安康'],
  特定场景: ['毕业离别', '新婚燕尔', '生日快乐']
} as const;

// 请求参数类型
export interface GeneratePoemRequest {
  name: string;              // 处理后的名字
  originalName: string;      // 原始名字
  style: string;             // 书法风格
  styleKeyword: string;      // 诗歌风格关键词
  lineCount: number;         // 行数
}

// Hook 返回类型
export interface UsePoemGeneratorReturn {
  // 状态
  lineCount: number;
  styleKeyword: string;
  expandedCategories: Record<string, boolean>;
  STYLE_CATEGORIES: typeof STYLE_CATEGORIES;

  // 方法
  setLineCount: (count: number) => void;
  setStyleKeyword: (keyword: string) => void;
  toggleCategory: (category: string) => void;
  getProcessedName: (originalName: string, lineCount: number) => string;
  generateRequestParams: (name: string, style: string) => GeneratePoemRequest;
}

/**
 * 名字处理函数
 *
 * 规则：
 * - 默认4行：使用完整名字
 * - 2行诗：如果名字是3-4个字，取最后两个字；如果名字是2个字，使用完整名字
 * - 6行诗：使用完整名字
 */
export const getProcessedName = (originalName: string, lineCount: number): string => {
  // 处理 null/undefined
  if (!originalName) {
    return '';
  }

  // 2行诗且名字长度>=3时，取最后两个字
  if (lineCount === 2 && originalName.length >= 3) {
    return originalName.slice(-2);
  }

  // 其他情况返回完整名字
  return originalName;
};

/**
 * 藏头诗生成器 Hook
 */
export const usePoemGenerator = (): UsePoemGeneratorReturn => {
  // 行数选择（默认4行）
  const [lineCount, setLineCount] = useState<number>(4);

  // 风格关键词选择
  const [styleKeyword, setStyleKeyword] = useState<string>('');

  // 分类展开状态（默认展开气质风格）
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    气质风格: true
  });

  /**
   * 切换分类展开状态
   */
  const toggleCategory = useCallback((category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  /**
   * 生成请求参数
   */
  const generateRequestParams = useCallback((
    name: string,
    style: string
  ): GeneratePoemRequest => {
    const processedName = getProcessedName(name, lineCount);

    return {
      name: processedName,
      originalName: name,
      style,
      styleKeyword,
      lineCount
    };
  }, [lineCount, styleKeyword]);

  return {
    // 状态
    lineCount,
    styleKeyword,
    expandedCategories,
    STYLE_CATEGORIES,

    // 方法
    setLineCount,
    setStyleKeyword,
    toggleCategory,
    getProcessedName,
    generateRequestParams
  };
};
