import { NextResponse } from 'next/server';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

export const runtime = 'edge';

// Font configuration mapping
interface FontConfig {
  url: string;
  name: string;
}

// Get base URL for font loading (works in both Vercel and Cloudflare)
const getBaseUrl = () => {
  // In production, use the site URL
  // In development, use localhost
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  // For server-side, we'll use relative paths
  return '';
};

// Font URLs mapping - using public directory for local fonts
const getFontConfig = (style: string): FontConfig => {
  const baseUrl = getBaseUrl();

  const fontMap: Record<string, FontConfig> = {
    kaishu: {
      url: `${baseUrl}/fonts/kaishu.ttf`,
      name: 'KaiShu'
    },
    xingshu: {
      url: `${baseUrl}/fonts/zhi-mang-xing.woff`,
      name: 'ZhiMangXing'
    },
    caoshu: {
      url: `${baseUrl}/fonts/liu-jian-mao-cao.woff`,
      name: 'LiuJianMaoCao'
    },
    lishu: {
      url: `${baseUrl}/fonts/qingliaolishu.ttf`,
      name: 'QingLiaoLiShu'
    },
    shoujin: {
      url: `${baseUrl}/fonts/ShouJin.ttf`,
      name: 'ShouJin'
    },
    niaochong: {
      url: `${baseUrl}/fonts/zcool-xiaowei.woff`,
      name: 'ZcoolXiaoWei'
    },
    mianhua: {
      url: `${baseUrl}/fonts/mianhuatang.ttf`,
      name: 'mianhuatang'
    },
    marker: {
      url: `${baseUrl}/fonts/lxgw-marker-gothic.woff`,
      name: 'LXGWMarkerGothic'
    },
    default: {
      url: `${baseUrl}/fonts/noto-serif-sc.woff`,
      name: 'NotoSerifSC'
    }
  };

  return fontMap[style] || fontMap.default;
};

// Helper to load fonts using fetch (Works in Cloudflare Workers)
async function loadFont(style: string): Promise<{ name: string; data: ArrayBuffer }> {
  const fontConfig = getFontConfig(style);

  console.log(`Loading font ${fontConfig.name} from:`, fontConfig.url);

  try {
    // Try fetching from public directory first
    const response = await fetch(fontConfig.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    console.log(`Font ${fontConfig.name} loaded, size: ${arrayBuffer.byteLength} bytes`);
    return { name: fontConfig.name, data: arrayBuffer };
  } catch (error) {
    console.error(`Error loading font ${fontConfig.name}:`, error);
    throw new Error(`Failed to load font ${fontConfig.name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

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

    const fontInfo = await loadFont(style);

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
                  fontFamily: fontInfo.name,
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
