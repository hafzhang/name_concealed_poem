/**
 * 图片缓存模块
 *
 * 基于 docs/modify_program.md 的性能优化建议
 * 实现图片生成结果的缓存，减少重复请求
 */

import { getCacheConfig } from './env';

/**
 * 图片缓存项
 */
interface ImageCacheItem {
  data: string; // base64 或 blob URL
  timestamp: number;
  hash: string;
}

/**
 * 缓存键生成参数
 */
export interface CacheKeyParams {
  poem: string[];
  name: string;
  style: string;
  mounting?: string;
}

/**
 * 图片缓存类
 */
class ImageCache {
  private cache: Map<string, ImageCacheItem>;
  private maxAge: number;
  private maxItems: number;

  constructor(maxAge: number = 24 * 60 * 60 * 1000, maxItems: number = 100) {
    this.cache = new Map();
    this.maxAge = maxAge;
    this.maxItems = maxItems;
  }

  /**
   * 生成缓存键
   */
  private generateKey(params: CacheKeyParams): string {
    const { poem, name, style, mounting } = params;
    const content = JSON.stringify({ poem, name, style, mounting });
    return `img:${this.hash(content)}`;
  }

  /**
   * 生成简单的哈希值
   */
  private hash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 检查缓存是否过期
   */
  private isExpired(item: ImageCacheItem): boolean {
    return Date.now() - item.timestamp > this.maxAge;
  }

  /**
   * 清理过期和超出限制的缓存
   */
  private cleanup(): void {
    const now = Date.now();

    // 删除过期项
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
      }
    }

    // 如果超出数量限制，删除最老的项
    if (this.cache.size > this.maxItems) {
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toDelete = entries.slice(0, this.cache.size - this.maxItems);
      for (const [key] of toDelete) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存图片
   */
  get(params: CacheKeyParams): string | null {
    this.cleanup();

    const key = this.generateKey(params);
    const item = this.cache.get(key);

    if (!item || this.isExpired(item)) {
      if (item) this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * 设置缓存图片
   */
  set(params: CacheKeyParams, data: string): void {
    this.cleanup();

    const key = this.generateKey(params);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hash: key,
    });
  }

  /**
   * 删除指定缓存
   */
  delete(params: CacheKeyParams): void {
    const key = this.generateKey(params);
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 检查缓存是否存在
   */
  has(params: CacheKeyParams): boolean {
    const key = this.generateKey(params);
    const item = this.cache.get(key);
    return item !== undefined && !this.isExpired(item);
  }

  /**
   * 获取缓存统计
   */
  getStats(): {
    count: number;
    maxSize: number;
    maxAge: number;
  } {
    return {
      count: this.cache.size,
      maxSize: this.maxItems,
      maxAge: this.maxAge,
    };
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

/**
 * 全局图片缓存实例
 */
let globalImageCache: ImageCache | null = null;

/**
 * 获取全局图片缓存实例
 */
export function getImageCache(): ImageCache {
  if (!globalImageCache) {
    const config = getCacheConfig();
    globalImageCache = new ImageCache(
      config.imageExpiry * 60 * 60 * 1000,
      100 // 最多缓存100张图片
    );
  }
  return globalImageCache;
}

/**
 * 获取缓存的图片
 */
export function getCachedImage(params: CacheKeyParams): string | null {
  const cache = getImageCache();
  return cache.get(params);
}

/**
 * 设置图片缓存
 */
export function setCachedImage(params: CacheKeyParams, data: string): void {
  const cache = getImageCache();
  cache.set(params, data);
}

/**
 * 删除图片缓存
 */
export function deleteCachedImage(params: CacheKeyParams): void {
  const cache = getImageCache();
  cache.delete(params);
}

/**
 * 清空所有图片缓存
 */
export function clearImageCache(): void {
  const cache = getImageCache();
  cache.clear();
}

/**
 * 检查图片是否已缓存
 */
export function hasCachedImage(params: CacheKeyParams): boolean {
  const cache = getImageCache();
  return cache.has(params);
}

/**
 * 获取图片缓存统计
 */
export function getImageCacheStats() {
  const cache = getImageCache();
  return cache.getStats();
}
