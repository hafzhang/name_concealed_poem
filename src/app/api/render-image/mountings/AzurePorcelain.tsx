import React from 'react';

export interface MountingProps {
  children: any;
  width?: number;
  height?: number;
}

const THEME_COLOR_PRIMARY = "#e0f2fe";
const THEME_COLOR_SECONDARY = "#0ea5e9";
const THEME_COLOR_ACCENT = "#1e40af";
const THEME_COLOR_HIGHLIGHT = "#ffffff";

export const AzurePorcelain = ({ children }: MountingProps) => {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: THEME_COLOR_PRIMARY,
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `linear-gradient(90deg, ${THEME_COLOR_PRIMARY}, ${THEME_COLOR_HIGHLIGHT})`,
              opacity: 0.6,
              zIndex: 0
            }
          }
        },
        {
          type: 'div',
          props: {
            style: {
              position: 'relative',
              width: '85%',
              height: '85%',
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
              border: `2px solid ${THEME_COLOR_SECONDARY}`,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    right: '8px',
                    bottom: '8px',
                    border: `2px dashed ${THEME_COLOR_ACCENT}`,
                    pointerEvents: 'none',
                  }
                }
              },
              {
                type: 'div',
                props: {
                  style: {
                    padding: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                  },
                  children
                }
              }
            ]
          }
        }
      ]
    }
  };
};
