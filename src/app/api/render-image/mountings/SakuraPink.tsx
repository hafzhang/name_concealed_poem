// 樱花粉 (Sakura Pink) - 精简优化版
// 设计理念：浪漫柔美，樱花飘落

import React from 'react';

export interface MountingProps {
  children: any;
  width?: number;
  height?: number;
}

const COLORS = {
  sakuraLight: '#fdf2f8',        // 浅粉
  sakuraMain: '#fbcfe8',         // 主粉
  sakuraDark: '#f472b6',         // 深粉
  paperBg: '#fff1f8',            // 粉色纸张
  petalPink: '#fce7f3',          // 花瓣粉
};

// 简化的樱花花瓣
const SAKURA_PETAL = "M20,30 Q15,20 20,10 Q25,20 20,30 M20,10 Q20,5 25,8 M20,10 Q20,5 15,8";

const SakuraFlower = () => ({
  type: 'svg',
  props: {
    width: '40',
    height: '40',
    viewBox: '0 0 40 40',
    children: [
      // 主花瓣
      {
        type: 'path',
        props: {
          d: "M20,35 C15,30 10,25 10,15 C10,5 30,5 30,15 C30,25 25,30 20,35",
          fill: COLORS.sakuraMain,
          opacity: 0.6,
        }
      },
      // 花蕊
      {
        type: 'circle',
        props: {
          cx: '20',
          cy: '20',
          r: '3',
          fill: COLORS.sakuraDark,
          opacity: 0.5,
        }
      },
      // 花蕊点
      {
        type: 'circle',
        props: {
          cx: '12',
          cy: '18',
          r: '1.5',
          fill: COLORS.sakuraDark,
          opacity: 0.4,
        }
      },
      {
        type: 'circle',
        props: {
          cx: '28',
          cy: '18',
          r: '1.5',
          fill: COLORS.sakuraDark,
          opacity: 0.4,
        }
      },
      {
        type: 'circle',
        props: {
          cx: '20',
          cy: '28',
          r: '1.5',
          fill: COLORS.sakuraDark,
          opacity: 0.4,
        }
      }
    ]
  }
});

const SakuraBorder = () => ({
  type: 'div',
  props: {
    style: {
      position: 'absolute',
      inset: '25px',
      border: `3px solid ${COLORS.sakuraMain}`,
      borderRadius: '8px',
      pointerEvents: 'none',
    }
  }
});

export const SakuraPink = ({ children }: MountingProps) => {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        backgroundColor: COLORS.sakuraLight,
        position: 'relative',
        padding: '30px',
      },
      children: [
        // 樱花渐变背景
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(135deg, ${COLORS.sakuraLight}, ${COLORS.sakuraMain}, ${COLORS.sakuraLight})`,
              opacity: 0.5,
              pointerEvents: 'none',
            }
          }
        },
        // 四角樱花装饰
        { type: 'div', props: { style: { display: 'flex', position: 'absolute', top: '35px', left: '35px' }, children: SakuraFlower() } },
        { type: 'div', props: { style: { display: 'flex', position: 'absolute', top: '35px', right: '35px' }, children: SakuraFlower() } },
        { type: 'div', props: { style: { display: 'flex', position: 'absolute', bottom: '35px', left: '35px' }, children: SakuraFlower() } },
        { type: 'div', props: { style: { display: 'flex', position: 'absolute', bottom: '35px', right: '35px' }, children: SakuraFlower() } },
        // 漂浮花瓣（顶部）
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              position: 'absolute',
              top: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: 0.4,
            },
            children: SakuraFlower()
          }
        },
        // 樱花边框
        SakuraBorder(),
        // 内边框
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              inset: '31px',
              border: `1px dashed ${COLORS.sakuraDark}`,
              borderRadius: '6px',
              opacity: 0.3,
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
              boxShadow: '0 8px 30px rgba(244,114,182,0.2)',
              borderRadius: '8px',
            },
            children
          }
        }
      ]
    }
  };
};
