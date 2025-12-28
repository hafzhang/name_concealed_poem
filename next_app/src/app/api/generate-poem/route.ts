import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { name, style } = await req.json();

    if (!name || name.length < 2 || name.length > 4) {
      return NextResponse.json(
        { success: false, error: 'Name must be between 2 and 4 characters' },
        { status: 400 }
      );
    }

    // Mock response simulation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock data based on input
    const mockPoem = [
      `${name[0]}风拂面柳丝长`,
      `${name[1] || '花'}影摇红入画堂`,
      `春色满园关不住`,
      `一枝红杏出墙来`
    ];

    if (name.length >= 3) {
       mockPoem[2] = `${name[2]}鸟鸣春意闹`;
    }

    return NextResponse.json({
      success: true,
      data: {
        poem: mockPoem,
        explanation: `这是一首为${name}创作的${style === 'hao_fang' ? '豪放' : '婉约'}藏头诗，寓意美好。`,
        cached: false
      }
    });

  } catch (error) {
    console.error('Error generating poem:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate poem' },
      { status: 500 }
    );
  }
}
