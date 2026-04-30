import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  CheckCircle2, 
  Award, 
  Clock, 
  Star, 
  ExternalLink, 
  StarIcon,
  MapPin,
  Calendar,
  Globe,
  Settings,
  Zap,
  TrendingUp,
  Briefcase,
  X,
  Save,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { updateUserStatus } from '../services/api';

export default function Profile() {
  const { profile, user, updatePlusStatus, completeUserProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    skills: profile?.skills || [],
    skillInput: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const isApproved = profile?.status === 'approved' || profile?.role === 'admin';

  const handleConfigClick = () => {
    if (isApproved) {
      setEditForm({
        name: profile?.name || '',
        bio: profile?.bio || '',
        skills: profile?.skills || [],
        skillInput: ''
      });
      setIsEditing(true);
    } else {
      toast.error('Acceso Restringido', { 
        description: 'Tu cuenta aún no ha sido validada. Debes esperar la aprobación del administrador para configurar tu perfil.' 
      });
    }
  };

  const handleAddSkill = () => {
    if (editForm.skillInput.trim() && !editForm.skills.includes(editForm.skillInput.trim().toUpperCase())) {
      setEditForm({
        ...editForm,
        skills: [...editForm.skills, editForm.skillInput.trim().toUpperCase()],
        skillInput: ''
      });
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditForm({
      ...editForm,
      skills: editForm.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      await completeUserProfile({
        name: editForm.name,
        bio: editForm.bio,
        skills: editForm.skills
      });
      toast.success('Perfil actualizado correctamente');
      setIsEditing(false);
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestValidate = async () => {
    if (user?.uid) {
      try {
        await updateUserStatus(user.uid, 'approved');
        toast.success('Cuenta validada exitosamente (Modo Prueba)');
      } catch (error) {
        toast.error('Error al validar la cuenta');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors pb-32">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] w-[40%] h-[30%] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 pt-16 relative z-10">
        
        {/* Profile Header Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-[3rem] overflow-hidden border-white/5 mb-10 shadow-2xl"
        >
          {/* Cover Area */}
          <div className="h-48 relative overflow-hidden">
            <div className={cn(
              "absolute inset-0 transition-transform duration-[2s] hover:scale-105",
              profile?.isPlus 
                ? "bg-gradient-to-r from-indigo-900 via-indigo-600 to-violet-800" 
                : "bg-gradient-to-r from-slate-800 to-slate-950"
            )} />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
            
            <div className="absolute bottom-6 right-8 flex gap-4">
              {!isApproved && (
                <button 
                  onClick={handleTestValidate}
                  className="px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/20"
                >
                  <Shield className="w-4 h-4" /> Validar Cuenta (Test)
                </button>
              )}
              <button 
                onClick={handleConfigClick}
                className={cn(
                  "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                  isApproved 
                    ? "bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20" 
                    : "bg-slate-900/50 border border-slate-800 text-slate-500 cursor-not-allowed"
                )}
              >
                <Settings className="w-4 h-4" /> Configurar
              </button>
            </div>
          </div>

          <div className="px-10 pb-12 relative">
            <div className="flex flex-col lg:flex-row items-end gap-8 -mt-16">
              {/* Avatar Box */}
              <div className="relative group">
                <div className="w-40 h-40 rounded-[2.5rem] bg-white dark:bg-[#0f172a] p-1.5 shadow-2xl relative z-10 overflow-hidden border-4 border-white dark:border-slate-900">
                  <img 
                    src={profile?.photoUrl || `https://ui-avatars.com/api/?name=${profile?.name || 'Usuario'}&size=256&background=6366f1&color=fff`} 
                    alt="Profile" 
                    className="w-full h-full rounded-[2rem] object-cover" 
                  />
                </div>
                {profile?.isPlus && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-3 -right-3 bg-indigo-600 text-white p-2.5 rounded-2xl border-4 border-white dark:border-[#0f172a] shadow-xl z-20"
                  >
                    <StarIcon className="w-5 h-5 fill-white" />
                  </motion.div>
                )}
              </div>

              {/* Identity Details */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {profile?.name || 'Operador Nexus'}
                  </h1>
                  {profile?.status === 'approved' && (
                    <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                      <Shield className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Verificado</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{user?.email || profile?.email || 'nexus@micromarket.app'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Global Network</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Miembro Alpha</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-2">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estatus del Rango</p>
                  <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter">
                    {profile?.isPlus ? 'NEXUS PRESTIGE' : 'ESTÁNDAR V1'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Bio & Skills */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-[2.5rem] p-10 border-white/5"
            >
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-8">Protocolo de Identidad</h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Biografía del Especialista</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    {profile?.bio || 'Este perfil no ha definido una biografía de especialidad aún. La comunicación técnica es clave para el éxito en MicroMarket.'}
                  </p>
                </div>
                
                <div className="pt-6 border-t border-slate-200 dark:border-white/5">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Núcleo de Habilidades</p>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.map(skill => (
                        <span key={skill} className="px-4 py-2 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 hover:border-indigo-500/30 transition-all">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 italic">No hay habilidades inyectadas</span>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 dark:border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ubicación</span>
                     <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Mainnet Central</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lenguaje</span>
                     <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Bilingüe (ES/EN)</span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Red Externa</span>
                     <div className="flex gap-2">
                       <ExternalLink className="w-3 h-3 text-slate-400 hover:text-indigo-500 cursor-pointer" />
                       <Globe className="w-3 h-3 text-slate-400 hover:text-indigo-500 cursor-pointer" />
                     </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {!profile?.isPlus && (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updatePlusStatus(true)}
                className="w-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 p-6 rounded-3xl font-black text-[10px] uppercase tracking-[4px] shadow-2xl transition-all"
              >
                Actualizar a Nexus Prestige
              </motion.button>
            )}
          </div>

          {/* Right Column: Performance & History */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-[2.5rem] p-10 border-white/5"
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Análisis de Rendimiento</h3>
                <TrendingUp className="w-5 h-5 text-indigo-500" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <MetricCard 
                  icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                  value="12"
                  label="Despliegues"
                  sublabel="Exitosos"
                />
                <MetricCard 
                  icon={<StarIcon className="w-6 h-6 text-yellow-500 fill-yellow-500/20" />}
                  value="4.95"
                  label="Reputación"
                  sublabel="Puntuación"
                />
                <MetricCard 
                  icon={<Clock className="w-6 h-6 text-indigo-500" />}
                  value="98%"
                  label="SLA"
                  sublabel="Eficiencia"
                />
                <MetricCard 
                  icon={<Award className="w-6 h-6 text-violet-500" />}
                  value="Lvl 4"
                  label="Rango"
                  sublabel="Experiencia"
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-panel rounded-[2.5rem] p-10 border-white/5"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Historial de Operaciones</h3>
                <Briefcase className="w-5 h-5 text-slate-400" />
              </div>

              <div className="space-y-4">
                {/* Empty State or Items */}
                <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2.5rem] bg-slate-50 dark:bg-white/[0.02]">
                  <Zap className="w-10 h-10 text-slate-300 dark:text-slate-800 mx-auto mb-6" />
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">Sin actividad reciente</h4>
                  <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">Tus misiones y despliegues técnicos aparecerán aquí una vez que comiences a operar en la red.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8 relative">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">Configurar Perfil</h2>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6 relative">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nombre de Operador</label>
                  <input 
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="Tu nombre público"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Biografía / Especialidad</label>
                  <textarea 
                    value={editForm.bio}
                    onChange={e => setEditForm({...editForm, bio: e.target.value})}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    placeholder="Describe tu experiencia o especialidad..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Habilidades Técnicas</label>
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text"
                      value={editForm.skillInput}
                      onChange={e => setEditForm({...editForm, skillInput: e.target.value})}
                      onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                      className="flex-1 bg-slate-50 dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="Ej. JAVASCRIPT, REACT..."
                    />
                    <button 
                      onClick={handleAddSkill}
                      className="bg-indigo-600 text-white px-4 rounded-2xl hover:bg-indigo-700 transition-colors flex items-center justify-center"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {editForm.skills.map(skill => (
                      <div key={skill} className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-widest">{skill}</span>
                        <button onClick={() => handleRemoveSkill(skill)} className="text-slate-400 hover:text-red-500 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-4 relative">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Guardar Cambios
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MetricCard({ icon, value, label, sublabel }: any) {
  return (
    <div className="bg-white dark:bg-white/5 p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 transition-all group shadow-sm">
      <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-3 font-mono">{value}</p>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">
          {label}<br/>
          <span className="text-slate-500 dark:text-slate-600">{sublabel}</span>
        </p>
      </div>
    </div>
  );
}
