import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Grid2X2, 
  List, 
  MoreVertical, 
  Clock, 
  FileText, 
  Calendar,
  PlayCircle,
  History,
  Loader2,
  Briefcase,
  Layers,
  ArrowRight,
  Target,
  Trophy,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { subscribeToUserTasks, subscribeToAssignedTasks } from '../services/api';
import { Task } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';
import { Loader } from '../components/Loader';

export default function MyTasks() {
  const [activeTab, setActiveTab] = React.useState('Recibidas');
  const [statusFilter, setStatusFilter] = React.useState('Activas');
  const [authoredTasks, setAuthoredTasks] = useState<Task[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  useEffect(() => {
    if (!profile?.uid) {
      setLoading(false);
      return;
    }

    const unsubAuthored = subscribeToUserTasks(
      profile.name || user?.displayName || '',
      (tasks) => setAuthoredTasks(tasks)
    );

    const unsubAssigned = subscribeToAssignedTasks(
      profile.uid,
      (tasks) => {
        setAssignedTasks(tasks);
        setLoading(false);
      }
    );

    return () => {
      unsubAuthored();
      unsubAssigned();
    };
  }, [profile, user]);

  const currentTasks = activeTab === 'Publicadas' ? authoredTasks : assignedTasks;

  const filteredTasks = currentTasks.filter(task => {
    if (statusFilter === 'Activas') {
      return task.status !== 'completed' && task.status !== 'deleted';
    }
    if (statusFilter === 'Completadas') {
      return task.status === 'completed';
    }
    if (statusFilter === 'Eliminadas') {
      return task.status === 'deleted';
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors pb-32">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-0 w-[50%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[30%] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Centro de Operaciones</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Gestión de Tareas</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Controla tu flujo de trabajo y monitorea tus misiones activas en tiempo real.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link 
              to="/post-task" 
              className="group flex items-center gap-3 px-8 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/25 active:scale-95"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              Publicar Misión
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <aside className="col-span-12 lg:col-span-3 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel rounded-[2rem] p-3 border-white/5 shadow-xl"
            >
              <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 px-4 pt-4">Navegación</h3>
              <div className="space-y-1">
                {[
                  { id: 'Recibidas', label: 'Mis Asignaciones', icon: <Target className="w-4 h-4" />, count: assignedTasks.length },
                  { id: 'Publicadas', label: 'Tareas Publicadas', icon: <Layers className="w-4 h-4" />, count: authoredTasks.length }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-xs transition-all group",
                      activeTab === tab.id 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                        : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn("transition-colors", activeTab === tab.id ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-500")}>
                        {tab.icon}
                      </span>
                      {tab.label}
                    </div>
                    <span className={cn(
                      "text-[9px] px-2 py-0.5 rounded-lg font-bold border font-mono", 
                      activeTab === tab.id 
                        ? "bg-white/20 border-white/20 text-white" 
                        : "bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-white/5"
                    )}>
                      {tab.count.toString().padStart(2, '0')}
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="h-px bg-slate-100 dark:bg-white/5 mx-4 my-4" />
              
              <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 px-4">Filtrar por Estado</h3>
              <div className="space-y-1 pb-4">
                {['Activas', 'Completadas', 'Eliminadas'].map((filter) => (
                  <button 
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl font-bold text-[11px] transition-all",
                      statusFilter === filter 
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl" 
                        : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-[2rem] p-8 border-white/5 shadow-xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Métricas</h3>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              
              <div className="space-y-6">
                <MetricProgress label="Tasa de Éxito" value={94} color="bg-indigo-500" />
                <MetricProgress label="Cumplimiento" value={88} color="bg-emerald-500" />
              </div>

              <div className="pt-4">
                <div className="p-5 rounded-2xl bg-indigo-600/5 dark:bg-indigo-500/10 border border-indigo-500/10 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-3 opacity-20 transition-transform group-hover:scale-110">
                     <Zap className="w-10 h-10 text-indigo-500" />
                   </div>
                   <p className="text-[11px] leading-relaxed text-indigo-900/60 dark:text-indigo-300/60 font-medium relative z-10">
                     <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-1">Nexus Status</span>
                     Tu reputación como tasker está en el nivel <span className="text-indigo-600 dark:text-indigo-400 font-bold">Diamante</span>.
                   </p>
                </div>
              </div>
            </motion.div>
          </aside>

          {/* Task Grid */}
          <main className="col-span-12 lg:col-span-9 space-y-8">
            <div className="flex justify-between items-center bg-white dark:bg-[#0f172a]/40 p-5 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Visualización:</span>
                  <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                    <button className="p-2 rounded-lg bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm">
                      <Grid2X2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Ordenar:</span>
                 <select className="bg-transparent border-none text-[11px] font-bold text-slate-800 dark:text-white focus:ring-0 cursor-pointer p-0">
                   <option className="bg-white dark:bg-slate-900">Fecha Límite</option>
                   <option className="bg-white dark:bg-slate-900">Recompensa Alta</option>
                   <option className="bg-white dark:bg-slate-900">Estado Crítico</option>
                 </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <div className="col-span-2">
                  <Loader message="Sincronizando con Nexus..." />
                </div>
              ) : filteredTasks.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-2 text-center py-32 glass-panel rounded-[3rem] border-white/5"
                >
                  <History className="w-12 h-12 text-slate-200 dark:text-white/5 mx-auto mb-4" />
                  <p className="text-sm font-medium text-slate-400">No se encontraron misiones registradas.</p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredTasks.map((task, idx) => (
                    <PremiumTaskItem 
                      key={task.id}
                      index={idx}
                      task={task}
                      activeTab={activeTab}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function MetricProgress({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={cn("h-full rounded-full shadow-[0_0_15px_rgba(99,102,241,0.3)]", color)}
        />
      </div>
    </div>
  );
}

function PremiumTaskItem({ task, index, activeTab }: { task: Task, index: number, activeTab: string }) {
  const link = activeTab === 'Recibidas' ? `/my-tasks/${task.id}/active` : `/tasks/${task.id}`;
  
  const getStatusInfo = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return { label: 'Completada', color: 'bg-emerald-500/10 text-emerald-500' };
      case 'deleted': return { label: 'Eliminada', color: 'bg-red-500/10 text-red-500' };
      case 'open': return { label: 'Abierta', color: 'bg-blue-500/10 text-blue-500' };
      default: return { label: 'En Progreso', color: 'bg-amber-500/10 text-amber-500' };
    }
  };

  const status = getStatusInfo(task.status || 'open');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <Link to={link} className="block group">
        <article className="glass-panel rounded-[2.5rem] p-8 border-white/5 h-full flex flex-col hover:border-indigo-500/30 transition-all duration-500 group-hover:translate-y-[-4px] relative overflow-hidden">
          {/* Subtle Glow on hover */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/0 group-hover:bg-indigo-500/5 blur-3xl transition-colors duration-500 rounded-full" />
          
          <div className="flex justify-between items-start mb-6">
            <span className={cn("px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.1em]", status.color)}>
              {status.label}
            </span>
            <button className="text-slate-300 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors relative z-10">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3 tracking-tight leading-tight group-hover:text-indigo-500 transition-colors">
            {task.title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 flex-grow leading-relaxed line-clamp-2">
            {task.description}
          </p>
          
          <div className="flex items-center gap-5 mb-8 text-slate-400 dark:text-slate-500">
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
               <Calendar className="w-3.5 h-3.5 text-indigo-500" />
               {task.deadline || "Sin Plazo"}
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
               <History className="w-3.5 h-3.5 text-blue-500" />
               {task.createdAt?.includes('T') ? 'Reciente' : task.createdAt || 'Registrada'}
             </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5 mt-auto relative z-10">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Rendimiento</span>
              <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tighter">
                ${typeof task.reward === 'number' ? task.reward.toLocaleString() : task.reward}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-indigo-500 font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
              Gestionar
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

