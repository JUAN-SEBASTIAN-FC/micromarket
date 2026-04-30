import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, ArrowRight, Mail, XCircle, UserPlus, User as UserIcon, Chrome } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginWithEmail, registerAdminWithEmail, loginWithGoogle, registerAdminWithGoogle, profile, logout, loading: authLoading } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [masterKey, setMasterKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [isRegisteringAdmin, setIsRegisteringAdmin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check role on mount or after login
  useEffect(() => {
    const checkRole = async () => {
      // Don't check role if we are actively registering an admin to prevent race condition
      if (profile && !authLoading && !isRegisteringAdmin) {
        if (profile.role === 'admin') {
          navigate('/admin/metrics');
        } else {
          // If a non-admin is trying to access, logout immediately
          toast.error('Acceso denegado: No tienes privilegios de administrador.');
          await logout();
        }
      }
    };
    checkRole();
  }, [profile, authLoading, navigate, logout, isRegisteringAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isLoginMode) {
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
        if (err.code === 'auth/user-not-found') {
          setErrorMsg('El administrador no está registrado.');
        } else if (err.code === 'auth/wrong-password') {
          setErrorMsg('Contraseña administrativa incorrecta.');
        } else {
          setErrorMsg('Fallo en la autenticación de seguridad.');
        }
        triggerShake();
      } finally {
        setLoading(false);
      }
    } else {
      // Register Mode
      if (!name || !email || !password || !masterKey) {
        setErrorMsg('Todos los campos son obligatorios.');
        triggerShake();
        return;
      }
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
        triggerShake();
        return;
      }

      setLoading(true);
      setIsRegisteringAdmin(true);
      try {
        await registerAdminWithEmail(email, password, name, masterKey);
        toast.success('Cuenta de administrador creada exitosamente.');
        navigate('/complete-profile');
      } catch (err: any) {
        console.error(err);
        if (err.message === 'Clave maestra incorrecta') {
          setErrorMsg('La clave maestra es inválida. Acceso denegado.');
        } else if (err.code === 'auth/email-already-in-use') {
          toast.info('Este correo ya está registrado. Redirigiendo al inicio de sesión...');
          setIsLoginMode(true);
          setPassword('');
          setMasterKey('');
          setErrorMsg('');
        } else {
          setErrorMsg('Error al crear el administrador.');
        }
        triggerShake();
        setIsRegisteringAdmin(false); // Only reset on error, on success we navigate away
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogle = async () => {
    setErrorMsg('');
    if (!isLoginMode) {
      if (!masterKey) {
        setErrorMsg('La clave maestra es requerida para crear cuenta.');
        triggerShake();
        return;
      }
    }

    setLoading(true);
    if (!isLoginMode) setIsRegisteringAdmin(true);
    try {
      if (isLoginMode) {
        await loginWithGoogle();
      } else {
        await registerAdminWithGoogle(masterKey);
        toast.success('Cuenta de administrador creada exitosamente con Google.');
        navigate('/complete-profile');
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === 'Clave maestra inválida.') {
        setErrorMsg('La clave maestra es inválida. Acceso denegado.');
      } else if (err.code === 'auth/email-already-in-use' || err.code === 'auth/credential-already-in-use') {
        toast.info('Esta cuenta de Google ya está registrada. Redirigiendo al inicio de sesión...');
        setIsLoginMode(true);
        setMasterKey('');
        setErrorMsg('');
      } else {
        setErrorMsg('Error al autenticar con Google.');
      }
      triggerShake();
      setIsRegisteringAdmin(false);
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
            {isLoginMode ? <Shield className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
          </motion.div>
          <motion.h1 layout className="text-3xl font-black text-white tracking-tighter leading-none mb-3">
            {isLoginMode ? 'Acceso Autorizado' : 'Nuevo Administrador'}
          </motion.h1>
          <motion.p layout className="text-slate-400 font-medium text-sm">
            {isLoginMode ? 'Portal de gestión administrativa' : 'Ingresa la clave maestra para continuar'}
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <AnimatePresence mode="popLayout">
            {!isLoginMode && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative group mb-4">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Nombre completo"
                    className="w-full h-14 pl-14 pr-6 bg-slate-950/50 border border-slate-800 rounded-2xl text-sm font-medium text-white placeholder:text-slate-600 focus:border-emerald-500/50 outline-none transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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

          <AnimatePresence mode="popLayout">
            {!isLoginMode && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative group mt-4">
                  <Shield className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-500/50 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    type="password"
                    value={masterKey}
                    onChange={(e) => {
                      setMasterKey(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="Clave Maestra del Sistema"
                    className="w-full h-14 pl-14 pr-6 bg-amber-950/20 border border-amber-900/30 rounded-2xl text-sm font-medium text-white placeholder:text-slate-600 focus:border-amber-500/50 outline-none transition-all focus:bg-amber-950/30"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
            {loading ? 'Procesando...' : (isLoginMode ? 'Acceder al Panel' : 'Crear Administrador')}
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
            {isLoginMode ? 'Entrar con Google' : 'Registrarse con Google'}
          </motion.button>
        </form>

        <motion.div layout className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setErrorMsg('');
              // Limpiar campos al cambiar
              if (isLoginMode) {
                setMasterKey('');
                setName('');
              }
            }}
            className="text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors"
          >
            {isLoginMode
              ? '¿Nuevo administrador? Regístrate aquí'
              : '¿Ya tienes acceso? Inicia sesión'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
