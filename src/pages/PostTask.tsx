import React, { useState } from 'react';
import {
  Check,
  MapPin,
  ArrowRight,
  ChevronRight,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Sparkles,
  DollarSign,
  Layers
} from 'lucide-react';
import { iconMap } from './AdminCategories';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useParams, useNavigate } from 'react-router-dom';
import { createTask, fetchTaskById, updateTask, subscribeToCategories, Category } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function PostTask() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = React.useState({
    category: '',
    title: '',
    description: '',
    budget: '',
    deadline: '',
    requirements: ['']
  });

  React.useEffect(() => {
    const unsubscribe = subscribeToCategories((cats) => {
      setCategories(cats);
      if (!formData.category && cats.length > 0) {
        setFormData(prev => ({ ...prev, category: cats[0].name.toLowerCase() }));
      }
    });
    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (id) {
      const loadTask = async () => {
        const task = await fetchTaskById(id);
        if (task) {
          setFormData({
            category: task.category || 'diseño',
            title: task.title || '',
            description: task.description || '',
            budget: task.reward?.toString() || '',
            deadline: task.deadline || '',
            requirements: task.requirements || ['']
          });
        }
      };
      loadTask();
    }
  }, [id]);

  const nextStep = () => {
    if (step === 1 && (!formData.title.trim() || !formData.description.trim())) {
      toast.error("Ingresa un título y descripción.");
      return;
    }
    if (step === 2 && (!formData.budget || Number(formData.budget) <= 0 || !formData.deadline)) {
      toast.error("Define presupuesto y fecha.");
      return;
    }
    setStep(s => Math.min(s + 1, 3));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const { user, profile } = useAuth();
  const isPending = profile?.status === 'pending';

  const handleFinalSubmit = async () => {
    if (isPending) return;
    setLoading(true);
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        reward: Number(formData.budget),
        urgency: 'Estándar' as const,
        status: 'open' as const,
        deadline: formData.deadline,
        requirements: formData.requirements,
        authorId: user?.uid,
        author: {
          name: profile?.name || user?.displayName || 'Usuario',
          avatar: profile?.photoUrl || user?.photoURL || 'https://ui-avatars.com/api/?name=User',
          rating: 5.0
        }
      };

      if (id) {
        await updateTask(id, taskData);
        toast.success("Tarea actualizada con éxito.");
        navigate(`/tasks/${id}`);
      } else {
        await createTask(taskData);
        toast.success("¡Tarea publicada con éxito!");
        navigate('/explore');
      }
    } catch (error) {
      toast.error("Error al guardar la tarea.");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 flex flex-col items-center text-center page-fade-in">
        <div className="w-24 h-24 bg-amber-500/10 rounded-[2rem] flex items-center justify-center text-amber-500 mb-8 border border-amber-500/20 shadow-2xl">
          <Clock className="w-12 h-12" />
        </div>
        <h2 className="text-[10px] font-black text-amber-500 uppercase tracking-[5px] mb-4">Acceso Pendiente</h2>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">Verificando tu perfil</h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md leading-relaxed mb-10">
          Como medida de seguridad, revisamos cada perfil. Pronto podrás publicar tus tareas.
        </p>
        <button
          onClick={() => navigate('/explore')}
          className="btn-primary"
        >
          Explorar el Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 page-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div>
          <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[4px] mb-4 flex items-center gap-2">
            <Sparkles className="w-3 h-3" /> Micro-Task Factory
          </h2>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
            {id ? "Editar Tarea" : "Publicar Tarea"}
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 w-12 rounded-full transition-all duration-500",
                step >= s ? "bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]" : "bg-slate-200 dark:bg-slate-800"
              )}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-12"
              >
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-600/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Tag className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Elegir Categoría</h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {categories.map((cat) => {
                      const Icon = iconMap[cat.icon] || Tag;
                      return (
                        <CategoryOption
                          key={cat.id}
                          id={cat.name.toLowerCase()}
                          label={cat.name}
                          icon={<Icon className="w-6 h-6" />}
                          selected={formData.category === cat.name.toLowerCase()}
                          onSelect={() => setFormData({ ...formData, category: cat.name.toLowerCase() })}
                        />
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-600/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Detalles Principales</h3>
                  </div>

                  <div className="glass-panel p-8 rounded-[2rem] space-y-8 border-slate-200 dark:border-white/5 shadow-sm">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título de la misión</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ej: Rediseño de icono de App"
                        className="w-full h-14 px-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-bold focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Instrucciones detalladas</label>
                      <textarea
                        rows={5}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe los entregables y el objetivo final..."
                        className="w-full p-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-medium focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/10 transition-all outline-none resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="glass-panel p-10 rounded-[2.5rem] border-slate-200 dark:border-white/5 shadow-sm space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <DollarSign className="w-32 h-32 text-indigo-500" />
                    </div>
                    <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-widest">Recompensa (USD)</h3>
                    <div className="relative">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-4xl font-black text-slate-400 dark:text-slate-700">$</span>
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="00.00"
                        className="w-full pl-10 bg-transparent text-6xl font-black tracking-tighter text-slate-900 dark:text-white outline-none placeholder:text-slate-300 dark:placeholder:text-slate-800"
                      />
                    </div>
                    <div className="bg-indigo-500/10 rounded-2xl p-5 border border-indigo-500/20">
                      <p className="text-[11px] font-bold text-indigo-300 leading-relaxed uppercase tracking-tighter">
                        Tareas con mayor presupuesto atraen mejores talentos en minutos.
                      </p>
                    </div>
                  </section>

                  <section className="glass-panel p-10 rounded-[2.5rem] border-slate-200 dark:border-white/5 shadow-sm space-y-8">
                    <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-500 uppercase tracking-widest">Plazo Límite</h3>
                    <div className="relative">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                      <input
                        type="date"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="w-full h-16 pl-14 pr-6 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-900 dark:text-white font-bold focus:border-indigo-600 outline-none transition-all uppercase text-sm shadow-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {['MAÑANA (Urgente)', '3 DÍAS (Estándar)', '7 DÍAS (Flexible)'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            const date = new Date();
                            if (opt.includes('MAÑANA')) date.setDate(date.getDate() + 1);
                            else if (opt.includes('3 DÍAS')) date.setDate(date.getDate() + 3);
                            else date.setDate(date.getDate() + 7);
                            setFormData({ ...formData, deadline: date.toISOString().split('T')[0] });
                          }}
                          className="w-full h-12 flex items-center px-6 rounded-xl border border-white/5 hover:bg-white/5 hover:border-indigo-600 transition-all text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <div className="glass-panel rounded-[3rem] border-slate-200 dark:border-white/10 shadow-sm overflow-hidden relative">
                  <div className="p-12 border-b border-slate-200 dark:border-white/5">
                    <div className="flex justify-between items-start mb-12">
                      <div className="px-5 py-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-[3px]">
                        {formData.category}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest mb-1">Monto Escrow</p>
                        <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">${formData.budget || '0'}</p>
                      </div>
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-6 tracking-tight leading-tight uppercase">{formData.title || 'Misión sin título'}</h3>
                    <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-200 dark:border-white/5">
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
                        {formData.description || 'Sin descripción proporcionada.'}
                      </p>
                    </div>
                  </div>
                  <div className="p-8 bg-indigo-50 dark:bg-indigo-600/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/5">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Deadline</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{formData.deadline || 'PENDIENTE'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-[2px]">Verificación de Seguridad OK</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-8 border border-slate-200 dark:border-white/10 flex items-start gap-6 shadow-sm">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Garantía Micromarket</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      Tus fondos están protegidos. El pago se libera automáticamente solo cuando apruebas el trabajo final.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-20 flex items-center justify-between gap-6 border-t border-white/5 pt-12">
            {step > 1 ? (
              <button
                onClick={prevStep}
                className="h-16 px-12 rounded-2xl border border-white/10 text-slate-400 font-bold text-xs hover:bg-white/5 transition-all active:scale-95 flex items-center gap-3"
              >
                Regresar
              </button>
            ) : (
              <div />
            )}

            <button
              onClick={step === 3 ? handleFinalSubmit : nextStep}
              disabled={loading}
              className="h-16 px-16 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 hover:-translate-y-1 transition-all flex items-center gap-4 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
              ) : (
                <>
                  {step === 3 ? (id ? 'Confirmar Cambios' : 'Lanzar Tarea') : 'Siguiente Paso'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-6 hidden lg:block">
          <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 space-y-6">
            <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Consejos de experto</h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">1</div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">Sé específico con los entregables para evitar retrasos.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">2</div>
                <p className="text-xs text-slate-400 leading-relaxed font-medium">Usa capturas de pantalla o links de referencia en la descripción.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryOption({ id, label, icon, selected, onSelect }: any) {
  return (
    <label onClick={onSelect} className="cursor-pointer group relative block">
      <div className={cn(
        "h-32 rounded-3xl flex flex-col items-center justify-center transition-all duration-500 border-2",
        selected
          ? "bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-600/20 scale-105"
          : "bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-900/60"
      )}>
        <div className={cn("mb-4 transition-all duration-500", selected ? "text-white scale-110" : "text-slate-600 group-hover:text-indigo-400")}>
          {icon}
        </div>
        <span className={cn("text-[10px] font-black uppercase tracking-[2px] transition-colors", selected ? "text-white" : "text-slate-500 group-hover:text-slate-300")}>
          {label}
        </span>
        {selected && (
          <motion.div
            layoutId="activeCategory"
            className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-2xl flex items-center justify-center shadow-xl"
          >
            <Check className="w-4 h-4 text-indigo-600 stroke-[4px]" />
          </motion.div>
        )}
      </div>
    </label>
  );
}

// Add ShieldCheck icon for use in Step 3
function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
