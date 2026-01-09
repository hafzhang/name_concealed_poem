/**
 * API 请求 Hook
 *
 * 基于 docs/modify_program.md 的安全性改进建议
 * 提供统一的 API 请求接口，包含错误处理、重试、限流等功能
 */

import { useState, useCallback, useRef } from 'react';

// 诗歌生成请求参数
export interface GeneratePoemParams {
  name: string;
  originalName: string;
  style: string;
  styleKeyword: string;
  lineCount: number;
}

// 图片渲染请求参数
export interface RenderImageParams {
  poem: string[];
  name: string;
  style: string;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// 请求选项
export interface RequestOptions {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

// Hook 返回类型
export interface UseApiRequestReturn {
  // 状态
  loading: boolean;
  error: string | null;

  // 方法
  generatePoem: (
    params: GeneratePoemParams,
    options?: RequestOptions
  ) => Promise<ApiResponse>;
  renderImage: (
    params: RenderImageParams,
    options?: RequestOptions
  ) => Promise<string>;
  clearError: () => void;
}

// 限流配置
const RATE_LIMIT_CONFIG = {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1分钟
};

// 限流状态
const rateLimitState = {
  requests: [] as number[],
  isLimited: false,
};

/**
 * 检查是否被限流
 */
function checkRateLimit(): boolean {
  const now = Date.now();

  // 清除过期的请求记录
  rateLimitState.requests = rateLimitState.requests.filter(
    (time) => now - time < RATE_LIMIT_CONFIG.windowMs
  );

  // 检查是否超过限制
  if (rateLimitState.requests.length >= RATE_LIMIT_CONFIG.maxRequests) {
    rateLimitState.isLimited = true;
    setTimeout(() => {
      rateLimitState.isLimited = false;
    }, RATE_LIMIT_CONFIG.windowMs);
    return true;
  }

  rateLimitState.requests.push(now);
  return false;
}

/**
 * 延迟函数
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * API 请求 Hook
 */
export const useApiRequest = (): UseApiRequestReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 清除错误
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 带重试的请求函数
   */
  const fetchWithRetry = useCallback(
    async (
      url: string,
      options: RequestInit,
      retryOptions: RequestOptions
    ): Promise<Response> => {
      const { retries = 0, retryDelay = 1000, timeout = 30000 } = retryOptions;

      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          // 创建超时 Promise
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('请求超时')), timeout);
          });

          // 发起请求
          const response = await Promise.race([
            fetch(url, options),
            timeoutPromise,
          ]);

          // 检查响应状态
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}`);
          }

          return response;
        } catch (err) {
          lastError = err as Error;

          // 如果是限流错误，等待更长时间
          if (responseIncludesRateLimit(err) && attempt < retries) {
            await delay(retryDelay * (attempt + 1) * 2);
            continue;
          }

          // 最后一次尝试失败，抛出错误
          if (attempt === retries) {
            throw lastError;
          }

          // 等待后重试
          await delay(retryDelay * (attempt + 1));
        }
      }

      throw lastError;
    },
    []
  );

  /**
   * 检查错误是否包含限流信息
   */
  function responseIncludesRateLimit(err: any): boolean {
    return (
      err?.message?.includes('429') ||
      err?.message?.includes('请求过于频繁') ||
      err?.message?.includes('rate limit')
    );
  }

  /**
   * 生成诗歌
   */
  const generatePoem = useCallback(
    async (
      params: GeneratePoemParams,
      options: RequestOptions = {}
    ): Promise<ApiResponse> => {
      // 检查限流
      if (checkRateLimit()) {
        return {
          success: false,
          error: '请求过于频繁，请稍后再试',
        };
      }

      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const response = await fetchWithRetry(
          '/api/generate-poem',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
            signal: abortControllerRef.current.signal,
          },
          options
        );

        const data = await response.json();

        return {
          success: true,
          data: data.data,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '请求失败';
        setError(errorMessage);

        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [fetchWithRetry]
  );

  /**
   * 渲染图片
   */
  const renderImage = useCallback(
    async (
      params: RenderImageParams,
      options: RequestOptions = {}
    ): Promise<string> => {
      // 检查限流
      if (checkRateLimit()) {
        throw new Error('请求过于频繁，请稍后再试');
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetchWithRetry(
          '/api/render-image',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
          },
          options
        );

        const blob = await response.blob();
        const imageUrl = URL.createObjectURL(blob);

        return imageUrl;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '图片渲染失败';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [fetchWithRetry]
  );

  return {
    loading,
    error,
    generatePoem,
    renderImage,
    clearError,
  };
};
