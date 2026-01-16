// 红木画框 (Redwood) - 精简优化版
// 设计理念：沉稳深色实木，适合正式场合

import React from 'react';

export interface MountingProps {
  children: any;
  width?: number;
  height?: number;
}

const COLORS = {
  frameOuter: '#3E2723',      // 外框深棕
  frameMiddle: '#5D4037',     // 中框棕
  frameInner: '#6D4C41',      // 内框浅棕
  goldAccent: '#C5A059',      // 金色装饰
  paperBg: '#fffbf0',         // 宣纸底色
  innerShadow: 'rgba(0,0,0,0.3)',
};

const FrameMolding = ({ width, side }: { width: number; side: 'top' | 'bottom' | 'left' | 'right' }) => {
  const isHorizontal = side === 'top' || side === 'bottom';
  const style: any = {
    display: 'flex',
    position: 'absolute',
    [side]: 0,
    [isHorizontal ? 'left' : 'top']: 0,
    [isHorizontal ? 'right' : 'bottom']: 0,
    [isHorizontal ? 'height' : 'width']: `${width}px`,
    background: `linear-gradient(${side === 'top' ? 'to bottom' : side === 'bottom' ? 'to top' : side === 'left' ? 'to right' : 'to left'}, ${COLORS.frameOuter}, ${COLORS.frameMiddle}, ${COLORS.frameInner})`,
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
  };

  const goldLineStyle: any = {
    position: 'absolute',
    [side === 'top' ? 'bottom' : side === 'bottom' ? 'top' : 'right']: '4px',
    [isHorizontal ? 'left' : 'top']: '0',
    [isHorizontal ? 'right' : 'bottom']: '0',
    [isHorizontal ? 'height' : 'width']: '2px',
    background: COLORS.goldAccent,
    opacity: 0.6,
  };

  return React.createElement('div', { style },
    React.createElement('div', { style: goldLineStyle })
  );
};

// 简化的角花
const CornerFlower = () =>
  React.createElement('svg', {
    width: '30',
    height: '30',
    viewBox: '0 0 30 30',
  },
    React.createElement('circle', {
      cx: '15',
      cy: '15',
      r: '12',
      stroke: COLORS.goldAccent,
      strokeWidth: '1.5',
      fill: 'none',
      opacity: 0.5,
    }),
    React.createElement('circle', {
      cx: '15',
      cy: '15',
      r: '6',
      stroke: COLORS.goldAccent,
      strokeWidth: '1',
      fill: 'none',
      opacity: 0.4,
    }),
    React.createElement('circle', {
      cx: '15',
      cy: '15',
      r: '2',
      fill: COLORS.goldAccent,
      opacity: 0.6,
    })
  );

export const Redwood = ({ children }: MountingProps) => {
  return React.createElement('div', {
    style: {
      display: 'flex',
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      backgroundColor: COLORS.frameOuter,
      position: 'relative',
      padding: '45px',
    }
  },
    // 三层框线
    FrameMolding({ width: 45, side: 'top' }),
    FrameMolding({ width: 45, side: 'bottom' }),
    FrameMolding({ width: 45, side: 'left' }),
    FrameMolding({ width: 45, side: 'right' }),
    // 四角装饰
    React.createElement('div', { style: { display: 'flex', position: 'absolute', top: '45px', left: '45px' } }, CornerFlower()),
    React.createElement('div', { style: { display: 'flex', position: 'absolute', top: '45px', right: '45px' } }, CornerFlower()),
    React.createElement('div', { style: { display: 'flex', position: 'absolute', bottom: '45px', left: '45px' } }, CornerFlower()),
    React.createElement('div', { style: { display: 'flex', position: 'absolute', bottom: '45px', right: '45px' } }, CornerFlower()),
    // 内容区
    React.createElement('div', {
      style: {
        flex: 1,
        backgroundColor: COLORS.paperBg,
        margin: '45px',
        padding: '45px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
      }
    }, ...Array.isArray(children) ? children : [children])
  );
};
