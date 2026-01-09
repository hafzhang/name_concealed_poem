/**
 * 全局错误边界
 *
 * 基于 docs/modify_program.md 的错误处理改进建议
 * 捕获并处理应用中的错误，提供友好的错误提示
 */

'use client';

import { useEffect } from 'react';
import React from 'react';
import { Frown, RefreshCw, Home } from 'lucide-react';

/**
 * 错误组件属性
 */
interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * 全局错误页面
 */
export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 在开发环境打印错误详情
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by error boundary:', error);
    }
  }, [error]);

  /**
   * 判断错误类型
   */
  const getErrorType = (): string => {
    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('fetch')) {
      return '网络错误';
    }
    if (message.includes('timeout')) {
      return '请求超时';
    }
    if (message.includes('rate limit') || message.includes('429')) {
      return '请求过于频繁';
    }
    if (message.includes('validation')) {
      return '参数错误';
    }

    return '应用错误';
  };

  /**
   * 获取错误提示
   */
  const getErrorMessage = (): string => {
    const message = error.message;

    // 开发环境显示完整错误信息
    if (process.env.NODE_ENV === 'development') {
      return message;
    }

    // 生产环境显示友好提示
    const errorType = getErrorType();
    const friendlyMessages: Record<string, string> = {
      '网络错误': '网络连接出现问题，请检查您的网络设置',
      '请求超时': '请求超时，请稍后重试',
      '请求过于频繁': '您发送请求的频率太高，请稍后再试',
      '参数错误': '请求参数有误，请检查后重试',
    };

    return friendlyMessages[errorType] || '应用遇到了一些问题，请稍后重试';
  };

  const errorType = getErrorType();
  const errorMessage = getErrorMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* 错误图标 */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <Frown className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* 错误标题 */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {errorType}
        </h1>

        {/* 错误消息 */}
        <p className="text-gray-600 mb-6">
          {errorMessage}
        </p>

        {/* 开发环境显示错误堆栈 */}
        {process.env.NODE_ENV === 'development' && error.stack && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 mb-2">
              查看错误详情
            </summary>
            <pre className="text-xs bg-gray-100 p-3 rounded-lg overflow-auto max-h-40 text-gray-700">
              {error.stack}
            </pre>
          </details>
        )}

        {/* 错误摘要（生产环境） */}
        {process.env.NODE_ENV === 'production' && error.digest && (
          <p className="text-xs text-gray-400 mb-6">
            错误代码: {error.digest}
          </p>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* 重试按钮 */}
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            重试
          </button>

          {/* 返回首页按钮 */}
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
          >
            <Home className="w-4 h-4" />
            返回首页
          </a>
        </div>

        {/* 帮助提示 */}
        <p className="text-sm text-gray-500 mt-6">
          如果问题持续存在，请联系客服获取帮助
        </p>
      </div>
    </div>
  );
}

/**
 * 错误边界组件属性
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

/**
 * 错误边界组件状态
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 类组件错误边界
 * 用于包裹特定组件，捕获组件内的错误
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 记录错误到控制台
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // 可以在这里将错误上报到错误追踪服务
    // logErrorToService(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

/**
 * 默认错误回退组件
 */
interface DefaultErrorFallbackProps {
  error: Error;
  reset: () => void;
}

function DefaultErrorFallback({ error, reset }: DefaultErrorFallbackProps) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-800 font-medium">组件加载失败</p>
      <p className="text-red-600 text-sm mt-1">{error.message}</p>
      <button
        onClick={reset}
        className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
      >
        重试
      </button>
    </div>
  );
}
