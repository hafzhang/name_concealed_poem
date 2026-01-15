const styleMap: Record<string, string> = {
  'kaishu': '端正平实',
  'xingshu': '飘逸洒脱',
  'caoshu': '豪放狂野',
  'lishu': '古朴典雅',
  'shoujin': '清冷孤傲',
  'niaochong': '华丽绮靡'
};

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { name, originalName, style, styleKeyword, lineCount = 4 } = body;

    if (!name || name.length < 2) {
      return new Response(JSON.stringify({ success: false, error: '名字至少需要2个字符' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const literaryStyle = styleKeyword || styleMap[style] || style || '优美';

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

    const apiKey = process.env.AI_API_KEY || process.env.API_KEY || '';
    const baseURL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';
    const modelName = process.env.AI_MODEL_NAME || 'gpt-4';
    const timeout = parseInt(process.env.AI_TIMEOUT || '60000', 10);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(`${baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: '你是一个帮助生成JSON数据的AI助手。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return new Response(JSON.stringify({
        success: false,
        error: `AI API error: ${response.status} ${response.statusText}`
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || '';
    content = content.replace(/```json\n?|\n?```/g, '').trim();

    let result;
    try {
      result = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to parse AI response',
        raw: content
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        poem: result.poem,
        explanation: result.explanation,
        originalName: originalName || name,
        processedName: name,
        lineCount,
        cached: false
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error generating poem:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to generate poem'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
