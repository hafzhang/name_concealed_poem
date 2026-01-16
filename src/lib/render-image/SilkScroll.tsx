// 绫罗卷轴 (Silk Scroll) - 精简优化版
// 设计理念：传统中式挂轴，简化装饰，突出书法主体

import React from 'react';

export interface MountingProps {
  children: any;
  width?: number;
  height?: number;
}

// --- 配色方案 ---
const COLORS = {
  silkMain: '#d6d3d1',      // 绢布主色
  silkDark: '#a8a29e',       // 绢布暗部
  goldAccent: '#d4af37',     // 金色装饰
  rollerDark: '#2c2c2c',     // 卷轴深色
  rollerLight: '#4a4a4a',    // 卷轴亮色
  paperBg: '#fffbf0',        // 宣纸底色
  string: '#8b4513',         // 挂绳颜色
};

// --- 装饰图案 (精选 8 个云纹) ---
const CLOUD_PATTERNS = [
  "M10,25 Q20,15 30,25 T50,25",           // 单云
  "M5,20 Q15,10 25,20 T45,20",           // 小云
  "M15,30 Q25,20 35,30 T55,30",          // 连云
  "M0,25 C10,15 30,15 40,25 S70,35 80,25", // 弧云
  "M10,20 Q25,10 40,20 T70,20",          // 长云
  "M5,25 Q20,10 35,25 T65,25",           // 流云
  "M0,20 C15,10 35,10 50,20",            // 卷云
  "M10,15 Q25,5 40,15 T70,15",           // 轻云
];

// --- 辅助组件 ---

// 渲染挂绳
const RenderHangingString = () =>
  React.createElement('div', {
    style: {
      position: 'absolute',
      top: '-60px',
      left: 0,
      right: 0,
      margin: '0 auto',
      width: '3px',
      height: '80px',
      background: `linear-gradient(to bottom, ${COLORS.string}, transparent)`,
      zIndex: 100,
    }
  });

// 渲染顶部卷轴
const RenderTopRoller = () =>
  React.createElement('div', {
    style: {
      display: 'flex',
      width: '100%',
      height: '24px',
      background: `linear-gradient(to bottom, ${COLORS.rollerLight}, ${COLORS.rollerDark})`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      position: 'relative',
    }
  },
    // 左轴头
    React.createElement('div', {
      style: {
        position: 'absolute',
        left: '-10px',
        top: '-6px',
        width: '20px',
        height: '36px',
        background: `linear-gradient(to right, ${COLORS.rollerDark}, ${COLORS.rollerLight})`,
        borderRadius: '4px',
        boxShadow: '-2px 0 4px rgba(0,0,0,0.3)',
      }
    }),
    // 右轴头
    React.createElement('div', {
      style: {
        position: 'absolute',
        right: '-10px',
        top: '-6px',
        width: '20px',
        height: '36px',
        background: `linear-gradient(to left, ${COLORS.rollerDark}, ${COLORS.rollerLight})`,
        borderRadius: '4px',
        boxShadow: '2px 0 4px rgba(0,0,0,0.3)',
      }
    }),
    // 金色装饰线
    React.createElement('div', {
      style: {
        position: 'absolute',
        bottom: '2px',
        left: '0',
        right: '0',
        height: '2px',
        background: COLORS.goldAccent,
        opacity: 0.6,
      }
    })
  );

// 渲染顶部绫罗面板
const RenderTopSilkPanel = () =>
  React.createElement('div', {
    style: {
      width: '100%',
      height: '60px',
      background: `linear-gradient(to bottom, ${COLORS.silkMain}, ${COLORS.silkDark})`,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  },
    // 精简云纹装饰 (中央)
    React.createElement('div', {
      style: {
        display: 'flex',
        position: 'absolute',
        width: '120px',
        height: '40px',
        opacity: 0.15,
      }
    }, CLOUD_PATTERNS.slice(0, 4).map((path, i) =>
      React.createElement('svg', {
        key: i,
        width: '100%',
        height: '100%',
        viewBox: '0 0 100 50',
      }, React.createElement('path', {
        d: path,
        stroke: COLORS.goldAccent,
        strokeWidth: '1.5',
        fill: 'none',
        transform: `translate(${(i % 2) * 20}, ${Math.floor(i / 2) * 10})`,
      }))
    )),
    // 金色边框线
    React.createElement('div', {
      style: {
        position: 'absolute',
        bottom: 0,
        left: '0',
        right: '0',
        height: '3px',
        background: `linear-gradient(to right, transparent, ${COLORS.goldAccent} 20%, ${COLORS.goldAccent} 80%, transparent)`,
      }
    })
  );

// 渲染中间宣纸内容区
const RenderPaperContent = (children: any) =>
  React.createElement('div', {
    style: {
      flex: 1,
      backgroundColor: COLORS.paperBg,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px',
      margin: '0 20px',
      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.05)',
    }
  }, ...Array.isArray(children) ? children : [children]);

// 渲染底部绫罗面板
const RenderBottomSilkPanel = () =>
  React.createElement('div', {
    style: {
      width: '100%',
      height: '60px',
      background: `linear-gradient(to top, ${COLORS.silkMain}, ${COLORS.silkDark})`,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  },
    // 精简云纹装饰 (中央)
    React.createElement('div', {
      style: {
        display: 'flex',
        position: 'absolute',
        width: '120px',
        height: '40px',
        opacity: 0.15,
      }
    }, CLOUD_PATTERNS.slice(4, 8).map((path, i) =>
      React.createElement('svg', {
        key: i,
        width: '100%',
        height: '100%',
        viewBox: '0 0 100 50',
      }, React.createElement('path', {
        d: path,
        stroke: COLORS.goldAccent,
        strokeWidth: '1.5',
        fill: 'none',
        transform: `translate(${(i % 2) * 20}, ${Math.floor(i / 2) * 10})`,
      }))
    )),
    // 金色边框线
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: 0,
        left: '0',
        right: '0',
        height: '3px',
        background: `linear-gradient(to right, transparent, ${COLORS.goldAccent} 20%, ${COLORS.goldAccent} 80%, transparent)`,
      }
    })
  );

// 渲染底部卷轴
const RenderBottomRoller = () =>
  React.createElement('div', {
    style: {
      display: 'flex',
      width: '100%',
      height: '24px',
      background: `linear-gradient(to top, ${COLORS.rollerLight}, ${COLORS.rollerDark})`,
      boxShadow: '0 -2px 4px rgba(0,0,0,0.2)',
      position: 'relative',
    }
  },
    // 左轴头
    React.createElement('div', {
      style: {
        position: 'absolute',
        left: '-10px',
        top: '-6px',
        width: '20px',
        height: '36px',
        background: `linear-gradient(to right, ${COLORS.rollerDark}, ${COLORS.rollerLight})`,
        borderRadius: '4px',
        boxShadow: '-2px 0 4px rgba(0,0,0,0.3)',
      }
    }),
    // 右轴头
    React.createElement('div', {
      style: {
        position: 'absolute',
        right: '-10px',
        top: '-6px',
        width: '20px',
        height: '36px',
        background: `linear-gradient(to left, ${COLORS.rollerDark}, ${COLORS.rollerLight})`,
        borderRadius: '4px',
        boxShadow: '2px 0 4px rgba(0,0,0,0.3)',
      }
    }),
    // 金色装饰线
    React.createElement('div', {
      style: {
        position: 'absolute',
        top: '2px',
        left: '0',
        right: '0',
        height: '2px',
        background: COLORS.goldAccent,
        opacity: 0.6,
      }
    })
  );

// --- 主组件 ---
export const SilkScroll = ({ children }: MountingProps) => {
  return React.createElement('div', {
    style: {
      display: 'flex',
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
      backgroundColor: '#f5f5f4',
      position: 'relative',
      overflow: 'hidden',
    }
  },
    // 顶部组件
    React.createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        zIndex: 10,
      }
    }, RenderHangingString(), RenderTopRoller(), RenderTopSilkPanel()),
    // 中间宣纸
    RenderPaperContent(children),
    // 底部组件
    React.createElement('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        zIndex: 10,
      }
    }, RenderBottomSilkPanel(), RenderBottomRoller())
  );
};
