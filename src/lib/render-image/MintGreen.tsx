// 薄荷绿 (Mint Green) - 精简优化版
// 设计理念：清新自然，竹子元素

import React from 'react';

export interface MountingProps {
  children: any;
  width?: number;
  height?: number;
}

const COLORS = {
  mintLight: '#ecfdf5',         // 浅绿
  mintMain: '#10b981',          // 主绿
  mintDark: '#047857',          // 深绿
  paperBg: '#f0fdf4',           // 淡绿纸张
  bambooGold: '#fbbf24',        // 竹节金
};

// 简化的竹节图案
const BAMBOO_SEGMENT = "M15,0 L15,20 M10,20 Q15,25 20,20 L20,0";

const BambooDecoration = () =>
  React.createElement('svg', {
    width: '30',
    height: '50',
    viewBox: '0 0 30 50',
  },
    React.createElement('path', {
      d: BAMBOO_SEGMENT,
      stroke: COLORS.mintMain,
      strokeWidth: '3',
      fill: 'none',
      opacity: 0.5,
    }),
    React.createElement('line', {
      x1: '10',
      y1: '20',
      x2: '20',
      y2: '20',
      stroke: COLORS.bambooGold,
      strokeWidth: '2',
      opacity: 0.6,
    }),
    React.createElement('ellipse', {
      cx: '15',
      cy: '35',
      rx: '6',
      ry: '3',
      stroke: COLORS.mintDark,
      strokeWidth: '1',
      fill: 'none',
      opacity: 0.4,
    })
  );

const BambooBorder = () =>
  React.createElement('div', {
    style: {
      position: 'absolute',
      inset: '25px',
      border: `3px solid ${COLORS.mintMain}`,
      borderRadius: '4px',
      pointerEvents: 'none',
    }
  });

export const MintGreen = ({ children }: MountingProps) => {
  return React.createElement('div', {
    style: {
      display: 'flex',
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      backgroundColor: COLORS.mintLight,
      position: 'relative',
      padding: '30px',
    }
  },
    // 渐变背景
    React.createElement('div', {
      style: {
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, ${COLORS.mintLight}, ${COLORS.mintMain})`,
        opacity: 0.2,
        pointerEvents: 'none',
      }
    }),
    // 四边竹子装饰
    React.createElement('div', { style: { display: 'flex', position: 'absolute', top: '35px', left: '35px' } }, BambooDecoration()),
    React.createElement('div', { style: { display: 'flex', position: 'absolute', top: '35px', right: '35px' } }, BambooDecoration()),
    React.createElement('div', { style: { display: 'flex', position: 'absolute', bottom: '35px', left: '35px' } }, BambooDecoration()),
    React.createElement('div', { style: { display: 'flex', position: 'absolute', bottom: '35px', right: '35px' } }, BambooDecoration()),
    // 竹子边框
    BambooBorder(),
    // 内容区
    React.createElement('div', {
      style: {
        flex: 1,
        backgroundColor: COLORS.paperBg,
        margin: '30px',
        padding: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 6px 25px rgba(16,185,129,0.2)',
        borderRadius: '4px',
      }
    }, ...(Array.isArray(children) ? children : [children]))
  );
};
