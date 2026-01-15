import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export const config = {
  runtime: 'edge',
};

const getOpenAI = () => {
  return new OpenAI({
    apiKey: process.env.AI_API_KEY || process.env.API_KEY || '',
    baseURL: process.env.AI_BASE_URL || undefined,
    timeout: parseInt(process.env.AI_TIMEOUT || '60000', 10), // 默认 60 秒
  });
};

// Map font styles to literary styles for better poem generation
const styleMap: Record<string, string> = {
  'kaishu': '端正平实',
  'xingshu': '飘逸洒脱',
  'caoshu': '豪放狂野',
  'lishu': '古朴典雅',
  'shoujin': '清冷孤傲',
  'niaochong': '华丽绮靡'
};

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 接收参数：name 是前端已处理过的名字，与 lineCount 匹配
    const body = await req.json();
    const { name, originalName, style, styleKeyword, lineCount = 4 } = body;

    // 注意：name 是前端已经处理过的名字
    // - lineCount=2 时，name 长度一定是 2
    // - lineCount=4 时，name 长度可能是 2-4
    // - lineCount=6 时，name 长度可能是 2-4

    if (!name || name.length < 2) {
      return new NextResponse(JSON.stringify({ success: false, error: '名字至少需要2个字符' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Determine literary style
    const literaryStyle = styleKeyword || styleMap[style] || style || '优美';

    // 根据行数动态构建 Prompt
    let formatInstruction = "五言绝句";
    let acrosticInstruction = "必须是藏头诗，共四句。每句的第一个字依次是";
    let poemCount = 4;

    if (lineCount === 2) {
      formatInstruction = "五言对联";
      acrosticInstruction = "必须是藏头对联，共两句。每句的第一个字依次是";
      poemCount = 2;
    } else if (lineCount === 6) {
      formatInstruction = "六句五言诗";
      acrosticInstruction = "前三句必须是藏头，第1-3句的第一个字依次是";
      poemCount = 6;
    }
    // lineCount === 4 时使用默认值

    // 构建诗句数组模板
    const poemTemplate = Array.from({ length: poemCount }, (_, i) => `第${i + 1}句`);

    const prompt = `你是一个国学大师。请为"${name}"创作一首${formatInstruction}。

要求：
1. ${acrosticInstruction}"${name}"中的字。${lineCount === 6 ? '第4-6句自由发挥，不重复姓名，但需与前文意境连贯。' : ''}
2. 意境：${literaryStyle}，要求意境优美、寓意深远、格调高雅
3. 内容：整体积极向上，含赞美、祝福或美好期许之意
4. 语义：诗句之间衔接自然，前后贯通，避免生硬拼凑

【返回格式】
仅返回纯JSON对象，不要添加任何解释性文字：
{
    "poem": [${poemTemplate.map(s => `"${s}"`).join(', ')}],
    "explanation": "对这首诗的简短意境赏析"
}`;

    console.log(`生成藏头诗 - 名字: ${name}, 原始名字: ${originalName || name}, 行数: ${lineCount}, 格式: ${formatInstruction}`);

    let client;
    try {
      client = getOpenAI();
    } catch (e: any) {
      console.error('OpenAI Initialization Error:', e);
      return new NextResponse(JSON.stringify({ success: false, error: `AI Client Init Failed: ${e.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const completion = await client.chat.completions.create({
      model: process.env.AI_MODEL_NAME || 'gpt-4',
      messages: [
        { role: 'system', content: '你是一个帮助生成JSON数据的AI助手。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      stream: false, // Ensure we get the full JSON at once
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    console.log('AI Response:', content); // For debugging

    // Parse JSON safely (handling potential markdown wrappers)
    let jsonStr = content.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let result;
    try {
      result = JSON.parse(jsonStr);
    } catch (e) {
      console.error('JSON Parse Error:', e);
      // Fallback if JSON parsing fails
      return res.status(500).json(
        { success: false, error: 'Failed to parse AI response' }
      );
    }

    return res.json({
      success: true,
      data: {
        poem: result.poem,
        explanation: result.explanation,
        originalName: originalName || name,  // 返回原始名字用于显示
        processedName: name,                 // 返回处理后的名字
        lineCount,
        cached: false
      }
    });

  } catch (error: any) {
    console.error('Error generating poem:', error);
    return res.status(500).json(
      { success: false, error: error.message || 'Failed to generate poem' }
    );
  }
}
    return res.status(500).json(
      { success: false, error: error.message || 'Failed to generate poem' }
    );
  }
}
