// 极简黑框 (Modern Black) - 精简优化版
// 设计理念：极简现代，新中式风格

import React from 'react';

export interface MountingProps {
  children: any;
  width?: number;
  height?: number;
}

const COLORS = {
  frameBlack: '#1a1a1a',       // 纯黑外框
  frameGray: '#2d2d2d',        // 深灰过渡
  accentRed: '#C41E3A',        // 点缀红色
  paperBg: '#fffbf0',          // 宣纸底色
};

export const ModernBlack = ({ children }: MountingProps) => {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        backgroundColor: COLORS.frameBlack,
        position: 'relative',
        padding: '25px',
      },
      children: [
        // 内容区
        {
          type: 'div',
          props: {
            style: {
              flex: 1,
              backgroundColor: COLORS.paperBg,
              margin: '25px',
              padding: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              position: 'relative',
            },
            children: [
              // 内边框（灰色细线）
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    inset: '15px',
                    border: '1px solid #e5e5e5',
                    opacity: 0.5,
                    pointerEvents: 'none',
                  }
                }
              },
              // 四角红色点缀
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    top: '15px',
                    left: '15px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: COLORS.accentRed,
                  }
                }
              },
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: COLORS.accentRed,
                  }
                }
              },
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    bottom: '15px',
                    left: '15px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: COLORS.accentRed,
                  }
                }
              },
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    bottom: '15px',
                    right: '15px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: COLORS.accentRed,
                  }
                }
              },
              children
            ]
          }
        }
      ]
    }
  };
};
