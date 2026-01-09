/**
 * 图片缓存 Hook
 *
 * 基于 docs/modify_program.md 的性能优化建议
 * 实现字体和图片的缓存管理，提高应用性能
 */

import { useCallback, useEffect, useRef } from 'react';

// 缓存配置
const CACHE_CONFIG = {
  // 图片缓存过期时间（小时）
  imageExpiry: 24,
  // 字体缓存过期时间（天）
  fontExpiry: 7,
  // 最大缓存大小（MB）
  maxSize: 10,
  // 缓存键前缀
  imagePrefix: 'img_',
  fontPrefix: 'font_',
  timestampPrefix: 'timestamp_',
};

// Hook 返回类型
export interface UseImageCacheReturn {
  // 图片缓存
  getCachedImage: (key: string) => Promise<string | null>;
  setCachedImage: (key: string, data: string) => Promise<void>;
  hasCachedImage: (key: string) => Promise<boolean>;
  deleteCachedImage: (key: string) => Promise<void>;
  clearAllCache: () => Promise<void>;

  // 字体缓存
  getCachedFont: (fontName: string) => Promise<ArrayBuffer | null>;
  setCachedFont: (fontName: string, data: ArrayBuffer) => Promise<void>;

  // 缓存管理
  isCacheExpired: (key: string, maxHours: number) => Promise<boolean>;
  cleanExpiredCache: (maxHours: number) => Promise<void>;
  getCacheSize: () => Promise<number>;
  getCacheCount: () => Promise<number>;
  getCacheList: () => Promise<string[]>;
  batchGetCachedImages: (keys: string[]) => Promise<Record<string, string | null>>;
}

/**
 * 检查 localStorage 是否可用
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取缓存键
 */
function getCacheKey(prefix: string, key: string): string {
  return `${prefix}${key}`;
}

/**
 * 获取时间戳键
 */
function getTimestampKey(key: string): string {
  return `${CACHE_CONFIG.timestampPrefix}${key}`;
}

/**
 * 图片缓存 Hook
 */
export const useImageCache = (): UseImageCacheReturn => {
  const storageAvailable = useRef(isLocalStorageAvailable());

  /**
   * 获取缓存的图片
   */
  const getCachedImage = useCallback(async (key: string): Promise<string | null> => {
    if (!storageAvailable.current || !key) {
      return null;
    }

    try {
      const cacheKey = getCacheKey(CACHE_CONFIG.imagePrefix, key);
      const data = localStorage.getItem(cacheKey);

      return data;
    } catch {
      return null;
    }
  }, []);

  /**
   * 设置图片缓存
   */
  const setCachedImage = useCallback(async (key: string, data: string): Promise<void> => {
    if (!storageAvailable.current || !key || !data) {
      return;
    }

    try {
      const cacheKey = getCacheKey(CACHE_CONFIG.imagePrefix, key);
      const timestampKey = getTimestampKey(cacheKey);

      // 检查缓存大小，如果超限则清理
      await ensureCacheSpace();

      // 存储数据和時間戳
      localStorage.setItem(cacheKey, data);
      localStorage.setItem(timestampKey, Date.now().toString());
    } catch (error) {
      console.warn('Failed to cache image:', error);
    }
  }, []);

  /**
   * 检查图片缓存是否存在
   */
  const hasCachedImage = useCallback(async (key: string): Promise<boolean> => {
    const cached = await getCachedImage(key);
    return cached !== null;
  }, [getCachedImage]);

  /**
   * 删除指定缓存
   */
  const deleteCachedImage = useCallback(async (key: string): Promise<void> => {
    if (!storageAvailable.current) {
      return;
    }

    try {
      const cacheKey = getCacheKey(CACHE_CONFIG.imagePrefix, key);
      const timestampKey = getTimestampKey(cacheKey);

      localStorage.removeItem(cacheKey);
      localStorage.removeItem(timestampKey);
    } catch (error) {
      console.warn('Failed to delete cache:', error);
    }
  }, []);

  /**
   * 清空所有缓存
   */
  const clearAllCache = useCallback(async (): Promise<void> => {
    if (!storageAvailable.current) {
      return;
    }

    try {
      const keys = await getCacheList();
      for (const key of keys) {
        localStorage.removeItem(key);
        localStorage.removeItem(getTimestampKey(key));
      }
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }, []);

  /**
   * 获取缓存的字体
   */
  const getCachedFont = useCallback(async (fontName: string): Promise<ArrayBuffer | null> => {
    if (!storageAvailable.current) {
      return null;
    }

    try {
      const cacheKey = getCacheKey(CACHE_CONFIG.fontPrefix, fontName);
      const data = localStorage.getItem(cacheKey);

      if (!data) {
        return null;
      }

      // 解析 JSON 并转换为 ArrayBuffer
      const uint8Array = JSON.parse(data);
      return Uint8Array.from(uint8Array).buffer;
    } catch {
      return null;
    }
  }, []);

  /**
   * 设置字体缓存
   */
  const setCachedFont = useCallback(async (fontName: string, data: ArrayBuffer): Promise<void> => {
    if (!storageAvailable.current) {
      return;
    }

    try {
      // 字体文件通常较大，检查是否超过 localStorage 限制
      const uint8Array = new Uint8Array(data);
      const jsonString = JSON.stringify(Array.from(uint8Array));
      const sizeInMB = jsonString.length / (1024 * 1024);

      // 如果超过 5MB，不缓存
      if (sizeInMB > 5) {
        console.warn('Font too large for localStorage, skipping cache');
        return;
      }

      const cacheKey = getCacheKey(CACHE_CONFIG.fontPrefix, fontName);
      const timestampKey = getTimestampKey(cacheKey);

      localStorage.setItem(cacheKey, jsonString);
      localStorage.setItem(timestampKey, Date.now().toString());
    } catch (error) {
      console.warn('Failed to cache font:', error);
    }
  }, []);

  /**
   * 检查缓存是否过期
   */
  const isCacheExpired = useCallback(async (key: string, maxHours: number): Promise<boolean> => {
    if (!storageAvailable.current) {
      return true;
    }

    try {
      const cacheKey = getCacheKey(CACHE_CONFIG.imagePrefix, key);
      const timestampKey = getTimestampKey(cacheKey);
      const timestampStr = localStorage.getItem(timestampKey);

      if (!timestampStr) {
        return true;
      }

      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();
      const hoursDiff = (now - timestamp) / (1000 * 60 * 60);

      return hoursDiff > maxHours;
    } catch {
      return true;
    }
  }, []);

  /**
   * 清理过期缓存
   */
  const cleanExpiredCache = useCallback(async (maxHours: number): Promise<void> => {
    if (!storageAvailable.current) {
      return;
    }

    try {
      const keys = await getCacheList();

      for (const key of keys) {
        const expired = await isCacheExpired(
          key.replace(CACHE_CONFIG.imagePrefix, ''),
          maxHours
        );

        if (expired) {
          await deleteCachedImage(key.replace(CACHE_CONFIG.imagePrefix, ''));
        }
      }
    } catch (error) {
      console.warn('Failed to clean expired cache:', error);
    }
  }, [isCacheExpired, deleteCachedImage]);

  /**
   * 获取缓存大小（MB）
   */
  const getCacheSize = useCallback(async (): Promise<number> => {
    if (!storageAvailable.current) {
      return 0;
    }

    try {
      let totalSize = 0;
      const keys = await getCacheList();

      for (const key of keys) {
        const data = localStorage.getItem(key);
        if (data) {
          totalSize += data.length;
        }
      }

      return totalSize / (1024 * 1024);
    } catch {
      return 0;
    }
  }, []);

  /**
   * 获取缓存项数量
   */
  const getCacheCount = useCallback(async (): Promise<number> => {
    if (!storageAvailable.current) {
      return 0;
    }

    try {
      const keys = await getCacheList();
      return keys.length;
    } catch {
      return 0;
    }
  }, []);

  /**
   * 获取所有缓存键
   */
  const getCacheList = useCallback(async (): Promise<string[]> => {
    if (!storageAvailable.current) {
      return [];
    }

    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(CACHE_CONFIG.imagePrefix) || key.startsWith(CACHE_CONFIG.fontPrefix))) {
          keys.push(key);
        }
      }
      return keys;
    } catch {
      return [];
    }
  }, []);

  /**
   * 批量获取缓存
   */
  const batchGetCachedImages = useCallback(async (keys: string[]): Promise<Record<string, string | null>> => {
    const results: Record<string, string | null> = {};

    await Promise.all(
      keys.map(async (key) => {
        results[key] = await getCachedImage(key);
      })
    );

    return results;
  }, [getCachedImage]);

  /**
   * 确保有足够的缓存空间
   */
  const ensureCacheSpace = useCallback(async (): Promise<void> => {
    const currentSize = await getCacheSize();
    const maxSizeInMB = CACHE_CONFIG.maxSize;

    if (currentSize > maxSizeInMB * 0.9) {
      // 缓存快满了，清理最老的缓存
      const keys = await getCacheList();

      // 按时间戳排序
      const keysWithTimestamp = await Promise.all(
        keys.map(async (key) => {
          const timestampKey = getTimestampKey(key);
          const timestampStr = localStorage.getItem(timestampKey);
          return {
            key,
            timestamp: timestampStr ? parseInt(timestampStr, 10) : 0,
          };
        })
      );

      keysWithTimestamp.sort((a, b) => a.timestamp - b.timestamp);

      // 删除最老的 20%
      const deleteCount = Math.ceil(keysWithTimestamp.length * 0.2);
      for (let i = 0; i < deleteCount; i++) {
        const key = keysWithTimestamp[i].key;
        localStorage.removeItem(key);
        localStorage.removeItem(getTimestampKey(key));
      }
    }
  }, [getCacheSize, getCacheList]);

  // 初始化时清理过期缓存
  useEffect(() => {
    cleanExpiredCache(CACHE_CONFIG.imageExpiry);
  }, [cleanExpiredCache]);

  return {
    // 图片缓存
    getCachedImage,
    setCachedImage,
    hasCachedImage,
    deleteCachedImage,
    clearAllCache,

    // 字体缓存
    getCachedFont,
    setCachedFont,

    // 缓存管理
    isCacheExpired,
    cleanExpiredCache,
    getCacheSize,
    getCacheCount,
    getCacheList,
    batchGetCachedImages,
  };
};
