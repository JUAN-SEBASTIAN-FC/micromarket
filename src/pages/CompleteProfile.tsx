import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { User, Image as ImageIcon, FileText, UploadCloud, ArrowRight, CheckCircle2, X, XCircle, ShieldCheck } from 'lucide-react';
import { useAuth, UserProfile } from '../contexts/AuthContext';
import { uploadFile } from '../services/storage';
import { toast } from 'sonner';
import { isValidDNI, isValidPhone, sanitizeText } from '../lib/validation';

export default function CompleteProfile() {
  const { user, profile, completeUserProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(profile?.name || '');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  React.useEffect(() => {
    if (profile?.name && !name) {
      setName(profile.name);
    }
  }, [profile?.name]);
  const [certFiles, setCertFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Redirect if not incomplete
  React.useEffect(() => {
    if (profile && profile.status !== 'incomplete') {
      navigate(profile.role === 'admin' ? '/admin/metrics' : '/explore');
    }
  }, [profile, navigate]);

  // ✅ Validación profesional de campos
  const validateFields = () => {
    const errors: { [key: string]: string } = {};
    
    // Validar nombre
    if (!name.trim()) {
      errors.name = 'El nombre es obligatorio.';
    } else if (name.trim().length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres.';
    } else if (name.trim().length > 100) {
      errors.name = 'El nombre no puede exceder 100 caracteres.';
    }

    // Validar DNI y teléfono solo para usuarios normales
    if (profile?.role !== 'admin') {
      if (!dni.trim()) {
        errors.dni = 'El DNI es obligatorio.';
      } else if (!isValidDNI(dni)) {
        errors.dni = 'DNI debe ser 6-12 dígitos válidos.';
      }

      if (!phone.trim()) {
        errors.phone = 'El teléfono es obligatorio.';
      } else if (!isValidPhone(phone)) {
        errors.phone = 'Teléfono debe ser 7-15 dígitos válidos.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) {
      toast.error('Por favor, revisa los campos en rojo para continuar.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      let photoUrl = profile?.photoUrl;
      const uploadedCerts: string[] = [];
      const uploadedDocs: string[] = [];

      // Mapeo de errores para el usuario
      const getErrorMessage = (err: string) => {
        if (err.startsWith('UPLOAD_FAILED')) return 'Error al procesar el archivo. Intenta de nuevo.';

        switch (err) {
          case 'FILE_TOO_LARGE':
            return 'Archivo demasiado grande para la base de datos (Máximo: 150KB fotos, 300KB documentos). Usa un compresor de PDF o recorta la foto.';
          case 'INVALID_TYPE':
            return 'Formato no permitido. Usa imágenes (JPG, PNG) o documentos (PDF, Word).';
          case 'TOTAL_PROFILE_TOO_LARGE':
            return 'El peso total del perfil supera el límite. Intenta subir menos certificados/documentos.';
          default:
            return `Error técnico: ${err}`;
        }
      };

      if (photoFile && user) {
        try {
          // La foto de perfil no necesita mucha resolución (400px es suficiente)
          photoUrl = await uploadFile(`users/${user.uid}/profile_${photoFile.name}`, photoFile, {
            maxWidth: 400,
            maxSizeKB: 150 // Límite estricto para Base64
          });
        } catch (e: any) {
          const msg = `Foto de perfil: ${getErrorMessage(e.message)}`;
          setError(msg);
          toast.error(msg);
          setLoading(false);
          return;
        }
      }

      if (certFiles.length > 0 && user) {
        for (const file of certFiles) {
          try {
            const url = await uploadFile(`users/${user.uid}/certs/${file.name}`, file, {
              maxSizeKB: 300, // Límite estricto para PDFs en Base64
              maxWidth: 800
            });
            uploadedCerts.push(url);
          } catch (e: any) {
            const msg = `Certificado (${file.name}): ${getErrorMessage(e.message)}`;
            setError(msg);
            toast.error(msg);
            setLoading(false);
            return;
          }
        }
      }

      if (docFiles.length > 0 && user) {
        for (const file of docFiles) {
          try {
            const url = await uploadFile(`users/${user.uid}/docs/${file.name}`, file, {
              maxSizeKB: 300,
              maxWidth: 800
            });
            uploadedDocs.push(url);
          } catch (e: any) {
            const msg = `Documento ID (${file.name}): ${getErrorMessage(e.message)}`;
            setError(msg);
            toast.error(msg);
            setLoading(false);
            return;
          }
        }
      }

      const updates: Partial<UserProfile> = {
        name: sanitizeText(name, 100),
        photoUrl,
        certificates: uploadedCerts,
        dni: dni.trim().replace(/\D/g, ''), // ✅ Solo números
        phone: phone.trim().replace(/\D/g, ''), // ✅ Solo números
        bio: sanitizeText(bio, 500),
        skills: tags.map(tag => sanitizeText(tag, 50)),
        documents: uploadedDocs
      };

      // Verificación de seguridad: El documento de Firestore no puede exceder 1MB
      // Reducimos el umbral a 900KB para tener margen con los demás campos
      const totalSizeEstimate = JSON.stringify(updates).length;
      if (totalSizeEstimate > 900000) {
        throw new Error('TOTAL_PROFILE_TOO_LARGE');
      }

      await completeUserProfile(updates);
      toast.success('¡Perfil guardado con éxito!');
      navigate(profile?.role === 'admin' ? '/admin/metrics' : '/explore');
    } catch (err: any) {
      console.error(err);
      const msg = err.message === 'TOTAL_PROFILE_TOO_LARGE' 
        ? 'El perfil es demasiado pesado en conjunto. Intenta subir menos archivos o documentos más pequeños.'
        : 'Error al guardar el perfil. Por favor intenta de nuevo.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center py-12 px-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-indigo-500/10 rounded-[2rem] text-indigo-400 mb-8 border border-white/10 shadow-xl"
          >
            <User className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-tight mb-4">
            Completa tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">perfil</span>
          </h1>
          <p className="text-slate-400 font-medium max-w-md mx-auto text-sm leading-relaxed mb-4">
            Personaliza tu identidad en la plataforma para empezar a colaborar con la comunidad.
          </p>
          <div className="inline-block bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-2">
            <p className="text-[11px] text-orange-400 font-medium">
              ⚠️ Importante: El peso total de tu perfil (foto + documentos) no puede superar los 900KB.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 mb-2">
                  <XCircle className="w-6 h-6 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Foto de Perfil */}
          <div className="flex flex-col items-center gap-4 p-8 bg-white/5 rounded-[2rem] border border-white/5">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-slate-800 overflow-hidden border-4 border-white/10 shadow-2xl relative">
                 {photoFile ? (
                   <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                 ) : profile?.photoUrl ? (
                   <img src={profile.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-500">
                     <ImageIcon className="w-10 h-10" />
                   </div>
                 )}
                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <UploadCloud className="w-6 h-6 text-white" />
                 </div>
              </div>
              <label className="absolute bottom-1 right-1 w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 active:scale-95 transition-all border-4 border-slate-950">
                <UploadCloud className="w-5 h-5" />
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setPhotoFile(e.target.files[0]);
                  }
                }} />
              </label>
            </div>
            <div className="text-center">
              <span className="block text-[10px] font-black text-slate-500 uppercase tracking-[3px]">Imagen de Perfil</span>
              <span className="block text-[9px] text-slate-500 mt-1 font-medium">(Máx: 150KB - Se comprime auto)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] ml-1">Nombre Completo</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
                }}
                placeholder="Tu nombre"
                className={`w-full h-14 px-5 bg-white/5 rounded-2xl border transition-all text-sm font-medium text-white placeholder:text-slate-500 outline-none ${fieldErrors.name ? 'border-red-500/50 bg-red-500/5 focus:border-red-500' : 'border-white/10 focus:border-indigo-500/50 focus:bg-white/10'}`}
              />
              {fieldErrors.name && (
                <p className="text-[10px] text-red-400 font-bold ml-1 uppercase">{fieldErrors.name}</p>
              )}
            </div>

            {profile?.role !== 'admin' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] ml-1">DNI / Identificación</label>
                  <input 
                    type="text" 
                    value={dni}
                    onChange={(e) => {
                      setDni(e.target.value.replace(/\D/g, ''));
                      if (fieldErrors.dni) setFieldErrors(prev => ({ ...prev, dni: '' }));
                    }}
                    placeholder="Número de documento"
                    className={`w-full h-14 px-5 bg-white/5 rounded-2xl border transition-all text-sm font-medium text-white placeholder:text-slate-500 outline-none ${fieldErrors.dni ? 'border-red-500/50 bg-red-500/5 focus:border-red-500' : 'border-white/10 focus:border-indigo-500/50 focus:bg-white/10'}`}
                  />
                  {fieldErrors.dni && (
                    <p className="text-[10px] text-red-400 font-bold ml-1 uppercase">{fieldErrors.dni}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] ml-1">Teléfono</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/[^\d+]/g, ''));
                      if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    placeholder="+57 300..."
                    className={`w-full h-14 px-5 bg-white/5 rounded-2xl border transition-all text-sm font-medium text-white placeholder:text-slate-500 outline-none ${fieldErrors.phone ? 'border-red-500/50 bg-red-500/5 focus:border-red-500' : 'border-white/10 focus:border-indigo-500/50 focus:bg-white/10'}`}
                  />
                  {fieldErrors.phone && (
                    <p className="text-[10px] text-red-400 font-bold ml-1 uppercase">{fieldErrors.phone}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] ml-1">Biografía</label>
              <input 
                type="text" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Corta descripción..."
                className="w-full h-14 px-5 bg-white/5 rounded-2xl border border-white/10 transition-all text-sm font-medium text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/50 focus:bg-white/10"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] ml-1">Habilidades</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                        setTags([...tags, tagInput.trim()]);
                        setTagInput('');
                      }
                    }
                  }}
                  placeholder="Escribe y presiona Enter..."
                  className="w-full h-14 px-5 bg-white/5 rounded-2xl border border-white/10 transition-all text-sm font-medium text-white placeholder:text-slate-500 outline-none focus:border-indigo-500/50 focus:bg-white/10"
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((tag, i) => (
                  <motion.span 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={i} 
                    className="px-3 py-1.5 bg-indigo-500/10 text-indigo-300 text-[11px] font-bold rounded-xl border border-indigo-500/20 flex items-center gap-2"
                  >
                    {tag} 
                    <X className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} />
                  </motion.span>
                ))}
              </div>
            </div>
          </div>

          {profile?.role !== 'admin' && (
            <div className="space-y-6">
              <div className="h-px bg-white/10 w-full my-8" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] ml-1">Certificados</label>
                  <label className="group cursor-pointer flex flex-col items-center justify-center gap-3 w-full p-8 border-2 border-dashed border-white/10 rounded-[2rem] text-slate-500 hover:border-indigo-500/50 hover:bg-white/5 transition-all">
                    <FileText className="w-8 h-8 opacity-40 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center">
                      Subir PDF/Imagen<br/>
                      <span className="block text-[9px] font-medium text-slate-400 normal-case tracking-normal mt-1">Máx: 300KB por archivo</span>
                    </span>
                    <input type="file" multiple accept=".pdf,image/*" className="hidden" onChange={(e) => {
                      if (e.target.files) {
                        setCertFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                      }
                    }} />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {certFiles.map((f, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 text-slate-300 text-[10px] font-bold rounded-lg border border-white/10 flex items-center gap-2">
                        {f.name} <X className="w-3 h-3 cursor-pointer" onClick={() => setCertFiles(fks => fks.filter((_, idx) => idx !== i))} />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] ml-1">Documentos ID</label>
                  <label className="group cursor-pointer flex flex-col items-center justify-center gap-3 w-full p-8 border-2 border-dashed border-white/10 rounded-[2rem] text-slate-500 hover:border-emerald-500/50 hover:bg-white/5 transition-all">
                    <ShieldCheck className="w-8 h-8 opacity-40 group-hover:text-emerald-400 transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-center">
                      Validar Identidad<br/>
                      <span className="block text-[9px] font-medium text-slate-400 normal-case tracking-normal mt-1">Máx: 300KB por archivo</span>
                    </span>
                    <input type="file" multiple accept=".pdf,image/*" className="hidden" onChange={(e) => {
                      if (e.target.files) {
                        setDocFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                      }
                    }} />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {docFiles.map((f, i) => (
                      <span key={i} className="px-3 py-1 bg-white/5 text-slate-300 text-[10px] font-bold rounded-lg border border-white/10 flex items-center gap-2">
                        {f.name} <X className="w-3 h-3 cursor-pointer" onClick={() => setDocFiles(fks => fks.filter((_, idx) => idx !== i))} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-10 flex flex-col md:flex-row gap-4">
            <button 
              type="button"
              onClick={() => logout()}
              className="flex-1 h-14 bg-white/5 border border-white/10 text-slate-400 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
            >
              Cerrar Sesión
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-[2] h-14 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Finalizar Registro'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
