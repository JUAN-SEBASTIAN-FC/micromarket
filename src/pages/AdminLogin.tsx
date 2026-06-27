import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, ArrowRight, Mail, XCircle, Chrome } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginWithEmail, loginWithGoogle, profile, logout, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check role on mount or after login
  useEffect(() => {
    const checkRole = async () => {
      if (profile && !authLoading) {
        if (profile.role === 'admin') {
          navigate('/admin/metrics');
        } else {
          // Un no-admin que llega aquí queda fuera de inmediato.
          toast.error('Acceso denegado: No tienes privilegios de administrador.');
          await logout();
        }
      }
    };
    checkRole();
  }, [profile, authLoading, navigate, logout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Por favor ingresa correo y contraseña.');
      triggerShake();
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(email, password);
    } catch (err: any) {
      console.error(err);
      // Mensaje genérico - no revelar si el usuario existe
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Correo o contraseña administrativos incorrectos.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Demasiados intentos. Intenta más tarde.');
      } else {
        setErrorMsg('Fallo en la autenticación. Intenta nuevamente.');
      }
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
      // El useEffect verifica el rol y redirige o cierra sesión.
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('Dominio no autorizado en Firebase. Contacta al administrador del sistema.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Cancelaste el inicio de sesión con Google.');
      } else {
        setErrorMsg('Error al autenticar con Google.');
      }
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const [shake, setShake] = useState(false);
  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6 relative overflow-hidden">
      {/* Background Orbs para Admin */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]"></div>

      <motion.div
        layout
        initial={{ opacity: 0, y: 30 }}
        animate={{
          opacity: 1,
          y: 0,
          x: shake ? [-10, 10, -10, 10, 0] : 0
        }}
        transition={{
          opacity: { duration: 0.5 },
          y: { duration: 0.5 },
          x: { duration: 0.4 },
          layout: { duration: 0.3 }
        }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-slate-800 shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            layout
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl text-white mb-6 shadow-xl shadow-emerald-500/20"
          >
            <Shield className="w-8 h-8" />
          </motion.div>
          <motion.h1 layout className="text-3xl font-black text-white tracking-tighter leading-none mb-3">
            Acceso Autorizado
          </motion.h1>
          <motion.p layout className="text-slate-400 font-medium text-sm">
            Portal de gestión administrativa
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <motion.div layout>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Correo corporativo"
                className="w-full h-14 pl-14 pr-6 bg-slate-950/50 border border-slate-800 rounded-2xl text-sm font-medium text-white placeholder:text-slate-600 focus:border-emerald-500/50 outline-none transition-all"
              />
            </div>
          </motion.div>

          <motion.div layout>
            <div className="relative group">
              <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Contraseña de administrador"
                className="w-full h-14 pl-14 pr-6 bg-slate-950/50 border border-slate-800 rounded-2xl text-sm font-medium text-white placeholder:text-slate-600 focus:border-emerald-500/50 outline-none transition-all"
              />
            </div>
          </motion.div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                layout
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <p className="flex items-center gap-1.5 text-xs font-bold text-red-400 ml-2">
                  <XCircle className="w-3.5 h-3.5" />
                  {errorMsg}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            layout
            type="submit"
            disabled={loading || authLoading}
            className="w-full h-14 mt-4 bg-emerald-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500 shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Acceder al Panel'}
            <ArrowRight className="w-4 h-4" />
          </motion.button>

          <motion.div layout className="flex items-center gap-4 my-2">
            <div className="h-px bg-slate-800 flex-1"></div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">O</span>
            <div className="h-px bg-slate-800 flex-1"></div>
          </motion.div>

          <motion.button
            layout
            type="button"
            onClick={handleGoogle}
            disabled={loading || authLoading}
            className="w-full h-14 flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white rounded-2xl font-bold text-sm hover:bg-white/10 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <Chrome className="w-5 h-5 text-emerald-500" />
            Entrar con Google
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
