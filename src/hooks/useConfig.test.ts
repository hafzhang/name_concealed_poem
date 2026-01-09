/**
 * 配置管理测试 Hook
 *
 * 基于 docs/modify_program.md 的配置化改造建议
 * 测试风格配置、装裱样式配置等功能
 */

import { renderHook, act } from '@testing-library/react';
import { useConfig } from './useConfig';

describe('useConfig - 配置管理 Hook', () => {
  // ============================================
  // 一、风格配置测试
  // ============================================

  describe('风格配置', () => {
    test('获取所有书法风格', () => {
      const { result } = renderHook(() => useConfig());

      const styles = result.current.getFontStyles();

      expect(styles).toEqual([
        { value: 'kaishu', label: '楷书', literary: '端正平实' },
        { value: 'xingshu', label: '行书', literary: '飘逸洒脱' },
        { value: 'caoshu', label: '草书', literary: '豪放狂野' },
        { value: 'lishu', label: '隶书', literary: '古朴典雅' },
        { value: 'shoujin', label: '瘦金', literary: '清冷孤傲' },
        { value: 'niaochong', label: '鸟虫', literary: '华丽绮靡' },
      ]);
      expect(styles).toHaveLength(6);
    });

    test('根据 value 获取风格信息', () => {
      const { result } = renderHook(() => useConfig());

      const style = result.current.getFontStyle('kaishu');

      expect(style).toEqual({
        value: 'kaishu',
        label: '楷书',
        literary: '端正平实',
      });
    });

    test('根据 value 获取文学风格', () => {
      const { result } = renderHook(() => useConfig());

      const literary = result.current.getLiteraryStyle('kaishu');

      expect(literary).toBe('端正平实');
    });

    test('无效的 style 返回默认文学风格', () => {
      const { result } = renderHook(() => useConfig());

      const literary = result.current.getLiteraryStyle('invalid-style');

      expect(literary).toBe('优美');
    });

    test('检查风格是否有效', () => {
      const { result } = renderHook(() => useConfig());

      expect(result.current.isValidFontStyle('kaishu')).toBe(true);
      expect(result.current.isValidFontStyle('invalid')).toBe(false);
    });
  });

  // ============================================
  // 二、行数配置测试
  // ============================================

  describe('行数配置', () => {
    test('获取所有行数选项', () => {
      const { result } = renderHook(() => useConfig());

      const lineCounts = result.current.getLineCounts();

      expect(lineCounts).toEqual([
        { value: 2, label: '对联' },
        { value: 4, label: '绝句' },
        { value: 6, label: '六句' },
      ]);
      expect(lineCounts).toHaveLength(3);
    });

    test('根据 value 获取行数标签', () => {
      const { result } = renderHook(() => useConfig());

      const label = result.current.getLineCountLabel(4);

      expect(label).toBe('绝句');
    });

    test('无效的行数返回默认标签', () => {
      const { result } = renderHook(() => useConfig());

      const label = result.current.getLineCountLabel(8);

      expect(label).toBe('未知');
    });

    test('检查行数是否有效', () => {
      const { result } = renderHook(() => useConfig());

      expect(result.current.isValidLineCount(2)).toBe(true);
      expect(result.current.isValidLineCount(4)).toBe(true);
      expect(result.current.isValidLineCount(6)).toBe(true);
      expect(result.current.isValidLineCount(8)).toBe(false);
    });
  });

  // ============================================
  // 三、装裱样式配置测试
  // ============================================

  describe('装裱样式配置', () => {
    test('获取所有装裱样式', () => {
      const { result } = renderHook(() => useConfig());

      const mountings = result.current.getMountingStyles();

      expect(Array.isArray(mountings)).toBe(true);
      expect(mountings.length).toBeGreaterThan(0);
    });

    test('根据名称获取装裱样式', () => {
      const { result } = renderHook(() => useConfig());

      const mounting = result.current.getMountingStyle('museum');

      expect(mounting).toBeDefined();
      expect(mounting).toHaveProperty('name');
      expect(mounting).toHaveProperty('colors');
    });

    test('装裱样式包含必要的属性', () => {
      const { result } = renderHook(() => useConfig());

      const mountings = result.current.getMountingStyles();

      mountings.forEach((mounting) => {
        expect(mounting).toHaveProperty('name');
        expect(mounting).toHaveProperty('colors');
        expect(mounting.colors).toHaveProperty('background');
        expect(mounting.colors).toHaveProperty('border');
      });
    });
  });

  // ============================================
  // 四、API 配置测试
  // ============================================

  describe('API 配置', () => {
    test('获取 API 超时配置', () => {
      const { result } = renderHook(() => useConfig());

      const timeout = result.current.getApiTimeout();

      expect(typeof timeout).toBe('number');
      expect(timeout).toBeGreaterThan(0);
    });

    test('获取重试配置', () => {
      const { result } = renderHook(() => useConfig());

      const retryConfig = result.current.getRetryConfig();

      expect(retryConfig).toHaveProperty('retries');
      expect(retryConfig).toHaveProperty('retryDelay');
    });

    test('获取限流配置', () => {
      const { result } = renderHook(() => useConfig());

      const rateLimit = result.current.getRateLimitConfig();

      expect(rateLimit).toHaveProperty('maxRequests');
      expect(rateLimit).toHaveProperty('windowMs');
    });
  });

  // ============================================
  // 五、缓存配置测试
  // ============================================

  describe('缓存配置', () => {
    test('获取图片缓存过期时间', () => {
      const { result } = renderHook(() => useConfig());

      const expiry = result.current.getImageCacheExpiry();

      expect(typeof expiry).toBe('number');
      expect(expiry).toBeGreaterThan(0);
    });

    test('获取字体缓存过期时间', () => {
      const { result } = renderHook(() => useConfig());

      const expiry = result.current.getFontCacheExpiry();

      expect(typeof expiry).toBe('number');
      expect(expiry).toBeGreaterThan(0);
    });

    test('获取最大缓存大小', () => {
      const { result } = renderHook(() => useConfig());

      const maxSize = result.current.getMaxCacheSize();

      expect(typeof maxSize).toBe('number');
      expect(maxSize).toBeGreaterThan(0);
    });
  });

  // ============================================
  // 六、动态配置更新测试
  // ============================================

  describe('动态配置更新', () => {
    test('更新 API 超时配置', () => {
      const { result } = renderHook(() => useConfig());

      act(() => {
        result.current.setApiTimeout(60000);
      });

      const timeout = result.current.getApiTimeout();
      expect(timeout).toBe(60000);
    });

    test('更新重试配置', () => {
      const { result } = renderHook(() => useConfig());

      act(() => {
        result.current.setRetryConfig({ retries: 5, retryDelay: 2000 });
      });

      const retryConfig = result.current.getRetryConfig();
      expect(retryConfig.retries).toBe(5);
      expect(retryConfig.retryDelay).toBe(2000);
    });

    test('更新限流配置', () => {
      const { result } = renderHook(() => useConfig());

      act(() => {
        result.current.setRateLimitConfig({ maxRequests: 20, windowMs: 60000 });
      });

      const rateLimit = result.current.getRateLimitConfig();
      expect(rateLimit.maxRequests).toBe(20);
    });

    test('重置配置为默认值', () => {
      const { result } = renderHook(() => useConfig());

      // 先修改配置
      act(() => {
        result.current.setApiTimeout(90000);
      });

      // 重置
      act(() => {
        result.current.resetConfig();
      });

      const timeout = result.current.getApiTimeout();
      expect(timeout).toBe(60000); // 默认值
    });
  });

  // ============================================
  // 七、配置验证测试
  // ============================================

  describe('配置验证', () => {
    test('验证风格配置完整性', () => {
      const { result } = renderHook(() => useConfig());

      const isValid = result.current.validateFontStyles();

      expect(isValid).toBe(true);
    });

    test('验证行数配置完整性', () => {
      const { result } = renderHook(() => useConfig());

      const isValid = result.current.validateLineCounts();

      expect(isValid).toBe(true);
    });

    test('验证装裱样式配置完整性', () => {
      const { result } = renderHook(() => useConfig());

      const isValid = result.current.validateMountingStyles();

      expect(isValid).toBe(true);
    });

    test('验证所有配置', () => {
      const { result } = renderHook(() => useConfig());

      const validation = result.current.validateAllConfig();

      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('errors');
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  // ============================================
  // 八、边界情况测试
  // ============================================

  describe('边界情况', () => {
    test('处理空字符串风格', () => {
      const { result } = renderHook(() => useConfig());

      const literary = result.current.getLiteraryStyle('');

      expect(literary).toBe('优美');
    });

    test('处理 null 风格', () => {
      const { result } = renderHook(() => useConfig());

      const literary = result.current.getLiteraryStyle(null as any);

      expect(literary).toBe('优美');
    });

    test('处理 undefined 行数', () => {
      const { result } = renderHook(() => useConfig());

      const isValid = result.current.isValidLineCount(undefined as any);

      expect(isValid).toBe(false);
    });

    test('处理负数行数', () => {
      const { result } = renderHook(() => useConfig());

      const isValid = result.current.isValidLineCount(-1);

      expect(isValid).toBe(false);
    });

    test('处理超大数值的 API 超时', () => {
      const { result } = renderHook(() => useConfig());

      act(() => {
        result.current.setApiTimeout(Number.MAX_SAFE_INTEGER);
      });

      const timeout = result.current.getApiTimeout();
      expect(timeout).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  // ============================================
  // 九、配置导出测试
  // ============================================

  describe('配置导出', () => {
    test('导出所有配置为 JSON', () => {
      const { result } = renderHook(() => useConfig());

      const configJson = result.current.exportConfig();

      expect(typeof configJson).toBe('string');

      const config = JSON.parse(configJson);
      expect(config).toHaveProperty('fontStyles');
      expect(config).toHaveProperty('lineCounts');
      expect(config).toHaveProperty('api');
    });

    test('从 JSON 导入配置', () => {
      const { result } = renderHook(() => useConfig());

      const customConfig = {
        api: {
          timeout: 90000,
          retries: 5,
        },
      };

      act(() => {
        const success = result.current.importConfig(JSON.stringify(customConfig));
        expect(success).toBe(true);
      });

      const timeout = result.current.getApiTimeout();
      expect(timeout).toBe(90000);
    });

    test('导入无效 JSON 应该失败', () => {
      const { result } = renderHook(() => useConfig());

      act(() => {
        const success = result.current.importConfig('invalid-json');
        expect(success).toBe(false);
      });
    });
  });
});
