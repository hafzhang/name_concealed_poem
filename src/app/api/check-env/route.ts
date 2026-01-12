import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  return NextResponse.json({
    AI_MODEL_NAME: process.env.AI_MODEL_NAME || '未设置',
    AI_BASE_URL: process.env.AI_BASE_URL || '未设置',
    AI_TIMEOUT: process.env.AI_TIMEOUT || '未设置',
    // 不返回 API Key，只检查是否设置
    API_KEY_SET: !!process.env.AI_API_KEY,
  });
}
