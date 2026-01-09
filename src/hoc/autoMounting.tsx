import React from 'react';
import { genMountingStyle } from './styleGen';

export function autoMounting<P extends object>(Wrapped: React.ComponentType<P>) {
  const name = Wrapped.displayName || Wrapped.name || 'Mounting';
  const className = `mt-${name.replace(/[^a-zA-Z0-9]/g, '')}`;

  /* 动态生成专属 <style> */
  const cssContent = `
      ${genMountingStyle(className.replace('mt-', ''))}
      .${className}{
        position: relative;
        width: 85%;
        height: 85%;
        /* 装裱底色 + 光泽 + 纹理 */
        background-color: var(--mt-bg-color);
        background-image: var(--mt-texture), var(--mt-sheen); 
        background-repeat: repeat, no-repeat;
        background-blend-mode: multiply, normal; /* 纹理正片叠底，光泽正常 */
        /* background-size: auto;  Let SVG intrinsic size rule */
        
        border-radius: var(--mt-radius);
        border: var(--mt-border);
        box-shadow: var(--mt-shadow);
        animation: mt-breathe var(--mt-breath) ease-in-out infinite;
        overflow: hidden;
        
        /* Flex 布局居中画心 */
        display: flex;
        align-items: center;
        justify-content: center;
        /* 传统天头地脚布局 */
        padding: var(--mt-padding-top) var(--mt-padding-side) var(--mt-padding-bottom) var(--mt-padding-side);
      }
      
      /* 画心 (Paper) - 干净的区域 */
      .${className}-paper {
        position: relative;
        width: 100%;
        height: 100%;
        background: var(--mt-paper-bg); /* 干净背景 */
        /* 内阴影增加嵌入感，外阴影增加层次 */
        box-shadow: inset 0 0 30px rgba(0,0,0,0.05), 0 1px 4px rgba(0,0,0,0.1);
        z-index: 5;
        overflow: hidden; /* 防止内容溢出画心 */
        
        /* 隔水线 (Jin) - 双线风格增强精致感 */
        border: 3px double var(--mt-jin-color);
        outline: 1px solid rgba(255,255,255,0.2); /* 极细内发光 */
        outline-offset: -1px;
      }
      
      /* 场：光晕 (叠加在装裱层上，但在画心下？或者整体上) */
      /* 为了效果，光晕加在最外层容器上，但 z-index 低于画心，或者 pointer-events none */
      .${className}::after{
        content:'';
        position:absolute;
        inset:0;
        background: radial-gradient(circle at 50% 40%, hsla(var(--mt-hue),var(--mt-sat),95%,.3) 0%, transparent var(--mt-halo-size));
        mix-blend-mode: screen;
        pointer-events:none;
        z-index: 10; /* 光晕要在最上层，营造氛围 */
      }
      
      /* 场：颗粒整页叠层 */
      .${className}-grain{
        position: fixed;
        inset: 0;
        background-image: var(--mt-grain);
        mix-blend-mode: multiply;
        pointer-events: none;
        opacity: .04;
        z-index: 9999;
      }
      
      /* 装饰：边角 - 位于装裱层 (Padding区域) */
      .${className}-corner-tl,
      .${className}-corner-tr,
      .${className}-corner-bl,
      .${className}-corner-br {
        position: absolute;
        width: 60px; height: 60px;
        background-image: var(--mt-corner);
        background-repeat: no-repeat;
        background-size: contain;
        pointer-events: none;
        z-index: 2; /* 在底纹之上，画心之下(如果画心不遮挡的话) -> 画心是 z-index 5 */
        opacity: 0.8;
      }
      .${className}-corner-tl { top: 0; left: 0; }
      .${className}-corner-tr { top: 0; right: 0; transform: scaleX(-1); }
      .${className}-corner-bl { bottom: 0; left: 0; transform: scaleY(-1); }
      .${className}-corner-br { bottom: 0; right: 0; transform: scale(-1, -1); }
      
      /* 动：呼吸 */
      @keyframes mt-breathe{
        50%{
          box-shadow: 0 16px 40px -4px hsla(var(--mt-hue),var(--mt-sat),30%,calc(var(--mt-shadow-alpha,0.2) + 0.08)),
                      0 40px 80px -12px hsla(var(--mt-hue),var(--mt-sat),30%,calc(var(--mt-shadow-alpha,0.1) + 0.04));
        }
      }
      
      /* 动：扫光 (扫过整个装裱) */
      .${className}-sweep{
        position:absolute;
        top:0;
        left:0;
        width:80px;
        height:100%;
        background: linear-gradient(to right, transparent, hsla(var(--mt-hue),var(--mt-sat),95%,.1), transparent);
        transform: skewX(-30deg);
        animation: mt-sweep var(--mt-sweep) ease-in-out infinite;
        pointer-events:none;
        z-index: 20;
      }
      @keyframes mt-sweep{
        0%{transform:translateX(-120%) skewX(-30deg)}
        100%{transform:translateX(120%) skewX(-30deg)}
      }
      /* 响应式适配 */
      @media (max-width: 768px) {
        .${className}{
          /* 移动端缩小边距 */
          padding: calc(var(--mt-padding-top)*0.6) calc(var(--mt-padding-side)*0.6) calc(var(--mt-padding-bottom)*0.6) calc(var(--mt-padding-side)*0.6);
        }
      }
  `;

  const styleTag = (
    <style dangerouslySetInnerHTML={{ __html: cssContent }} />
  );

  const Component = (props: P) => (
    <>
      {styleTag}
      <div className={`${className}-grain`} /> {/* 整页颗粒 */}
      <div className={className}>
        {/* 边角装饰 (位于 Padding 区域) */}
        <div className={`${className}-corner-tl`} />
        <div className={`${className}-corner-tr`} />
        <div className={`${className}-corner-bl`} />
        <div className={`${className}-corner-br`} />

        <div className={`${className}-sweep`} />
        
        {/* 画心区域：干净背景，承载内容 */}
        <div className={`${className}-paper`}>
            <div className={`${className}-content`}> {/* 保留原始 content 类名以便兼容，或者直接用 paper */}
                <Wrapped {...props} />
            </div>
        </div>
      </div>
    </>
  );

  Component.displayName = `AutoMounting(${name})`;
  return Component;
}
