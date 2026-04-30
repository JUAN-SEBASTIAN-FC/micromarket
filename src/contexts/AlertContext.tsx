import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface Alert {
  id: string;
  type: AlertType;
  message: string;
  title?: string;
}

interface AlertContextType {
  showAlert: (type: AlertType, message: string, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = useCallback((type: AlertType, message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setAlerts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 5000);
  }, []);

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-4 w-full max-w-sm pointer-events-none">
        <AnimatePresence>
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className={`
                relative overflow-hidden rounded-[1.5rem] border p-5 shadow-2xl backdrop-blur-xl
                ${alert.type === 'success' ? 'bg-emerald-50/90 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-100' : ''}
                ${alert.type === 'error' ? 'bg-rose-50/90 dark:bg-rose-950/30 border-rose-200/50 dark:border-rose-500/20 text-rose-900 dark:text-rose-100' : ''}
                ${alert.type === 'warning' ? 'bg-amber-50/90 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-500/20 text-amber-900 dark:text-amber-100' : ''}
                ${alert.type === 'info' ? 'bg-indigo-50/90 dark:bg-indigo-950/30 border-indigo-200/50 dark:border-indigo-500/20 text-indigo-900 dark:text-indigo-100' : ''}
              `}>
                <div className="flex gap-4">
                  <div className={`
                    w-10 h-10 rounded-2xl flex items-center justify-center shrink-0
                    ${alert.type === 'success' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : ''}
                    ${alert.type === 'error' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : ''}
                    ${alert.type === 'warning' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : ''}
                    ${alert.type === 'info' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : ''}
                  `}>
                    {alert.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                    {alert.type === 'error' && <AlertCircle className="w-5 h-5" />}
                    {alert.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                    {alert.type === 'info' && <Info className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-0.5">
                    {alert.title && <h4 className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">{alert.title}</h4>}
                    <p className="text-sm font-bold leading-relaxed">{alert.message}</p>
                  </div>

                  <button 
                    onClick={() => removeAlert(alert.id)}
                    className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4 opacity-40" />
                  </button>
                </div>
                
                {/* Progress bar timer */}
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-1 opacity-30
                    ${alert.type === 'success' ? 'bg-emerald-500' : ''}
                    ${alert.type === 'error' ? 'bg-rose-500' : ''}
                    ${alert.type === 'warning' ? 'bg-amber-500' : ''}
                    ${alert.type === 'info' ? 'bg-indigo-600' : ''}
                  `}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
