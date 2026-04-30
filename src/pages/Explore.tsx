import React, { useEffect, useState } from 'react';
import { Tag, DollarSign, SortAsc, Loader2, X, TrendingUp, Filter, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { subscribeToAllTasks, subscribeToCategories, Category } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { Task } from '../services/mockData';
import { TaskCard } from '../components/TaskCard';
import { 
  ModalOverlay, 
  CategoryModalContent, 
  PriceModalContent, 
  SortModalContent 
} from '../components/FilterModals';
import { Loader } from '../components/Loader';

export default function Explore() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'reward-high' | 'reward-low'>('newest');
  const [priceRange, setPriceRange] = useState<{ min: number, max: number }>({ min: 0, max: 5000 });

  // Modal State
  const [activeModal, setActiveModal] = useState<'category' | 'price' | 'sort' | null>(null);

  useEffect(() => {
    const unsubscribeTasks = subscribeToAllTasks(
      (fetchedTasks) => {
        setTasks(fetchedTasks);
        setLoading(false);
      },
      () => setLoading(false)
    );

    const unsubscribeCats = subscribeToCategories(setCategories);

    return () => {
      unsubscribeTasks();
      unsubscribeCats();
    };
  }, []);

  const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const filteredTasks = tasks.filter(task => {
    const matchesCategory = selectedCategory === 'all' || task.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesPrice = (task.reward || 0) >= priceRange.min && (task.reward || 0) <= priceRange.max;
    const matchesSearch = !searchQuery || removeAccents(task.title || '').toLowerCase().includes(removeAccents(searchQuery).toLowerCase());
    return matchesCategory && matchesPrice && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'reward-high') return (b.reward || 0) - (a.reward || 0);
    if (sortBy === 'reward-low') return (a.reward || 0) - (b.reward || 0);
    if (sortBy === 'newest') {
      const timeA = (a.createdAt as any)?.toMillis?.() || 0;
      const timeB = (b.createdAt as any)?.toMillis?.() || 0;
      return timeB - timeA;
    }
    return 0;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-300 pb-32 relative overflow-hidden">
      {/* Advanced Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-indigo-600/10 dark:bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 dark:bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Premium Header & Filters */}
      <div className="pt-12 pb-8 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 mb-12">
          <div className="flex-1 w-full lg:w-auto">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl font-black text-slate-950 dark:text-white tracking-tighter mb-4"
            >
              EXPLORAR
            </motion.h1>
            
            <div className="relative max-w-xl w-full mt-6">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Busca por nombre de la tarea..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
              />
            </div>
          </div>
          
          {/* Action Filter Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            <FilterButton 
              active={selectedCategory !== 'all'} 
              label={selectedCategory === 'all' ? 'Categorías' : selectedCategory} 
              icon={<Tag className="w-4 h-4" />} 
              onClick={() => setActiveModal('category')} 
            />
            <FilterButton 
              active={priceRange.min > 0 || priceRange.max < 5000} 
              label={priceRange.min === 0 && priceRange.max === 5000 ? 'Presupuesto' : `$${priceRange.min} - $${priceRange.max}`} 
              icon={<DollarSign className="w-4 h-4" />} 
              onClick={() => setActiveModal('price')} 
            />
            <FilterButton 
              active={sortBy !== 'newest'} 
              label={sortBy === 'newest' ? 'Ordenar' : sortBy === 'reward-high' ? 'Mayor Paga' : 'Menor Paga'} 
              icon={<SortAsc className="w-4 h-4" />} 
              onClick={() => setActiveModal('sort')} 
            />
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-10 border-b border-slate-200 dark:border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-[3px]">
              {filteredTasks.length} OPORTUNIDADES
            </span>
          </div>
          
          {(selectedCategory !== 'all' || priceRange.min > 0 || priceRange.max < 5000 || sortBy !== 'newest' || searchQuery !== '') && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceRange({ min: 0, max: 5000 });
                setSortBy('newest');
              }}
              className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-6">
        {loading ? (
          <Loader message="Sincronizando Mercado..." />
        ) : filteredTasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-40 bg-white dark:bg-slate-900/20 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[4rem]"
          >
            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300 dark:text-slate-700">
              <X className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter">Sin resultados</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto mt-4 mb-10">Ajusta tus filtros para descubrir nuevas posibilidades estratégicas.</p>
              <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setPriceRange({ min: 0, max: 5000 });
                setSortBy('newest');
              }}
              className="px-8 py-4 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.05]"
            >
              Ver Todo el Catálogo
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task, idx) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                >
                  <TaskCard task={task} categories={categories} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Premium Modals Orchestration */}
      <AnimatePresence>
        {activeModal && (
          <ModalOverlay onClose={() => setActiveModal(null)}>
            {activeModal === 'category' && (
              <CategoryModalContent 
                categories={categories} 
                selected={selectedCategory} 
                onSelect={(cat) => { setSelectedCategory(cat); setActiveModal(null); }} 
              />
            )}
            {activeModal === 'price' && (
              <PriceModalContent 
                range={priceRange} 
                onChange={setPriceRange} 
                onClose={() => setActiveModal(null)} 
              />
            )}
            {activeModal === 'sort' && (
              <SortModalContent 
                selected={sortBy} 
                onSelect={(val) => { setSortBy(val); setActiveModal(null); }} 
              />
            )}
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterButton({ label, icon, active, onClick }: { label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) {
  return (
    <motion.button 
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[2px] transition-all border shadow-sm",
        active 
          ? "bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-600/20" 
          : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-indigo-500/30 dark:hover:border-indigo-500/30"
      )}
    >
      {icon}
      {label}
    </motion.button>
  );
}
