import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { Task } from '../services/mockData';
import { subscribeToAllTasks, subscribeToCategories, Category } from '../services/api';
import { TaskCard } from '../components/TaskCard';
import { cn } from '../lib/utils';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeTasks = subscribeToAllTasks(
      (fetchedTasks) => {
        setTasks(fetchedTasks.slice(0, 4));
        setLoading(false);
      },
      (error) => {
        console.error("Home: Error loading tasks", error);
        setLoading(false);
      }
    );

    const unsubscribeCats = subscribeToCategories(setCategories);

    return () => {
      unsubscribeTasks();
      unsubscribeCats();
    };
  }, []);

  return (
    <div className="flex flex-col bg-slate-50 dark:bg-[#020617] transition-colors overflow-x-hidden">
      {/* Hero Section: Cinematic & Premium */}
      <section className="min-h-[95vh] flex flex-col justify-center px-6 overflow-hidden relative border-b border-slate-200 dark:border-white/5">
        {/* Advanced Ambient Glows */}
        <div className="absolute top-[-10%] right-[-5%] w-[80%] h-[80%] bg-indigo-600/10 dark:bg-indigo-500/10 rounded-full blur-[180px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[70%] h-[70%] bg-emerald-600/10 dark:bg-emerald-500/10 rounded-full blur-[160px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[4px] shadow-2xl mb-12"
          >
             <span className="relative flex h-2.5 w-2.5">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
             </span>
             Arquitectura del Trabajo Digital
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-[8.5rem] font-black text-slate-950 dark:text-white tracking-[-0.06em] leading-[0.82] max-w-6xl mb-12"
          >
            EJECUCIÓN <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 via-violet-500 to-emerald-400 drop-shadow-sm">MAGISTRAL</span>.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 font-medium max-w-3xl leading-relaxed mb-20 px-4"
          >
            La plataforma definitiva para microtareas de alta fidelidad. 
            Donde la visión estratégica se encuentra con el talento técnico más refinado.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
            className="flex flex-col sm:flex-row items-center gap-6 w-full max-w-xl px-4"
          >
            <Link to="/explore" className="w-full group relative overflow-hidden bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-10 py-6 rounded-[2rem] text-xs font-black uppercase tracking-[3px] transition-all hover:scale-[1.02] active:scale-95 shadow-2xl">
              <span className="relative z-10 flex items-center justify-center gap-3">
                Explorar Mercado <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
            <Link to="/post-task" className="w-full px-10 py-6 rounded-[2rem] border-2 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs font-black uppercase tracking-[3px] hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
              Publicar Tarea
            </Link>
          </motion.div>
          
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1, duration: 1 }}
             className="mt-24 flex flex-wrap items-center justify-center gap-12"
          >
             <div className="flex flex-col gap-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">5k+</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expertos</span>
             </div>
             <div className="w-px h-10 bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
             <div className="flex flex-col gap-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">12k+</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entregas</span>
             </div>
             <div className="w-px h-10 bg-slate-200 dark:bg-white/10 hidden sm:block"></div>
             <div className="flex flex-col gap-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">99.8%</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Satisfacción</span>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section: High-End Minimalist */}
      <section className="py-40 px-6 relative overflow-hidden">
        {/* Decorative background element for features */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-500/5 dark:bg-indigo-500/[0.02] rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
           {[
             { icon: <Zap className="w-8 h-8" />, title: "VELOCIDAD ATÓMICA", desc: "Sistemas optimizados para entregas en tiempo récord. El tiempo es el activo más valioso de un arquitecto.", color: "indigo" },
             { icon: <ShieldCheck className="w-8 h-8" />, title: "SEGURIDAD DE ÉLITE", desc: "Verificación de identidad obligatoria y pagos en garantía. Cero riesgos, total control sobre tu capital.", color: "emerald" },
             { icon: <TrendingUp className="w-8 h-8" />, title: "ESTÁNDAR PREMIUM", desc: "Solo freelancers con trayectoria validada pueden postularse a desafíos estratégicos.", color: "violet" }
           ].map((feature, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.2, duration: 0.8 }}
               className="group p-12 rounded-[4rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10"
             >
               <div className={cn(
                 "w-20 h-20 rounded-3xl flex items-center justify-center mb-10 shadow-lg group-hover:scale-110 transition-transform duration-500",
                 feature.color === 'indigo' && "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
                 feature.color === 'emerald' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                 feature.color === 'violet' && "bg-violet-500/10 text-violet-600 dark:text-violet-400"
               )}>
                 {feature.icon}
               </div>
               <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter mb-4">{feature.title}</h3>
               <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feature.desc}</p>
             </motion.div>
           ))}
        </div>
      </section>

      {/* Recent Tasks: Grid Refined */}
      <section className="py-40 px-6 bg-slate-50/50 dark:bg-white/[0.02] border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24 px-4">
            <div className="max-w-2xl">
              <h2 className="text-5xl md:text-6xl font-black text-slate-950 dark:text-white tracking-tighter leading-[0.9] mb-6">Oportunidades de Alto Nivel</h2>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Únete a los proyectos más innovadores de la red y escala tus capacidades.</p>
            </div>
            <Link to="/explore" className="group inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[4px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-all">
              Ver Catálogo Completo <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando feed...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {tasks.length === 0 ? (
                <div className="lg:col-span-2 text-center py-32 bg-white dark:bg-slate-900/40 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-white/10">
                  <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No hay tareas activas en este momento</p>
                </div>
              ) : (
                tasks.map((task: Task) => (
                  <TaskCard key={task.id} task={task} categories={categories} />
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section: Professional & Bold */}
      <section className="py-40 px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto bg-slate-950 dark:bg-indigo-600 rounded-[5rem] p-16 md:p-32 text-center relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5"
        >
           {/* Dynamic background lighting */}
           <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-500/20 rounded-full blur-[120px] -mr-[15rem] -mt-[15rem] animate-pulse"></div>
           <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[100px] -ml-[10rem] -mb-[10rem] animate-pulse" style={{ animationDelay: '2s' }}></div>
           
           <h2 className="text-5xl md:text-[6.5rem] font-black text-white tracking-tighter leading-[0.8] mb-12 relative z-10 max-w-4xl mx-auto drop-shadow-2xl">
             ¿LISTO PARA <br/>LO SIGUIENTE?
           </h2>
           
           <p className="text-indigo-200/60 dark:text-white/70 text-lg md:text-2xl font-medium mb-20 relative z-10 max-w-2xl mx-auto leading-relaxed">
             Únete a la plataforma donde la calidad no es una opción, sino el estándar predeterminado de cada ejecución.
           </p>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
             <Link to="/register" className="w-full sm:w-auto px-20 py-8 bg-white text-slate-950 rounded-[2rem] font-black uppercase tracking-[4px] text-[10px] hover:bg-slate-50 transition-all shadow-2xl active:scale-95 group flex items-center justify-center gap-3">
               Unirse a la Red <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </Link>
             <Link to="/post-task" className="w-full sm:w-auto px-20 py-8 bg-white/5 text-white border border-white/10 rounded-[2rem] font-black uppercase tracking-[4px] text-[10px] hover:bg-white/10 transition-all backdrop-blur-xl active:scale-95">
               Publicar Desafío
             </Link>
           </div>
        </motion.div>
      </section>
    </div>
  );
}
