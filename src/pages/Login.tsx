import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, LogIn, Chrome, ArrowRight, XCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithGoogle, loginWithEmail, resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shake, setShake] = useState(false);
  
  const stateMessage = (location.state as any)?.message;
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  
  React.useEffect(() => {
    if (stateMessage) {
      toast.info(stateMessage);
    }
  }, [stateMessage]);
  
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      errors.email = 'El correo es obligatorio.';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'El formato del correo no es válido.';
      isValid = false;
    }

    if (!password) {
      errors.password = 'La contraseña es obligatoria.';
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) triggerShake();
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setFieldErrors({}); // Clear previous errors
    try {
      await loginWithEmail(email, password);
      toast.success('¡Bienvenido de nuevo!');
      navigate('/explore');
    } catch (err: any) {
      triggerShake();
      
      // Manejo específico de errores como solicitó el usuario
      if (err.code === 'auth/user-not-found') {
        setFieldErrors({ email: 'Este correo no está registrado en nuestra plataforma.' });
      } else if (err.code === 'auth/wrong-password') {
        setFieldErrors({ password: 'La contraseña ingresada es incorrecta.' });
      } else if (err.code === 'auth/invalid-credential') {
        setFieldErrors({ general: 'Las credenciales proporcionadas no son válidas.' });
      } else if (err.code === 'auth/too-many-requests') {
        setFieldErrors({ general: 'Demasiados intentos. Tu acceso ha sido limitado temporalmente por seguridad.' });
      } else {
        setFieldErrors({ general: 'Ocurrió un error al intentar iniciar sesión. Intenta nuevamente.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email || !email.includes('@')) {
      setFieldErrors({ email: 'Ingresa un correo válido arriba para poder recuperar tu contraseña.' });
      triggerShake();
      return;
    }
    
    setResetLoading(true);
    try {
      await resetPassword(email);
      toast.success('Te hemos enviado un correo de recuperación.');
    } catch (err: any) {
      toast.error('No pudimos procesar tu solicitud en este momento.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await loginWithGoogle();
      const { getAdditionalUserInfo, deleteUser } = await import('firebase/auth');
      const additionalInfo = getAdditionalUserInfo(result);
      
      if (additionalInfo?.isNewUser) {
        await deleteUser(result.user);
        toast.error('Cuenta no registrada. Por favor, regístrate primero.');
        setTimeout(() => navigate('/register'), 2000);
        return;
      }
      
      navigate('/explore');
    } catch (err: any) {
      toast.error('Error al conectar con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
      {/* Premium Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-600/20 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }}></div>

      <motion.div 
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] p-10 relative z-10 border border-white/10 shadow-2xl shadow-black/50"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[1.5rem] text-white mb-6 shadow-2xl shadow-indigo-500/30 ring-1 ring-white/20"
          >
            <ShieldCheck className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            Bienvenido
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            Accede a tu panel profesional
          </p>
        </div>

        <div className="space-y-6">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 flex items-center justify-center gap-3 bg-white text-slate-950 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg hover:shadow-white/20"
          >
            <Chrome className="w-5 h-5 text-indigo-600" />
            Acceder con Google
          </button>

          <div className="relative flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">O con tu correo</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            <AnimatePresence>
              {fieldErrors.general && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-2"
                >
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <p className="text-xs font-semibold text-red-400">{fieldErrors.general}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">Correo Electrónico</label>
              <div className="relative group">
                <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.email ? 'text-red-400' : 'text-slate-500 group-focus-within:text-indigo-400'}`} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email || fieldErrors.general) setFieldErrors({});
                  }}
                  className={`w-full h-14 pl-14 pr-6 bg-slate-950/50 border rounded-2xl text-sm font-medium text-white placeholder:text-slate-600 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all ${fieldErrors.email ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500/50'}`}
                  placeholder="ejemplo@market.com"
                />
              </div>
              <AnimatePresence>
                {fieldErrors.email && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    className="text-[11px] font-bold text-red-400 ml-2"
                  >
                    {fieldErrors.email}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Contraseña</label>
                <button type="button" onClick={handleForgotPassword} className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">¿Olvidaste tu clave?</button>
              </div>
              <div className="relative group">
                <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.password ? 'text-red-400' : 'text-slate-500 group-focus-within:text-indigo-400'}`} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password || fieldErrors.general) setFieldErrors({});
                  }}
                  className={`w-full h-14 pl-14 pr-6 bg-slate-950/50 border rounded-2xl text-sm font-medium text-white placeholder:text-slate-600 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all ${fieldErrors.password ? 'border-red-500/50' : 'border-white/10 focus:border-indigo-500/50'}`}
                  placeholder="••••••••"
                />
              </div>
              <AnimatePresence>
                {fieldErrors.password && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    className="text-[11px] font-bold text-red-400 ml-2"
                  >
                    {fieldErrors.password}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 mt-6 bg-indigo-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-500 shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full" />
              ) : (
                <>
                  Entrar a la plataforma
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 text-center pt-6 border-t border-white/5">
          <p className="text-xs text-slate-400 font-medium">
            ¿No tienes cuenta todavía?
            <Link to="/register" className="ml-2 text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
              Crea tu perfil
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
