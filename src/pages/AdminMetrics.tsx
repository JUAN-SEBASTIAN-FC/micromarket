import { 
  TrendingUp, 
  Timer, 
  Users, 
  ShieldAlert, 
  Download, 
  Calendar,
  MoreHorizontal,
  ClipboardList
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { AppLayout } from '../components/Layout';
import { cn } from '../lib/utils';

const data = [
  { name: '01 Nov', value: 0 },
  { name: '08 Nov', value: 0 },
  { name: '15 Nov', value: 0 },
  { name: '22 Nov', value: 0 },
  { name: '30 Nov', value: 0 },
];

const categories = [
  { name: 'Verificación de Datos', value: 0, color: '#0040df' },
  { name: 'Etiquetado de Imágenes', value: 0, color: '#2d5bff' },
  { name: 'Transcripción de Audio', value: 0, color: '#6063ee' },
  { name: 'Moderación de Contenido', value: 0, color: '#0040df' },
];

export default function AdminMetrics() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Rendimiento Global</h2>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Métricas de Rendimiento</h1>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-white border border-slate-200 font-bold text-[10px] text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            Últimos 30 días
          </button>
          <button className="flex items-center gap-2 h-9 px-6 rounded-lg bg-indigo-600 font-bold text-[10px] text-white hover:bg-indigo-700 transition-all shadow-sm active:scale-95 uppercase tracking-wider">
            <Download className="w-3.5 h-3.5" />
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard 
          title="Valor Total de Cartera" 
          value="0.00" 
          change="0.0%" 
          icon={<ClipboardList className="w-4 h-4" />} 
          trend="up"
        />
        <MetricCard 
          title="Listados Activos" 
          value="0" 
          change="0.0%" 
          icon={<Timer className="w-4 h-4 text-indigo-600" />} 
          trend="down"
          color="indigo"
        />
        <MetricCard 
          title="Rendimiento Promedio" 
          value="0" 
          change="0.0%" 
          icon={<Users className="w-4 h-4 text-slate-600" />} 
          trend="up"
          color="gray"
        />
        <MetricCard 
          title="Costo Operativo" 
          value="0.0%" 
          change="0.0%" 
          icon={<ShieldAlert className="w-4 h-4 text-red-600" />} 
          trend="up"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col min-h-[400px]">
           <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pulso de Cartera</h3>
              <p className="text-lg font-bold text-slate-900 tracking-tight">Tendencias de Rendimiento</p>
            </div>
            <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Eficiencia por Tipo</h3>
          <div className="flex flex-col gap-6 flex-1 justify-center">
            {categories.map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                  <span className="text-xs font-mono text-indigo-600">{cat.value}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.value}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-indigo-500" 
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 bg-slate-900 rounded-xl p-5 text-white">
             <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[2px]">Insights Pro</span>
             <p className="text-[11px] leading-relaxed mt-2 opacity-80 font-medium">
               Las tendencias del mercado sugieren un aumento del 15% en la demanda comercial para el sector de Zúrich el próximo trimestre.
             </p>
             <button className="mt-3 text-[10px] font-bold border-b border-indigo-400 text-indigo-400 uppercase tracking-wider">Leer informe completo</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon, trend, color = 'blue' }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center justify-between">
        {title}
        <div className="text-slate-300">{icon}</div>
      </div>
      <div className="text-2xl font-light text-slate-900 mono-value">{value}</div>
      <div className={cn(
        "text-[10px] font-bold mt-1.5 uppercase",
        trend === 'up' ? "text-emerald-500" : "text-amber-500"
      )}>
        {change}
      </div>
    </div>
  );
}

function ClipboardListIcon(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}
