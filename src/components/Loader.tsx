import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';

export const Loader = ({ message = "Cargando datos..." }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-8 animate-in fade-in duration-1000">
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 180, 270, 360] }} 
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40 relative z-10 border border-white/20"
        >
          <TrendingUp className="w-10 h-10" />
        </motion.div>
        <motion.div 
          animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }} 
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-indigo-600 rounded-[2rem] blur-2xl z-0"
        />
        <motion.div 
          animate={{ scale: [1.2, 0.8, 1.2], opacity: [0.2, 0.5, 0.2] }} 
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-violet-600 rounded-[2rem] blur-xl z-0"
        />
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-1">
          <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
          <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
        </div>
        <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[4px] opacity-80 text-center px-4">
          {message}
        </p>
      </div>
    </div>
  );
};

export const FullScreenLoader = ({ message = "Inicializando sistema..." }: { message?: string }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/90 dark:bg-[#020617]/90 backdrop-blur-xl"
  >
    <Loader message={message} />
  </motion.div>
);
