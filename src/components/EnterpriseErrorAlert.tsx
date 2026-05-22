import React from 'react';
import { AlertTriangle, X, RefreshCw, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EnterpriseErrorResponse } from '../lib/validation';

interface EnterpriseErrorAlertProps {
  error: EnterpriseErrorResponse | null;
  onClose: () => void;
  onAction?: () => void;
  actionLabel?: string;
}

export default function EnterpriseErrorAlert({
  error,
  onClose,
  onAction,
  actionLabel = 'Corregir ahora'
}: EnterpriseErrorAlertProps) {
  if (!error) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: [0.95, 1.02, 1],
          transition: {
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1]
          }
        }}
        exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
        className="w-full relative z-50 mb-8"
      >
        {/* Glow ambientador por detrás */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-500/10 to-indigo-500/10 rounded-[2rem] blur-xl opacity-75 pointer-events-none" />

        {/* Panel Glassmorphic principal */}
        <div className="relative backdrop-blur-2xl bg-white/70 dark:bg-slate-900/60 border border-red-500/20 dark:border-red-500/30 rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
          
          {/* Luz de advertencia pulsante en la esquina */}
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-red-500 to-amber-500" />

          {/* Información del Error */}
          <div className="flex items-start gap-4 md:flex-1 pl-2">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shrink-0 border border-red-500/20 relative group">
              <span className="absolute inset-0 rounded-2xl bg-red-500/20 animate-ping opacity-75" />
              <AlertTriangle className="w-6 h-6 relative z-10" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-red-500 dark:text-red-400 uppercase tracking-[3px]">
                  Falla de Validación
                </span>
                <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {error.source}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-800 dark:text-white leading-relaxed">
                {error.message}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 md:self-center">
            {error.actionable && onAction && (
              <button
                onClick={onAction}
                className="flex-1 md:flex-none h-12 px-6 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-[0_4px_15px_rgba(239,68,68,0.2)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.35)] flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {actionLabel}
              </button>
            )}

            <button
              onClick={onClose}
              className="w-12 h-12 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl transition-all duration-300 active:scale-95 border border-slate-200 dark:border-white/5 flex items-center justify-center"
              aria-label="Cerrar alerta"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
