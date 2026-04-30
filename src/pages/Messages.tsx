import React, { useRef, useEffect } from 'react';
import { 
  Search, 
  Send, 
  Paperclip,
  CheckCheck,
  Image as ImageIcon,
  Briefcase,
  CheckCircle,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { subscribeToUserChats, subscribeToChatMessages, sendChatMessage, updateChatStatus, assignTask, createNotification, Chat, confirmApplicantAndDiscardOthers } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Clock } from 'lucide-react';

export default function Messages() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const initialChatId = searchParams.get('chat');
  
  const [chats, setChats] = React.useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = React.useState(true);
  const [messages, setMessages] = React.useState<any[]>([]);
  const [input, setInput] = React.useState('');
  const [selectedChatId, setSelectedChatId] = React.useState<string | null>(initialChatId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile?.uid) return;
    setLoadingChats(true);
    const unsubscribe = subscribeToUserChats(profile.uid, profile.role, (fetchedChats) => {
      setChats(fetchedChats);
      setLoadingChats(false);
      if (!selectedChatId && fetchedChats.length > 0 && !initialChatId) {
        setSelectedChatId(fetchedChats[0].id || null);
      }
    });
    return () => unsubscribe();
  }, [profile?.uid, profile?.role, initialChatId]);

  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }
    const unsubscribe = subscribeToChatMessages(selectedChatId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [selectedChatId]);

  const handleSend = async () => {
    if (!input.trim() || !selectedChatId || !profile) return;
    try {
      await sendChatMessage(selectedChatId, {
        sender: profile.name || "Usuario",
        senderId: profile.uid,
        avatar: profile.photoUrl || `https://ui-avatars.com/api/?name=${profile.name || 'Usuario'}`,
        text: input
      });
      
      setInput('');
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  const handleConfirmTask = async (chat: Chat) => {
    if (!chat.id) return;
    if (window.confirm('¿Confirmar a este usuario y asignar la tarea? Los demás chats se descartarán.')) {
      await confirmApplicantAndDiscardOthers(chat.taskId, chat.id, chat.applicantId);
    }
  };

  const handleDiscardChat = async (chat: Chat) => {
    if (!chat.id) return;
    if (window.confirm('¿Descartar este chat?')) {
      await updateChatStatus(chat.id, 'discarded');
      await createNotification({
        userId: chat.applicantId,
        title: 'Postulación Descartada',
        message: `Tu postulación para la tarea ${chat.taskTitle} no fue seleccionada.`,
        type: 'task_discarded',
        read: false,
        link: `/messages?chat=${chat.id}`
      });
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const selectedChat = chats.find(c => c.id === selectedChatId);

  let headerChatName = "Creador de la Tarea";
  let headerChatAvatar = "https://ui-avatars.com/api/?name=Creador";

  if (selectedChat) {
    const isCreator = profile?.uid === selectedChat.creatorId;
    const isAdminView = profile?.role === 'admin' && profile?.uid !== selectedChat.creatorId && profile?.uid !== selectedChat.applicantId;

    if (isAdminView) {
      headerChatName = `${selectedChat.applicantName} (Admin Monitoreo)`;
      headerChatAvatar = selectedChat.applicantAvatar || `https://ui-avatars.com/api/?name=${selectedChat.applicantName}`;
    } else if (isCreator) {
      headerChatName = selectedChat.applicantName;
      headerChatAvatar = selectedChat.applicantAvatar || `https://ui-avatars.com/api/?name=${selectedChat.applicantName}`;
    } else {
      headerChatName = selectedChat.creatorName || "Creador de la Tarea";
      headerChatAvatar = selectedChat.creatorAvatar || `https://ui-avatars.com/api/?name=${headerChatName}`;
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-1 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[1.75rem] shadow-xl">
      <aside className={cn(
        "flex flex-col border-r border-slate-200 dark:border-white/5 shrink-0 bg-slate-50/50 dark:bg-slate-950/50 transition-all duration-300",
        // On mobile: full width when no chat selected, hidden when chat selected
        selectedChatId
          ? "hidden lg:flex lg:w-80 xl:w-96"
          : "flex w-full lg:w-80 xl:w-96"
      )}>
        <div className="p-6 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mensajes Recientes</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar conversación..." 
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
          {loadingChats ? (
            <div className="flex flex-col items-center justify-center p-12 gap-4">
              <div className="w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando...</p>
            </div>
          ) : chats.length === 0 ? (
            <p className="text-slate-400 text-xs font-medium p-6">No tienes conversaciones activas.</p>
          ) : (
            chats.map((chat) => {
              const isCreator = profile?.uid === chat.creatorId;
              const isAdminView = profile?.role === 'admin' && profile?.uid !== chat.creatorId && profile?.uid !== chat.applicantId;
              
              let chatName = "Creador de la Tarea";
              let chatAvatar = "https://ui-avatars.com/api/?name=Creador";
              
              if (isAdminView) {
                chatName = `${chat.applicantName} (Admin Monitoreo)`;
                chatAvatar = chat.applicantAvatar || `https://ui-avatars.com/api/?name=${chat.applicantName}`;
              } else if (isCreator) {
                chatName = chat.applicantName;
                chatAvatar = chat.applicantAvatar || `https://ui-avatars.com/api/?name=${chat.applicantName}`;
              } else {
                chatName = chat.creatorName || "Creador de la Tarea";
                chatAvatar = chat.creatorAvatar || `https://ui-avatars.com/api/?name=${chatName}`;
              }
              
              return (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChatId(chat.id || null)}
                  className={cn(
                    "w-full p-5 flex gap-4 transition-all hover:bg-white dark:hover:bg-slate-900 text-left relative group",
                    selectedChatId === chat.id && "bg-indigo-50/50 dark:bg-indigo-500/10 border-l-2 border-indigo-500",
                    chat.status === 'discarded' && "opacity-50"
                  )}
                >
                  <div className="relative shrink-0">
                    <img src={chatAvatar} alt="" className="w-10 h-10 rounded-full border border-slate-200 dark:border-white/10 shadow-sm object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">{chatName}</h4>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                       <Briefcase className="w-3 h-3 text-indigo-400 dark:text-indigo-500" />
                       <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest truncate">{chat.taskTitle}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate leading-relaxed">
                      {chat.lastMessage || "Sin mensajes"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-white dark:bg-slate-900 min-w-0 relative">
        {/* Dynamic ambient glow behind chat */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        {selectedChat ? (
          <>
            <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 shadow-sm relative z-10 shrink-0">
              <div className="flex items-center gap-3">
                {/* Back button — mobile only */}
                <button
                  onClick={() => setSelectedChatId(null)}
                  className="lg:hidden w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <img src={headerChatAvatar} alt="" className="w-9 h-9 rounded-full border border-slate-200 dark:border-white/10 shadow-sm object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{headerChatName}</h3>
                    {selectedChat.status === 'confirmed' && <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest border border-emerald-500/20">Confirmado</span>}
                    {selectedChat.status === 'discarded' && <span className="text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest border border-red-500/20">Descartado</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                     <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Tarea Asociada:</span>
                     <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest leading-none truncate max-w-[200px]">{selectedChat.taskTitle}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                {profile?.uid === selectedChat.creatorId && selectedChat.status === 'active' && (
                  <>
                    <button 
                      onClick={() => handleConfirmTask(selectedChat)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[2px] rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
                    >
                      <CheckCircle className="w-4 h-4" /> Confirmar
                    </button>
                    <button 
                      onClick={() => handleDiscardChat(selectedChat)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-[2px] rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all active:scale-95"
                    >
                      <XCircle className="w-4 h-4" /> Descartar
                    </button>
                  </>
                )}
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 relative z-10">
              {messages.map((msg, i) => {
                const isMe = msg.senderId === profile?.uid;
                return (
                <div key={msg.id || i} className={cn(
                  "flex flex-col gap-1.5 max-w-[80%]",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm transition-all",
                    isMe 
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/20" 
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-black/5"
                  )}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1.5 px-2">
                     <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{msg.timestamp}</span>
                     {isMe && (
                       <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                         {msg.read ? (
                           <><CheckCheck className="w-3.5 h-3.5 text-blue-500" /> Leído</>
                         ) : msg.received ? (
                           <><CheckCheck className="w-3.5 h-3.5 text-slate-400" /> Recibido</>
                         ) : (
                           <><CheckCircle className="w-3 h-3 text-slate-400" /> Enviado</>
                         )}
                       </div>
                     )}
                  </div>
                </div>
              )})}
            </div>

            <div className="p-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-white/5 relative z-10">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-3">
                   <button className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"><Paperclip className="w-5 h-5" /></button>
                   <button className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"><ImageIcon className="w-5 h-5" /></button>
                </div>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escribe un mensaje..." 
                  className="w-full pl-24 pr-16 py-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none transition-all text-sm font-medium text-slate-900 dark:text-white disabled:opacity-50 placeholder:text-slate-400"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-90 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:shadow-none"
                >
                  <Send className="w-5 h-5 -ml-0.5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-medium gap-4">
             <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                <Briefcase className="w-8 h-8" />
             </div>
            <p className="text-[10px] font-black uppercase tracking-[3px]">Selecciona una conversación</p>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
