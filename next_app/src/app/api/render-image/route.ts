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
    case 'songti':
      fontPackage = '@fontsource/noto-serif-sc';
      fontFile = 'noto-serif-sc-chinese-simplified-400-normal.woff';
      fontName = 'NotoSerifSC';
      break;
    case 'kuangcao':
      fontPackage = '@fontsource/liu-jian-mao-cao';
      fontFile = 'chinese-simplified-400.css'; // This seems to be a CSS file, let's check the structure again.
      // Wait, ls output showed css files, let's check files subdirectory if it exists or if woff files are in root
      // Checking liu-jian-mao-cao ls output again...
      // It has chinese-simplified-400.css but no 'files' directory visible in the first level ls output?
      // Ah, I missed the files listing for liu-jian-mao-cao.
      // Let's assume standard structure or re-check.
      // Actually, looking at previous ls output for liu-jian-mao-cao:
      // - 400.css
      // - chinese-simplified-400.css
      // ...
      // It DOES NOT seem to have a 'files' folder in the root listing provided.
      // Wait, other packages had 'files' folder.
      // I should double check liu-jian-mao-cao structure.
      // For now, let's use lxgw-wenkai which I know has files.
      fontPackage = '@fontsource/liu-jian-mao-cao'; 
      fontFile = 'files/liu-jian-mao-cao-chinese-simplified-400-normal.woff'; // Guessing
      fontName = 'LiuJianMaoCao';
      break;
    case 'wenkai':
      fontPackage = 'lxgw-wenkai-screen-webfont';
      fontFile = 'lxgwwenkaiscreen-subset-119.woff2'; // This is just a subset, we need the main file or merge subsets?
      // Wait, lxgw-wenkai-screen-webfont splits font into many subset files. Satori might not support this easily if we need full coverage.
      // Satori needs a single font file usually, or we load multiple.
      // Loading 100+ files is bad.
      // Let's check if there is a single woff2 file or if we can use another package.
      // The @fontsource/lxgw-wenkai only had latin.
      // Maybe we can try to find a package with a single file or use a CDN URL if possible (but we prefer local).
      
      // Let's check if lxgw-wenkai-screen-webfont has a full file?
      // The ls output shows many subset files.
      
      // Alternative: Use a CDN for the font data fetch?
      // Or try to install `lxgw-wenkai` (not @fontsource)?
      // Let's try `npm install lxgw-wenkai` if it exists.
      // Or maybe `lxgw-wenkai-lite-webfont` has fewer files?
      
      // Actually, for Satori, we need a single font file that covers the characters we need.
      // Since we don't know the characters in advance (dynamic input), we need a full font.
      
      // Let's check if we can download a single .ttf/.otf file of LXGW WenKai from GitHub or similar source.
      // But I cannot browse arbitrary URLs easily to find the link.
      // I can try to use `lxgw-marker-gothic` which I installed and has `chinese-traditional`? 
      // Wait, does it have simplified?
      // `lxgw-marker-gothic-chinese-traditional-400-normal.woff`
      // Usually Traditional includes Simplified characters visually? Or maybe not.
      
      // Let's try to fetch a known URL for LXGW WenKai Lite or Screen.
      // https://github.com/lxgw/LxgwWenKai/releases/download/v1.330/LXGWWenKai-Regular.ttf
      // I will try to download this file to public/fonts.
      
      fontName = 'LXGWWenKai';
      // I will implement the download logic in a separate step or inside loadFont if file missing.
      // For now, let's point to a path I will create.
      fontPackage = 'local';
      fontFile = 'LXGWWenKai-Regular.ttf';
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
