// 香槟金 (Champagne Gold) - 精简优化版
// 设计理念：奢华典雅，Art Deco 风格

import React from 'react';

export interface MountingProps {
  children: any;
  width?: number;
  height?: number;
}

const COLORS = {
  goldLight: '#fef3c7',         // 浅金色
  goldMain: '#fcd34d',          // 主金色
  goldDark: '#d97706',          // 深金色
  blackLacquer: '#18181b',      // 黑漆底
  paperBg: '#fffbeb',           // 米白纸张
  accentRed: '#7f1d1d',         // 红色点缀
};

// Art Deco 几何图案
const DECO_PATTERN = "M10,10 L30,10 L20,30 Z"; // 三角形
const DECO_FAN = "M20,40 L10,10 Q20,5 30,10 Z"; // 扇形

const DecoCorner = () =>
  React.createElement('svg', {
    width: '35',
    height: '35',
    viewBox: '0 0 35 35',
  },
    React.createElement('path', {
      d: DECO_PATTERN,
      stroke: COLORS.goldMain,
      strokeWidth: '2',
      fill: 'none',
      opacity: 0.6,
    }),
    React.createElement('circle', {
      cx: '20',
      cy: '20',
      r: '3',
      fill: COLORS.goldDark,
      opacity: 0.5,
    })
  );

const GoldBorder = () =>
  React.createElement('div', {
    style: {
      position: 'absolute',
      inset: '30px',
      border: `4px solid ${COLORS.goldMain}`,
      boxShadow: 'inset 0 0 15px rgba(252,211,77,0.3)',
      pointerEvents: 'none',
    }
  });

export const ChampagneGold = ({ children }: MountingProps) => {
  return React.createElement('div', {
    style: {
      display: 'flex',
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      backgroundColor: COLORS.blackLacquer,
      position: 'relative',
      padding: '40px',
    }
  },
    // 金色渐变边框层
    React.createElement('div', {
      style: {
        position: 'absolute',
        inset: '35px',
        background: `linear-gradient(135deg, ${COLORS.goldLight}, ${COLORS.goldMain}, ${COLORS.goldDark}, ${COLORS.goldMain}, ${COLORS.goldLight})`,
        opacity: 0.8,
        pointerEvents: 'none',
      }
    }),
    // 四角 Art Deco 装饰
    React.createElement('div', { style: { display: 'flex', position: 'absolute', top: '45px', left: '45px' } }, DecoCorner()),
    React.createElement('div', { style: { display: 'flex', position: 'absolute', top: '45px', right: '45px', transform: 'scaleX(-1)' } }, DecoCorner()),
    React.createElement('div', { style: { display: 'flex', position: 'absolute', bottom: '45px', left: '45px', transform: 'scaleY(-1)' } }, DecoCorner()),
    React.createElement('div', { style: { display: 'flex', position: 'absolute', bottom: '45px', right: '45px', transform: 'scale(-1,-1)' } }, DecoCorner()),
    // 金色主边框
    GoldBorder(),
    // 内容区
    React.createElement('div', {
      style: {
        flex: 1,
        backgroundColor: COLORS.paperBg,
        margin: '40px',
        padding: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        position: 'relative',
      }
    },
      // 内装饰线
      React.createElement('div', {
        style: {
          position: 'absolute',
          inset: '20px',
          border: `2px solid ${COLORS.goldMain}`,
          opacity: 0.3,
          pointerEvents: 'none',
        }
      }),
      ...(Array.isArray(children) ? children : [children])
    )
  );
};
