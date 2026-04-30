import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, DollarSign, TrendingUp, X, Filter, ChevronRight } from 'lucide-react';
import { Category } from '../services/api';
import { iconMap } from '../pages/AdminCategories';
import { cn } from '../lib/utils';

interface ModalOverlayProps {
  children: React.ReactNode;
  onClose: () => void;
}

export const ModalOverlay = ({ children, onClose }: ModalOverlayProps) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md"
    onClick={onClose}
  >
    <motion.div 
      initial={{ scale: 0.95, opacity: 0, y: 30 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.95, opacity: 0, y: 30 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-2xl border border-slate-200 dark:border-white/10 relative overflow-hidden"
    >
      <div className="absolute top-6 right-6">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);

export const CategoryModalContent = ({ 
  categories, 
  selected, 
  onSelect 
}: { 
  categories: Category[], 
  selected: string, 
  onSelect: (val: string) => void 
}) => (
  <div>
    <div className="mb-8">
      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Categorías</h3>
      <p className="text-sm text-slate-500 font-medium">Filtra por el área de especialidad que buscas.</p>
    </div>
    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
      <button
        onClick={() => onSelect('all')}
        className={cn(
          "w-full group text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-between",
          selected === 'all' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
        )}
      >
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5" />
          <span>Todas las áreas</span>
        </div>
        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      {categories.map(cat => {
        const Icon = iconMap[cat.icon] || Tag;
        const isActive = selected.toLowerCase() === cat.name.toLowerCase();
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.name)}
            className={cn(
              "w-full group text-left px-5 py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-between",
              isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
            )}
          >
            <div className="flex items-center gap-4">
              <Icon className="w-5 h-5" />
              <span>{cat.name}</span>
            </div>
            <ChevronRight className={cn("w-4 h-4 transition-all", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
          </button>
        );
      })}
    </div>
  </div>
);

export const PriceModalContent = ({ 
  range, 
  onChange, 
  onClose 
}: { 
  range: {min: number, max: number}, 
  onChange: (r: any) => void, 
  onClose: () => void 
}) => (
  <div>
    <div className="mb-8">
      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Presupuesto</h3>
      <p className="text-sm text-slate-500 font-medium">Define el rango de recompensa esperado.</p>
    </div>
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Mínimo ($)</label>
          <div className="relative">
             <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input
               type="number"
               value={range.min}
               onChange={(e) => onChange({ ...range, min: Math.max(0, Number(e.target.value)) })}
               className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
             />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 ml-1">Máximo ($)</label>
          <div className="relative">
             <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input
               type="number"
               value={range.max}
               onChange={(e) => onChange({ ...range, max: Math.max(range.min, Number(e.target.value)) })}
               className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl pl-10 pr-4 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
             />
          </div>
        </div>
      </div>
      
      <div className="relative pt-6 pb-2">
        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
          <span>Escala rápida</span>
          <span className="text-indigo-600 dark:text-indigo-400">${range.max}</span>
        </div>
        <input
          type="range"
          min="0"
          max="5000"
          step="50"
          value={range.max}
          onChange={(e) => onChange({ ...range, max: Number(e.target.value) })}
          className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
      </div>
      
      <button 
        onClick={onClose}
        className="w-full h-16 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
      >
        Aplicar Filtros
      </button>
    </div>
  </div>
);

export const SortModalContent = ({ 
  selected, 
  onSelect 
}: { 
  selected: string, 
  onSelect: (val: any) => void 
}) => {
  const options = [
    { id: 'newest', label: 'Más recientes', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'reward-high', label: 'Mayor recompensa', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'reward-low', label: 'Menor recompensa', icon: <DollarSign className="w-5 h-5" /> }
  ];

  return (
    <div>
      <div className="mb-8">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Orden</h3>
        <p className="text-sm text-slate-500 font-medium">Prioriza lo que más te importa.</p>
      </div>
      <div className="space-y-2">
        {options.map(opt => {
          const isActive = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className={cn(
                "w-full group text-left px-5 py-5 rounded-2xl text-sm font-bold transition-all flex items-center justify-between",
                isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-4">
                {opt.icon}
                <span>{opt.label}</span>
              </div>
              <ChevronRight className={cn("w-4 h-4 transition-all", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
