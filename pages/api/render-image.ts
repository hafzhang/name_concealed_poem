import satori from 'satori';

export const config = {
  runtime: 'edge',
};

const loadFont = async (style: string) => {
  let fontUrl: string;
  let fontName = 'NotoSerifSC';

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

  try {
    const response = await fetch(fontUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch font: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return { name: fontName, data: arrayBuffer };
  } catch (e) {
    console.error('Font loading error:', e);
    try {
      const fallbackUrl = `${baseUrl}/fonts/NotoSerifSC.woff`;
      const response = await fetch(fallbackUrl);
      if (!response.ok) throw new Error(`Failed to fetch fallback font`);
      const arrayBuffer = await response.arrayBuffer();
      return { name: 'NotoSerifSC', data: arrayBuffer };
    } catch {
      throw new Error(`Font file not found`);
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

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await req.json();
    const { poem, style, bg, frame, name, lineCount = 4 } = body;

    if (!poem || !Array.isArray(poem) || poem.length < 2 || poem.length > 6) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid poem data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Load font
    const fontData = await loadFont(style);

    // Load fallback font
    let fallbackFontData = null;
    if (fontData.name !== 'NotoSerifSC') {
      try {
        fallbackFontData = await loadFont('default');
      } catch (e) {
        console.error('Failed to load fallback font', e);
      }
    }

    const getFontSize = (poemLength: number) => {
      switch (poemLength) {
        case 2: return 72;
        case 4: return 64;
        case 6: return 52;
        default: return 64;
      }
    };

    const getGapSize = (poemLength: number) => {
      switch (poemLength) {
        case 2: return '80px';
        case 4: return '50px';
        case 6: return '35px';
        default: return '50px';
      }
    };

    const fontSize = getFontSize(poem.length);
    const gapSize = getGapSize(poem.length);

    const sealText = name ? (name.length > 2 ? name.slice(-2) : name) : '印';
    const isSealTwoChars = sealText.length > 1;

    // Build poem elements
    const poemElements = [
      // Main poem content - vertical text
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'row-reverse',
            gap: gapSize,
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
                flexDirection: 'column',
                fontSize: `${fontSize}px`,
                lineHeight: '1.2',
                color: '#1c1917',
                fontFamily: fallbackFontData ? `${fontData.name}, ${fallbackFontData.name}` : fontData.name,
              },
              children: (line || '').split('').map((char: string, j: number) => ({
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
      // Seal and year info
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
            // Year text
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  fontSize: '32px',
                  color: '#57534e',
                  fontFamily: fontData.name,
                  opacity: 0.8,
                },
                children: ['乙', '巳', '年'].map((char: string, i: number) => ({
                  type: 'div',
                  key: `year-${i}`,
                  props: {
                    children: char,
                    style: { marginBottom: '8px' }
                  }
                }))
              }
            },
            // Seal
            {
              type: 'div',
              props: {
                style: {
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#b91c1c',
                  color: 'white',
                  display: 'flex',
                  flexDirection: isSealTwoChars ? 'column' : 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isSealTwoChars ? '36px' : '48px',
                  borderRadius: '12px',
                  fontFamily: fontData.name,
                  border: '3px solid #991b1b',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
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

    // Select mounting component based on frame
    const renderFrame = (frameType: string, children: any[]) => {
      const commonStyle = { display: 'flex', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center', position: 'relative' };

      switch (frameType) {
        case 'silk_scroll':
          return SilkScroll({ children });
        case 'redwood':
          return Redwood({ children });
        case 'golden_wood':
          return GoldenWood({ children });
        case 'cloud_brocade':
          return CloudBrocade({ children });
        case 'modern_black':
          return ModernBlack({ children });
        case 'sakura_pink':
          return SakuraPink({ children });
        case 'mint_green':
          return MintGreen({ children });
        case 'lavender_mist':
          return LavenderMist({ children });
        case 'champagne_gold':
          return ChampagneGold({ children });
        case 'azure_porcelain':
          return AzurePorcelain({ children });
        default:
          return {
            type: 'div',
            props: {
              style: { ...commonStyle, backgroundColor: '#f5f5f4', padding: '40px' },
              children
            }
          };
      }
    };

    const svg = await satori(
      renderFrame(frame, poemElements) as any,
      {
        width: 800,
        height: 1200,
        fonts: [
          {
            name: fontData.name,
            data: fontData.data,
            weight: 400,
            style: 'normal',
          },
          ...(fallbackFontData ? [{
            name: fallbackFontData.name,
            data: fallbackFontData.data,
            weight: 400,
            style: 'normal',
          } as const] : []),
        ],
      }
    );

    // Return SVG as base64 data URL for easy display
    const base64Svg = `data:image/svg+xml;base64,${btoa(svg)}`;

    return new Response(JSON.stringify({
      success: true,
      data: base64Svg
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error rendering image:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to render image'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
