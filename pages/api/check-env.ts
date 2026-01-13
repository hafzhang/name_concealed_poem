import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  return res.json({
    AI_MODEL_NAME: process.env.AI_MODEL_NAME || '未设置',
    AI_BASE_URL: process.env.AI_BASE_URL || '未设置',
    AI_TIMEOUT: process.env.AI_TIMEOUT || '未设置',
    // 不返回 API Key，只检查是否设置
    API_KEY_SET: !!process.env.AI_API_KEY,
  });
}
