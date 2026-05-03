import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, LogIn, Chrome, ArrowRight, UserPlus, XCircle, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const { loginWithGoogle, registerWithEmail } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Custom Error States
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  
  const [loading, setLoading] = useState(false);

  // ✅ Validación mejorada de email
  const isValidEmail = (email: string): boolean => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return false;
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) return false;
    if (email.startsWith('@') || email.endsWith('@')) return false;
    if (email.length > 254) return false;
    return true;
  };

  const validateForm = () => {
    const errors: { name?: string; email?: string; password?: string } = {};
    let isValid = true;

    if (!name.trim()) {
      errors.name = 'Por favor, ingresa tu nombre completo.';
      isValid = false;
    } else if (name.trim().length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres.';
      isValid = false;
    }

    if (!email) {
      errors.email = 'Por favor, ingresa tu correo electrónico.';
      isValid = false;
    } else if (!isValidEmail(email)) {
      errors.email = 'Ingresa un correo válido (ej. usuario@dominio.com).';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Por favor, ingresa una contraseña.';
      isValid = false;
    } else if (password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres (incluir mayúscula, número).';
      isValid = false;
    } else if (!/[A-Z]/.test(password) || !/\d/.test(password)) {
      errors.password = 'La contraseña debe contener al menos una mayúscula y un número.';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await registerWithEmail(email, password, name.trim());
      // Profile will be created in /complete-profile to avoid ghost users
      navigate('/complete-profile');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        toast.error('Este correo ya está registrado. Redirigiendo al inicio de sesión...');
        setTimeout(() => navigate('/login', { 
          state: { message: 'Ya tienes una cuenta registrada. Por favor, inicia sesión.' } 
        }), 2000);
      } else {
        toast.error('Hubo un error al crear tu cuenta. Verifica tu conexión e intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      navigate('/explore');
    } catch (err: any) {
      console.error(err);
      toast.error('No se pudo continuar con Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-600/5 rounded-full blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white mb-6 shadow-xl shadow-emerald-500/20"
          >
            <UserPlus className="w-8 h-8" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tighter leading-none mb-3">
            Únete hoy
          </h1>
          <p className="text-slate-400 font-medium">
            Crea tu cuenta en segundos
          </p>
        </div>

        <div className="space-y-4">
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <Chrome className="w-5 h-5 text-emerald-500" />
            Registrarse con Google
          </button>

          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[3px]">O tu correo</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <div className="relative group">
                <UserIcon className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.name ? 'text-red-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Tu nombre completo"
                  className={`w-full h-14 pl-14 pr-6 bg-white/5 border rounded-2xl text-sm font-medium text-white placeholder:text-slate-500 focus:bg-white/10 outline-none transition-all ${fieldErrors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-emerald-500/50'}`}
                />
              </div>
              <AnimatePresence>
                {fieldErrors.name && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 dark:text-red-400 ml-2">
                      <XCircle className="w-3.5 h-3.5" />
                      {fieldErrors.name}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <div className="relative group">
                <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.email ? 'text-red-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder="Tu correo electrónico"
                  className={`w-full h-14 pl-14 pr-6 bg-white/5 border rounded-2xl text-sm font-medium text-white placeholder:text-slate-500 focus:bg-white/10 outline-none transition-all ${fieldErrors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-emerald-500/50'}`}
                />
              </div>
              <AnimatePresence>
                {fieldErrors.email && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 dark:text-red-400 ml-2">
                      <XCircle className="w-3.5 h-3.5" />
                      {fieldErrors.email}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div>
              <div className="relative group">
                <Lock className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${fieldErrors.password ? 'text-red-400' : 'text-slate-400 group-focus-within:text-emerald-500'}`} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Crea una contraseña segura"
                  className={`w-full h-14 pl-14 pr-6 bg-white/5 border rounded-2xl text-sm font-medium text-white placeholder:text-slate-500 focus:bg-white/10 outline-none transition-all ${fieldErrors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-emerald-500/50'}`}
                />
              </div>
              <AnimatePresence>
                {fieldErrors.password && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="flex items-center gap-1.5 text-xs font-bold text-red-500 dark:text-red-400 ml-2">
                      <XCircle className="w-3.5 h-3.5" />
                      {fieldErrors.password}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full h-14 mt-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Empezar ahora'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

          <p className="mt-8 text-center text-slate-400 text-sm font-medium">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
              Inicia sesión aquí
            </Link>
          </p>

          <p className="mt-6 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            Al registrarte, aceptas nuestros{' '}
            <span className="text-slate-400">Términos</span> y{' '}
            <span className="text-slate-400">Política de Privacidad</span>
          </p>
      </motion.div>
    </div>
  );
}

