import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render(): ReactNode {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Algo salió mal</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              La aplicación encontró un error inesperado. Hemos sido notificados y estamos trabajando en ello.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <RefreshCcw className="w-4 h-4" />
              Recargar aplicación
            </button>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 text-left p-4 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-600 dark:text-red-400">
                  {error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return children || null;
  }
}

export default ErrorBoundary;
