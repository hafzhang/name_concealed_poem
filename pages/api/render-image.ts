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

    let Component;
    switch (bg) {
      case 'silk_scroll': Component = SilkScroll; break;
      case 'redwood': Component = Redwood; break;
      case 'golden_wood': Component = GoldenWood; break;
      case 'cloud_brocade': Component = CloudBrocade; break;
      case 'modern_black': Component = ModernBlack; break;
      case 'sakura_pink': Component = SakuraPink; break;
      case 'mint_green': Component = MintGreen; break;
      case 'lavender_mist': Component = LavenderMist; break;
      case 'champagne_gold': Component = ChampagneGold; break;
      case 'azure_porcelain': Component = AzurePorcelain; break;
      default: Component = SilkScroll;
    }

    const fontData = await loadFont(style);

    const svg = await satori(
      Component({ poem, name, style, font: fontData.name }),
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
        ],
      }
    );

    return new Response(JSON.stringify({
      success: true,
      data: svg
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
