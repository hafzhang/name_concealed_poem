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
             throw new Error(`Font file not found: ${e.message}, ${e2}, ${e3}`);
        }
    }
  }
};

import { appendFileSync } from 'fs';

export async function POST(req: Request) {
  try {
    const { poem, style, bg, frame, name } = await req.json();

    if (!poem || !Array.isArray(poem) || poem.length !== 4) {
      return NextResponse.json(
        { success: false, error: 'Invalid poem data' },
        { status: 400 }
      );
    }

    const fontInfo = loadFont(style);
    
    // Prepare seal text
    const sealText = name ? (name.length > 2 ? name.slice(-2) : name) : '印';
    const isSealTwoChars = sealText.length > 1;

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
        case 'silk_scroll': // 绫罗卷轴 (Upgraded)
          return {
            type: 'div',
            props: {
              style: { ...commonStyle, backgroundColor: '#f5f5f4', flexDirection: 'column', justifyContent: 'space-between' },
              children: [
                // Top Scroll Bar
                { type: 'div', props: { style: { width: '100%', height: '20px', backgroundColor: '#4a4a4a', borderRadius: '10px 10px 0 0', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' } } },
                // Top Silk Section
                { type: 'div', props: { style: { width: '100%', height: '80px', backgroundColor: '#d6d3d1', borderBottom: '2px solid #a8a29e', backgroundImage: 'linear-gradient(45deg, #d6d3d1 25%, #e7e5e4 25%, #e7e5e4 50%, #d6d3d1 50%, #d6d3d1 75%, #e7e5e4 75%, #e7e5e4 100%)', backgroundSize: '20px 20px' } } },
                // Content Area (Paper)
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flex: 1, width: '100%', backgroundColor: '#fffbf0', padding: '40px', justifyContent: 'center', alignItems: 'center', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)' },
                    children
                  }
                },
                // Bottom Silk Section
                { type: 'div', props: { style: { width: '100%', height: '80px', backgroundColor: '#d6d3d1', borderTop: '2px solid #a8a29e', backgroundImage: 'linear-gradient(45deg, #d6d3d1 25%, #e7e5e4 25%, #e7e5e4 50%, #d6d3d1 50%, #d6d3d1 75%, #e7e5e4 75%, #e7e5e4 100%)', backgroundSize: '20px 20px' } } },
                // Bottom Scroll Bar (Roller)
                { type: 'div', props: { style: { width: '100%', height: '30px', backgroundColor: '#4a4a4a', borderRadius: '0 0 15px 15px', boxShadow: '0 -2px 5px rgba(0,0,0,0.3)' } } },
              ]
            }
          };
        case 'redwood': // 红木画框 (Upgraded)
          return {
            type: 'div',
            props: {
              style: { ...commonStyle, backgroundColor: '#451a03', border: '25px solid #451a03', borderRadius: '4px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' },
              children: [
                // Inner Gold Trim
                { type: 'div', props: { style: { position: 'absolute', top: '0', left: '0', right: '0', bottom: '0', border: '2px solid #b45309' } } },
                // Inner Matting (Beige)
                {
                   type: 'div',
                   props: {
                     style: { display: 'flex', width: '100%', height: '100%', backgroundColor: '#fef3c7', padding: '30px', justifyContent: 'center', alignItems: 'center', border: '5px solid #78350f' },
                     children: [
                        // Content Background
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', width: '100%', height: '100%', backgroundColor: '#fffbeb', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 10px rgba(0,0,0,0.2)' },
                            children
                          }
                        }
                     ]
                   }
                }
              ]
            }
          };
        case 'golden_wood': // 金丝楠木 (Upgraded)
          return {
            type: 'div',
            props: {
              style: { ...commonStyle, backgroundColor: '#b45309', border: '20px solid #b45309' },
              children: [
                 // Ornate Gold Pattern (Simplified)
                 { type: 'div', props: { style: { position: 'absolute', top: '5px', left: '5px', right: '5px', bottom: '5px', border: '5px solid #fbbf24' } } },
                 // Content
                 {
                   type: 'div',
                   props: {
                     style: { display: 'flex', width: '100%', height: '100%', backgroundColor: '#fff7ed', padding: '40px', justifyContent: 'center', alignItems: 'center' },
                     children
                   }
                 }
              ]
            }
          };
        case 'cloud_brocade': // 云纹锦缎 (Upgraded)
            return {
              type: 'div',
              props: {
                style: { ...commonStyle, backgroundColor: '#9f1239', border: '15px solid #881337' },
                children: [
                   // Inner Gold Border
                   {
                     type: 'div',
                     props: { style: { position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', border: '2px solid #fcd34d' } }
                   },
                   // Cloud Pattern Corners (Simulated with circles)
                   { type: 'div', props: { style: { position: 'absolute', top: '15px', left: '15px', width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #fcd34d', borderRightColor: 'transparent', borderBottomColor: 'transparent', transform: 'rotate(-45deg)' } } },
                   { type: 'div', props: { style: { position: 'absolute', top: '15px', right: '15px', width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #fcd34d', borderLeftColor: 'transparent', borderBottomColor: 'transparent', transform: 'rotate(45deg)' } } },
                   { type: 'div', props: { style: { position: 'absolute', bottom: '15px', left: '15px', width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #fcd34d', borderRightColor: 'transparent', borderTopColor: 'transparent', transform: 'rotate(-135deg)' } } },
                   { type: 'div', props: { style: { position: 'absolute', bottom: '15px', right: '15px', width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #fcd34d', borderLeftColor: 'transparent', borderTopColor: 'transparent', transform: 'rotate(135deg)' } } },
                   // Content Background (Rice Paper)
                   {
                     type: 'div',
                     props: {
                       style: { display: 'flex', width: '90%', height: '90%', backgroundColor: '#f5f5f4', padding: '40px', justifyContent: 'center', alignItems: 'center', boxShadow: '0 0 20px rgba(0,0,0,0.3)' },
                       children
                     }
                   }
                ]
              }
            };
        case 'modern_black': // 极简黑框 (Upgraded)
          return {
            type: 'div',
            props: {
              style: { ...commonStyle, backgroundColor: '#1c1917', border: '20px solid #1c1917' },
              children: [
                 // White Matting
                 {
                   type: 'div',
                   props: {
                     style: { display: 'flex', width: '100%', height: '100%', backgroundColor: '#ffffff', padding: '60px', justifyContent: 'center', alignItems: 'center' },
                     children: [
                        // Inner Thin Line
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', width: '100%', height: '100%', border: '1px solid #e5e5e5', justifyContent: 'center', alignItems: 'center', padding: '20px' },
                            children
                          }
                        }
                     ]
                   }
                 }
              ]
            }
          };

        // --- Girl-Friendly Styles ---
        case 'sakura_pink': // 樱花漫舞
           return {
             type: 'div',
             props: {
               style: { ...commonStyle, backgroundColor: '#fff1f2', border: '20px solid #fecdd3' },
               children: [
                 // Decorative Inner Border
                 {
                   type: 'div',
                   props: { style: { position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', border: '1px solid #fda4af' } }
                 },
                 // Corner Petals (Top Left)
                 { type: 'div', props: { style: { position: 'absolute', top: '10px', left: '10px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fbcfe8' } } },
                 { type: 'div', props: { style: { position: 'absolute', top: '22px', left: '8px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f9a8d4' } } },
                 { type: 'div', props: { style: { position: 'absolute', top: '8px', left: '22px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f9a8d4' } } },
                 // Corner Petals (Bottom Right)
                 { type: 'div', props: { style: { position: 'absolute', bottom: '10px', right: '10px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fbcfe8' } } },
                 { type: 'div', props: { style: { position: 'absolute', bottom: '22px', right: '8px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f9a8d4' } } },
                 { type: 'div', props: { style: { position: 'absolute', bottom: '8px', right: '22px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f9a8d4' } } },
                 // Content Container
                 {
                   type: 'div',
                   props: {
                     style: { display: 'flex', width: '100%', height: '100%', padding: '40px', justifyContent: 'center', alignItems: 'center' },
                     children
                   }
                 }
               ]
             }
           };
        case 'mint_green': // 清风竹影
           return {
             type: 'div',
             props: {
               style: { ...commonStyle, backgroundColor: '#f0fdf4', border: '20px solid #bbf7d0' },
               children: [
                 // Inner Dashed Border
                 {
                   type: 'div',
                   props: { style: { position: 'absolute', top: '20px', left: '20px', right: '20px', bottom: '20px', border: '2px dashed #86efac' } }
                 },
                 // Bamboo Joint Decorations (Simple Lines)
                 { type: 'div', props: { style: { position: 'absolute', top: '50%', left: '0', width: '20px', height: '2px', backgroundColor: '#86efac' } } },
                 { type: 'div', props: { style: { position: 'absolute', top: '50%', right: '0', width: '20px', height: '2px', backgroundColor: '#86efac' } } },
                 // Content
                 {
                   type: 'div',
                   props: {
                     style: { display: 'flex', width: '100%', height: '100%', padding: '40px', justifyContent: 'center', alignItems: 'center' },
                     children
                   }
                 }
               ]
             }
           };
        case 'lavender_mist': // 紫气东来
           return {
             type: 'div',
             props: {
               style: { ...commonStyle, backgroundColor: '#faf5ff', border: '20px solid #e9d5ff' },
               children: [
                 // Inner Rounded Border
                 {
                   type: 'div',
                   props: { style: { position: 'absolute', top: '25px', left: '25px', right: '25px', bottom: '25px', border: '1px solid #d8b4fe', borderRadius: '20px' } }
                 },
                 // Content
                 {
                   type: 'div',
                   props: {
                     style: { display: 'flex', width: '100%', height: '100%', padding: '40px', justifyContent: 'center', alignItems: 'center' },
                     children
                   }
                 }
               ]
             }
           };
        case 'champagne_gold': // 流金岁月 (Upgraded)
            return {
              type: 'div',
              props: {
                style: { ...commonStyle, backgroundColor: '#fffbeb', border: '20px solid #fde68a' },
                children: [
                  // Double Inner Border - using standard border instead of double which might be failing in Satori
                  {
                    type: 'div',
                    props: { style: { position: 'absolute', top: '15px', left: '15px', right: '15px', bottom: '15px', border: '4px solid #fbbf24' } }
                  },
                   {
                    type: 'div',
                    props: { style: { position: 'absolute', top: '23px', left: '23px', right: '23px', bottom: '23px', border: '1px solid #fbbf24' } }
                  },
                  // Content
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', width: '100%', height: '100%', padding: '40px', justifyContent: 'center', alignItems: 'center' },
                      children
                    }
                  }
                ]
              }
            };
        
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
              gap: '50px',
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
                  fontSize: '64px',
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
                    fontSize: '24px',
                    color: '#57534e',
                    fontFamily: fontInfo.name, // Use same font for consistency
                    opacity: 0.8,
                  },
                  children: ['乙', '巳', '年'].map((char, i) => ({
                    type: 'div',
                    key: `year-${i}`,
                    props: {
                      children: char,
                      style: { marginBottom: '5px' }
                    }
                  }))
                }
              },
              // Red Seal
              {
                type: 'div',
                props: {
                  style: {
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#b91c1c', // Red background
                    color: 'white',
                    display: 'flex',
                    flexDirection: isSealTwoChars ? 'column' : 'row', // Vertical for 2 chars
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isSealTwoChars ? '22px' : '32px', // Smaller font for 2 chars
                    borderRadius: '8px', // Slightly rounded
                    fontFamily: fontInfo.name,
                    border: '2px solid #991b1b',
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
      renderFrame(frame, poemElements),
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