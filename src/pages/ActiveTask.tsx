import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  FileText, 
  Upload, 
  MoreVertical, 
  Send, 
  Paperclip,
  Image as ImageIcon,
  FileCode,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { AppLayout } from '../components/Layout';
import { fetchTaskById, fetchChatByTaskAndUser, subscribeToChatMessages, sendChatMessage } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { Loader } from '../components/Loader';

export default function ActiveTask() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState<any>(null);
  const [chat, setChat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const { profile } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      if (id && profile?.uid) {
        try {
          const fetchedTask = await fetchTaskById(id);
          setTask(fetchedTask);
          
          const fetchedChat = await fetchChatByTaskAndUser(id, profile.uid);
          setChat(fetchedChat);
          
          if (fetchedChat?.id) {
            const unsubscribe = subscribeToChatMessages(fetchedChat.id, (msgs) => {
              setMessages(msgs.map(m => ({
                ...m,
                isMe: m.senderId === profile.uid
              })));
            });
            return () => unsubscribe();
          }
        } catch (error) {
          console.error("Error loading active task data:", error);
        }
      }
      setLoading(false);
    };
    const unsubPromise = loadData();
    return () => {
      unsubPromise.then(unsub => unsub && unsub());
    };
  }, [id, profile?.uid]);

  const handleSend = async () => {
    if (!input.trim() || !chat?.id || !profile?.uid) return;
    
    const messageData = {
      sender: profile.name || "Usuario",
      senderId: profile.uid,
      text: input,
      avatar: profile.photoUrl || "https://i.pravatar.cc/150"
    };

    try {
      await sendChatMessage(chat.id, messageData);
      setInput('');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-65px)] items-center justify-center bg-slate-900">
        <Loader message="Sincronizando Misión Activa..." />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-[calc(100vh-65px)] flex-col items-center justify-center bg-slate-900 space-y-4">
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Tarea no encontrada</p>
        <button onClick={() => navigate(-1)} className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest hover:underline">Volver</button>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-slate-900">
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex items-center justify-between px-6 bg-slate-900 border-b border-slate-800 shrink-0">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="h-4 w-px bg-slate-800" />
              <h1 className="text-xs font-bold text-white uppercase tracking-[2px] truncate max-w-[300px]">
                {task.title}
              </h1>
           </div>
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-md">
                 <Clock className="w-3.5 h-3.5 text-red-400" />
                 <span className="text-[10px] font-bold text-red-400 font-mono tracking-widest">19:42:05</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex -space-x-2">
                   {[1,2].map(i => (
                     <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="" className="w-full h-full grayscale opacity-50" />
                     </div>
                   ))}
                 </div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collaborative Mode</span>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-6">
           <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col group">
              <div className="h-10 flex items-center px-4 bg-slate-900 border-b border-slate-800 gap-2 shrink-0">
                 <div className="w-2 h-2 rounded-full bg-red-500/50" />
                 <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                 <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                 <div className="ml-4 h-6 px-3 rounded bg-slate-800 flex items-center gap-2">
                    <FileCode className="w-3 h-3 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-300 font-mono">execution_log.sh</span>
                 </div>
              </div>
              <div className="flex-1 p-8 font-mono text-sm text-slate-400 leading-relaxed overflow-y-auto">
                 <pre className="whitespace-pre-wrap">
                   {`// MICROMARKET EXECUTOR v1.0
// TASK_REF: ${task.id}
// STATUS: ACTIVE_TRANSMISSION

> Initializing secure tunnel... DONE
> Fetching asset definitions... DONE
> Verification probability: 98.4%

// Task specific instructions:
${task.description?.split('.').map((s: string) => `// ${s.trim()}`).join('\n')}

[AWAITING_RESULT_SUBMISSION...]
`}
                 </pre>
                 <div className="mt-8 p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center">
                       <Upload className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[4px]">Drag and drop assets or click to upload</span>
                 </div>
              </div>
           </div>

           <div className="h-20 bg-slate-900 rounded-2xl border border-slate-800 p-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">State</p>
                    <p className="text-xs font-bold text-white tracking-tight uppercase">Ready for Submission</p>
                 </div>
              </div>
              <div className="flex gap-3">
                 <button className="h-10 px-6 rounded-xl border border-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-widest hover:bg-white/5 transition-all active:scale-95">Save Snapshot</button>
                 <button className="h-10 px-10 rounded-xl bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition-all active:scale-95">Submit Deliverable</button>
              </div>
           </div>
        </div>
      </main>

      <aside className="w-[420px] flex flex-col bg-slate-900 border-l border-slate-800 overflow-hidden">
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-indigo-500/50 p-0.5">
                     <img 
                       src={profile?.uid === chat?.creatorId ? chat?.applicantAvatar : task?.author?.avatar || "https://i.pravatar.cc/150"} 
                       alt="" 
                       className="w-full h-full rounded-full object-cover" 
                     />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-white uppercase tracking-widest leading-none mb-1">
                       {profile?.uid === chat?.creatorId ? chat?.applicantName : task?.author?.name || "Cliente"}
                     </p>
                     <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                       {profile?.uid === chat?.creatorId ? "Postulante" : "Autor de la Tarea"}
                     </p>
                  </div>
               </div>
               <div className="flex gap-1">
                  <button className="p-2 text-slate-500 hover:text-white transition-colors"><MoreVertical className="w-4 h-4" /></button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
               {messages.map((msg, i) => (
                 <div key={msg.id || i} className={cn(
                   "flex flex-col gap-1.5 max-w-[85%]",
                   msg.isMe ? "ml-auto items-end" : "mr-auto items-start"
                 )}>
                   <div className={cn(
                     "p-4 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm transition-all",
                     msg.isMe 
                       ? "bg-slate-800 text-white rounded-tr-none border border-slate-700" 
                       : "bg-slate-950 border border-slate-800 text-slate-300 rounded-tl-none"
                   )}>
                     {msg.text}
                   </div>
                   <div className="flex items-center gap-1.5 px-1 mt-0.5 justify-end">
                     <span className="text-[9px] font-bold text-slate-600 font-mono tracking-widest">{msg.timestamp}</span>
                     {msg.isMe && (
                       <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-slate-500">
                         {msg.read ? (
                           <><CheckCircle2 className="w-3 h-3 text-blue-500" /> Leído</>
                         ) : msg.received ? (
                           <><CheckCircle2 className="w-3 h-3 text-slate-500" /> Recibido</>
                         ) : (
                           <><CheckCircle2 className="w-3 h-3 text-slate-500" /> Enviado</>
                         )}
                       </div>
                     )}
                   </div>
                 </div>
               ))}
            </div>

            <div className="p-6 bg-slate-950 border-t border-slate-800">
               <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-2">
                    <button className="text-slate-600 hover:text-slate-200 transition-colors"><Paperclip className="w-4 h-4" /></button>
                    <button className="text-slate-600 hover:text-slate-200 transition-colors"><ImageIcon className="w-4 h-4" /></button>
                  </div>
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Message client..." 
                    className="w-full pl-20 pr-12 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                  <button 
                    onClick={handleSend}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 active:scale-90 transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>
      </aside>
    </div>
  );
}

function FileItem({ name, size, date, type }: { name: string, size: string, date: string, type: 'pdf' | 'zip' | 'image' }) {
  const Icon = type === 'pdf' ? FileText : type === 'zip' ? FileCode : ImageIcon;
  const color = type === 'pdf' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600';

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group cursor-pointer">
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded flex items-center justify-center", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{name}</p>
          <p className="text-xs text-gray-500">{size} • {date}</p>
        </div>
      </div>
      <button className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <Upload className="w-4 h-4 rotate-180" />
      </button>
    </div>
  );
}
