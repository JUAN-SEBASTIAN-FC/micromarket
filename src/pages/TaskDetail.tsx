import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Shield, 
  Users, 
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { AppLayout } from '../components/Layout';
import { fetchTaskById, deleteTask, createChat, sendChatMessage, completeTask } from '../services/api';
import { Task } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { Loader } from '../components/Loader';

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTask = async () => {
      if (id) {
        try {
          const fetched = await fetchTaskById(id);
          setTask(fetched);
        } catch (error) {
          console.error("Error fetching task:", error);
        }
      }
      setLoading(false);
    };
    loadTask();
  }, [id]);

  const handleDelete = async () => {
    if (!task || !id) return;
    if (window.confirm('¿Eliminar esta tarea de forma permanente?')) {
      await deleteTask(id);
      navigate('/explore');
    }
  };

  const handleComplete = async () => {
    if (!task || !id || !task.assignedTo) return;
    if (window.confirm('¿Confirmas que la tarea ha sido completada satisfactoriamente? Se liberará el pago.')) {
      setLoading(true);
      await completeTask(id, task.assignedTo);
      const updated = await fetchTaskById(id);
      setTask(updated);
      setLoading(false);
    }
  };

  const [isAccepting, setIsAccepting] = useState(false);
  const handleAcceptTask = async (messageText?: string) => {
    if (!profile || !task || !id) {
      console.warn("TaskDetail: Falta información para aceptar tarea", { hasProfile: !!profile, hasTask: !!task, id });
      return;
    }
    
    if (!profile.uid) {
      console.error("TaskDetail: El perfil no tiene UID");
      return;
    }

    setIsAccepting(true);
    
    // Si es una tarea mock (sin authorId), asignamos uno para la demo o avisamos
    const targetAuthorId = task.authorId || 'system-admin';
    const targetAuthorName = task.author?.name || task.client || 'Administrador';
    
    try {
      const chatId = await createChat({
        taskId: id,
        taskTitle: task.title,
        creatorId: targetAuthorId,
        creatorName: targetAuthorName,
        creatorAvatar: task.author?.avatar || task.clientLogo || `https://ui-avatars.com/api/?name=${targetAuthorName}`,
        applicantId: profile.uid,
        applicantName: profile.name || 'Usuario',
        applicantAvatar: profile.photoUrl || `https://ui-avatars.com/api/?name=${profile.name || 'Usuario'}`
      });

      if (messageText) {
        await sendChatMessage(chatId, {
          sender: profile.name || 'Usuario',
          senderId: profile.uid,
          avatar: profile.photoUrl || `https://ui-avatars.com/api/?name=${profile.name || 'Usuario'}`,
          text: messageText
        });
      }

      navigate(`/messages?chat=${chatId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      alert("Hubo un error al iniciar el chat. Por favor intente de nuevo.");
    } finally {
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Loader message="Desencriptando Datos..." />
      </AppLayout>
    );
  }

  if (!task) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center py-20 space-y-4">
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Tarea no encontrada</p>
        <button onClick={() => navigate(-1)} className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:underline">Volver</button>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12 pb-32">
       <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-3 group text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all mb-4"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-[3px]">Protocolo de Retorno</span>
      </button>

      <div className="grid grid-cols-12 gap-12 items-start">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <div className="glass-panel rounded-[3.5rem] p-12 md:p-16 relative overflow-hidden group border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none">
             {/* Dynamic Ambient Glows */}
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
             <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-[100px] -ml-20 -mb-20 pointer-events-none" />
             
              <div className="flex flex-wrap items-center gap-3 mb-10 relative z-10">
                <span className="px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[2px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-sm backdrop-blur-md">
                  {task.category}
                </span>
                <span className={cn(
                  "px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[2px] border transition-all shadow-sm backdrop-blur-md",
                  task.status === 'completed' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                  task.status === 'assigned' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                  "bg-slate-500/10 text-slate-600 border-slate-500/20"
                )}>
                  {task.status === 'completed' ? 'PROTOCOLO FINALIZADO' : task.status === 'assigned' ? 'EN EJECUCIÓN' : 'MISIÓN DISPONIBLE'}
                </span>
              </div>

             <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black text-slate-900 dark:text-white tracking-tighter leading-[0.95] mb-12 relative z-10 text-balance">
                {task.title}
             </h1>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-10 border-y border-slate-200/50 dark:border-white/5 mb-12 relative z-10">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-indigo-500 shadow-xl shadow-indigo-500/5">
                      <Clock className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px] leading-none mb-2">Plazo Límite</p>
                      <p className="text-sm font-black text-slate-900 dark:text-slate-100 mono-value">24:00:00</p>
                   </div>
                </div>
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-indigo-500 shadow-xl shadow-indigo-500/5">
                      <Shield className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px] leading-none mb-2">Nivel de Red</p>
                      <p className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Nivel Alpha</p>
                   </div>
                </div>
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-indigo-500 shadow-xl shadow-indigo-500/5">
                      <Users className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px] leading-none mb-2">Aspirantes</p>
                      <p className="text-sm font-black text-slate-900 dark:text-slate-100 mono-value">12 Especialistas</p>
                   </div>
                </div>
             </div>

             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[4px] whitespace-nowrap">Objetivo Técnico</h3>
                  <div className="h-px w-full bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent" />
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-12 italic">
                  "{task.description}"
                </p>
                
                {task.requirements && (
                  <>
                    <div className="flex items-center gap-4 mb-8">
                      <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[4px] whitespace-nowrap">Criterios de Aceptación</h3>
                      <div className="h-px w-full bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent" />
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 list-none p-0">
                      {task.requirements.map((req, i) => (
                        <li key={i} className="flex gap-4 text-xs text-slate-600 dark:text-slate-400 font-bold p-5 rounded-3xl border border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-white/5 hover:border-indigo-500/30 transition-all duration-500 hover:scale-[1.02] group">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500/20 transition-colors">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          </div>
                          <span className="leading-relaxed uppercase tracking-wider">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
             </div>
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 space-y-8 sticky top-12">
           <div className="bg-slate-900 dark:bg-slate-950 backdrop-blur-2xl rounded-[3.5rem] p-12 text-white border border-white/5 shadow-2xl shadow-slate-900/40 dark:shadow-none relative overflow-hidden group">
              {/* Internal Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
              
              <div className="mb-12 relative z-10">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[4px] block mb-6 opacity-80">Recompensa Autorizada</span>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-display font-light text-slate-500">$</span>
                   <div className="text-7xl md:text-8xl font-display font-black tracking-tighter tabular-nums leading-none">
                      {Number(task.reward || 0).toFixed(0)}
                      <span className="text-3xl text-slate-500 font-light tracking-normal ml-1">.{(Number(task.reward || 0) % 1).toFixed(2).split('.')[1]}</span>
                   </div>
                </div>
                <div className="mt-8 flex items-center gap-3 bg-white/5 inline-flex px-5 py-2.5 rounded-2xl border border-white/10 backdrop-blur-md">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.6)] animate-pulse" />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-[2px]">Fondos en Escrow</span>
                </div>
              </div>

              <div className="space-y-4 mb-12 relative z-10">
                {(profile?.uid === task.authorId || profile?.role === 'admin') ? (
                  <>
                    {task.status === 'assigned' && (
                      <button 
                        onClick={handleComplete}
                        className="w-full bg-emerald-500 text-white font-black text-[10px] py-5 rounded-[1.5rem] shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 uppercase tracking-[3px] mb-3"
                      >
                        Validar Entrega
                      </button>
                    )}
                    <button 
                      onClick={() => navigate(`/edit-task/${id}`)}
                      className="w-full bg-white/5 text-white font-black text-[10px] py-5 rounded-[1.5rem] border border-white/10 hover:bg-white/10 transition-all active:scale-95 uppercase tracking-[3px] mb-3"
                    >
                      Modificar Briefing
                    </button>
                    <button 
                      onClick={handleDelete}
                      className="w-full bg-red-500/10 text-red-500 font-black text-[10px] py-5 rounded-[1.5rem] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all active:scale-95 uppercase tracking-[3px]"
                    >
                      Abortar Misión
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => handleAcceptTask("¡Hola! Me gustaría aceptar esta tarea y empezar a trabajar en ella.")}
                      disabled={profile?.status !== 'approved'}
                      className="relative w-full overflow-hidden bg-indigo-600 text-white font-black text-[10px] py-5 rounded-[1.5rem] hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 uppercase tracking-[3px] disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                      <span className="relative z-10">{profile?.status === 'approved' ? 'Solicitar Misión' : 'Acceso Restringido'}</span>
                    </button>
                    <button 
                      onClick={() => handleAcceptTask()}
                      disabled={profile?.status !== 'approved'}
                      className="w-full bg-white/5 text-white font-black text-[10px] py-5 rounded-[1.5rem] border border-white/10 hover:bg-white/10 transition-all active:scale-95 uppercase tracking-[3px] disabled:opacity-30"
                    >
                      Inyectar Consulta
                    </button>
                  </>
                )}
              </div>

              <div className="pt-10 border-t border-white/10 relative z-10">
                 <div className="flex items-center gap-5 mb-8">
                    <div className="relative">
                      <img src={task.author?.avatar || task.clientLogo || "https://ui-avatars.com/api/?name=Client"} alt="" className="w-16 h-16 rounded-2xl border-2 border-indigo-500 p-1 object-cover" />
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full border-2 border-slate-900 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div>
                       <p className="text-xs font-black text-white uppercase tracking-[2px] leading-none mb-2">{task.author?.name || task.client}</p>
                       <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[3px]">Nexus Tier Alpha</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/5 text-center group hover:border-indigo-500/30 transition-colors">
                       <p className="text-[9px] font-black text-slate-500 mb-2 uppercase tracking-[3px]">Reputación</p>
                       <p className="text-lg font-black text-white mono-value">{task.author?.rating || '4.98'}</p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/5 text-center group hover:border-indigo-500/30 transition-colors">
                       <p className="text-[9px] font-black text-slate-500 mb-2 uppercase tracking-[3px]">Despliegues</p>
                       <p className="text-lg font-black text-white mono-value">142</p>
                    </div>
                 </div>
              </div>
           </div>

           <div className="glass-panel rounded-[2.5rem] p-8 space-y-6 border-white/5">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[4px] px-2">Detalles del Protocolo</h3>
              <div className="space-y-2">
                 <DetailRow label="Formato" value="Figma / JSON" />
                 <DetailRow label="Complejidad" value="Standard" />
                 <DetailRow label="SLA" value="24H Delivery" />
                 <DetailRow label="Red" value="Mainnet v2.4" />
              </div>
           </div>
        </aside>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center p-4 hover:bg-white/50 dark:hover:bg-white/5 rounded-2xl transition-all group cursor-default">
      <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[2px]">{label}</span>
      <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{value}</span>
    </div>
  );
}
