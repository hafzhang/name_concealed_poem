import type { NextApiRequest, NextApiResponse } from 'next';
import React from 'react';
import satori from 'satori';
import path from 'path';
import fs from 'fs';

type ImageResponse = {
  success?: boolean;
  error?: string;
  details?: string;
};

// Use Node.js compatibility mode on Cloudflare (with nodejs_compat flag)
export const config = {
  runtime: 'nodejs',
};

// Font configurations with valid font files
const FONT_CONFIG: Record<string, { path: string; name: string }> = {
  'kaishu': { path: '/fonts/kaishu.ttf', name: 'KaiShu' },
  'xingshu': { path: '/fonts/zhi-mang-xing.woff', name: 'ZhiMangXing' },
  'caoshu': { path: '/fonts/liu-jian-mao-cao.woff', name: 'LiuJianMaoCao' },
  'lishu': { path: '/fonts/qingliaolishu.ttf', name: 'QingLiaoLiShu' },
  'shoujin': { path: '/fonts/ShouJin.ttf', name: 'ShouJin' },
  'niaochong': { path: '/fonts/zcool-xiaowei.woff', name: 'ZcoolXiaoWei' },
  // 棉花糖 · 俏皮 style
  'mianhua': { path: '/fonts/ShanHaiMianHuaTangW-2.ttf', name: 'ShanHaiMianHuaTang' },
  'marker': { path: '/fonts/lxgw-marker-gothic.woff', name: 'LXGWMarkerGothic' },
  // Default to kaishu since it's a valid font file
  'default': { path: '/fonts/kaishu.ttf', name: 'KaiShu' },
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  if (typeof btoa === 'function') {
    return btoa(binary);
  }
  return Buffer.from(binary, 'binary').toString('base64');
};

const loadFont = async (style: string): Promise<{ name: string; data: ArrayBuffer }> => {
  const config = FONT_CONFIG[style] || FONT_CONFIG['default'];

  // In production, fonts are in public/fonts
  // Remove leading slash and construct path
  const fontFileName = path.basename(config.path);
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'fonts', fontFileName), // public/fonts/xxx.ttf
    path.join(process.cwd(), '.next', 'static', 'fonts', fontFileName), // .next/static/fonts/xxx.ttf
    path.join(process.cwd(), 'fonts', fontFileName), // root fonts/xxx.ttf
  ];

  let fontPath = possiblePaths[0];
  let fontBuffer: Buffer | null = null;

  for (const tryPath of possiblePaths) {
    if (fs.existsSync(tryPath)) {
      fontPath = tryPath;
      fontBuffer = fs.readFileSync(tryPath);
      break;
    }
  }

  if (!fontBuffer) {
    throw new Error(`Font file not found: ${config.path}. Tried paths: ${possiblePaths.join(', ')}`);
  }

  // Convert Buffer to ArrayBuffer
  const arrayBuffer = fontBuffer.buffer.slice(
    fontBuffer.byteOffset,
    fontBuffer.byteOffset + fontBuffer.byteLength
  );

  // Validate ArrayBuffer
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error(`Font file is empty: ${fontPath}`);
  }

  // Check minimum valid font file size (at least 1KB)
  if (arrayBuffer.byteLength < 1024) {
    throw new Error(`Font file too small, possibly invalid: ${arrayBuffer.byteLength} bytes`);
  }

  console.log(`Font loaded: ${config.name}, size: ${arrayBuffer.byteLength} bytes from ${fontPath}`);
  return { name: config.name, data: arrayBuffer };
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  const setCorsHeaders = () => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  };

  setCorsHeaders();

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('=== Starting image rendering ===');
    const { poem, style, bg, frame, name, lineCount = 4 } = req.body;

    console.log('Request params:', { poem, style, frame, name, lineCount });

    if (!poem || !Array.isArray(poem) || poem.length < 2 || poem.length > 6) {
      return res.status(400).json({ success: false, error: 'Invalid poem data' });
    }

    console.log(`Rendering image: style=${style}, frame=${frame}, poem=${poem.length} lines`);

    // Load the main font
    const fontData = await loadFont(style);

    // Font size and gap based on poem length
    const fontSize = lineCount === 2 ? 72 : lineCount === 6 ? 52 : 64;
    const gapSize = lineCount === 2 ? '80px' : lineCount === 6 ? '35px' : '50px';

    // Seal text
    const sealText = name ? (name.length > 2 ? name.slice(-2) : name) : '印';
    const isSealTwoChars = sealText.length > 1;

    // Build poem elements for satori using React.createElement
    const poemElements = [
      // Main poem content - vertical text layout
      React.createElement('div', {
        style: {
          display: 'flex',
          flexDirection: 'row-reverse',
          gap: gapSize,
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }
      }, poem.map((line: string, i: number) =>
        React.createElement('div', {
          key: `line-${i}`,
          style: {
            display: 'flex',
            flexDirection: 'column',
            fontSize: `${fontSize}px`,
            lineHeight: '1.2',
            color: '#000000',
            fontFamily: fontData.name,
          }
        }, (line || '').split('').map((char: string, j: number) =>
          React.createElement('div', {
            key: `char-${j}`,
            style: { marginBottom: '15px' }
          }, char || ' ')
        ))
      )),
      // Year and seal - absolute positioned
      React.createElement('div', {
        style: {
          position: 'absolute',
          bottom: '60px',
          left: '60px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '15px',
        }
      },
        // Year
        React.createElement('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            fontSize: '32px',
            color: '#000000',
            fontFamily: fontData.name,
            opacity: 0.8,
          }
        }, ['乙', '巳', '年'].map((char: string, i: number) =>
          React.createElement('div', {
            key: `year-${i}`,
            style: { marginBottom: '8px' }
          }, char)
        )),
        // Seal stamp
        React.createElement('div', {
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
          }
        }, sealText.split('').map((char: string, i: number) =>
          React.createElement('div', {
            key: `seal-${i}`,
            style: { lineHeight: '1' }
          }, char)
        ))
      )
    ];

    // Select frame component
    const getFrameComponent = (frameType: string) => {
      const commonStyle = {
        display: 'flex',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative' as const
      };

      switch (frameType) {
        case 'silk_scroll': return SilkScroll({ children: poemElements });
        case 'redwood': return Redwood({ children: poemElements });
        case 'golden_wood': return GoldenWood({ children: poemElements });
        case 'cloud_brocade': return CloudBrocade({ children: poemElements });
        case 'modern_black': return ModernBlack({ children: poemElements });
        case 'sakura_pink': return SakuraPink({ children: poemElements });
        case 'mint_green': return MintGreen({ children: poemElements });
        case 'lavender_mist': return LavenderMist({ children: poemElements });
        case 'champagne_gold': return ChampagneGold({ children: poemElements });
        case 'azure_porcelain': return AzurePorcelain({ children: poemElements });
        default:
          return React.createElement('div', {
            style: { ...commonStyle, backgroundColor: '#f5f5f4', padding: '40px' }
          }, ...poemElements);
      }
    };

    const frameElement = getFrameComponent(frame);
    console.log('Frame element type:', typeof frameElement);
    console.log('Calling satori with font:', fontData.name);
    const svg = await satori(
      frameElement as any,
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

    console.log('SVG generated, length:', svg.length);

    const selectedFontConfig = FONT_CONFIG[style] || FONT_CONFIG['default'];
    const fontExt = selectedFontConfig.path.split('.').pop()?.toLowerCase();
    const fontMime =
      fontExt === 'ttf'
        ? 'font/ttf'
        : fontExt === 'otf'
        ? 'font/otf'
        : fontExt === 'woff'
        ? 'font/woff'
        : fontExt === 'woff2'
        ? 'font/woff2'
        : 'application/octet-stream';
    const fontFormat =
      fontExt === 'ttf'
        ? 'truetype'
        : fontExt === 'otf'
        ? 'opentype'
        : fontExt === 'woff'
        ? 'woff'
        : fontExt === 'woff2'
        ? 'woff2'
        : 'truetype';

    const fontBase64 = arrayBufferToBase64(fontData.data);
    const fontCss = `@font-face{font-family:'${fontData.name}';src:url(data:${fontMime};base64,${fontBase64}) format('${fontFormat}');}`;
    const svgWithFont = svg.replace(/<svg([^>]*)>/, `<svg$1><style>${fontCss}</style>`);

    console.log('=== Image rendering successful ===');

    res.status(200);
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.send(svgWithFont);

  } catch (error: any) {
    console.error('=== Error rendering image ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to render image',
      details: error.stack || error.toString()
    });
  }
}
