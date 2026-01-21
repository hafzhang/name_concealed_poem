import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: NextRequest) {
  return new NextResponse(JSON.stringify({
    success: true,
    message: 'Test endpoint is working',
    time: new Date().toISOString(),
    env: {
      hasProcess: typeof process !== 'undefined',
      hasProcessEnv: typeof process !== 'undefined' && !!process.env,
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
