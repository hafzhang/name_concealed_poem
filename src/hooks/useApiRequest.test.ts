/**
 * API 请求测试 Hook
 *
 * 基于 docs/modify_program.md 的安全性改进建议
 * 测试 API 请求、错误处理、限流等功能
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useApiRequest } from './useApiRequest';

// Mock fetch
global.fetch = jest.fn();

// Mock 响应构建器
const mockSuccessResponse = (data: any) => ({
  ok: true,
  status: 200,
  json: async () => data,
});

const mockErrorResponse = (status: number, message: string) => ({
  ok: false,
  status,
  json: async () => ({ success: false, error: message }),
});

describe('useApiRequest - API 请求 Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // 一、诗歌生成 API 测试
  // ============================================

  describe('诗歌生成 API', () => {
    test('成功生成诗歌', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        mockSuccessResponse({
          success: true,
          data: {
            poem: ['第一句', '第二句', '第三句', '第四句'],
            explanation: '这是一首优美的诗',
            originalName: '张三',
            processedName: '张三',
            lineCount: 4,
            cached: false,
          },
        })
      );

      const { result } = renderHook(() => useApiRequest());

      let response;
      await act(async () => {
        response = await result.current.generatePoem({
          name: '张三',
          originalName: '张三',
          style: 'kaishu',
          styleKeyword: '温文尔雅',
          lineCount: 4,
        });
      });

      expect(response.success).toBe(true);
      expect(response.data.poem).toHaveLength(4);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/generate-poem',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    test('处理 API 错误响应', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        mockErrorResponse(400, '名字至少需要2个字符')
      );

      const { result } = renderHook(() => useApiRequest());

      let response;
      await act(async () => {
        response = await result.current.generatePoem({
          name: '张',
          originalName: '张',
          style: 'kaishu',
          styleKeyword: '',
          lineCount: 4,
        });
      });

      expect(response.success).toBe(false);
      expect(response.error).toBe('名字至少需要2个字符');
    });

    test('处理网络错误', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useApiRequest());

      let response;
      await act(async () => {
        response = await result.current.generatePoem({
          name: '张三',
          originalName: '张三',
          style: 'kaishu',
          styleKeyword: '',
          lineCount: 4,
        });
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Network error');
    });

    test('6行诗 - 前三句藏头，后三句自由发挥', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        mockSuccessResponse({
          success: true,
          data: {
            poem: ['李园春色满', '清风拂槛闲', '照影花间月', '李下自成蹊', '清心赋妙句', '照月共婵娟'],
            explanation: '意境优美',
            originalName: '李清照',
            processedName: '李清照',
            lineCount: 6,
            cached: false,
          },
        })
      );

      const { result } = renderHook(() => useApiRequest());

      let response;
      await act(async () => {
        response = await result.current.generatePoem({
          name: '李清照',
          originalName: '李清照',
          style: 'kaishu',
          styleKeyword: '优美',
          lineCount: 6,
        });
      });

      expect(response.success).toBe(true);
      expect(response.data.poem).toHaveLength(6);
      // 验证前三句藏头
      expect(response.data.poem[0][0]).toBe('李');
      expect(response.data.poem[1][0]).toBe('清');
      expect(response.data.poem[2][0]).toBe('照');
    });
  });

  // ============================================
  // 二、图片渲染 API 测试
  // ============================================

  describe('图片渲染 API', () => {
    test('成功渲染图片', async () => {
      const mockImageData = 'data:image/png;base64,iVBORw0KGgo...';
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        blob: async () => new Blob(['mock image data']),
      });

      const { result } = renderHook(() => useApiRequest());

      let imageUrl;
      await act(async () => {
        imageUrl = await result.current.renderImage({
          poem: ['第一句', '第二句', '第三句', '第四句'],
          name: '张三',
          style: 'kaishu',
        });
      });

      expect(imageUrl).toContain('blob:');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/render-image',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    test('处理图片渲染错误', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        mockErrorResponse(500, '图片渲染失败')
      );

      const { result } = renderHook(() => useApiRequest());

      await expect(
        result.current.renderImage({
          poem: ['第一句'],
          name: '张三',
          style: 'kaishu',
        })
      ).rejects.toThrow();
    });
  });

  // ============================================
  // 三、加载状态测试
  // ============================================

  describe('加载状态管理', () => {
    test('请求开始时设置 loading 为 true', async () => {
      let resolveFetch: (value: any) => void;
      (global.fetch as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
      );

      const { result } = renderHook(() => useApiRequest());

      // 开始请求
      let requestPromise: Promise<any>;
      act(() => {
        requestPromise = result.current.generatePoem({
          name: '张三',
          originalName: '张三',
          style: 'kaishu',
          styleKeyword: '',
          lineCount: 4,
        });
      });

      // 检查 loading 状态
      expect(result.current.loading).toBe(true);

      // 完成请求
      await act(async () => {
        resolveFetch!(mockSuccessResponse({ success: true, data: {} }));
        await requestPromise!;
      });

      expect(result.current.loading).toBe(false);
    });

    test('错误后重置 loading 状态', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useApiRequest());

      await act(async () => {
        await result.current.generatePoem({
          name: '张三',
          originalName: '张三',
          style: 'kaishu',
          styleKeyword: '',
          lineCount: 4,
        });
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  // ============================================
  // 四、请求限流测试
  // ============================================

  describe('请求限流', () => {
    test('短时间内多次请求触发限流', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        mockErrorResponse(429, '请求过于频繁')
      );

      const { result } = renderHook(() => useApiRequest());

      // 连续发起多个请求
      const requests = Array(5)
        .fill(null)
        .map(() =>
          result.current.generatePoem({
            name: '张三',
            originalName: '张三',
            style: 'kaishu',
            styleKeyword: '',
            lineCount: 4,
          })
        );

      let responses: any[] = [];
      await act(async () => {
        responses = await Promise.all(requests);
      });

      // 至少有一个请求应该被限流
      const rateLimited = responses.some(
        (r) => r.error === '请求过于频繁'
      );
      expect(rateLimited).toBe(true);
    });

    test('限流后等待可恢复请求', async () => {
      let callCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount <= 1) {
          return Promise.resolve(mockErrorResponse(429, '请求过于频繁'));
        }
        return Promise.resolve(
          mockSuccessResponse({ success: true, data: {} })
        );
      });

      const { result } = renderHook(() => useApiRequest());

      // 第一次请求被限流
      let response1: any;
      await act(async () => {
        response1 = await result.current.generatePoem({
          name: '张三',
          originalName: '张三',
          style: 'kaishu',
          styleKeyword: '',
          lineCount: 4,
        }, { retries: 0 });
      });

      expect(response1.success).toBe(false);

      // 等待后再次请求
      await new Promise((resolve) => setTimeout(resolve, 100));

      let response2: any;
      await act(async () => {
        response2 = await result.current.generatePoem({
          name: '张三',
          originalName: '张三',
          style: 'kaishu',
          styleKeyword: '',
          lineCount: 4,
        }, { retries: 0 });
      });

      // 最终应该成功
      expect(response2.success).toBe(true);
    }, 10000);
  });

  // ============================================
  // 五、请求重试机制测试
  // ============================================

  describe('请求重试', () => {
    test('失败后自动重试', async () => {
      let attemptCount = 0;
      (global.fetch as jest.Mock).mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve(
          mockSuccessResponse({ success: true, data: {} })
        );
      });

      const { result } = renderHook(() => useApiRequest());

      const response = await act(async () => {
        return await result.current.generatePoem(
          {
            name: '张三',
            originalName: '张三',
            style: 'kaishu',
            styleKeyword: '',
            lineCount: 4,
          },
          { retries: 3 }
        );
      });

      expect(attemptCount).toBe(3);
      expect(response.success).toBe(true);
    });

    test('达到最大重试次数后返回错误', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useApiRequest());

      const response = await act(async () => {
        return await result.current.generatePoem(
          {
            name: '张三',
            originalName: '张三',
            style: 'kaishu',
            styleKeyword: '',
            lineCount: 4,
          },
          { retries: 2, retryDelay: 10 }
        );
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Network error');
      expect(global.fetch).toHaveBeenCalledTimes(3); // 初始请求 + 2次重试
    });
  });

  // ============================================
  // 六、数据验证测试
  // ============================================

  describe('数据验证', () => {
    test('验证请求参数格式', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        mockSuccessResponse({ success: true, data: {} })
      );

      const { result } = renderHook(() => useApiRequest());

      await act(async () => {
        await result.current.generatePoem({
          name: '张三',
          originalName: '张三',
          style: 'kaishu',
          styleKeyword: '温文尔雅',
          lineCount: 4,
        });
      });

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);

      expect(requestBody).toMatchObject({
        name: expect.any(String),
        originalName: expect.any(String),
        style: expect.any(String),
        styleKeyword: expect.any(String),
        lineCount: expect.any(Number),
      });
    });

    test('响应数据格式验证', async () => {
      const mockData = {
        success: true,
        data: {
          poem: ['第一句', '第二句', '第三句', '第四句'],
          explanation: '解释',
          originalName: '张三',
          processedName: '张三',
          lineCount: 4,
          cached: false,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValue(
        mockSuccessResponse(mockData)
      );

      const { result } = renderHook(() => useApiRequest());

      const response = await act(async () => {
        return await result.current.generatePoem({
          name: '张三',
          originalName: '张三',
          style: 'kaishu',
          styleKeyword: '',
          lineCount: 4,
        });
      });

      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('data');
      expect(response.data).toHaveProperty('poem');
      expect(response.data).toHaveProperty('explanation');
    });
  });

  // ============================================
  // 七、边界情况测试
  // ============================================

  describe('边界情况', () => {
    test('空字符串名字处理', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        mockErrorResponse(400, '名字至少需要2个字符')
      );

      const { result } = renderHook(() => useApiRequest());

      const response = await act(async () => {
        return await result.current.generatePoem({
          name: '',
          originalName: '',
          style: 'kaishu',
          styleKeyword: '',
          lineCount: 4,
        });
      });

      expect(response.success).toBe(false);
    });

    test('超长名字处理', async () => {
      const longName = '张'.repeat(100);
      (global.fetch as jest.Mock).mockResolvedValue(
        mockErrorResponse(400, '名字过长')
      );

      const { result } = renderHook(() => useApiRequest());

      const response = await act(async () => {
        return await result.current.generatePoem({
          name: longName,
          originalName: longName,
          style: 'kaishu',
          styleKeyword: '',
          lineCount: 4,
        });
      });

      expect(response.success).toBe(false);
    });

    test('无效行数处理', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(
        mockErrorResponse(400, '无效的行数')
      );

      const { result } = renderHook(() => useApiRequest());

      const response = await act(async () => {
        return await result.current.generatePoem({
          name: '张三',
          originalName: '张三',
          style: 'kaishu',
          styleKeyword: '',
          lineCount: 8, // 无效行数
        });
      });

      expect(response.success).toBe(false);
    });
  });
});
