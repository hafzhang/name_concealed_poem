// 金丝楠木 (Golden Wood) - 精简优化版
// 设计理念：温润典雅，浅色木纹，尊贵气质

import React from 'react';

export interface MountingProps {
  children: any;
  width?: number;
  height?: number;
}

const COLORS = {
  woodBase: '#C19A6B',         // 金丝楠木主色
  woodGrain: '#D4A76A',        // 木纹亮色
  woodShadow: '#8B7355',       // 木纹暗色
  goldInlay: '#D4AF37',        // 金色镶嵌
  paperBg: '#fffbf0',          // 宣纸底色
  innerAccent: '#B8860B',      // 内装饰色
};

// 木纹纹理
const woodGrainGradient = `url("data:image/svg+xml,%3Csvg width='10' height='10' viewBox='0 0 10 10' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='0' width='2' height='10' fill='rgba(139,115,85,0.1)' /%3E%3Crect x='5' y='0' width='2' height='10' fill='rgba(212,167,106,0.15)' /%3E%3C/svg%3E")`;

// 简化的镶嵌图案 (角落如意纹)
const RUYI_CORNER = "M10,30 Q10,10 30,10 Q50,10 50,30 Q50,50 30,50 Q10,50 10,30";

const InlayCorner = ({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) => {
  const rotations = { tl: 0, tr: 90, bl: -90, br: 180 };
  const style: any = {
    display: 'flex',
    position: 'absolute',
    width: '50px',
    height: '50px',
    [position.includes('t') ? 'top' : 'bottom']: '5px',
    [position.includes('l') ? 'left' : 'right']: '5px',
  };

  return React.createElement('div', { style },
    React.createElement('svg', {
      width: '100%',
      height: '100%',
      viewBox: '0 0 60 60',
      style: { transform: `rotate(${rotations[position]}deg)` },
    },
      React.createElement('path', {
        d: RUYI_CORNER,
        stroke: COLORS.goldInlay,
        strokeWidth: '2.5',
        fill: 'none',
        opacity: 0.7,
      }),
      React.createElement('circle', {
        cx: '30',
        cy: '30',
        r: '4',
        fill: COLORS.goldInlay,
        opacity: 0.5,
      })
    )
  );
};

export const GoldenWood = ({ children }: MountingProps) => {
  return React.createElement('div', {
    style: {
      display: 'flex',
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      backgroundColor: COLORS.woodBase,
      position: 'relative',
      padding: '35px',
      boxShadow: 'inset 0 0 50px rgba(0,0,0,0.2)',
    }
  },
    // 木纹层
    React.createElement('div', {
      style: {
        position: 'absolute',
        inset: 0,
        background: woodGrainGradient,
        opacity: 0.4,
        pointerEvents: 'none',
      }
    }),
    // 金色内边框线
    React.createElement('div', {
      style: {
        position: 'absolute',
        inset: '30px',
        border: `2px solid ${COLORS.goldInlay}`,
        opacity: 0.5,
        pointerEvents: 'none',
      }
    }),
    // 四角镶嵌装饰
    InlayCorner({ position: 'tl' }),
    InlayCorner({ position: 'tr' }),
    InlayCorner({ position: 'bl' }),
    InlayCorner({ position: 'br' }),
    // 内容区
    React.createElement('div', {
      style: {
        flex: 1,
        backgroundColor: COLORS.paperBg,
        margin: '35px',
        padding: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 25px rgba(0,0,0,0.25)',
        position: 'relative',
      }
    },
      // 内装饰框
      React.createElement('div', {
        style: {
          position: 'absolute',
          inset: '20px',
          border: `1px solid ${COLORS.innerAccent}`,
          opacity: 0.3,
          pointerEvents: 'none',
        }
      }),
      ...(Array.isArray(children) ? children : [children])
    )
  );
};
