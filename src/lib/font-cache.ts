/**
 * 字体缓存模块
 *
 * 基于 docs/modify_program.md 的性能优化建议
 * 实现字体预加载和缓存机制，减少重复加载开销
 */

import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * 字体缓存项
 */
interface FontCacheItem {
  data: ArrayBuffer;
  timestamp: number;
}

/**
 * 字体配置
 */
export interface FontConfig {
  name: string;
  path: string;
  weight?: string;
  style?: string;
}

/**
 * 字体缓存类
 */
class FontCache {
  private cache: Map<string, FontCacheItem>;
  private maxAge: number; // 毫秒
  private maxSize: number; // 字节数

  constructor(maxAge: number = 7 * 24 * 60 * 60 * 1000, maxSize: number = 50 * 1024 * 1024) {
    this.cache = new Map();
    this.maxAge = maxAge;
    this.maxSize = maxSize;
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(fontName: string): string {
    return `font:${fontName}`;
  }

  /**
   * 检查缓存是否过期
   */
  private isExpired(item: FontCacheItem): boolean {
    return Date.now() - item.timestamp > this.maxAge;
  }

  /**
   * 获取当前缓存大小
   */
  private getCurrentSize(): number {
    let size = 0;
    for (const item of this.cache.values()) {
      size += item.data.byteLength;
    }
    return size;
  }

  /**
   * 清理过期缓存
   */
  private cleanupExpired(): void {
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 确保有足够的缓存空间
   */
  private ensureSpace(requiredSize: number): void {
    this.cleanupExpired();

    const currentSize = this.getCurrentSize();
    if (currentSize + requiredSize <= this.maxSize) {
      return;
    }

    // 按时间戳排序，删除最老的缓存
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    let freedSpace = 0;
    for (const [key, item] of entries) {
      if (currentSize + requiredSize - freedSpace <= this.maxSize) {
        break;
      }
      freedSpace += item.data.byteLength;
      this.cache.delete(key);
    }
  }

  /**
   * 获取字体数据
   */
  async get(fontName: string): Promise<ArrayBuffer | null> {
    const key = this.getCacheKey(fontName);
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // 检查是否过期
    if (this.isExpired(item)) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * 设置字体缓存
   */
  async set(fontName: string, data: ArrayBuffer): Promise<void> {
    const key = this.getCacheKey(fontName);

    // 确保空间足够
    this.ensureSpace(data.byteLength);

    // 存储缓存
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * 删除指定字体缓存
   */
  delete(fontName: string): void {
    const key = this.getCacheKey(fontName);
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    count: number;
    size: number;
    sizeInMB: number;
  } {
    let size = 0;
    for (const item of this.cache.values()) {
      size += item.data.byteLength;
    }

    return {
      count: this.cache.size,
      size,
      sizeInMB: size / (1024 * 1024),
    };
  }

  /**
   * 检查字体是否已缓存
   */
  has(fontName: string): boolean {
    const key = this.getCacheKey(fontName);
    const item = this.cache.get(key);
    return item !== undefined && !this.isExpired(item);
  }
}

/**
 * 全局字体缓存实例
 */
let globalFontCache: FontCache | null = null;

/**
 * 获取全局字体缓存实例
 */
export function getFontCache(): FontCache {
  if (!globalFontCache) {
    // 从环境变量读取配置
    const maxAge = parseInt(process.env.CACHE_FONT_EXPIRY || '168', 10) * 60 * 60 * 1000;
    globalFontCache = new FontCache(maxAge);
  }
  return globalFontCache;
}

/**
 * 预定义的字体配置
 */
export const FONTS: Record<string, FontConfig> = {
  notoSerifSC: {
    name: 'Noto Serif SC',
    path: '/fonts/NotoSerifSC-Bold.otf',
    weight: '700',
    style: 'normal',
  },
  maShanZheng: {
    name: 'Ma Shan Zheng',
    path: '/fonts/MaShanZheng-Regular.ttf',
    weight: '400',
    style: 'normal',
  },
  longCang: {
    name: 'Long Cang',
    path: '/fonts/LongCang-Regular.ttf',
    weight: '400',
    style: 'normal',
  },
  zcoolKuaiLe: {
    name: 'ZCOOL KuaiLe',
    path: '/fonts/ZCOOLKuaiLe-Regular.ttf',
    weight: '400',
    style: 'normal',
  },
};

/**
 * 加载字体文件
 */
export async function loadFont(fontName: string): Promise<ArrayBuffer> {
  const fontConfig = FONTS[fontName];
  if (!fontConfig) {
    throw new Error(`未找到字体配置: ${fontName}`);
  }

  try {
    const fontPath = join(process.cwd(), 'public', fontConfig.path);
    const buffer = await readFile(fontPath);
    // 将 Buffer 转换为 ArrayBuffer
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  } catch (error) {
    throw new Error(`加载字体失败: ${fontName} - ${error}`);
  }
}

/**
 * 获取字体数据（带缓存）
 */
export async function getFontData(fontName: string): Promise<ArrayBuffer> {
  const cache = getFontCache();

  // 尝试从缓存获取
  const cached = await cache.get(fontName);
  if (cached) {
    return cached;
  }

  // 加载字体
  const fontData = await loadFont(fontName);

  // 存入缓存
  await cache.set(fontName, fontData);

  return fontData;
}

/**
 * 预加载多个字体
 */
export async function preloadFonts(fontNames: string[]): Promise<void> {
  const cache = getFontCache();

  await Promise.all(
    fontNames.map(async (fontName) => {
      if (!cache.has(fontName)) {
        try {
          const fontData = await loadFont(fontName);
          await cache.set(fontName, fontData);
        } catch (error) {
          console.warn(`预加载字体失败: ${fontName}`, error);
        }
      }
    })
  );
}

/**
 * 清空字体缓存
 */
export function clearFontCache(): void {
  const cache = getFontCache();
  cache.clear();
}

/**
 * 获取字体缓存统计
 */
export function getFontCacheStats() {
  const cache = getFontCache();
  return cache.getStats();
}
