import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home, Terminal } from "lucide-react";

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  showDetails: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      showDetails: false
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render(): ReactNode {
    const { hasError, error, showDetails } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden p-6 font-sans">
          {/* Ambient Glowing Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwb2x5Z29uIHBvaW50cz0iMCAwIDEgMCAxIDQwIDAgNDAiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48cG9seWdvbiBwb2ludHM9IjAgMCA0MCAwIDQwIDEgMCAxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIi8+PC9zdmc+')] opacity-50" />

          <div className="w-full max-w-xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
            {/* Glass Modal */}
            <div className="bg-slate-900/60 backdrop-blur-2xl rounded-[3rem] p-10 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center">
              
              {/* Icon Container */}
              <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-red-500/30 rounded-full blur-xl group-hover:bg-red-500/50 transition-all duration-500" />
                <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-red-500/30 shadow-2xl flex items-center justify-center relative transform group-hover:-translate-y-2 transition-all duration-500">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
              </div>

              {/* Text Content */}
              <h1 className="text-3xl font-black text-white mb-4 tracking-tight">
                Fallo del Sistema
              </h1>
              <p className="text-slate-400 font-medium leading-relaxed mb-10 max-w-sm">
                Hemos interceptado un error de ejecución en la capa de interfaz. Nuestros ingenieros han sido notificados.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] border border-indigo-500/50"
                >
                  <RefreshCcw className="w-5 h-5" />
                  Reiniciar Sesión
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 h-14 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 border border-white/10"
                >
                  <Home className="w-5 h-5" />
                  Ir al Inicio
                </button>
              </div>

              {/* Dev Details Toggle */}
              <div className="mt-8 w-full border-t border-white/10 pt-6">
                <button 
                  onClick={() => this.setState({ showDetails: !showDetails })}
                  className="mx-auto flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors"
                >
                  <Terminal className="w-4 h-4" />
                  {showDetails ? 'Ocultar Diagnóstico' : 'Ver Diagnóstico Técnico'}
                </button>

                {/* Details Block */}
                <div className={`mt-6 overflow-hidden transition-all duration-500 ${showDetails ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="text-left p-6 bg-black/50 rounded-2xl border border-red-500/20 overflow-auto max-h-64">
                    <p className="text-xs font-mono text-red-400 leading-relaxed break-words">
                      {error?.toString()}
                    </p>
                    <p className="text-[10px] font-mono text-slate-500 mt-4 whitespace-pre-wrap leading-relaxed">
                      {error?.stack}
                    </p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      );
    }

    return children || null;
  }
}

export default ErrorBoundary;
