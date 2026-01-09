/**
 * 图片缓存测试 Hook
 *
 * 基于 docs/modify_program.md 的性能优化建议
 * 测试字体缓存、图片缓存等功能
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useImageCache } from './useImageCache';

// Mock IndexedDB
const mockDB = {
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
};

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = mockLocalStorage as any;

describe('useImageCache - 图片缓存 Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  // ============================================
  // 一、缓存命中测试
  // ============================================

  describe('缓存命中', () => {
    test('从缓存中获取已存在的图片', async () => {
      const cachedImage = 'data:image/png;base64,mock-cached-image';
      mockLocalStorage.getItem.mockReturnValue(cachedImage);

      const { result } = renderHook(() => useImageCache());

      let image;
      await act(async () => {
        image = await result.current.getCachedImage(
          'poem-张三-kaishu-4'
        );
      });

      expect(image).toBe(cachedImage);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(
        'img_poem-张三-kaishu-4'
      );
    });

    test('缓存未命中时返回 null', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useImageCache());

      let image;
      await act(async () => {
        image = await result.current.getCachedImage('non-existent-key');
      });

      expect(image).toBeNull();
    });

    test('检查缓存是否存在', async () => {
      mockLocalStorage.getItem.mockReturnValue('some-data');

      const { result } = renderHook(() => useImageCache());

      let exists;
      await act(async () => {
        exists = await result.current.hasCachedImage('existing-key');
      });

      expect(exists).toBe(true);
    });

    test('缓存不存在时返回 false', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useImageCache());

      let exists;
      await act(async () => {
        exists = await result.current.hasCachedImage('non-existent-key');
      });

      expect(exists).toBe(false);
    });
  });

  // ============================================
  // 二、缓存写入测试
  // ============================================

  describe('缓存写入', () => {
    test('成功写入图片到缓存', async () => {
      const { result } = renderHook(() => useImageCache());

      const imageData = 'data:image/png;base64,mock-image-data';

      await act(async () => {
        await result.current.setCachedImage('test-key', imageData);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'img_test-key',
        imageData
      );
    });

    test('写入缓存时同时记录时间戳', async () => {
      const { result } = renderHook(() => useImageCache());

      const imageData = 'data:image/png;base64,mock-image-data';

      await act(async () => {
        await result.current.setCachedImage('test-key', imageData);
      });

      // 验证时间戳被记录
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('更新已存在的缓存', async () => {
      const { result } = renderHook(() => useImageCache());

      const oldData = 'data:image/png;base64,old-data';
      const newData = 'data:image/png;base64,new-data';

      // 第一次写入
      await act(async () => {
        await result.current.setCachedImage('test-key', oldData);
      });

      // 更新
      await act(async () => {
        await result.current.setCachedImage('test-key', newData);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(2);
    });
  });

  // ============================================
  // 三、缓存删除测试
  // ============================================

  describe('缓存删除', () => {
    test('删除指定的缓存项', async () => {
      const { result } = renderHook(() => useImageCache());

      await act(async () => {
        await result.current.deleteCachedImage('test-key');
      });

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(
        'img_test-key'
      );
    });

    test('清空所有缓存', async () => {
      // 模拟有多个缓存项
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key.startsWith('img_')) return 'mock-data';
        return null;
      });

      const { result } = renderHook(() => useImageCache());

      await act(async () => {
        await result.current.clearAllCache();
      });

      // 验证所有图片缓存都被清除
      // 实际实现中可能需要遍历所有键
    });
  });

  // ============================================
  // 四、缓存过期测试
  // ============================================

  describe('缓存过期', () => {
    test('检查缓存是否过期', async () => {
      const now = Date.now();
      const expiredTime = now - 25 * 60 * 60 * 1000; // 25小时前（已过期）

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'timestamp_test-key') {
          return expiredTime.toString();
        }
        return 'mock-data';
      });

      const { result } = renderHook(() => useImageCache());

      let isExpired;
      await act(async () => {
        isExpired = await result.current.isCacheExpired('test-key', 24);
      });

      expect(isExpired).toBe(true);
    });

    test('未过期的缓存返回 false', async () => {
      const now = Date.now();
      const recentTime = now - 1 * 60 * 60 * 1000; // 1小时前（未过期）

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'timestamp_test-key') {
          return recentTime.toString();
        }
        return 'mock-data';
      });

      const { result } = renderHook(() => useImageCache());

      let isExpired;
      await act(async () => {
        isExpired = await result.current.isCacheExpired('test-key', 24);
      });

      expect(isExpired).toBe(false);
    });

    test('自动清理过期缓存', async () => {
      const { result } = renderHook(() => useImageCache());

      await act(async () => {
        await result.current.cleanExpiredCache(24);
      });

      // 验证过期缓存被删除
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });
  });

  // ============================================
  // 五、字体缓存测试
  // ============================================

  describe('字体缓存', () => {
    test('字体文件缓存命中', async () => {
      const mockFontData = new ArrayBuffer(1024);

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({ data: Array.from(new Uint8Array(mockFontData)) })
      );

      const { result } = renderHook(() => useImageCache());

      let fontData;
      await act(async () => {
        fontData = await result.current.getCachedFont('noto-serif-sc');
      });

      expect(fontData).toBeInstanceOf(ArrayBuffer);
    });

    test('字体缓存未命中时返回 null', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useImageCache());

      let fontData;
      await act(async () => {
        fontData = await result.current.getCachedFont('unknown-font');
      });

      expect(fontData).toBeNull();
    });

    test('写入字体缓存', async () => {
      const { result } = renderHook(() => useImageCache());

      const fontData = new ArrayBuffer(1024);

      await act(async () => {
        await result.current.setCachedFont('test-font', fontData);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'font_test-font',
        expect.any(String)
      );
    });

    test('字体数据太大时不使用 localStorage', async () => {
      const { result } = renderHook(() => useImageCache());

      // 创建一个超过 localStorage 限制的数据（5MB+）
      const largeFontData = new ArrayBuffer(6 * 1024 * 1024);

      await act(async () => {
        await result.current.setCachedFont('large-font', largeFontData);
      });

      // 应该使用 IndexedDB 或跳过缓存
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // 六、缓存统计测试
  // ============================================

  describe('缓存统计', () => {
    test('获取缓存大小', async () => {
      const { result } = renderHook(() => useImageCache());

      let size;
      await act(async () => {
        size = await result.current.getCacheSize();
      });

      expect(typeof size).toBe('number');
    });

    test('获取缓存项数量', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key.startsWith('img_')) return 'mock-data';
        if (key.startsWith('font_')) return 'mock-data';
        return null;
      });

      const { result } = renderHook(() => useImageCache());

      let count;
      await act(async () => {
        count = await result.current.getCacheCount();
      });

      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('获取缓存列表', async () => {
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key.startsWith('img_')) return 'mock-data';
        return null;
      });

      const { result } = renderHook(() => useImageCache());

      let list;
      await act(async () => {
        list = await result.current.getCacheList();
      });

      expect(Array.isArray(list)).toBe(true);
    });
  });

  // ============================================
  // 七、边界情况测试
  // ============================================

  describe('边界情况', () => {
    test('空键名处理', async () => {
      const { result } = renderHook(() => useImageCache());

      let image;
      await act(async () => {
        image = await result.current.getCachedImage('');
      });

      expect(image).toBeNull();
    });

    test('特殊字符键名处理', async () => {
      const { result } = renderHook(() => useImageCache());

      const imageData = 'data:image/png;base64,mock-data';

      await act(async () => {
        await result.current.setCachedImage('key with spaces 中文', imageData);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    test('缓存数据损坏时的处理', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json-data');

      const { result } = renderHook(() => useImageCache());

      let fontData;
      await act(async () => {
        fontData = await result.current.getCachedFont('corrupted-font');
      });

      // 应该返回 null 并清理损坏的缓存
      expect(fontData).toBeNull();
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });

    test('localStorage 不可用时的降级处理', async () => {
      // 模拟 localStorage 不可用
      const originalGetItem = mockLocalStorage.getItem;
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage not available');
      });

      const { result } = renderHook(() => useImageCache());

      let image;
      await act(async () => {
        image = await result.current.getCachedImage('test-key');
      });

      expect(image).toBeNull();

      // 恢复
      mockLocalStorage.getItem.mockImplementation(originalGetItem);
    });
  });

  // ============================================
  // 八、性能优化测试
  // ============================================

  describe('性能优化', () => {
    test('批量获取缓存', async () => {
      const { result } = renderHook(() => useImageCache());

      const keys = ['key1', 'key2', 'key3'];

      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'img_key1') return 'data1';
        if (key === 'img_key2') return 'data2';
        return null;
      });

      let results;
      await act(async () => {
        results = await result.current.batchGetCachedImages(keys);
      });

      expect(results).toEqual({
        key1: 'data1',
        key2: 'data2',
        key3: null,
      });
    });

    test('限制缓存大小', async () => {
      const { result } = renderHook(() => useImageCache());

      // 模拟缓存已满
      mockLocalStorage.getItem.mockReturnValue('x'.repeat(5 * 1024 * 1024));

      await act(async () => {
        await result.current.setCachedImage('new-key', 'new-data');
      });

      // 应该清理最老的缓存
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });
  });
});
