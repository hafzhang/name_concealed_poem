/**
 * 配置管理 Hook
 *
 * 基于 docs/modify_program.md 的配置化改造建议
 * 提供统一的配置管理接口，包括风格、行数、装裱样式等配置
 */

import { useState, useCallback, useMemo } from 'react';

// 风格配置类型
export interface FontStyle {
  value: string;
  label: string;
  literary: string;
}

// 行数配置类型
export interface LineCount {
  value: number;
  label: string;
}

// 装裱样式类型
export interface MountingStyle {
  name: string;
  colors: {
    background: string;
    border: string;
    text: string;
  };
}

// API 配置类型
export interface ApiConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
}

// 缓存配置类型
export interface CacheConfig {
  imageExpiry: number;
  fontExpiry: number;
  maxSize: number;
}

// 验证结果类型
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Hook 返回类型
export interface UseConfigReturn {
  // 风格配置
  getFontStyles: () => FontStyle[];
  getFontStyle: (value: string) => FontStyle | undefined;
  getLiteraryStyle: (style: string) => string;
  isValidFontStyle: (style: string) => boolean;

  // 行数配置
  getLineCounts: () => LineCount[];
  getLineCountLabel: (value: number) => string;
  isValidLineCount: (value: number) => boolean;

  // 装裱样式配置
  getMountingStyles: () => MountingStyle[];
  getMountingStyle: (name: string) => MountingStyle | undefined;

  // API 配置
  getApiTimeout: () => number;
  getRetryConfig: () => { retries: number; retryDelay: number };
  getRateLimitConfig: () => { maxRequests: number; windowMs: number };
  setApiTimeout: (timeout: number) => void;
  setRetryConfig: (config: { retries: number; retryDelay: number }) => void;
  setRateLimitConfig: (config: { maxRequests: number; windowMs: number }) => void;

  // 缓存配置
  getImageCacheExpiry: () => number;
  getFontCacheExpiry: () => number;
  getMaxCacheSize: () => number;

  // 配置管理
  resetConfig: () => void;
  validateFontStyles: () => boolean;
  validateLineCounts: () => boolean;
  validateMountingStyles: () => boolean;
  validateAllConfig: () => ValidationResult;
  exportConfig: () => string;
  importConfig: (json: string) => boolean;
}

// 默认配置
const DEFAULT_FONT_STYLES: FontStyle[] = [
  { value: 'kaishu', label: '楷书', literary: '端正平实' },
  { value: 'xingshu', label: '行书', literary: '飘逸洒脱' },
  { value: 'caoshu', label: '草书', literary: '豪放狂野' },
  { value: 'lishu', label: '隶书', literary: '古朴典雅' },
  { value: 'shoujin', label: '瘦金', literary: '清冷孤傲' },
  { value: 'niaochong', label: '鸟虫', literary: '华丽绮靡' },
];

const DEFAULT_LINE_COUNTS: LineCount[] = [
  { value: 2, label: '对联' },
  { value: 4, label: '绝句' },
  { value: 6, label: '六句' },
];

const DEFAULT_API_CONFIG: ApiConfig = {
  timeout: 120000,
  retries: 3,
  retryDelay: 1000,
  rateLimit: {
    maxRequests: 10,
    windowMs: 60000,
  },
};

const DEFAULT_CACHE_CONFIG: CacheConfig = {
  imageExpiry: 24,
  fontExpiry: 7 * 24,
  maxSize: 10,
};

/**
 * 配置管理 Hook
 */
export const useConfig = (): UseConfigReturn => {
  // 可变配置状态
  const [apiConfig, setApiConfigState] = useState<ApiConfig>(DEFAULT_API_CONFIG);

  /**
   * 获取所有书法风格
   */
  const getFontStyles = useCallback((): FontStyle[] => {
    return DEFAULT_FONT_STYLES;
  }, []);

  /**
   * 根据值获取风格信息
   */
  const getFontStyle = useCallback((value: string): FontStyle | undefined => {
    return DEFAULT_FONT_STYLES.find((style) => style.value === value);
  }, []);

  /**
   * 获取文学风格描述
   */
  const getLiteraryStyle = useCallback((style: string): string => {
    const fontStyle = getFontStyle(style);
    return fontStyle?.literary || '优美';
  }, [getFontStyle]);

  /**
   * 检查风格是否有效
   */
  const isValidFontStyle = useCallback((style: string): boolean => {
    return DEFAULT_FONT_STYLES.some((s) => s.value === style);
  }, []);

  /**
   * 获取所有行数选项
   */
  const getLineCounts = useCallback((): LineCount[] => {
    return DEFAULT_LINE_COUNTS;
  }, []);

  /**
   * 获取行数标签
   */
  const getLineCountLabel = useCallback((value: number): string => {
    const lineCount = DEFAULT_LINE_COUNTS.find((lc) => lc.value === value);
    return lineCount?.label || '未知';
  }, []);

  /**
   * 检查行数是否有效
   */
  const isValidLineCount = useCallback((value: number): boolean => {
    return DEFAULT_LINE_COUNTS.some((lc) => lc.value === value);
  }, []);

  /**
   * 获取所有装裱样式
   */
  const getMountingStyles = useCallback((): MountingStyle[] => {
    // 这里可以扩展为从配置文件读取
    return [
      {
        name: 'museum',
        colors: {
          background: '#f5f5dc',
          border: '#8b4513',
          text: '#333333',
        },
      },
      {
        name: 'elegant',
        colors: {
          background: '#faf8f5',
          border: '#d4af37',
          text: '#2c2c2c',
        },
      },
    ];
  }, []);

  /**
   * 获取指定的装裱样式
   */
  const getMountingStyle = useCallback(
    (name: string): MountingStyle | undefined => {
      const styles = getMountingStyles();
      return styles.find((style) => style.name === name);
    },
    [getMountingStyles]
  );

  /**
   * 获取 API 超时配置
   */
  const getApiTimeout = useCallback((): number => {
    return apiConfig.timeout;
  }, [apiConfig.timeout]);

  /**
   * 获取重试配置
   */
  const getRetryConfig = useCallback(() => {
    return {
      retries: apiConfig.retries,
      retryDelay: apiConfig.retryDelay,
    };
  }, [apiConfig.retries, apiConfig.retryDelay]);

  /**
   * 获取限流配置
   */
  const getRateLimitConfig = useCallback(() => {
    return apiConfig.rateLimit;
  }, [apiConfig.rateLimit]);

  /**
   * 设置 API 超时
   */
  const setApiTimeout = useCallback((timeout: number) => {
    setApiConfigState((prev) => ({ ...prev, timeout }));
  }, []);

  /**
   * 设置重试配置
   */
  const setRetryConfig = useCallback(
    (config: { retries: number; retryDelay: number }) => {
      setApiConfigState((prev) => ({
        ...prev,
        retries: config.retries,
        retryDelay: config.retryDelay,
      }));
    },
    []
  );

  /**
   * 设置限流配置
   */
  const setRateLimitConfig = useCallback(
    (config: { maxRequests: number; windowMs: number }) => {
      setApiConfigState((prev) => ({
        ...prev,
        rateLimit: config,
      }));
    },
    []
  );

  /**
   * 获取图片缓存过期时间（小时）
   */
  const getImageCacheExpiry = useCallback((): number => {
    return DEFAULT_CACHE_CONFIG.imageExpiry;
  }, []);

  /**
   * 获取字体缓存过期时间（小时）
   */
  const getFontCacheExpiry = useCallback((): number => {
    return DEFAULT_CACHE_CONFIG.fontExpiry;
  }, []);

  /**
   * 获取最大缓存大小（MB）
   */
  const getMaxCacheSize = useCallback((): number => {
    return DEFAULT_CACHE_CONFIG.maxSize;
  }, []);

  /**
   * 重置配置为默认值
   */
  const resetConfig = useCallback(() => {
    setApiConfigState(DEFAULT_API_CONFIG);
  }, []);

  /**
   * 验证风格配置
   */
  const validateFontStyles = useCallback((): boolean => {
    if (DEFAULT_FONT_STYLES.length === 0) return false;

    return DEFAULT_FONT_STYLES.every((style) => {
      return (
        style.value &&
        style.label &&
        style.literary &&
        typeof style.value === 'string' &&
        typeof style.label === 'string' &&
        typeof style.literary === 'string'
      );
    });
  }, []);

  /**
   * 验证行数配置
   */
  const validateLineCounts = useCallback((): boolean => {
    if (DEFAULT_LINE_COUNTS.length === 0) return false;

    return DEFAULT_LINE_COUNTS.every((lc) => {
      return lc.value && lc.label && typeof lc.value === 'number' && typeof lc.label === 'string';
    });
  }, []);

  /**
   * 验证装裱样式配置
   */
  const validateMountingStyles = useCallback((): boolean => {
    const styles = getMountingStyles();

    if (styles.length === 0) return false;

    return styles.every((style) => {
      return (
        style.name &&
        style.colors &&
        style.colors.background &&
        style.colors.border &&
        style.colors.text
      );
    });
  }, [getMountingStyles]);

  /**
   * 验证所有配置
   */
  const validateAllConfig = useCallback((): ValidationResult => {
    const errors: string[] = [];

    if (!validateFontStyles()) {
      errors.push('风格配置不完整或无效');
    }

    if (!validateLineCounts()) {
      errors.push('行数配置不完整或无效');
    }

    if (!validateMountingStyles()) {
      errors.push('装裱样式配置不完整或无效');
    }

    if (apiConfig.timeout <= 0) {
      errors.push('API 超时时间必须大于 0');
    }

    if (apiConfig.retries < 0) {
      errors.push('重试次数不能为负数');
    }

    if (apiConfig.retryDelay < 0) {
      errors.push('重试延迟不能为负数');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }, [validateFontStyles, validateLineCounts, validateMountingStyles, apiConfig]);

  /**
   * 导出配置为 JSON
   */
  const exportConfig = useCallback((): string => {
    const config = {
      fontStyles: DEFAULT_FONT_STYLES,
      lineCounts: DEFAULT_LINE_COUNTS,
      api: apiConfig,
      cache: DEFAULT_CACHE_CONFIG,
    };

    return JSON.stringify(config, null, 2);
  }, [apiConfig]);

  /**
   * 从 JSON 导入配置
   */
  const importConfig = useCallback((json: string): boolean => {
    try {
      const config = JSON.parse(json);

      if (config.api) {
        setApiConfigState((prev) => ({
          ...prev,
          ...config.api,
        }));
      }

      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    // 风格配置
    getFontStyles,
    getFontStyle,
    getLiteraryStyle,
    isValidFontStyle,

    // 行数配置
    getLineCounts,
    getLineCountLabel,
    isValidLineCount,

    // 装裱样式配置
    getMountingStyles,
    getMountingStyle,

    // API 配置
    getApiTimeout,
    getRetryConfig,
    getRateLimitConfig,
    setApiTimeout,
    setRetryConfig,
    setRateLimitConfig,

    // 缓存配置
    getImageCacheExpiry,
    getFontCacheExpiry,
    getMaxCacheSize,

    // 配置管理
    resetConfig,
    validateFontStyles,
    validateLineCounts,
    validateMountingStyles,
    validateAllConfig,
    exportConfig,
    importConfig,
  };
};
