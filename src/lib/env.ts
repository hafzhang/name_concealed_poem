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

  // AI API 配置（必需）
  AI_API_KEY: z.string().min(1, 'AI_API_KEY 不能为空'),
  AI_BASE_URL: z.string().url().optional(),
  AI_MODEL_NAME: z.string().default('gpt-4'),
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
    timeout: 60000, // 默认 60 秒
  };
}

/**
 * 获取缓存配置
 */
export function getCacheConfig() {
  return {
    maxSize: 10, // MB
    imageExpiry: 24, // 小时
    fontExpiry: 168, // 小时 (7天)
  };
}

/**
 * 获取应用配置
 */
export function getAppConfig() {
  return {
    env: env.NODE_ENV,
    isDevelopment,
    isProduction,
    isTest,
  };
}
