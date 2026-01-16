// 薰衣草雾 (Lavender Mist) - 精简优化版
// 设计理念：柔美梦幻，紫色渐变雾气

import React from 'react';

export interface MountingProps {
  children: any;
  width?: number;
  height?: number;
}

const COLORS = {
  lavenderLight: '#e9d5ff',     // 浅紫
  lavenderMain: '#a78bfa',      // 主紫
  lavenderDark: '#7c3aed',      // 深紫
  paperBg: '#faf5ff',           // 淡紫纸张
  mistOverlay: 'rgba(255,255,255,0.4)',
};

// 柔和的曲线装饰
const MIST_CURVE = "M0,25 Q25,10 50,25 T100,25";

const MistDecoration = () =>
  React.createElement('svg', {
    width: '100',
    height: '40',
    viewBox: '0 0 100 40',
  },
    React.createElement('path', {
      d: MIST_CURVE,
      stroke: COLORS.lavenderMain,
      strokeWidth: '2',
      fill: 'none',
      opacity: 0.3,
    }),
    React.createElement('path', {
      d: "M0,30 Q25,15 50,30 T100,30",
      stroke: COLORS.lavenderLight,
      strokeWidth: '1.5',
      fill: 'none',
      opacity: 0.4,
    })
  );

export const LavenderMist = ({ children }: MountingProps) => {
  return React.createElement('div', {
    style: {
      display: 'flex',
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      backgroundColor: COLORS.lavenderLight,
      position: 'relative',
      padding: '25px',
    }
  },
    // 雾气渐变层
    React.createElement('div', {
      style: {
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(135deg, ${COLORS.lavenderLight}, ${COLORS.lavenderMain}, ${COLORS.lavenderLight})`,
        opacity: 0.4,
        pointerEvents: 'none',
      }
    }),
    // 顶部雾气装饰
    React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        opacity: 0.5,
      }
    }, MistDecoration()),
    // 底部雾气装饰
    React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: '30px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200px',
        opacity: 0.5,
      }
    }, MistDecoration()),
    // 柔和边框
    React.createElement('div', {
      style: {
        position: 'absolute',
        inset: '25px',
        border: `3px solid ${COLORS.lavenderMain}`,
        borderRadius: '12px',
        opacity: 0.5,
        pointerEvents: 'none',
      }
    }),
    // 内边框
    React.createElement('div', {
      style: {
        position: 'absolute',
        inset: '32px',
        border: `1px solid ${COLORS.lavenderDark}`,
        borderRadius: '8px',
        opacity: 0.2,
        pointerEvents: 'none',
      }
    }),
    // 内容区
    React.createElement('div', {
      style: {
        flex: 1,
        backgroundColor: COLORS.paperBg,
        margin: '25px',
        padding: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 30px rgba(139,92,246,0.2)',
        borderRadius: '8px',
      }
    }, ...(Array.isArray(children) ? children : [children]))
  );
};
