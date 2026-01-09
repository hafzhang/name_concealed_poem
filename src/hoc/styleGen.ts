
/** 返回一段 <style> 文本，包含该组件全部专属变量 */
export function genMountingStyle(name: string): string {
  // 0-1 浮点
  // 使用 SeededRandom 类来替代直接的 hash 操作，以获得更好的一致性和扩展性
  const hash = stableHash(name);
  const rnd = new SeededRandom(hash);

  // --- 1. 中国传统色配色策略 (3.1) ---
  const palettes = [
    { hue: 200, sat: 45, light: 88, name: '天青' },   // 天青 #B8D8E8
    { hue: 10,  sat: 55, light: 92, name: '朱砂' },   // 朱砂 #F4C8C0
    { hue: 45,  sat: 60, light: 90, name: '藤黄' },   // 藤黄 #F5E6B8
    { hue: 160, sat: 40, light: 90, name: '玉色' },   // 玉色 #C8E8D8
    { hue: 280, sat: 30, light: 92, name: '藕荷' },   // 藕荷 #E6D8E8
    { hue: 25,  sat: 40, light: 88, name: '檀色' },   // 檀色 #E8D0B8
    { hue: 220, sat: 50, light: 94, name: '月白' },   // 月白 #D8E4F4
    { hue: 0,   sat: 0,  light: 96, name: '宣纸' },   // 宣纸白 #F5F5F5
  ];
  // 使用随机数选择一个色系
  const paletteIndex = Math.floor(rnd.next() * palettes.length);
  const baseColor = palettes[paletteIndex];
  
  // 微调：
  // - 色相偏移：±15°
  // - 饱和度：基准值 ±10%
  // - 明度：基准值 ±5%
  const hue = Math.round(baseColor.hue + (rnd.next() * 30 - 15));
  const sat = Math.round(baseColor.sat + (rnd.next() * 20 - 10));
  const light = Math.round(baseColor.light + (rnd.next() * 10 - 5));

  /* -------- 器 -------- */
  const radius        = 8  + Math.round(rnd.next() * 14);          // 8-22px
  const borderW       = 1  + Math.round(rnd.next() * 3);           // 1-4px
  const shadowBlur    = 20 + Math.round(rnd.next() * 30);
  const shadowSpread  = -4 + Math.round(rnd.next() * 8);
  const shadowAlphaRaw = 0.15 + rnd.next() * 0.12;
  const shadowAlpha   = shadowAlphaRaw.toFixed(3);
  // 预计算第二层阴影的值
  const shadowBlur2    = shadowBlur + 20;
  const shadowSpread2  = shadowSpread + 10;
  const shadowAlpha2   = (shadowAlphaRaw / 2).toFixed(3);

  /* -------- 纹理：更丰富的 SVG 图案 (3.2) -------- */
  // 使用 Base64 编码以确保 SVG 在 CSS 中稳定渲染
  const toBase64 = (str: string) => {
    if (typeof window !== 'undefined') {
      return window.btoa(str);
    } else {
      return Buffer.from(str).toString('base64');
    }
  };

  const textureIndex  = Math.floor(rnd.next() * 8); // 0-7
  // 纹理颜色策略 (3.2.9)
  // - 自动适配：纹理颜色 = 底色明度 ± 15%
  // - 对比度控制：确保 WCAG 2.0 AA 标准 (这里简化为降低明度)
  // - 透明度：提升至 25%-40% 以增强可视度
  const strokeColor = `hsl(${hue}, ${sat}%, ${Math.max(0, light - 35)}%)`; 
  
  const rawTextures = [
    // 0. Cloud (云纹) (3.2.1) - 120x120px
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><path d="M20,60 Q40,30 60,60 T100,60" stroke="${strokeColor}" stroke-width="2" fill="none" opacity="0.6"/><path d="M10,80 Q30,50 50,80 T90,80" stroke="${strokeColor}" stroke-width="1.5" fill="none" opacity="0.6"/></svg>`,
    // 1. Scales (鱼鳞/波浪) (3.2.2)
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20" viewBox="0 0 40 20"><path d="M0 10 Q10 0 20 10 T40 10" fill="none" stroke="${strokeColor}" stroke-width="2" opacity="0.5"/></svg>`,
    // 2. Meander (回纹简化) (3.2.3)
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M10 10 H30 V30 H10 V10" fill="none" stroke="${strokeColor}" stroke-width="2" opacity="0.5"/></svg>`,
    // 3. Dots (点阵) (3.2.4)
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="2" cy="2" r="2" fill="${strokeColor}" opacity="0.6"/></svg>`,
    // 4. Crosshatch (交叉线) (3.2.5)
    `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path d="M0 0L20 20M20 0L0 20" stroke="${strokeColor}" stroke-width="1.5" opacity="0.5"/></svg>`,
    // 5. Floral (简易花卉) (3.2.6)
    `<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50"><path d="M25 10 Q30 20 25 25 Q20 20 25 10 M10 25 Q20 30 25 25 Q20 20 10 25 M25 40 Q20 30 25 25 Q30 30 25 40 M40 25 Q30 20 25 25 Q30 30 40 25" fill="none" stroke="${strokeColor}" stroke-width="2" opacity="0.5"/></svg>`,
    // 6. Rice Paper (宣纸纤维 - Noise) (3.2.8)
    `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><filter id="n"><feTurbulence baseFrequency="0.8" numOctaves="3"/></filter><rect width="100" height="100" filter="url(#n)" opacity="0.4"/></svg>`,
    // 7. Lozenge (菱形纹) (3.2.7)
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="${strokeColor}" stroke-width="1.5" opacity="0.4"/></svg>`
  ];
  
  const textureUrl = `data:image/svg+xml;base64,${toBase64(rawTextures[textureIndex])}`;

  /* -------- 装饰：边角花纹 (Corner Ornaments) (3.3) -------- */
  // 提升到 80% 概率出现边角装饰
  const hasCorner = rnd.next() > 0.2; 
  const cornerColor = `hsl(${hue}, ${sat}%, ${Math.max(0, light - 50)}%)`;
  // 定义几种边角图案
  const cornerPatterns = [
    // 0. 经典回纹角 (3.3.1)
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M5 5 H30 V10 H10 V30 H5 V5" fill="${cornerColor}" opacity="0.8"/></svg>`,
    // 1. 卷草纹角 (3.3.2)
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M5 5 Q25 5 25 25 T45 45" fill="none" stroke="${cornerColor}" stroke-width="4" opacity="0.8"/></svg>`,
    // 2. 双线角 (3.3.3)
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M5 5 H35 M5 12 H35 M5 5 V35 M12 5 V35" fill="none" stroke="${cornerColor}" stroke-width="3" opacity="0.7"/></svg>`,
  ];
  const cornerIndex = Math.floor(rnd.next() * cornerPatterns.length); 
  const cornerUrl = hasCorner 
    ? `data:image/svg+xml;base64,${toBase64(cornerPatterns[cornerIndex])}`
    : 'none';


  /* -------- 场 -------- */
  const haloSize  = Math.round(120 + rnd.next() * 120); // 径向光半径
  const grainUrl  = `data:image/svg+xml;base64,${toBase64('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2"/></filter><rect width="100%" height="100%" filter="url(#g)" opacity="0.1"/></svg>')}`;
  
  // 动效 (4.1)
  // 呼吸动画: 3-7 秒随机
  const breathSec = (3 + rnd.next() * 4).toFixed(1);
  // 扫光效果: 8-12 秒随机
  const sweepSec  = (8 + rnd.next() * 4).toFixed(1);
  
  // 核心修复：分离装裱（Mounting）和画心（Paper）
  // 画心背景：使用极浅的米色/纸色，带一点点底色的倾向
  const paperBg = `hsl(${hue}, ${sat*0.2}%, 96%)`;
  
  // 传统装裱布局：天头地脚 (Tian Tou / Di Jiao)
  // 侧边: 基准
  // 天头: 1.6 - 2.0 倍
  // 地脚: 1.3 - 1.6 倍
  const basePadding = 24 + rnd.next() * 12; // 24-36px
  const paddingSide = Math.round(basePadding);
  const paddingTop = Math.round(basePadding * (1.6 + rnd.next() * 0.4));
  const paddingBottom = Math.round(basePadding * (1.3 + rnd.next() * 0.3));

  // 惊燕/隔水线颜色 (Jin) - 使用双线风格
  const jinColor = `hsl(${hue}, ${sat}%, ${Math.max(0, light - 40)}%)`;
  
  // 装裱光泽感 (Sheen)
  const sheenGradient = `linear-gradient(135deg, hsla(${hue}, ${sat}%, ${light + 5}%, 0.8) 0%, hsla(${hue}, ${sat}%, ${light - 5}%, 0.9) 100%)`;

  /* 拼成一段 CSS 变量 */
  return `
    .mt-${name}{
      --mt-hue:${hue};
      --mt-sat:${sat}%;
      --mt-light:${light}%;
      --mt-radius:${radius}px;
      --mt-border:${borderW}px solid hsl(var(--mt-hue),calc(var(--mt-sat)*0.6),70%);
      --mt-shadow:0 ${shadowBlur}px ${shadowSpread}px hsla(var(--mt-hue),var(--mt-sat),30%,${shadowAlpha}),
                  0 ${shadowBlur2}px ${shadowSpread2}px hsla(var(--mt-hue),var(--mt-sat),30%,${shadowAlpha2});
      
      /* 复合背景：底色 + 光泽渐变 + 纹理 */
      --mt-bg-color: hsl(var(--mt-hue),var(--mt-sat),var(--mt-light));
      --mt-sheen: ${sheenGradient};
      --mt-texture:url('${textureUrl}');
      
      --mt-corner:url('${cornerUrl}');
      --mt-halo-size:${haloSize}px;
      --mt-grain:url('${grainUrl}');
      --mt-breath:${breathSec}s;
      --mt-sweep:${sweepSec}s;
      
      --mt-paper-bg: ${paperBg};
      
      /* 传统布局 padding */
      --mt-padding-top: ${paddingTop}px;
      --mt-padding-bottom: ${paddingBottom}px;
      --mt-padding-side: ${paddingSide}px;
      
      --mt-jin-color: ${jinColor};
    }
  `;
}

/** 简单 cyrb53 hash -> 0-1 */
function stableHash(str: string): number {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)) / 4294967296 / 4294967296;
}

/**
 * 一个简单的线性同余生成器 (LCG)
 * 用于将 0-1 的种子扩展为一系列伪随机数
 */
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  // 返回 [0, 1) 之间的浮点数
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}
