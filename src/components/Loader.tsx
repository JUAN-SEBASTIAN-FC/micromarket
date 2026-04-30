import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp } from 'lucide-react';

export const Loader = ({ message = "Cargando datos..." }: { message?: string }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-8 animate-in fade-in duration-1000">
      <div className="relative flex items-center justify-center">
        {/* Outer orbital ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute w-28 h-28 rounded-full border border-indigo-500/20 border-t-indigo-500/80"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          className="absolute w-36 h-36 rounded-full border border-violet-500/10 border-b-violet-500/50"
        />

        {/* Core icon */}
        <motion.div
          animate={{ rotate: [0, 90, 180, 270, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40 relative z-10 border border-white/10"
        >
          <TrendingUp className="w-8 h-8" />
        </motion.div>

        {/* Ambient glows */}
        <motion.div
          animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-16 h-16 bg-indigo-600 rounded-2xl blur-2xl z-0"
        />
        <motion.div
          animate={{ scale: [1.3, 0.9, 1.3], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute w-16 h-16 bg-violet-500 rounded-2xl blur-xl z-0"
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-1.5">
          <motion.span animate={{ opacity: [0.2, 1, 0.2], scaleY: [0.6, 1, 0.6] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} className="w-1 h-3 rounded-full bg-indigo-500" />
          <motion.span animate={{ opacity: [0.2, 1, 0.2], scaleY: [0.6, 1, 0.6] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.15 }} className="w-1 h-4 rounded-full bg-indigo-500" />
          <motion.span animate={{ opacity: [0.2, 1, 0.2], scaleY: [0.6, 1, 0.6] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }} className="w-1 h-5 rounded-full bg-violet-500" />
          <motion.span animate={{ opacity: [0.2, 1, 0.2], scaleY: [0.6, 1, 0.6] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.45 }} className="w-1 h-4 rounded-full bg-indigo-500" />
          <motion.span animate={{ opacity: [0.2, 1, 0.2], scaleY: [0.6, 1, 0.6] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }} className="w-1 h-3 rounded-full bg-indigo-500" />
        </div>
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[5px] text-center px-4">
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
