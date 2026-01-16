/**
 * 配置常量文件
 *
 * 基于 docs/modify_program.md 的配置化改造建议
 * 将所有硬编码配置移到统一位置，便于管理和修改
 */

import type {
  FontStyle,
  LineCount,
  MountingStyle,
  StyleConfig,
  LineCountConfig,
  MountingConfig,
} from '@/types';

// ============================================
// 书法风格配置
// ============================================

/**
 * 书法风格映射表
 * value: API 使用的风格值
 * label: 用户界面显示的标签
 * literary: 用于生成诗歌的文学风格描述
 */
export const FONT_STYLES: Record<FontStyle, StyleConfig> = {
  kaishu: {
    value: 'kaishu',
    label: '楷书',
    literary: '端正平实',
  },
  xingshu: {
    value: 'xingshu',
    label: '行书',
    literary: '飘逸洒脱',
  },
  caoshu: {
    value: 'caoshu',
    label: '草书',
    literary: '豪放狂野',
  },
  lishu: {
    value: 'lishu',
    label: '隶书',
    literary: '古朴典雅',
  },
  shoujin: {
    value: 'shoujin',
    label: '瘦金',
    literary: '清冷孤傲',
  },
  niaochong: {
    value: 'niaochong',
    label: '鸟虫',
    literary: '华丽绮靡',
  },
};

/**
 * 书法风格列表
 */
export const FONT_STYLE_LIST: StyleConfig[] = Object.values(FONT_STYLES);

/**
 * 根据值获取文学风格
 */
export function getLiteraryStyle(style: FontStyle): string {
  return FONT_STYLES[style]?.literary || '优美';
}

/**
 * 验证书法风格是否有效
 */
export function isValidFontStyle(style: string): style is FontStyle {
  return style in FONT_STYLES;
}

// ============================================
// 行数配置
// ============================================

/**
 * 行数选项配置
 */
export const LINE_COUNTS: Record<LineCount, LineCountConfig> = {
  2: {
    value: 2,
    label: '对联',
  },
  4: {
    value: 4,
    label: '绝句',
  },
  6: {
    value: 6,
    label: '六句',
  },
};

/**
 * 行数选项列表
 */
export const LINE_COUNT_LIST: LineCountConfig[] = Object.values(LINE_COUNTS);

/**
 * 根据值获取行数标签
 */
export function getLineCountLabel(count: number): string {
  return LINE_COUNTS[count as LineCount]?.label || '未知';
}

/**
 * 验证行数是否有效
 */
export function isValidLineCount(count: number): count is LineCount {
  return count in LINE_COUNTS;
}

// ============================================
// 装裱样式配置
// ============================================

/**
 * 装裱样式配置
 */
export const MOUNTING_STYLES: Record<MountingStyle, MountingConfig> = {
  museum: {
    name: 'museum',
    label: '博物馆',
    colors: {
      background: '#f5f5dc',
      border: '#8b4513',
      text: '#333333',
      accent: '#d4af37',
    },
  },
  elegant: {
    name: 'elegant',
    label: '优雅',
    colors: {
      background: '#faf8f5',
      border: '#d4af37',
      text: '#2c2c2c',
      accent: '#c9a961',
    },
  },
  simple: {
    name: 'simple',
    label: '简约',
    colors: {
      background: '#ffffff',
      border: '#cccccc',
      text: '#333333',
    },
  },
  classic: {
    name: 'classic',
    label: '经典',
    colors: {
      background: '#fef9e7',
      border: '#c9a961',
      text: '#4a4a4a',
      accent: '#b8860b',
    },
  },
  modern: {
    name: 'modern',
    label: '现代',
    colors: {
      background: '#f8f9fa',
      border: '#343a40',
      text: '#212529',
      accent: '#007bff',
    },
  },
};

/**
 * 装裱样式列表
 */
export const MOUNTING_STYLE_LIST: MountingConfig[] = Object.values(MOUNTING_STYLES);

/**
 * 获取装裱样式
 */
export function getMountingStyle(name: MountingStyle): MountingConfig | undefined {
  return MOUNTING_STYLES[name];
}

/**
 * 验证装裱样式是否有效
 */
export function isValidMountingStyle(name: string): name is MountingStyle {
  return name in MOUNTING_STYLES;
}

// ============================================
// API 配置
// ============================================

/**
 * API 端点
 */
export const API_ENDPOINTS = {
  GENERATE_POEM: '/api/generate-poem',
  RENDER_IMAGE: '/api/render-image',
} as const;

/**
 * API 默认配置
 */
export const API_DEFAULTS = {
  /** 请求超时时间（毫秒） */
  TIMEOUT: 120000,
  /** 重试次数 */
  RETRIES: 3,
  /** 重试延迟（毫秒） */
  RETRY_DELAY: 1000,
  /** 限流：时间窗口（毫秒） */
  RATE_LIMIT_WINDOW: 60000,
  /** 限流：最大请求数 */
  RATE_LIMIT_MAX: 10,
} as const;

// ============================================
// 诗歌配置
// ============================================

/**
 * 诗歌长度限制
 */
export const POEM_LIMITS = {
  /** 最小名字长度 */
  MIN_NAME_LENGTH: 2,
  /** 最大名字长度 */
  MAX_NAME_LENGTH: 10,
  /** 最小行数 */
  MIN_LINE_COUNT: 2,
  /** 最大行数 */
  MAX_LINE_COUNT: 6,
} as const;

/**
 * 诗歌格式说明
 */
export const POEM_FORMATS = {
  2: '五言对联',
  4: '五言绝句',
  6: '六句五言诗',
} as const;

/**
 * 根据行数获取诗歌格式
 */
export function getPoemFormat(lineCount: LineCount): string {
  return POEM_FORMATS[lineCount] || '未知格式';
}

// ============================================
// 图片配置
// ============================================

/**
 * 图片尺寸配置
 */
export const IMAGE_SIZES = {
  /** 默认宽度 */
  DEFAULT_WIDTH: 800,
  /** 默认高度 */
  DEFAULT_HEIGHT: 1200,
  /** 缩略图宽度 */
  THUMBNAIL_WIDTH: 200,
  /** 缩略图高度 */
  THUMBNAIL_HEIGHT: 300,
} as const;

/**
 * 图片格式配置
 */
export const IMAGE_FORMATS = {
  /** 默认格式 */
  DEFAULT: 'png',
  /** 支持的格式 */
  SUPPORTED: ['png', 'jpeg', 'webp'],
} as const;

/**
 * 图片质量配置
 */
export const IMAGE_QUALITY = {
  /** JPEG 质量 (0-1) */
  JPEG: 0.95,
  /** WebP 质量 (0-1) */
  WEBP: 0.95,
} as const;

// ============================================
// 缓存配置
// ============================================

/**
 * 缓存键前缀
 */
export const CACHE_PREFIXES = {
  IMAGE: 'img_',
  FONT: 'font_',
  TIMESTAMP: 'timestamp_',
} as const;

/**
 * 缓存默认配置
 */
export const CACHE_DEFAULTS = {
  /** 图片缓存过期时间（小时） */
  IMAGE_EXPIRY: 24,
  /** 字体缓存过期时间（小时） */
  FONT_EXPIRY: 168, // 7天
  /** 最大缓存大小（MB） */
  MAX_SIZE: 10,
  /** 最大缓存项数 */
  MAX_ITEMS: 100,
} as const;

// ============================================
// UI 配置
// ============================================

/**
 * 动画配置
 */
export const ANIMATION = {
  /** 默认过渡时长（毫秒） */
  DEFAULT_DURATION: 300,
  /** 快速过渡时长（毫秒） */
  FAST_DURATION: 150,
  /** 慢速过渡时长（毫秒） */
  SLOW_DURATION: 500,
} as const;

/**
 * 断点配置
 */
export const BREAKPOINTS = {
  /** 手机 */
  SM: 640,
  /** 平板 */
  MD: 768,
  /** 桌面 */
  LG: 1024,
  /** 大屏 */
  XL: 1280,
} as const;

// ============================================
// 错误消息
// ============================================

/**
 * 常用错误消息
 */
export const ERROR_MESSAGES = {
  /** 名字太短 */
  NAME_TOO_SHORT: '名字至少需要2个字符',
  /** 名字太长 */
  NAME_TOO_LONG: '名字不能超过10个字符',
  /** 请求失败 */
  REQUEST_FAILED: '请求失败，请稍后重试',
  /** 网络错误 */
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  /** 请求超时 */
  TIMEOUT: '请求超时，请稍后重试',
  /** 限流 */
  RATE_LIMIT: '请求过于频繁，请稍后再试',
  /** 服务错误 */
  SERVER_ERROR: '服务器错误，请稍后重试',
  /** 无效参数 */
  INVALID_PARAMS: '请求参数无效',
} as const;
