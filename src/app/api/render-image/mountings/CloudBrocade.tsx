// 云纹锦缎 (Cloud Brocade) - 精简优化版
// 设计理念：华丽喜庆，四周织锦包裹，适合庆典场景

import React from 'react';

export interface MountingProps {
  children: any;
  width?: number;
  height?: number;
}

const COLORS = {
  brocadeMain: '#8B1A1A',      // 锦缎主红
  brocadeLight: '#C41E3A',     // 锦缎亮红
  goldAccent: '#FFD700',       // 金色装饰
  innerBorder: '#1e3a8a',      // 内边框蓝
  paperBg: '#fffbf0',          // 宣纸底色
  cloudHighlight: 'rgba(255,215,0,0.3)', // 云纹高光
};

// 精选云纹图案 (12个)
const CLOUD_PATTERNS = [
  "M10,25 Q20,15 30,25 T50,25",
  "M5,20 Q15,10 25,20 T45,20",
  "M15,30 Q25,20 35,30 T55,30",
  "M0,25 C10,15 30,15 40,25 S70,35 80,25",
  "M10,20 Q25,10 40,20 T70,20",
  "M5,25 Q20,10 35,25 T65,25",
  "M0,20 C15,10 35,10 50,20",
  "M10,15 Q25,5 40,15 T70,15",
  "M8,22 Q18,12 28,22 T48,22",
  "M12,28 Q22,18 32,28 T52,28",
  "M3,18 Q13,8 23,18 T43,18",
  "M7,24 Q17,14 27,24 T47,24",
];

const CloudBorder = ({ side }: { side: 'top' | 'bottom' | 'left' | 'right' }) => {
  const isHorizontal = side === 'top' || side === 'bottom';
  return {
    type: 'div',
    props: {
      style: {
        position: 'absolute',
        [side]: 0,
        [isHorizontal ? 'left' : 'top']: 0,
        [isHorizontal ? 'right' : 'bottom']: 0,
        [isHorizontal ? 'height' : 'width']: '50px',
        background: `linear-gradient(${side === 'top' ? 'to bottom' : side === 'bottom' ? 'to top' : 'to right'}, ${COLORS.brocadeMain}, ${COLORS.brocadeLight})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        overflow: 'hidden',
      },
      children: Array.from({ length: 8 }, (_, i) => ({
        type: 'svg',
        props: {
          key: i,
          width: '40',
          height: '40',
          viewBox: '0 0 80 50',
          style: {
            opacity: 0.25,
            transform: isHorizontal ? 'none' : `rotate(${side === 'left' ? 90 : -90}deg)`,
          },
          children: [{
            type: 'path',
            props: {
              d: CLOUD_PATTERNS[i % CLOUD_PATTERNS.length],
              stroke: COLORS.goldAccent,
              strokeWidth: '2',
              fill: 'none',
            }
          }]
        }
      }))
    }
  };
};

const CornerDecoration = () => ({
  type: 'div',
  props: {
    style: {
      display: 'flex',
      position: 'absolute',
      width: '40px',
      height: '40px',
    },
    children: [
      // 金色角纹
      {
        type: 'svg',
        props: {
          width: '100%',
          height: '100%',
          viewBox: '0 0 40 40',
          children: [{
            type: 'path',
            props: {
              d: 'M5,5 L35,5 L35,35',
              stroke: COLORS.goldAccent,
              strokeWidth: '3',
              fill: 'none',
              opacity: 0.6,
            }
          }]
        }
      },
      // 内角装饰
      {
        type: 'div',
        props: {
          style: {
            position: 'absolute',
            top: '8px',
            left: '8px',
            width: '15px',
            height: '15px',
            border: `2px solid ${COLORS.innerBorder}`,
            borderRadius: '2px',
          }
        }
      }
    ]
  }
});

export const CloudBrocade = ({ children }: MountingProps) => {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        backgroundColor: COLORS.brocadeMain,
        position: 'relative',
        padding: '50px',
      },
      children: [
        // 四周边框
        CloudBorder({ side: 'top' }),
        CloudBorder({ side: 'bottom' }),
        CloudBorder({ side: 'left' }),
        CloudBorder({ side: 'right' }),
        // 四角装饰
        { type: 'div', props: { style: { display: 'flex', position: 'absolute', top: '50px', left: '50px' }, children: CornerDecoration() } },
        { type: 'div', props: { style: { display: 'flex', position: 'absolute', top: '50px', right: '50px', transform: 'scaleX(-1)' }, children: CornerDecoration() } },
        { type: 'div', props: { style: { display: 'flex', position: 'absolute', bottom: '50px', left: '50px', transform: 'scaleY(-1)' }, children: CornerDecoration() } },
        { type: 'div', props: { style: { display: 'flex', position: 'absolute', bottom: '50px', right: '50px', transform: 'scale(-1,-1)' }, children: CornerDecoration() } },
        // 内边框
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: '50px',
              left: '50px',
              right: '50px',
              bottom: '50px',
              border: `3px solid ${COLORS.innerBorder}`,
              borderRadius: '4px',
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
              margin: '50px',
              padding: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            },
            children
          }
        }
      ]
    }
  };
};
