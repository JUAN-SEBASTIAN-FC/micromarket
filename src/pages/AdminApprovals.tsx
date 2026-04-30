import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, CheckCircle, XCircle, FileText, AlertCircle, Trash2 } from 'lucide-react';
import { getAllUsers, updateUserStatus, deleteUserCascade } from '../services/api';
import { useAuth, UserProfile } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminApprovals() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/explore');
      return;
    }

    fetchUsers();
  }, [profile, navigate]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data as unknown as UserProfile[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    await updateUserStatus(userId, 'approved');
    fetchUsers();
  };

  const handleReject = async (userId: string) => {
    await updateUserStatus(userId, 'incomplete');
    fetchUsers();
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario y todas sus tareas? Esta acción no se puede deshacer.')) {
      setLoading(true);
      try {
        await deleteUserCascade(userId);
        fetchUsers();
      } catch (err) {
        console.error("Error eliminando usuario", err);
        setLoading(false);
      }
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando usuarios...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Verificaciones Pendientes</h1>
          <p className="text-slate-500 text-sm">Aprueba o rechaza perfiles y certificados</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-widest text-slate-500 font-bold">
              <th className="p-4">Usuario</th>
              <th className="p-4">Contacto</th>
              <th className="p-4">Rol / Estado</th>
              <th className="p-4">Archivos</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.filter(u => u.role !== 'admin' && u.status === 'pending').map(u => (
              <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={u.photoUrl || `https://ui-avatars.com/api/?name=${u.name}`} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{u.name || 'Sin Nombre'}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-slate-600 font-medium">DNI: {u.dni || 'No provisto'}</span>
                    <span className="text-xs text-slate-600 font-medium">Tel: {u.phone || 'No provisto'}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-2 items-start">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                      {u.role}
                    </span>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      u.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                      u.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {u.status}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-2">
                    {u.certificates && u.certificates.length > 0 && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Certificados</span>
                        {u.certificates.map((cert, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setSelectedFile({ url: cert, title: `Certificado ${idx + 1} - ${u.name}` })}
                            className="flex items-center gap-1 text-xs text-indigo-600 hover:underline text-left"
                          >
                            <FileText className="w-3 h-3" /> Certificado {idx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                    {u.documents && u.documents.length > 0 && (
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Documentos</span>
                        {u.documents.map((doc, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setSelectedFile({ url: doc, title: `Documento ${idx + 1} - ${u.name}` })}
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:underline text-left"
                          >
                            <FileText className="w-3 h-3" /> Documento {idx + 1}
                          </button>
                        ))}
                      </div>
                    )}
                    {(!u.certificates || u.certificates.length === 0) && (!u.documents || u.documents.length === 0) && (
                      <span className="text-xs text-slate-400">Sin archivos</span>
                    )}
                  </div>
                </td>
                <td className="p-4 text-right">
                  {u.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleApprove(u.uid)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Aprobar">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleReject(u.uid)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Rechazar">
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  {u.role !== 'admin' && (
                    <button onClick={() => handleDelete(u.uid)} className="p-2 ml-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Eliminar Usuario">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="p-8 text-center flex flex-col items-center text-slate-400">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p>No hay usuarios registrados.</p>
          </div>
        )}
      </div>

      {/* Modal de Previsualización */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="font-bold text-slate-800">{selectedFile.title}</h3>
              <button 
                onClick={() => setSelectedFile(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-50 flex items-center justify-center min-h-[400px]">
              {(selectedFile.url.match(/\.(jpeg|jpg|gif|png|webp)/i) || 
                selectedFile.url.startsWith('data:image/') || 
                (selectedFile.url.includes('alt=media') && !selectedFile.url.toLowerCase().includes('.pdf') && !selectedFile.url.toLowerCase().includes('.doc'))) ? (
                <img 
                  src={selectedFile.url} 
                  alt={selectedFile.title} 
                  className="max-w-full h-auto rounded shadow-lg border border-slate-200" 
                />
              ) : selectedFile.url.toLowerCase().includes('.pdf') ? (
                <iframe 
                  src={selectedFile.url} 
                  title={selectedFile.title}
                  className="w-full h-full min-h-[600px] rounded shadow-lg border border-slate-200" 
                />
              ) : (
                <div className="text-center p-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-6">Este archivo es un documento o no se puede previsualizar directamente.</p>
                  <a 
                    href={selectedFile.url} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                  >
                    Ver Documento
                  </a>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
              <a 
                href={selectedFile.url} 
                download={selectedFile.title}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
              >
                Descargar
              </a>
              <button 
                onClick={() => setSelectedFile(null)}
                className="px-6 py-2 text-sm font-bold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
