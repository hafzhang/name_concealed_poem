// 青花瓷 (Azure Porcelain) - 精简优化版
// 设计理念：清新雅致，青花瓷纹样

import React from 'react';

export interface MountingProps {
  children: any;
  width?: number;
  height?: number;
}

const COLORS = {
  porcelainLight: '#e0f2fe',    // 青花浅蓝
  porcelainMain: '#0ea5e9',     // 青花主色
  porcelainDark: '#1e40af',     // 青花深蓝
  paperBg: '#fffbf0',           // 宣纸底色
  accentGold: '#fbbf24',        // 金色点缀
};

// 简化的青花卷草纹
const PATTERN_PORCELAIN = [
  "M10,25 Q20,15 30,25 T50,25",
  "M5,20 Q15,10 25,20 T45,20",
  "M15,30 Q25,20 35,30 T55,30",
  "M0,25 C10,15 30,15 40,25 S70,35 80,25",
];

const PorcelainBorder = () => ({
  type: 'div',
  props: {
    style: {
      position: 'absolute',
      inset: '20px',
      border: `3px solid ${COLORS.porcelainMain}`,
      borderRadius: '8px',
      pointerEvents: 'none',
    }
  }
});

const CornerPattern = () => ({
  type: 'svg',
  props: {
    width: '40',
    height: '40',
    viewBox: '0 0 80 50',
    children: PATTERN_PORCELAIN.map((d, i) => ({
      type: 'path',
      props: {
        key: i,
        d,
        stroke: COLORS.porcelainDark,
        strokeWidth: '1.5',
        fill: 'none',
        opacity: 0.4,
        transform: `translate(${i * 5}, ${i * 3})`,
      }
    }))
  }
});

export const AzurePorcelain = ({ children }: MountingProps) => {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        backgroundColor: COLORS.porcelainLight,
        position: 'relative',
        padding: '30px',
      },
      children: [
        // 渐变背景层
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, ${COLORS.porcelainLight}, ${COLORS.porcelainMain})`,
              opacity: 0.3,
              pointerEvents: 'none',
            }
          }
        },
        // 四角装饰
        { type: 'div', props: { style: { display: 'flex', position: 'absolute', top: '35px', left: '35px' }, children: CornerPattern() } },
        { type: 'div', props: { style: { display: 'flex', position: 'absolute', top: '35px', right: '35px', transform: 'scaleX(-1)' }, children: CornerPattern() } },
        { type: 'div', props: { style: { display: 'flex', position: 'absolute', bottom: '35px', left: '35px', transform: 'scaleY(-1)' }, children: CornerPattern() } },
        { type: 'div', props: { style: { display: 'flex', position: 'absolute', bottom: '35px', right: '35px', transform: 'scale(-1,-1)' }, children: CornerPattern() } },
        // 青花边框
        PorcelainBorder(),
        // 内边框
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              inset: '28px',
              border: `1px solid ${COLORS.porcelainDark}`,
              opacity: 0.2,
              borderRadius: '6px',
              pointerEvents: 'none',
            }
          }
        },
        // 内容区
        {
          type: 'div',
          props: {
            style: {
              flex: 1,
              backgroundColor: COLORS.paperBg,
              margin: '30px',
              padding: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 25px rgba(14,165,233,0.2)',
              borderRadius: '4px',
            },
            children
          }
        }
      ]
    }
  };
};
