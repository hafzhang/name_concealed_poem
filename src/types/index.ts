/**
 * 统一类型定义
 *
 * 基于 docs/modify_program.md 的代码质量改进建议
 * 提供完整的类型定义，提高代码可维护性
 */

// ============================================
// 诗歌相关类型
// ============================================

/**
 * 书法风格类型
 */
export type FontStyle =
  | 'kaishu'      // 楷书
  | 'xingshu'     // 行书
  | 'caoshu'      // 草书
  | 'lishu'       // 隶书
  | 'shoujin'     // 瘦金
  | 'niaochong';  // 鸟虫

/**
 * 行数类型
 */
export type LineCount = 2 | 4 | 6;

/**
 * 诗歌行数据
 */
export type PoemLine = string;

/**
 * 完整诗歌数据
 */
export interface Poem {
  lines: PoemLine[];
  explanation: string;
}

/**
 * 诗歌生成请求参数
 */
export interface GeneratePoemRequest {
  /** 处理后的名字（用于生成藏头诗） */
  name: string;
  /** 原始名字（用于显示） */
  originalName: string;
  /** 书法风格 */
  style: FontStyle;
  /** 诗歌风格关键词（可选） */
  styleKeyword?: string;
  /** 行数 */
  lineCount: LineCount;
}

/**
 * 诗歌生成响应数据
 */
export interface GeneratePoemResponse {
  success: true;
  data: {
    /** 诗歌内容 */
    poem: PoemLine[];
    /** 诗歌赏析 */
    explanation: string;
    /** 原始名字 */
    originalName: string;
    /** 处理后的名字 */
    processedName: string;
    /** 行数 */
    lineCount: LineCount;
    /** 是否来自缓存 */
    cached: boolean;
  };
}

/**
 * 诗歌生成错误响应
 */
export interface GeneratePoemErrorResponse {
  success: false;
  error: string;
  code?: string;
}

/**
 * 诗歌生成响应（联合类型）
 */
export type PoemApiResponse = GeneratePoemResponse | GeneratePoemErrorResponse;

// ============================================
// 图片相关类型
// ============================================

/**
 * 装裱样式类型
 */
export type MountingStyle =
  | 'museum'      // 博物馆风格
  | 'elegant'     // 优雅风格
  | 'simple'      // 简约风格
  | 'classic'     // 经典风格
  | 'modern';     // 现代风格

/**
 * 图片渲染请求参数
 */
export interface RenderImageRequest {
  /** 诗歌内容 */
  poem: PoemLine[];
  /** 名字 */
  name: string;
  /** 书法风格 */
  style: FontStyle;
  /** 装裱样式（可选） */
  mounting?: MountingStyle;
  /** 是否返回 base64（可选） */
  base64?: boolean;
}

/**
 * 图片渲染响应数据
 */
export interface RenderImageResponse {
  success: true;
  data: {
    /** 图片 URL 或 base64 数据 */
    url: string;
    /** 图片格式 */
    format: 'png' | 'jpeg' | 'webp';
    /** 图片宽度 */
    width: number;
    /** 图片高度 */
    height: number;
  };
}

/**
 * 图片渲染错误响应
 */
export interface RenderImageErrorResponse {
  success: false;
  error: string;
}

/**
 * 图片渲染响应（联合类型）
 */
export type ImageApiResponse = RenderImageResponse | RenderImageErrorResponse;

// ============================================
// API 通用类型
// ============================================

/**
 * API 成功响应
 */
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
}

/**
 * API 错误响应
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

/**
 * API 响应（联合类型）
 */
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * 请求选项
 */
export interface RequestOptions {
  /** 重试次数 */
  retries?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
  /** 超时时间（毫秒） */
  timeout?: number;
}

// ============================================
// 配置相关类型
// ============================================

/**
 * 风格配置
 */
export interface StyleConfig {
  value: FontStyle;
  label: string;
  literary: string;
}

/**
 * 行数配置
 */
export interface LineCountConfig {
  value: LineCount;
  label: string;
}

/**
 * 装裱样式配置
 */
export interface MountingConfig {
  name: MountingStyle;
  label: string;
  colors: {
    background: string;
    border: string;
    text: string;
    accent?: string;
  };
}

/**
 * API 配置
 */
export interface ApiConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
}

/**
 * 缓存配置
 */
export interface CacheConfig {
  maxSize: number;
  imageExpiry: number;
  fontExpiry: number;
}

// ============================================
// 错误相关类型
// ============================================

/**
 * 自定义 API 错误类
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 错误类型枚举
 */
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * 错误详情
 */
export interface ErrorDetails {
  type: ErrorType;
  message: string;
  code?: string;
  stack?: string;
  context?: Record<string, any>;
}

// ============================================
// UI 相关类型
// ============================================

/**
 * 加载状态
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * 生成诗歌状态
 */
export interface GeneratePoemState {
  loading: LoadingState;
  poem: Poem | null;
  error: string | null;
}

/**
 * 渲染图片状态
 */
export interface RenderImageState {
  loading: LoadingState;
  imageUrl: string | null;
  error: string | null;
}

// ============================================
// 工具类型
// ============================================

/**
 * 提取 Promise 的返回类型
 */
export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;

/**
 * 使所有属性可选
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * 提取对象的部分键
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * 函数类型
 */
export type Fn = (...args: any[]) => any;

/**
 * 异步函数类型
 */
export type AsyncFn = (...args: any[]) => Promise<any>;
