import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, ArrowRight, Tag, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Task } from '../services/mockData';
import { Category } from '../services/api';
import { iconMap } from '../pages/AdminCategories';
import { cn } from '../lib/utils';

interface TaskCardProps {
  task: Task;
  categories?: Category[];
  variant?: 'compact' | 'full';
}

export const TaskCard = ({ task, categories = [], variant = 'full' }: TaskCardProps) => {
  const categoryIcon = categories.find(c => c.name.toLowerCase() === task.category?.toLowerCase());
  const Icon = categoryIcon ? (iconMap[categoryIcon.icon] || Tag) : Tag;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link
        to={`/tasks/${task.id}`}
        className={cn(
          "block relative bg-white dark:bg-[#0f172a]/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/5 rounded-[1.75rem] transition-all duration-300 hover:shadow-[0_20px_40px_-12px_rgba(99,102,241,0.15)] hover:border-indigo-500/30 overflow-hidden",
          variant === 'compact' ? "p-5" : "p-6"
        )}
      >
        {/* Advanced Glow Interaction */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[80px] -ml-32 -mb-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" style={{ animationDelay: '1s' }}></div>

        {/* Top Section: Author & Category */}
        <div className="flex justify-between items-start mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-md group-hover:scale-105 transition-transform duration-300">
                <img src={task.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.author?.name || 'user'}`} alt="" className="w-full h-full object-cover" />
              </div>
              {task.authorId && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full border-2 border-white dark:border-[#0f172a] flex items-center justify-center text-white shadow-md">
                  <ShieldCheck className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-[1.5px] mb-1.5">{task.author?.name || 'Verificado'}</h4>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-xl uppercase tracking-wide border border-indigo-500/20 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" /> {task.category || 'Servicio'}
                </span>
                {task.urgency === 'Urgente' && (
                  <span className="text-[11px] font-black text-rose-700 dark:text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-xl uppercase tracking-wide border border-rose-500/20 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 fill-current" /> Urgente
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right shrink-0 ml-2">
            <div className="bg-slate-50 dark:bg-white/5 px-3 py-2 rounded-xl border border-slate-100 dark:border-white/5">
              <span className="text-[9px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest block mb-0.5">Paga</span>
              <div className="flex items-baseline gap-0.5 justify-end">
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">$</span>
                <span className="text-xl font-black text-slate-950 dark:text-white tracking-tight">
                  {Number(task.reward).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Title & Content */}
        <div className="mb-5 relative z-10">
          <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-3">
            {task.title}
          </h3>
          <p className="text-base sm:text-lg text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed font-medium">
            {task.description}
          </p>
        </div>

        {/* Bottom Section: Footer Actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[11px] font-black uppercase tracking-wider">{task.deadline || 'Flexible'}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[11px] font-black uppercase tracking-wider">24h</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[1.5px] opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">Ver</span>
            <div className="w-9 h-9 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 group-active:scale-90 shadow-md group-hover:shadow-indigo-600/30">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
