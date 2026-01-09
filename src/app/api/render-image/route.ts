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
      fontPackage = 'local';
      fontFile = 'kaishu.ttf';
      fontName = 'KaiShu';
      break;
    case 'xingshu':
      fontPackage = '@fontsource/zhi-mang-xing';
      fontFile = 'zhi-mang-xing-chinese-simplified-400-normal.woff';
      fontName = 'ZhiMangXing';
      break;
    case 'caoshu':
      fontPackage = '@fontsource/liu-jian-mao-cao';
      fontFile = 'liu-jian-mao-cao-chinese-simplified-400-normal.woff';
      fontName = 'LiuJianMaoCao';
      break;
    case 'lishu':
      fontPackage = 'local';
      fontFile = 'qingliaolishu.ttf';
      fontName = 'QingLiaoLiShu';
      break;
    case 'shoujin':
      fontPackage = 'local';
      fontFile = 'ShouJin.ttf';
      fontName = 'ShouJin';
      break;
    case 'niaochong':
      fontPackage = '@fontsource/zcool-xiaowei';
      fontFile = 'zcool-xiaowei-chinese-simplified-400-normal.woff';
      fontName = 'ZcoolXiaoWei';
      break;
    case 'mianhua':
      fontPackage = 'local';
      fontFile = 'mianhuatang.ttf';
      fontName = 'mianhuatang';
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
      const fontData = readFileSync(fontPath);
      console.log(`Font ${fontName} loaded, size: ${fontData.byteLength} bytes`);
      return { name: fontName, data: fontData };
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
             throw new Error(`Font file not found: ${String(e)}, ${String(e2)}, ${String(e3)}`);
        }
    }
  }
};

import { SilkScroll } from './mountings/SilkScroll';
import { Redwood } from './mountings/Redwood';
import { GoldenWood } from './mountings/GoldenWood';
import { CloudBrocade } from './mountings/CloudBrocade';
import { ModernBlack } from './mountings/ModernBlack';
import { SakuraPink } from './mountings/SakuraPink';
import { MintGreen } from './mountings/MintGreen';
import { LavenderMist } from './mountings/LavenderMist';
import { ChampagneGold } from './mountings/ChampagneGold';
import { AzurePorcelain } from './mountings/AzurePorcelain';

export async function POST(req: Request) {
  try {
    const { poem, style, bg, frame, name, lineCount = 4 } = await req.json();

    if (!poem || !Array.isArray(poem) || poem.length < 2 || poem.length > 6) {
      return NextResponse.json(
        { success: false, error: 'Invalid poem data' },
        { status: 400 }
      );
    }

    const fontInfo = loadFont(style);

    // Prepare seal text
    const sealText = name ? (name.length > 2 ? name.slice(-2) : name) : '印';
    const isSealTwoChars = sealText.length > 1;

    // 根据诗句数量动态调整布局
    const poemLength = poem.length;

    // 动态计算字体大小（诗句越多，字体越小）
    const getFontSize = (lineCount: number) => {
      switch (lineCount) {
        case 2: return 72;  // 2行诗用较大字体
        case 4: return 64;  // 4行诗用默认字体
        case 6: return 52;  // 6行诗用较小字体
        default: return 64;
      }
    };

    const fontSize = getFontSize(poemLength);

    // 动态计算垂直间距
    const getGapSize = (lineCount: number) => {
      switch (lineCount) {
        case 2: return '80px';  // 2行诗间距较大
        case 4: return '50px';  // 4行诗默认间距
        case 6: return '35px';  // 6行诗间距较小
        default: return '50px';
      }
    };

    const gapSize = getGapSize(poemLength);

    // Load fallback font (NotoSerifSC) to prevent blank text if main font fails or misses glyphs
    let fallbackFontInfo = null;
    if (fontInfo.name !== 'NotoSerifSC') {
        try {
            fallbackFontInfo = loadFont('default');
        } catch (e) {
            console.error('Failed to load fallback font', e);
        }
    }

    // Helper to render complex frames
    const renderFrame = (frameType: string, children: any[]) => {
      const commonStyle = { display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative' };
      
      switch (frameType) {
        // --- Traditional / Classic Styles ---
        case 'silk_scroll': // 绫罗卷轴
          return SilkScroll({ children });
        case 'redwood': // 红木画框
          return Redwood({ children });
        case 'golden_wood': // 金丝楠木
          return GoldenWood({ children });
        case 'cloud_brocade': // 云纹锦缎
            return CloudBrocade({ children });
        case 'modern_black': // 极简黑框
          return ModernBlack({ children });

        // --- Girl-Friendly Styles ---
        case 'sakura_pink': // 樱花漫舞
           return SakuraPink({ children });
        case 'mint_green': // 清风竹影
           return MintGreen({ children });
        case 'lavender_mist': // 紫气东来
           return LavenderMist({ children });
        case 'champagne_gold': // 流金岁月
            return ChampagneGold({ children });
        case 'azure_porcelain': // 青瓷纹饰
            return AzurePorcelain({ children });
        
        default: // 'none' and fallback
           return {
             type: 'div',
             props: {
               style: { ...commonStyle, backgroundColor: '#f5f5f4', padding: '40px' },
               children
             }
           };
      }
    };

    // Construct the poem content elements
    const poemElements = [
      {
        type: 'div',
        props: {
            style: {
              display: 'flex',
              flexDirection: 'row-reverse', // Right to left
              gap: gapSize,  // 使用动态计算的间距
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            },
            children: poem.map((line: string, i: number) => ({
              type: 'div',
              key: `line-${i}`,
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column', // Top to bottom
                  fontSize: `${fontSize}px`,  // 使用动态计算的字体大小
                  lineHeight: '1.2',
                  color: '#1c1917',
                  fontFamily: fallbackFontInfo ? `${fontInfo.name}, ${fallbackFontInfo.name}` : fontInfo.name,
                },
                children: (line || '').split('').map((char, j) => ({
                  type: 'div',
                  key: `char-${j}`,
                  props: {
                    children: char || ' ',
                    style: { marginBottom: '15px' }
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
            gap: '15px',
          },
          children: [
              // Vertical Year Text
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    fontSize: '32px', // Increased from 24px
                    color: '#57534e',
                    fontFamily: fontInfo.name, // Use same font for consistency
                    opacity: 0.8,
                  },
                  children: ['乙', '巳', '年'].map((char, i) => ({
                    type: 'div',
                    key: `year-${i}`,
                    props: {
                      children: char,
                      style: { marginBottom: '8px' } // Increased spacing
                    }
                  }))
                }
              },
              // Red Seal
              {
                type: 'div',
                props: {
                  style: {
                    width: '80px', // Increased from 60px
                    height: '80px', // Increased from 60px
                    backgroundColor: '#b91c1c', // Red background
                    color: 'white',
                    display: 'flex',
                    flexDirection: isSealTwoChars ? 'column' : 'row', // Vertical for 2 chars
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isSealTwoChars ? '36px' : '48px', // Increased from 22px/32px
                    borderRadius: '12px', // Slightly rounded
                    fontFamily: fontInfo.name,
                    border: '3px solid #991b1b', // Thicker border
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
                    gap: isSealTwoChars ? '0px' : '0',
                  },
                  children: sealText.split('').map((char: string, i: number) => ({
                    type: 'div',
                    key: `seal-${i}`,
                    props: { 
                      children: char,
                      style: { lineHeight: '1' }
                    }
                  }))
                }
              }
          ]
        }
      }
    ];

    // Satori rendering
    const svg = await satori(
      renderFrame(frame, poemElements) as any,
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
          ...(fallbackFontInfo ? [{
            name: fallbackFontInfo.name,
            data: fallbackFontInfo.data,
            weight: 400,
            style: 'normal',
          } as const] : []),
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
