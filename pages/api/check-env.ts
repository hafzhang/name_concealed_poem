import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  return new NextResponse(JSON.stringify({
    AI_MODEL_NAME: process.env.AI_MODEL_NAME || '未设置',
    AI_BASE_URL: process.env.AI_BASE_URL || '未设置',
    AI_TIMEOUT: process.env.AI_TIMEOUT || '未设置',
    // 不返回 API Key，只检查是否设置
    API_KEY_SET: !!(process.env.AI_API_KEY || process.env.API_KEY),
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_URL: process.env.VERCEL_URL,
    CF_PAGES_URL: process.env.CF_PAGES_URL,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
