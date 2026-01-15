import type { NextApiRequest, NextApiResponse } from 'next';
import satori from 'satori';

// Edge Runtime compatible - no native Node.js modules
export const config = {
  runtime: 'edge',
};

// Helper to load fonts using fetch for Edge Runtime compatibility
const loadFont = async (style: string) => {
  let fontUrl: string;
  let fontName = 'NotoSerifSC';

  // Map styles to font URLs (public folder URLs)
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.CF_PAGES_URL
    ? process.env.CF_PAGES_URL
    : 'http://localhost:3000';

  switch (style) {
    case 'kaishu':
      fontUrl = `${baseUrl}/fonts/kaishu.ttf`;
      fontName = 'KaiShu';
      break;
    case 'xingshu':
      fontUrl = `${baseUrl}/fonts/zhi-mang-xing.woff`;
      fontName = 'ZhiMangXing';
      break;
    case 'caoshu':
      fontUrl = `${baseUrl}/fonts/liu-jian-mao-cao.woff`;
      fontName = 'LiuJianMaoCao';
      break;
    case 'lishu':
      fontUrl = `${baseUrl}/fonts/qingliaolishu.ttf`;
      fontName = 'QingLiaoLiShu';
      break;
    case 'shoujin':
      fontUrl = `${baseUrl}/fonts/ShouJin.ttf`;
      fontName = 'ShouJin';
      break;
    case 'niaochong':
      fontUrl = `${baseUrl}/fonts/zcool-xiaowei.woff`;
      fontName = 'ZcoolXiaoWei';
      break;
    case 'mianhua':
      fontUrl = `${baseUrl}/fonts/mianhuatang.woff2`;
      fontName = 'mianhuatang';
      break;
    case 'marker':
      fontUrl = `${baseUrl}/fonts/lxgw-marker-gothic.woff`;
      fontName = 'LXGWMarkerGothic';
      break;
    default:
      fontUrl = `${baseUrl}/fonts/NotoSerifSC.woff`;
      fontName = 'NotoSerifSC';
      break;
  }

  console.log(`Loading font ${fontName} from:`, fontUrl);

  try {
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    console.log(`Font ${fontName} loaded, size: ${arrayBuffer.byteLength} bytes`);
    return { name: fontName, data: arrayBuffer };
  } catch (e) {
    console.error(`Failed to load font from ${fontUrl}`, e);
    // Fallback to NotoSerifSC
    try {
      const fallbackUrl = `${baseUrl}/fonts/NotoSerifSC.woff`;
      const response = await fetch(fallbackUrl);
      if (!response.ok) throw new Error(`Failed to fetch fallback font: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      return { name: 'NotoSerifSC', data: arrayBuffer };
    } catch (e2) {
      throw new Error(`Font file not found: ${String(e)}, ${String(e2)}`);
    }
  }
};

import { SilkScroll } from '../../src/lib/render-image/SilkScroll';
import { Redwood } from '../../src/lib/render-image/Redwood';
import { GoldenWood } from '../../src/lib/render-image/GoldenWood';
import { CloudBrocade } from '../../src/lib/render-image/CloudBrocade';
import { ModernBlack } from '../../src/lib/render-image/ModernBlack';
import { SakuraPink } from '../../src/lib/render-image/SakuraPink';
import { MintGreen } from '../../src/lib/render-image/MintGreen';
import { LavenderMist } from '../../src/lib/render-image/LavenderMist';
import { ChampagneGold } from '../../src/lib/render-image/ChampagneGold';
import { AzurePorcelain } from '../../src/lib/render-image/AzurePorcelain';

export default async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return new NextResponse(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { poem, style, bg, frame, name, lineCount = 4 } = body;

    if (!poem || !Array.isArray(poem) || poem.length < 2 || poem.length > 6) {
      return new NextResponse(JSON.stringify({ success: false, error: 'Invalid poem data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
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

    // Load fallback font (NotoSerifSC) to prevent blank text if main font fails or misses glyphs
    let fallbackFontInfo = null;
    if (fontInfo.name !== 'NotoSerifSC') {
        try {
            fallbackFontInfo = await loadFont('default');
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

    // Satori rendering - returns SVG directly for Edge Runtime compatibility
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

    // Return SVG as base64 data URI for Edge Runtime compatibility
    // Client can convert to PNG if needed using canvas or other libraries
    const base64Svg = `data:image/svg+xml;base64,${btoa(svg)}`;

    return new NextResponse(JSON.stringify({
      success: true,
      data: {
        imageUrl: base64Svg,
        format: 'svg',
        remainingCredits: 2
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error rendering image:', error);
    return new NextResponse(JSON.stringify({
      success: false,
      error: `Failed to render image: ${error instanceof Error ? error.message : String(error)}`,
      stack: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
