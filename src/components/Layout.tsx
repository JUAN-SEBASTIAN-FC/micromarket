import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  ClipboardList,
  MessageSquare,
  Wallet,
  Settings,
  LogOut,
  ChevronRight,
  TrendingUp,
  User,
  Moon,
  PlusCircle,
  ShieldCheck,
  Home,
  Lock,
  Clock,
  Tag
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, AppNotification } from '../services/api';

const NotificationBell = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = React.useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const navigate = useNavigate();
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!profile?.uid) return;
    const unsubscribe = subscribeToUserNotifications(profile.uid, (notifs) => {
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, [profile?.uid]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeNotifs = notifications.filter(n => !n.read);
  const unreadCount = activeNotifs.length;

  const handleNotificationClick = async (notif: AppNotification) => {
    if (!notif.read && notif.id) {
      await markNotificationAsRead(notif.id);
    }
    setIsOpen(false);
    setIsHistoryOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (profile?.uid) {
      await markAllNotificationsAsRead(profile.uid);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all relative border border-slate-200/50 dark:border-slate-700/50 shadow-sm"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#0f172a]"></span>
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-84 glass-panel-premium rounded-3xl z-50 overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Notificaciones</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 uppercase tracking-wider transition-colors"
                  >
                    Limpiar Todo
                  </button>
                )}
              </div>
              <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                {activeNotifs.length === 0 ? (
                  <div className="p-10 text-center text-slate-500 dark:text-slate-300 text-xs font-bold uppercase tracking-widest opacity-50">
                    Sin notificaciones
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {activeNotifs.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className="p-5 flex gap-4 cursor-pointer hover:bg-white/5 dark:hover:bg-white/5 transition-all group bg-indigo-500/5"
                      >
                        <div className="w-2 h-2 rounded-full mt-2 shrink-0 transition-all duration-500 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] scale-110" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-slate-900 dark:text-white truncate mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{notif.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-300 line-clamp-2 leading-relaxed font-medium">{notif.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 bg-slate-50/50 dark:bg-white/5 border-t border-white/5">
                <button
                  onClick={() => { setIsOpen(false); setIsHistoryOpen(true); }}
                  className="w-full py-2 text-[10px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-[2px] transition-colors"
                >
                  Ver Todo el Historial
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-md px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter premium-gradient-text">Historial de Actividad</h2>
                    <p className="label-eyebrow-muted mt-1">Centro de Notificaciones</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {unreadCount > 0 && (
                    <button
                      onClick={(e) => { handleMarkAllRead(e); setIsHistoryOpen(false); }}
                      className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest transition-all"
                    >
                      Marcar Todo Leído
                    </button>
                  )}
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-red-500 hover:text-white text-slate-500 transition-all"
                  >
                    <LogOut className="w-5 h-5 rotate-180" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-50/50 dark:bg-[#0f172a]/30">
                {activeNotifs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                      <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Sin notificaciones activas</h3>
                    <p className="text-sm font-medium text-slate-500 max-w-sm">No tienes mensajes pendientes. Cuando recibas alertas importantes, aparecerán aquí.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeNotifs.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-start gap-5 hover:border-indigo-500/30 dark:hover:border-indigo-500/30"
                      >
                        <div className="w-3 h-3 rounded-full mt-1.5 shrink-0 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] group-hover:scale-125 transition-transform" />
                        <div className="flex-1">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{notif.title}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{notif.message}</p>
                          <div className="mt-4 flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {(notif.createdAt as any)?.toDate?.()?.toLocaleDateString() || 'Reciente'}</span>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 flex justify-center shrink-0">
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="px-8 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[2px] hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-600/20"
                >
                  Cerrar Historial
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};


// TOP NAVIGATION LAYOUT (Landing Page)
export const TopNavLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const { profile, user } = useAuth();

  const handleThemeToggle = () => {
    if (profile?.isPlus) {
      toggleTheme();
    } else {
      navigate('/upgrade');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-[#020617] font-sans transition-colors duration-300">
      <header className="h-20 glass-nav px-4 md:px-8 flex items-center justify-between shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter font-display flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            MicroMarket
          </Link>
          <nav className="hidden md:flex items-center gap-8 ml-4">
            <NavLink to="/explore" className="text-sm font-bold text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Explorar</NavLink>
            <NavLink to="/my-tasks" className="text-sm font-bold text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Mis Tareas</NavLink>
            <NavLink to="/admin/metrics" className="text-sm font-bold text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Clasificación</NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <button onClick={handleThemeToggle} className="hidden sm:flex w-10 h-10 rounded-full items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <Moon className="w-5 h-5" />
          </button>
          {(!user || user.isAnonymous) ? (
            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden sm:block text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Ingresar
              </Link>
              <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all">
                Empezar
              </Link>
            </div>
          ) : (
            <>
              <NotificationBell />
              <Link to="/profile" className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden cursor-pointer border-2 border-white dark:border-slate-800 shadow-md hover:scale-105 transition-transform">
                <img src={profile?.photoUrl || user?.photoURL || "https://i.pravatar.cc/150?u=a042581f4e29026024d"} alt="Profile" className="w-full h-full object-cover" />
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="py-12 glass-nav mt-auto border-t-0 border-slate-200/50 dark:border-slate-800/50 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-6 justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><TrendingUp className="w-3 h-3" /></div>
            <span>&copy; 2026 MicroMarket. Ejecución Impecable.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Términos</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
};


// SIDEBAR FOR DESKTOP ONLY
export const Sidebar = () => {
  const { user, profile, logout } = useAuth();
  const isAdmin = profile?.role === 'admin';

  return (
    <aside className="hidden lg:flex flex-col w-80 glass-panel m-6 rounded-[2.5rem] overflow-hidden shrink-0 transition-all duration-500 z-40 relative border-white/5">
      {/* Decorative Glow */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Logo Section */}
      <div className="p-10 flex items-center gap-4 shrink-0 relative z-10">
        <div className="w-14 h-14 premium-gradient rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30 group cursor-pointer transition-transform hover:scale-105 active:scale-95">
          <TrendingUp className="w-7 h-7 transition-transform group-hover:rotate-12" />
        </div>
        <Link to="/" className="text-slate-900 dark:text-white font-black text-2xl tracking-tighter font-display leading-none">
          Micro<span className="text-indigo-600 dark:text-indigo-500">Market</span>
        </Link>
      </div>

      <div className="flex-1 px-5 py-2 space-y-10 overflow-y-auto custom-scrollbar relative z-10">
        <section>
          <h3 className="label-eyebrow-muted mb-6 px-5 font-display">Operaciones</h3>
          <nav className="space-y-2">
            <SidebarLink to="/explore" icon={<Search className="w-5 h-5" />} label="Explorar Tareas" />
            <SidebarLink to="/my-tasks" icon={<ClipboardList className="w-5 h-5" />} label="Mis Tareas" />
            <SidebarLink to="/messages" icon={<MessageSquare className="w-5 h-5" />} label="Mensajería" />
            <SidebarLink to="/wallet" icon={<Wallet className="w-5 h-5" />} label="Billetera" />
          </nav>
        </section>

        {isAdmin && (
          <section>
            <h3 className="label-eyebrow-muted mb-6 px-5 font-display text-indigo-500/60 dark:text-indigo-400/40">Terminal Control</h3>
            <nav className="space-y-2">
              <SidebarLink to="/admin/metrics" icon={<TrendingUp className="w-5 h-5" />} label="Métricas Globales" />
              <SidebarLink to="/admin/users" icon={<User className="w-5 h-5" />} label="Gestión Usuarios" />
              <SidebarLink to="/admin/approvals" icon={<ShieldCheck className="w-5 h-5" />} label="Verificaciones" />
              <SidebarLink to="/admin/categories" icon={<Tag className="w-5 h-5" />} label="Categorías" />
            </nav>
          </section>
        )}
      </div>

      {/* User Profile Footer */}
      <div className="p-4 shrink-0 border-t border-white/20 dark:border-white/5">
        <Link to="/profile" className="p-3 rounded-[2rem] bg-white/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 flex items-center gap-3 transition-all group relative cursor-pointer">
          <div className="relative shrink-0">
            <img
              src={profile?.photoUrl || user?.photoURL || "https://i.pravatar.cc/150?u=a042581f4e29026024d"}
              alt="Avatar"
              className="w-12 h-12 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform"
            />
            {profile?.status === 'approved' && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0f172a] flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-3 h-3" />
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-slate-900 dark:text-white text-sm font-black truncate tracking-tight font-display leading-none mb-1">
              {profile?.name || "Usuario"}
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 opacity-80">
              {profile?.role === 'admin' ? 'Master Admin' : profile?.isPlus ? 'Premium' : 'Estándar'}
            </span>
          </div>

          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); }}
            className="ml-auto w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </Link>
      </div>
    </aside>
  );
};

const SidebarLink = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  return (
    <NavLink
      to={to}
      className={cn(
        "flex items-center gap-4 px-5 py-3.5 rounded-[1.25rem] text-sm font-black transition-all duration-200 group relative overflow-hidden",
        isActive
          ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 translate-x-1"
          : "text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5 hover:translate-x-0.5"
      )}
    >
      <span className="shrink-0 transition-all duration-200 group-hover:scale-110">{icon}</span>
      <span className="truncate tracking-tight font-display">{label}</span>
      {isActive && (
        <motion.div
          layoutId="sidebar-active-bar"
          className="absolute right-3 w-1.5 h-5 bg-white/40 rounded-full blur-[1px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </NavLink>
  );
};

// BOTTOM NAVIGATION FOR MOBILE
export const BottomNav = () => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="glass-nav border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center justify-around h-[60px] px-1">
          <BottomNavLink to="/explore" icon={<Search className="w-[22px] h-[22px]" />} label="Explorar" />
          <BottomNavLink to="/my-tasks" icon={<ClipboardList className="w-[22px] h-[22px]" />} label="Tareas" />

          {/* FAB — Post Task */}
          <div className="flex flex-col items-center -mt-6">
            <NavLink
              to="/post-task"
              className="w-14 h-14 premium-gradient rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-600/40 hover:scale-110 active:scale-95 transition-all border-4 border-slate-50 dark:border-[#020617]"
            >
              <PlusCircle className="w-7 h-7" />
            </NavLink>
          </div>

          <BottomNavLink to="/messages" icon={<MessageSquare className="w-[22px] h-[22px]" />} label="Chat" />
          <BottomNavLink to="/profile" icon={<User className="w-[22px] h-[22px]" />} label="Perfil" />
        </div>
      </div>
    </div>
  );
};

const BottomNavLink = ({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className="flex flex-col items-center justify-center gap-1 w-14 py-1 relative group"
    >
      <div className={cn(
        "w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200",
        isActive
          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110"
          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 group-hover:bg-slate-100 dark:group-hover:bg-white/5"
      )}>
        {icon}
      </div>
      <span className={cn(
        "text-[10px] font-bold tracking-tight leading-none transition-colors duration-200",
        isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
      )}>
        {label}
      </span>
      {isActive && (
        <motion.div
          layoutId="bottom-nav-dot"
          className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-indigo-600 rounded-full"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </Link>
  );
};

export const Header = () => {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const { profile, user } = useAuth();

  const handleThemeToggle = () => {
    if (profile?.isPlus) {
      toggleTheme();
    } else {
      navigate('/upgrade');
    }
  };

  return (
    <header className="h-16 glass-nav px-4 sm:px-6 lg:px-10 flex items-center justify-between shrink-0 z-30 sticky top-0">
      <div className="flex items-center gap-4 lg:hidden">
        <Link to="/" className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
          <TrendingUp className="w-6 h-6" />
        </Link>
      </div>

      <div className="flex items-center gap-8 ml-auto w-full lg:w-auto justify-end">
        <div className="flex-1" /> {/* Spacer */}

        <div className="flex items-center gap-4">
          <button onClick={handleThemeToggle} className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all relative border border-slate-200/50 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none group">
            <Moon className="w-5 h-5 transition-transform group-hover:-rotate-12" />
          </button>
          <NotificationBell />
          <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-2 hidden sm:block" />
          <Link to="/profile" className="w-12 h-12 rounded-2xl bg-slate-200 overflow-hidden cursor-pointer border-2 border-white dark:border-white/10 shadow-xl hover:scale-105 transition-all shrink-0">
            <img src={profile?.photoUrl || user?.photoURL || "https://i.pravatar.cc/150?u=a042581f4e29026024d"} alt="Profile" className="w-full h-full object-cover" />
          </Link>
          <NavLink
            to="/post-task"
            className="hidden sm:flex bg-indigo-600 text-white px-10 h-12 items-center justify-center rounded-2xl text-[10px] font-black uppercase tracking-[2px] shadow-2xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:-translate-y-0.5 transition-all active:scale-95 gap-3 ml-2 group"
          >
            <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90" />
            <span className="font-display">Nueva Tarea</span>
          </NavLink>
        </div>
      </div>
    </header>
  );
};

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useAuth();
  const location = useLocation();
  const isPending = profile?.status === 'pending';

  return (
    <div className="h-screen w-full flex bg-slate-50 dark:bg-[#020617] font-sans overflow-hidden transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-screen relative">
        <Header />

        {isPending && (
          <div className="mx-6 lg:mx-12 mt-4 px-8 py-4 bg-amber-500/5 border border-amber-500/20 rounded-3xl flex items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-xl shadow-amber-500/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[3px] leading-none mb-1">Protocolo de Verificación</p>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest opacity-80">
                  Tu cuenta está siendo analizada por el equipo de seguridad. Acceso restringido.
                </p>
              </div>
            </div>
            <Link to="/profile" className="text-[10px] font-black uppercase tracking-[2px] px-6 py-2.5 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all active:scale-95">
              Estado de Red
            </Link>
          </div>
        )}

        {/* pb-20 on mobile to account for BottomNav height */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative pb-20 lg:pb-8 px-4 sm:px-6 lg:px-10">
          <div className={cn(
            "mx-auto w-full pt-5 lg:pt-6",
            location.pathname === '/messages' ? "max-w-none h-[calc(100vh-140px)]" : "max-w-7xl"
          )}>
            {children}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
};

