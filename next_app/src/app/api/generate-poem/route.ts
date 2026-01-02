import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

// Map font styles to literary styles for better poem generation
const styleMap: Record<string, string> = {
  'kaishu': '端正平实',
  'xingshu': '飘逸洒脱',
  'caoshu': '豪放狂野',
  'lishu': '古朴典雅',
  'shoujin': '清冷孤傲',
  'niaochong': '华丽绮靡'
};

export async function POST(req: Request) {
  try {
    const { name, style, styleKeyword } = await req.json();

    if (!name || name.length < 2 || name.length > 4) {
      return NextResponse.json(
        { success: false, error: 'Name must be between 2 and 4 characters' },
        { status: 400 }
      );
    }

    // Determine literary style
    const literaryStyle = styleKeyword || styleMap[style] || style || '优美';

    // Construct the prompt
    const prompt = `你是一个国学大师。请为"${name}"创作一首五言绝句藏头诗。
    
    要求：
    1. 必须是藏头诗，每句的第一个字依次是"${name}"中的字。如果名字只有两个字，则前两句藏头；如果三个字，前三句藏头。
    2. 风格要求：${literaryStyle}。
    3. 必须严格按照以下JSON格式返回，不要包含Markdown代码块或其他多余字符。
    4.诗句的前后语义要顺畅，搭配流畅，不能生硬转折。
    
    JSON格式模板：
    {
      "poem": ["第一句", "第二句", "第三句", "第四句"],
      "explanation": "对这首诗的简短意境赏析"
    }`;

    // Call AI API
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL_NAME || 'glm-4',
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
      // Fallback if JSON parsing fails (extremely rare with GLM-4 and proper prompt)
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        poem: result.poem,
        explanation: result.explanation,
        cached: false
      }
    });

  } catch (error: any) {
    console.error('Error generating poem:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate poem' },
      { status: 500 }
    );
  }
}
