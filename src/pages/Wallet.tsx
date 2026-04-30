import React from 'react';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Plus, 
  MoreHorizontal,
  ChevronRight,
  Download,
  AlertCircle,
  Clock,
  TrendingUp,
  History,
  ShieldCheck,
  Zap,
  ArrowRight,
  Globe
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../contexts/AuthContext';

const data = [
  { name: 'Lunes', earnings: 120 },
  { name: 'Martes', earnings: 450 },
  { name: 'Miércoles', earnings: 300 },
  { name: 'Jueves', earnings: 800 },
  { name: 'Viernes', earnings: 600 },
  { name: 'Sábado', earnings: 950 },
  { name: 'Domingo', earnings: 1200 },
];

export default function Wallet() {
  const { profile } = useAuth();
  const isPending = profile?.status === 'pending';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors pb-32">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-600/10 to-transparent pointer-events-none" />
      <div className="absolute top-[10%] right-[-5%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-5%] w-[30%] h-[30%] bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-16 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <WalletIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">Financial Hub</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">Nexus Vault</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-md">
              Gestiona tus activos y monitorea tus ingresos en la red central de MicroMarket.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3"
          >
            <button className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm">
              <Download className="w-4 h-4" />
              Reporte
            </button>
            <button 
              disabled={isPending}
              className="flex items-center gap-2 px-8 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/25 active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              {isPending ? <Clock className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isPending ? 'Validando' : 'Retirar Fondos'}
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Financial Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Balance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BalanceVaultCard 
                label="Saldo Disponible"
                amount="$1,420.50"
                trend="+12.5%"
                isPositive={true}
                variant="primary"
              />
              <BalanceVaultCard 
                label="En Procesamiento"
                amount="$340.00"
                trend="Nexus Guard"
                isPositive={true}
                variant="secondary"
              />
            </div>

            {/* Analytics Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel rounded-[2.5rem] p-8 border-white/5 overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                    Proyección de Ingresos
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">$3,842.00</p>
                    <span className="text-emerald-500 text-xs font-bold font-mono">+24.8%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {['1S', '1M', '3M', 'ALL'].map((tab) => (
                    <button 
                      key={tab}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                        tab === '1S' 
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-72 w-full -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      fontSize={10} 
                      tick={{ fill: '#64748b', fontWeight: 600 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      fontSize={10} 
                      tick={{ fill: '#64748b', fontWeight: 600 }}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#6366f1" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorEarnings)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-panel rounded-[2.5rem] p-8 border-white/5 flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Seguridad Nexus
                </h3>
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              </div>

              <div className="space-y-8 flex-1">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nivel de Confianza</span>
                    <span className="text-xl font-bold text-slate-900 dark:text-white font-mono leading-none">98.4%</span>
                  </div>
                  <div className="relative h-2 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '98.4%' }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Métodos Vinculados</p>
                   <div className="space-y-3">
                      <PremiumPaymentCard 
                        name="Visa Infinite"
                        digits="**** 8824"
                        isPrimary={true}
                        type="card"
                      />
                      <PremiumPaymentCard 
                        name="Mainnet Wallet"
                        digits="0x4f...a231"
                        isPrimary={false}
                        type="crypto"
                      />
                   </div>
                   <button className="w-full py-3 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                     + Añadir Método
                   </button>
                </div>
              </div>

              <div className="mt-10 p-5 rounded-2xl bg-indigo-600/5 border border-indigo-500/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:scale-110 transition-transform">
                  <Clock className="w-12 h-12 text-indigo-500" />
                </div>
                <p className="text-[11px] leading-relaxed text-indigo-900/60 dark:text-indigo-300/60 font-medium relative z-10">
                  <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-1">Transferencia en curso</span>
                  Tu solicitud de retiro de $1,200.00 está siendo validada por los nodos de MicroMarket. Tiempo estimado: 2h.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Transactions Table Section */}
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <div className="flex justify-between items-center mb-8 px-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <History className="w-4 h-4 text-slate-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-widest">Historial de Operaciones</h3>
            </div>
            <button className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2 group">
              Ver Libro Mayor Completo
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="glass-panel rounded-[2.5rem] border-white/5 overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              <TransactionRow 
                type="Ingreso"
                title="Desarrollo de Smart Contract"
                id="TXN-48291"
                date="Hace 2 horas"
                amount="+$850.00"
                status="Liquidado"
              />
              <TransactionRow 
                type="Egreso"
                title="Retiro a Billetera Externa"
                id="TXN-48285"
                date="Hoy, 10:45 AM"
                amount="-$1,200.00"
                status="Pendiente"
              />
              <TransactionRow 
                type="Ingreso"
                title="Bonus de Reputación Nexus"
                id="TXN-48212"
                date="Ayer"
                amount="+$50.00"
                status="Liquidado"
              />
               <TransactionRow 
                type="Ingreso"
                title="Auditoría de Interfaz UI"
                id="TXN-48199"
                date="28 Abr 2026"
                amount="+$320.00"
                status="Liquidado"
              />
            </div>
            <div className="p-8 text-center bg-slate-50/50 dark:bg-white/[0.02]">
              <button className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] hover:text-indigo-500 transition-colors">
                Cargar más transacciones
              </button>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function BalanceVaultCard({ label, amount, trend, isPositive, variant }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn(
        "relative rounded-[2.5rem] p-8 overflow-hidden border transition-all duration-500 group",
        variant === 'primary' 
          ? "bg-[#020617] border-white/10 shadow-2xl shadow-indigo-500/10" 
          : "glass-panel border-white/5 shadow-xl"
      )}
    >
      {/* Glow Effect */}
      <div className={cn(
        "absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity",
        variant === 'primary' ? "bg-indigo-500" : "bg-emerald-500"
      )} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-12">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center border",
            variant === 'primary' 
              ? "bg-indigo-600 border-indigo-400/20 shadow-lg shadow-indigo-500/20" 
              : "bg-white/5 border-white/10"
          )}>
            {variant === 'primary' ? <Zap className="w-5 h-5 text-white" /> : <ShieldCheck className="w-5 h-5 text-emerald-500" />}
          </div>
          <div className={cn(
            "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
            isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
          )}>
            {trend}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">{label}</h4>
          <p className={cn(
            "text-4xl font-bold tracking-tight font-mono",
            variant === 'primary' ? "text-white" : "text-slate-900 dark:text-white"
          )}>{amount}</p>
        </div>
      </div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel border-white/10 p-4 rounded-2xl shadow-2xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
        <p className="text-lg font-bold text-indigo-500 font-mono tracking-tight">${payload[0].value}</p>
      </div>
    );
  }
  return null;
}

function PremiumPaymentCard({ name, digits, isPrimary, type }: any) {
  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.02] cursor-pointer",
      isPrimary 
        ? "bg-indigo-600 border-indigo-400/20 shadow-lg shadow-indigo-500/20" 
        : "bg-white/5 border-white/5 hover:bg-white/10"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          isPrimary ? "bg-white/10" : "bg-slate-100 dark:bg-white/10"
        )}>
          {type === 'card' ? (
            <CreditCard className={cn("w-5 h-5", isPrimary ? "text-white" : "text-slate-500")} />
          ) : (
            <Globe className={cn("w-5 h-5", isPrimary ? "text-white" : "text-slate-500")} />
          )}
        </div>
        <div>
          <p className={cn("text-xs font-bold", isPrimary ? "text-white" : "text-slate-900 dark:text-white")}>{name}</p>
          <p className={cn("text-[10px] font-bold font-mono tracking-tighter", isPrimary ? "text-indigo-200/60" : "text-slate-400")}>{digits}</p>
        </div>
      </div>
      {isPrimary && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />}
    </div>
  );
}

function TransactionRow({ type, title, id, date, amount, status }: any) {
  const isIncome = type === 'Ingreso';

  return (
    <div className="group flex items-center justify-between p-6 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
      <div className="flex items-center gap-6">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
          isIncome 
            ? "bg-emerald-500/10 text-emerald-500" 
            : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"
        )}>
          {isIncome ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1 group-hover:text-indigo-500 transition-colors">{title}</h4>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className={isIncome ? "text-emerald-500/70" : ""}>{type}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10" />
            <span>{id}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-white/10" />
            <span>{date}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className={cn(
          "text-lg font-bold font-mono tracking-tight",
          isIncome ? "text-emerald-500" : "text-slate-900 dark:text-white"
        )}>{amount}</span>
        <span className={cn(
          "text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.1em]",
          status === 'Liquidado' 
            ? "bg-emerald-500/10 text-emerald-500" 
            : "bg-amber-500/10 text-amber-500"
        )}>{status}</span>
      </div>
    </div>
  );
}

