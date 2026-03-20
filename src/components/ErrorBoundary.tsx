import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = '发生了一些错误';
      try {
        const errorData = JSON.parse(this.state.error?.message || '{}');
        if (errorData.error) {
          errorMessage = `数据库错误: ${errorData.error}`;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl flex flex-col items-center justify-center gap-4 text-red-600">
          <AlertTriangle size={48} />
          <h2 className="text-xl font-bold">抱歉，出错了</h2>
          <p className="text-sm text-center max-w-md">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-md"
          >
            <RefreshCw size={18} />
            刷新页面
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
