/**
 * 环境变量验证模块
 *
 * 基于 docs/modify_program.md 的安全性改进建议
 * 使用 zod 验证所有环境变量，确保配置完整性
 */

import { z } from 'zod';

/**
 * 环境变量 Schema 定义
 */
const envSchema = z.object({
  // Node 环境
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // AI API 配置
  AI_API_KEY: z.string().min(1, 'AI_API_KEY 不能为空'),
  AI_BASE_URL: z.string().url('AI_BASE_URL 必须是有效的 URL').optional(),
  AI_MODEL_NAME: z.string().min(1).default('gpt-4'),
  AI_TIMEOUT: z.string().optional().transform((val) => parseInt(val || '60000', 10)).pipe(
    z.number().min(1000).max(300000)
  ).default(60000),

  // 应用配置
  APP_URL: z.string().url().optional().default('http://localhost:3000'),

  // 缓存配置
  CACHE_MAX_SIZE: z.string().optional().transform((val) => parseInt(val || '10', 10)).pipe(
    z.number().min(1).max(100)
  ).default(10),

  CACHE_IMAGE_EXPIRY: z.string().optional().transform((val) => parseInt(val || '24', 10)).pipe(
    z.number().min(1).max(168) // 最大一周
  ).default(24),

  CACHE_FONT_EXPIRY: z.string().optional().transform((val) => parseInt(val || '168', 10)).pipe(
    z.number().min(1).max(720) // 最大30天
  ).default(168),
});

/**
 * 环境变量类型
 */
export type Env = z.infer<typeof envSchema>;

/**
 * 验证并解析环境变量
 *
 * @throws {z.ZodError} 当环境变量验证失败时抛出
 */
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ 环境变量验证失败:');
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('环境变量配置不完整，请检查 .env 文件');
    }
    throw error;
  }
}

/**
 * 导出验证后的环境变量
 */
export const env = validateEnv();

/**
 * 检查是否为开发环境
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * 检查是否为生产环境
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * 检查是否为测试环境
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * 获取 AI 配置
 */
export function getAIConfig() {
  return {
    apiKey: env.AI_API_KEY,
    baseURL: env.AI_BASE_URL,
    modelName: env.AI_MODEL_NAME,
    timeout: env.AI_TIMEOUT,
  };
}

/**
 * 获取缓存配置
 */
export function getCacheConfig() {
  return {
    maxSize: env.CACHE_MAX_SIZE,
    imageExpiry: env.CACHE_IMAGE_EXPIRY,
    fontExpiry: env.CACHE_FONT_EXPIRY,
  };
}

/**
 * 获取应用配置
 */
export function getAppConfig() {
  return {
    url: env.APP_URL,
    env: env.NODE_ENV,
    isDevelopment,
    isProduction,
    isTest,
  };
}
