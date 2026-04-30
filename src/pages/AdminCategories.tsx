import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Tag, Terminal, Palette, PenTool, TrendingUp, MoreHorizontal, 
  HandMetal, Check, AlertCircle, Languages, Code2, Briefcase, Music, Video, 
  Camera, Book, Heart, Zap, Cpu, Globe, MessageSquare, ShoppingBag, Wrench, Home 
} from 'lucide-react';
import { subscribeToCategories, createCategory, deleteCategory, Category } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export const iconMap: Record<string, any> = {
  Terminal,
  Code2,
  Palette,
  PenTool,
  TrendingUp,
  Briefcase,
  HandMetal,
  Languages,
  Music,
  Video,
  Camera,
  Book,
  Heart,
  Zap,
  Cpu,
  Globe,
  MessageSquare,
  ShoppingBag,
  Wrench,
  Home,
  MoreHorizontal,
  Tag
};

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToCategories(setCategories);
    return () => unsubscribe();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await createCategory({
        name: newCategoryName.trim(),
        icon: selectedIcon
      });
      setNewCategoryName('');
      setSelectedIcon('Tag');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Error al crear la categoría. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría? Esto no afectará a las tareas existentes pero ya no se podrá filtrar por ella.')) {
      try {
        await deleteCategory(id);
      } catch (err) {
        alert('Error al eliminar la categoría');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Gestión de Categorías
          </h1>
          <p className="text-gray-400 mt-1">Configura las categorías disponibles para las tareas del MicroMarket.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario de Creación */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Nueva Categoría
            </h2>

            <form onSubmit={handleAddCategory} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nombre de la Categoría</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ej: Consultoría"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Icono Sugerido</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(iconMap).map((iconKey) => {
                    const Icon = iconMap[iconKey];
                    return (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setSelectedIcon(iconKey)}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                          selectedIcon === iconKey
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                            : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 text-emerald-400 text-sm bg-emerald-400/10 p-3 rounded-xl">
                  <Check className="w-4 h-4" />
                  Categoría creada con éxito
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                {loading ? 'Procesando...' : 'Crear Categoría'}
              </button>
            </form>
          </div>
        </div>

        {/* Listado de Categorías */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {categories.map((category) => {
                const Icon = iconMap[category.icon] || Tag;
                return (
                  <motion.div
                    key={category.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{category.name}</h3>
                        <p className="text-xs text-gray-500">ID: {category.id?.substring(0, 8)}...</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => category.id && handleDelete(category.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                      title="Eliminar categoría"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {categories.length === 0 && (
            <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
              <Tag className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">No hay categorías configuradas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
