import type { NextApiRequest, NextApiResponse } from 'next';

type EnvResponse = {
  AI_MODEL_NAME: string;
  AI_BASE_URL: string;
  AI_TIMEOUT: string;
  API_KEY_SET: boolean;
  NODE_ENV: string | undefined;
  VERCEL_URL: string | undefined;
  CF_PAGES_URL: string | undefined;
};

// Use Node.js compatibility mode on Cloudflare (with nodejs_compat flag)
export const config = {
  runtime: 'nodejs',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EnvResponse>
) {
  res.status(200).json({
    AI_MODEL_NAME: process.env.AI_MODEL_NAME || '未设置',
    AI_BASE_URL: process.env.AI_BASE_URL || '未设置',
    AI_TIMEOUT: process.env.AI_TIMEOUT || '未设置',
    // 不返回 API Key，只检查是否设置
    API_KEY_SET: !!(process.env.AI_API_KEY || process.env.API_KEY),
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    CF_PAGES_URL: process.env.CF_PAGES_URL,
  });
}
