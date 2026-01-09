/**
 * API 限流中间件
 *
 * 基于 docs/modify_program.md 的安全性改进建议
 * 实现请求频率限制，防止 API 滥用
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * 限流配置
 */
export interface RateLimitConfig {
  /** 时间窗口（毫秒） */
  windowMs: number;
  /** 最大请求次数 */
  maxRequests: number;
}

/**
 * 限流状态
 */
interface RateLimitState {
  count: number;
  resetTime: number;
}

/**
 * 内存中的限流存储
 * 生产环境建议使用 Redis 或 Upstash
 */
const rateLimitStore = new Map<string, RateLimitState>();

/**
 * 清理过期的限流记录
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, state] of rateLimitStore.entries()) {
    if (now > state.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// 每分钟清理一次过期记录
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredEntries, 60 * 1000);
}

/**
 * 获取客户端标识
 */
function getClientIdentifier(request: NextRequest): string {
  // 优先使用 API Key（如果有）
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    return `apikey:${apiKey}`;
  }

  // 使用 IP 地址
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() :
             request.headers.get('x-real-ip') ||
             '127.0.0.1';

  return `ip:${ip}`;
}

/**
 * 检查是否超过限流
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; resetTime: number } {
  const now = Date.now();
  const state = rateLimitStore.get(identifier);

  // 如果没有记录或已过期，创建新记录
  if (!state || now > state.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return { allowed: true, resetTime: now + config.windowMs };
  }

  // 检查是否超过限制
  if (state.count >= config.maxRequests) {
    return { allowed: false, resetTime: state.resetTime };
  }

  // 增加计数
  state.count++;
  return { allowed: true, resetTime: state.resetTime };
}

/**
 * 获取限流剩余次数和重置时间
 */
export function getRateLimitInfo(
  identifier: string,
  config: RateLimitConfig
): { remaining: number; resetTime: number } {
  const state = rateLimitStore.get(identifier);
  const now = Date.now();

  if (!state || now > state.resetTime) {
    return {
      remaining: config.maxRequests,
      resetTime: now + config.windowMs,
    };
  }

  return {
    remaining: Math.max(0, config.maxRequests - state.count),
    resetTime: state.resetTime,
  };
}

/**
 * API 限流中间件工厂函数
 */
export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async function rateLimitMiddleware(
    request: NextRequest
  ): Promise<NextResponse | null> {
    const identifier = getClientIdentifier(request);
    const result = checkRateLimit(identifier, config);

    // 添加限流响应头
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', config.maxRequests.toString());

    const info = getRateLimitInfo(identifier, config);
    headers.set('X-RateLimit-Remaining', result.allowed ? info.remaining.toString() : '0');
    headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

    if (!result.allowed) {
      headers.set('Retry-After', Math.ceil((result.resetTime - Date.now()) / 1000).toString());

      return NextResponse.json(
        {
          success: false,
          error: '请求过于频繁，请稍后再试',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        },
        { status: 429, headers }
      );
    }

    return null; // 允许请求继续
  };
}

/**
 * 预设的限流配置
 */
export const RateLimitPresets = {
  /** 宽松限制：适用于付费用户或可信客户端 */
  loose: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 100,
  },

  /** 标准限制：适用于普通用户 */
  standard: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 10,
  },

  /** 严格限制：适用于公开 API */
  strict: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 5,
  },

  /** 超严格限制：适用于敏感操作 */
  veryStrict: {
    windowMs: 60 * 1000 * 5, // 5分钟
    maxRequests: 3,
  },
};

/**
 * 创建诗歌生成 API 的限流中间件
 */
export const poemRateLimit = createRateLimitMiddleware(RateLimitPresets.standard);

/**
 * 创建图片渲染 API 的限流中间件
 */
export const imageRateLimit = createRateLimitMiddleware(RateLimitPresets.loose);

/**
 * 重置指定标识的限流计数（用于测试）
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * 清空所有限流记录（用于测试）
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
