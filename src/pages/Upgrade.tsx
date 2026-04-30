import React from 'react';
import { motion } from 'motion/react';
import { Check, Star, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Upgrade() {
  const { profile, user } = useAuth();
  const STRIPE_LINK = user 
    ? `https://buy.stripe.com/test_bJe00i35tarI2w41FP1ZS00?client_reference_id=${user.uid}` 
    : "https://buy.stripe.com/test_bJe00i35tarI2w41FP1ZS00";

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-12">
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">MicroMarket <span className="text-indigo-600 dark:text-indigo-400">Plus</span></h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Potencia tu experiencia. Desbloquea herramientas profesionales y personaliza tu entorno de trabajo.
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free Plan */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col gap-6 opacity-70">
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Plan Básico</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Para comenzar a explorar microtareas.</p>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">$0 <span className="text-sm font-medium text-slate-500">/mes</span></div>
          <ul className="space-y-3 flex-1">
            <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-300"><Check className="w-5 h-5 text-indigo-500 shrink-0" /> Acceso a tareas estándar</li>
            <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-300"><Check className="w-5 h-5 text-indigo-500 shrink-0" /> Soporte comunitario</li>
            <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-300"><Check className="w-5 h-5 text-indigo-500 shrink-0" /> Publicar hasta 3 tareas al mes</li>
          </ul>
          <button disabled className="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 py-3 rounded-full font-bold cursor-not-allowed">
            Tu Plan Actual
          </button>
        </div>

        {/* Plus Plan */}
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-indigo-600 rounded-3xl p-8 flex flex-col gap-6 shadow-xl shadow-indigo-600/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Star className="w-24 h-24 text-white" />
          </div>
          <div className="relative z-10">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full w-max mb-4 inline-block">RECOMENDADO</span>
            <h3 className="text-xl font-bold text-white">Plan Plus</h3>
            <p className="text-indigo-100 text-sm mt-2">Para profesionales que valoran su tiempo y vista.</p>
          </div>
          <div className="text-3xl font-black text-white relative z-10">$50,000 <span className="text-sm font-medium text-indigo-200">COP/mes</span></div>
          <ul className="space-y-3 flex-1 relative z-10">
            <li className="flex gap-3 text-sm text-white"><Check className="w-5 h-5 text-indigo-300 shrink-0" /> <strong>Modo Oscuro Exclusivo</strong> <Moon className="w-4 h-4 ml-1" /></li>
            <li className="flex gap-3 text-sm text-indigo-50"><Check className="w-5 h-5 text-indigo-300 shrink-0" /> Acceso prioritario a tareas</li>
            <li className="flex gap-3 text-sm text-indigo-50"><Check className="w-5 h-5 text-indigo-300 shrink-0" /> Publicar tareas ilimitadas</li>
            <li className="flex gap-3 text-sm text-indigo-50"><Check className="w-5 h-5 text-indigo-300 shrink-0" /> Soporte VIP 24/7</li>
          </ul>
          {profile?.isPlus ? (
            <button disabled className="w-full bg-white/20 text-white py-3 rounded-full font-bold cursor-not-allowed">
              Ya eres Plus
            </button>
          ) : (
            <a 
              href={STRIPE_LINK}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-white text-indigo-600 text-center py-3 rounded-full font-bold hover:bg-slate-50 transition-colors shadow-md relative z-10 block"
            >
              Mejorar a Plus
            </a>
          )}
        </motion.div>
      </div>
    </div>
  );
}
