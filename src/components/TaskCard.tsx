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
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link
        to={`/tasks/${task.id}`}
        className={cn(
          "block relative bg-white dark:bg-[#0f172a]/60 backdrop-blur-2xl border border-slate-200/50 dark:border-white/5 rounded-[3rem] transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.15)] hover:border-indigo-500/30 overflow-hidden",
          variant === 'compact' ? "p-6" : "p-10"
        )}
      >
        {/* Advanced Glow Interaction */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[80px] -ml-32 -mb-32 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" style={{ animationDelay: '1s' }}></div>

        {/* Top Section: Author & Category */}
        <div className="flex justify-between items-start mb-8 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-14 h-14 rounded-[1.25rem] overflow-hidden border border-slate-100 dark:border-white/5 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                <img src={task.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.author?.name || 'user'}`} alt="" className="w-full h-full object-cover" />
              </div>
              {task.authorId && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 rounded-full border-4 border-white dark:border-[#0f172a] flex items-center justify-center text-white shadow-lg">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px] mb-2">{task.author?.name || 'Verificado'}</h4>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-indigo-500/10 flex items-center gap-2 backdrop-blur-md">
                  <Icon className="w-3.5 h-3.5" /> {task.category || 'Servicio'}
                </span>
                {task.urgency === 'Urgente' && (
                  <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 bg-rose-500/5 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-rose-500/10 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 fill-current" /> Urgente
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
             <div className="bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-2xl border border-slate-100 dark:border-white/5">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-1">Recompensa</span>
                <div className="flex items-center gap-1 justify-end">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">$</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {Number(task.reward).toLocaleString()}
                  </span>
                </div>
             </div>
          </div>
        </div>

        {/* Middle Section: Title & Content */}
        <div className="mb-10 relative z-10">
          <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 mb-4">
            {task.title}
          </h3>
          <p className="text-base text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
            {task.description}
          </p>
        </div>

        {/* Bottom Section: Footer Actions */}
        <div className="pt-8 border-t border-slate-100 dark:border-white/5 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
              <Calendar className="w-4.5 h-4.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{task.deadline || 'Flexible'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
              <Clock className="w-4.5 h-4.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">24h</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[2px] opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500">Ver Detalles</span>
            <div className="w-14 h-14 bg-slate-900 dark:bg-white rounded-2xl flex items-center justify-center text-white dark:text-slate-900 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 group-active:scale-90 shadow-xl group-hover:shadow-indigo-600/30">
              <ArrowRight className="w-7 h-7" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
