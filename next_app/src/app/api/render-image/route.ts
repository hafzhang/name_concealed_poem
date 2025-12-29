import { NextResponse } from 'next/server';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { join } from 'path';
import { readFileSync } from 'fs';

// Helper to load fonts
const loadFont = (style: string) => {
  const cwd = process.cwd();
  let fontPackage = '@fontsource/noto-serif-sc';
  let fontFile = 'noto-serif-sc-chinese-simplified-400-normal.woff';
  let fontName = 'NotoSerifSC';

  // Map styles to fonts
  switch (style) {
    case 'kaishu':
      fontPackage = '@fontsource/ma-shan-zheng';
      fontFile = 'ma-shan-zheng-chinese-simplified-400-normal.woff';
      fontName = 'MaShanZheng';
      break;
    case 'xingshu':
      fontPackage = '@fontsource/long-cang';
      fontFile = 'long-cang-chinese-simplified-400-normal.woff';
      fontName = 'LongCang';
      break;
    case 'caoshu':
      fontPackage = '@fontsource/zhi-mang-xing';
      fontFile = 'zhi-mang-xing-chinese-simplified-400-normal.woff';
      fontName = 'ZhiMangXing';
      break;
    case 'lishu':
      fontPackage = '@fontsource/zcool-xiaowei';
      fontFile = 'zcool-xiaowei-chinese-simplified-400-normal.woff';
      fontName = 'ZcoolXiaoWei';
      break;
    case 'shoujin':
      fontPackage = '@fontsource/ma-shan-zheng';
      fontFile = 'files/ma-shan-zheng-chinese-simplified-400-normal.woff';
      fontName = 'MaShanZheng';
      break;
    case 'niaochong':
      fontPackage = '@fontsource/long-cang';
      fontFile = 'files/long-cang-chinese-simplified-400-normal.woff';
      fontName = 'LongCang';
      break;
    case 'marker':
      fontPackage = '@fontsource/lxgw-marker-gothic';
      fontFile = 'lxgw-marker-gothic-chinese-traditional-400-normal.woff'; // It has traditional, maybe not simplified?
      fontName = 'LXGWMarkerGothic';
      break;
    default:
      // Keep default
      break;
  }

  // Try node_modules path
  const fontPath = fontPackage === 'local' 
    ? join(cwd, 'public', 'fonts', fontFile)
    : join(cwd, 'node_modules', fontPackage, 'files', fontFile);
  
  console.log(`Loading font ${fontName} from:`, fontPath);
  
  try {
    return { name: fontName, data: readFileSync(fontPath) };
  } catch (e) {
    // Fallback to searching in local public folder if node_modules fails
    console.error(`Failed to load font from ${fontPath}`, e);
    // Fallback to NotoSerifSC if specific font fails
    try {
        // Try public/fonts/NotoSerifSC.otf first as it is more likely to be there in this env
        const localFallback = join(cwd, 'public', 'fonts', 'NotoSerifSC.otf');
        return { name: 'NotoSerifSC', data: readFileSync(localFallback) };
    } catch (e2) {
        try {
             const fallbackPath = join(cwd, 'node_modules', '@fontsource/noto-serif-sc', 'files', 'noto-serif-sc-chinese-simplified-400-normal.woff');
             return { name: 'NotoSerifSC', data: readFileSync(fallbackPath) };
        } catch (e3) {
             throw new Error(`Font file not found: ${e.message}, ${e2}, ${e3}`);
        }
    }
  }
};

import { appendFileSync } from 'fs';

export async function POST(req: Request) {
  try {
    const { poem, style, bg, frame } = await req.json();

    if (!poem || !Array.isArray(poem) || poem.length !== 4) {
      return NextResponse.json(
        { success: false, error: 'Invalid poem data' },
        { status: 400 }
      );
    }

    const fontInfo = loadFont(style);

    // Frame styles configuration
    const frameStyles: Record<string, any> = {
      none: { padding: '40px', background: '#f5f5f4' }, // bg-stone-100
      silk_scroll: { padding: '60px 40px', background: '#e7e5e4', borderTop: '20px solid #57534e', borderBottom: '20px solid #57534e' }, // 模拟卷轴
      redwood: { padding: '40px', background: '#451a03', border: '10px solid #451a03', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }, // 模拟红木
      golden_wood: { padding: '40px', background: '#d4a373', border: '10px solid #d4a373' },
      cloud_brocade: { padding: '60px', background: '#9f1239' }, // 红色织锦
      modern_black: { padding: '40px', background: '#ffffff', border: '15px solid #1c1917' }, // 黑框
    };

    const currentFrame = frameStyles[frame] || frameStyles.none;

    const containerStyle: any = {
      display: 'flex',
      width: '100%',
      height: '100%',
      backgroundColor: currentFrame.background,
      padding: currentFrame.padding,
      border: currentFrame.border,
      borderTop: currentFrame.borderTop,
      borderBottom: currentFrame.borderBottom,
      boxShadow: currentFrame.boxShadow,
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '48px',
      color: 'black',
      // flexDirection: 'column', // Removed for vertical layout attempt
    };

    // Clean undefined properties to prevent Satori crash
    Object.keys(containerStyle).forEach(key => {
      if (containerStyle[key] === undefined) {
        delete containerStyle[key];
      }
    });

    // Satori rendering
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: containerStyle,
          children: [
            {
              type: 'div',
              props: {
                 style: {
                   display: 'flex',
                   flexDirection: 'row-reverse', // Right to left
                   gap: '40px',
                 },
                 children: poem.map((line: string, i: number) => ({
                    type: 'div',
                    key: `line-${i}`,
                    props: {
                      style: {
                        display: 'flex',
                        flexDirection: 'column', // Top to bottom
                        fontSize: '48px',
                        lineHeight: '1.2',
                        color: '#1c1917',
                      },
                      children: (line || '').split('').map((char, j) => ({
                        type: 'div',
                        key: `char-${j}`,
                        props: {
                          children: char || ' ',
                          style: { marginBottom: '10px' }
                        }
                      }))
                    }
                 }))
              }
            },
            // Seal (Chop)
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  bottom: '60px',
                  left: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                },
                children: [
                   {
                     type: 'div',
                     props: {
                       children: '乙巳年 · 题',
                       style: { fontSize: '20px', color: '#57534e', marginBottom: '10px' }
                     }
                   },
                   {
                     type: 'div',
                     props: {
                       style: {
                         width: '50px',
                         height: '50px',
                         border: '3px solid #dc2626',
                         color: '#dc2626',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         fontSize: '24px',
                         borderRadius: '4px',
                       },
                       children: '印'
                     }
                   }
                ]
              }
            }
          ]
        },
        key: 'container'
      },
      {
        width: 800,
        height: 1200,
        fonts: [
          {
            name: fontInfo.name,
            data: fontInfo.data,
            weight: 400,
            style: 'normal',
          },
        ],
      }
    );

    // Resvg rendering
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: 800,
      },
    });
    
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    
    // For MVP, return base64 data URI directly to avoid Supabase storage setup complexity for now
    const base64Image = `data:image/png;base64,${pngBuffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: base64Image,
        remainingCredits: 2
      }
    });

  } catch (error) {
    console.error('Error rendering image:', error);
    return NextResponse.json(
      { success: false, error: `Failed to render image: ${error instanceof Error ? error.message : String(error)}`, stack: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
}
