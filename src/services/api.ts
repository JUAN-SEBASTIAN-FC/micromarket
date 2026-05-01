import { collection, addDoc, getDocs, doc, getDoc, updateDoc, setDoc, query, orderBy, onSnapshot, serverTimestamp, where, deleteDoc, writeBatch, Timestamp, or } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task, Message } from './mockData';

export interface Chat {
  id?: string;
  taskId: string;
  taskTitle: string;
  creatorId: string;
  creatorName?: string;
  creatorAvatar?: string;
  applicantId: string;
  applicantName: string;
  applicantAvatar: string;
  status: 'active' | 'discarded' | 'confirmed';
  lastMessage?: string;
  updatedAt?: Timestamp;
}

export interface AppNotification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'message' | 'task_assigned' | 'task_discarded' | 'system';
  read: boolean;
  link?: string;
  createdAt?: Timestamp;
}

export interface Category {
  id?: string;
  name: string;
  icon: string;
  createdAt?: Timestamp;
}

// TASKS
export const subscribeToAllTasks = (
  callback: (tasks: Task[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(collection(db, "tasks"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      callback(tasks);
    },
    (error) => {
      console.error("Firestore error in subscribeToAllTasks:", error);
      if (onError) onError(error);
    }
  );
};

export const subscribeToUserTasks = (
  userId: string,
  callback: (tasks: Task[]) => void,
  onError?: (error: Error) => void
) => {
  if (!userId) return () => { };
  const q = query(
    collection(db, "tasks"),
    where("authorId", "==", userId)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];

      // Client-side sort to avoid index requirement for small scale
      tasks.sort((a, b) => {
        const getTime = (dateVal: any) => {
          if (!dateVal) return 0;
          if (typeof dateVal.toMillis === 'function') return dateVal.toMillis();
          if (typeof dateVal === 'string') return new Date(dateVal).getTime();
          if (dateVal.seconds) return dateVal.seconds * 1000;
          return 0;
        };
        const timeA = getTime(a.createdAt);
        const timeB = getTime(b.createdAt);
        return timeB - timeA;
      });

      callback(tasks);
    },
    (error: any) => {
      console.error("Firestore error in subscribeToUserTasks:", error);
      if (onError) onError(error);
    }
  );
};

export const subscribeToAssignedTasks = (
  userId: string,
  callback: (tasks: Task[]) => void,
  onError?: (error: Error) => void
) => {
  if (!userId) return () => { };
  const q = query(
    collection(db, "tasks"),
    where("assignedTo", "==", userId)
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];

      tasks.sort((a, b) => {
        const getTime = (dateVal: any) => {
          if (!dateVal) return 0;
          if (typeof dateVal.toMillis === 'function') return dateVal.toMillis();
          if (typeof dateVal === 'string') return new Date(dateVal).getTime();
          if (dateVal.seconds) return dateVal.seconds * 1000;
          return 0;
        };
        const timeA = getTime(a.createdAt);
        const timeB = getTime(b.createdAt);
        return timeB - timeA;
      });

      callback(tasks);
    },
    (error: any) => {
      console.error("Firestore error in subscribeToAssignedTasks:", error);
      if (onError) onError(error);
    }
  );
};

export const fetchTaskById = async (taskId: string): Promise<Task | null> => {
  const docRef = doc(db, "tasks", taskId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Task;
  }
  return null;
};

export const createTask = async (taskData: Omit<Task, 'id'>) => {
  const docRef = await addDoc(collection(db, "tasks"), {
    ...taskData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const deleteTask = async (taskId: string) => {
  await deleteDoc(doc(db, "tasks", taskId));
};

export const updateTask = async (taskId: string, taskData: Partial<Task>) => {
  const docRef = doc(db, "tasks", taskId);
  await updateDoc(docRef, {
    ...taskData,
    updatedAt: serverTimestamp()
  });
};


// CHATS & MESSAGES (Real-time)
export const createChat = async (chatData: Omit<Chat, 'id' | 'status' | 'updatedAt'>) => {
  // Check if chat already exists
  const chatsRef = collection(db, 'chats');

  console.log("createChat called with:", {
    taskId: chatData.taskId,
    applicantId: chatData.applicantId,
    creatorId: chatData.creatorId
  });

  if (!chatData.taskId || !chatData.applicantId) {
    console.error("Missing IDs in createChat:", chatData);
    throw new Error("taskId and applicantId are required to create/retrieve a chat");
  }
  const q = query(
    chatsRef,
    where('applicantId', '==', chatData.applicantId)
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find(d => d.data().taskId === chatData.taskId);
  if (existing) {
    return existing.id;
  }

  const docRef = await addDoc(chatsRef, {
    ...chatData,
    status: 'active',
    updatedAt: serverTimestamp()
  });

  // Notify the creator
  try {
    await createNotification({
      userId: chatData.creatorId,
      title: 'Nuevo interesado',
      message: `${chatData.applicantName} ha iniciado un chat por: ${chatData.taskTitle}`,
      type: 'message',
      read: false,
      link: `/messages/${docRef.id}`
    });
  } catch (err) {
    console.error("Error sending chat notification:", err);
  }

  return docRef.id;
};

export const subscribeToUserChats = (userId: string, userRole: string | undefined, callback: (chats: Chat[]) => void) => {
  if (!userId) return () => { };

  const q = query(
    collection(db, "chats"),
    or(
      where("creatorId", "==", userId),
      where("applicantId", "==", userId)
    )
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Chat[];

    // Sort in memory to avoid index requirements
    chats.sort((a, b) => {
      const timeA = a.updatedAt?.toMillis() || 0;
      const timeB = b.updatedAt?.toMillis() || 0;
      return timeB - timeA;
    });

    callback(chats);
  }, (error) => {
    console.error("Error in subscribeToUserChats:", error);
  });
};

export const fetchChatByTaskAndUser = async (taskId: string, userId: string): Promise<Chat | null> => {
  const q = query(
    collection(db, "chats"),
    where("taskId", "==", taskId)
  );
  const snap = await getDocs(q);
  const chat = snap.docs.find(d => d.data().applicantId === userId || d.data().creatorId === userId);
  if (chat) {
    return { id: chat.id, ...chat.data() } as Chat;
  }
  return null;
};

export const subscribeToChatMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  if (!chatId) return () => { };
  const q = query(collection(db, `chats/${chatId}/messages`));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];

    // Sort in memory
    messages.sort((a, b) => {
      const timeA = (a as any).createdAt?.toMillis() || 0;
      const timeB = (b as any).createdAt?.toMillis() || 0;
      return timeA - timeB;
    });

    callback(messages);
  }, (error) => {
    console.error("Error in subscribeToChatMessages:", error);
  });
};

export const sendChatMessage = async (chatId: string, messageData: Omit<Message, 'id' | 'timestamp'>) => {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  await addDoc(collection(db, `chats/${chatId}/messages`), {
    ...messageData,
    timestamp,
    createdAt: serverTimestamp()
  });

  // Update last message in chat
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    lastMessage: messageData.text,
    updatedAt: serverTimestamp()
  });

  // Notify recipient
  try {
    const chatSnap = await getDoc(chatRef);
    if (chatSnap.exists()) {
      const chat = chatSnap.data() as Chat;
      const recipientId = messageData.senderId === chat.creatorId ? chat.applicantId : chat.creatorId;

      await createNotification({
        userId: recipientId,
        title: 'Nuevo mensaje',
        message: `Has recibido un mensaje en: ${chat.taskTitle}`,
        type: 'message',
        read: false,
        link: `/messages/${chatId}`
      });
    }
  } catch (err) {
    console.error("Error sending notification:", err);
  }
};

export const updateChatStatus = async (chatId: string, status: 'discarded' | 'confirmed') => {
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, { status });

  if (status === 'discarded') {
    try {
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        const chat = chatSnap.data() as Chat;
        await createNotification({
          userId: chat.applicantId,
          title: 'Postulación rechazada',
          message: `Tu interés en "${chat.taskTitle}" ha sido declinado por el autor.`,
          type: 'task_discarded',
          read: false,
          link: '/explore'
        });
      }
    } catch (err) {
      console.error("Error sending discard notification:", err);
    }
  }
};

export const completeTask = async (taskId: string, assigneeId: string) => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    status: 'completed',
    completedAt: serverTimestamp()
  });

  // Notify the assignee
  try {
    const taskSnap = await getDoc(taskRef);
    if (taskSnap.exists()) {
      const task = taskSnap.data() as any;
      await createNotification({
        userId: assigneeId,
        title: '¡Tarea Finalizada!',
        message: `El autor ha marcado "${task.title}" como completada. Tu pago será procesado.`,
        type: 'system',
        read: false,
        link: `/tasks/${taskId}`
      });
    }
  } catch (err) {
    console.error("Error sending completion notification:", err);
  }
};

export const assignTask = async (taskId: string, assigneeId: string) => {
  const taskRef = doc(db, 'tasks', taskId);
  await updateDoc(taskRef, {
    assignedTo: assigneeId,
    status: 'assigned'
  });

  // Notify the assignee
  try {
    const taskSnap = await getDoc(taskRef);
    if (taskSnap.exists()) {
      const task = taskSnap.data() as Task;
      await createNotification({
        userId: assigneeId,
        title: 'Tarea asignada',
        message: `¡Felicidades! Has sido seleccionado para: ${task.title}`,
        type: 'task_assigned',
        read: false,
        link: `/tasks/${taskId}`
      });
    }
  } catch (err) {
    console.error("Error sending assignment notification:", err);
  }
};

export const confirmApplicantAndDiscardOthers = async (taskId: string, confirmedChatId: string, assigneeId: string) => {
  // 1. Assign the task
  await assignTask(taskId, assigneeId);

  // 2. Mark this chat as confirmed
  await updateChatStatus(confirmedChatId, 'confirmed');

  // 3. Find other active chats for this task and mark them as discarded
  const q = query(collection(db, "chats"), where("taskId", "==", taskId), where("status", "==", "active"));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  const discardPromises: Promise<any>[] = [];

  snap.docs.forEach(docSnap => {
    if (docSnap.id !== confirmedChatId) {
      batch.update(doc(db, "chats", docSnap.id), { status: 'discarded' });
      // Queue notification
      const chatData = docSnap.data() as Chat;
      discardPromises.push(createNotification({
        userId: chatData.applicantId,
        title: 'Postulación no seleccionada',
        message: `El autor ha seleccionado a otro especialista para la misión "${chatData.taskTitle}".`,
        type: 'task_discarded',
        read: false,
        link: `/explore`
      }));
    }
  });

  await batch.commit();
  await Promise.all(discardPromises);
};

// NOTIFICATIONS
export const createNotification = async (notifData: Omit<AppNotification, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, "notifications"), {
    ...notifData,
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const subscribeToUserNotifications = (userId: string, callback: (notifs: AppNotification[]) => void) => {
  if (!userId) return () => { };
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId)
  );
  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AppNotification[];

    const sortedNotifs = notifs.sort((a, b) => {
      const getTime = (dateVal: any) => {
        if (!dateVal) return 0;
        if (typeof dateVal.toMillis === 'function') return dateVal.toMillis();
        if (typeof dateVal === 'string') return new Date(dateVal).getTime();
        if (dateVal.seconds) return dateVal.seconds * 1000;
        return 0;
      };
      const timeA = getTime(a.createdAt);
      const timeB = getTime(b.createdAt);
      return timeB - timeA;
    });
    callback(sortedNotifs);
  });
};

export const markNotificationAsRead = async (notificationId: string) => {
  await updateDoc(doc(db, 'notifications', notificationId), { read: true });
};

export const markAllNotificationsAsRead = async (userId: string) => {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false));
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    batch.update(doc(db, 'notifications', d.id), { read: true });
  });
  await batch.commit();
};

// User Management for Admins
export async function getAllUsers() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
}

export async function updateUserStatus(userId: string, status: 'pending' | 'approved' | 'incomplete') {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, { status }, { merge: true });

  // Notificar al usuario
  let title = '';
  let message = '';

  if (status === 'approved') {
    title = '¡Cuenta Verificada!';
    message = 'Tu identidad ha sido verificada con éxito. Ya puedes postularte a tareas.';
  } else if (status === 'incomplete') {
    title = 'Verificación Rechazada';
    message = 'Hubo un problema con tus documentos. Por favor, revisa tu perfil y vuelve a intentarlo.';
  }

  if (title) {
    await createNotification({
      userId,
      title,
      message,
      type: 'system',
      read: false,
      link: '/profile'
    });
  }
}

export async function deleteUserCascade(userId: string) {
  const batch = writeBatch(db);

  // 1. Find all tasks by this user
  const tasksQuery = query(collection(db, 'tasks'), where('authorId', '==', userId));
  const tasksSnap = await getDocs(tasksQuery);
  tasksSnap.forEach((taskDoc) => {
    batch.delete(doc(db, 'tasks', taskDoc.id));
  });

  // 2. Delete the user profile document
  batch.delete(doc(db, 'users', userId));

  // Commit all deletes
  await batch.commit();
}

// CATEGORIES
const INITIAL_CATEGORIES = [
  { name: 'Tecnología', icon: 'Terminal' },
  { name: 'Manualidades', icon: 'HandMetal' },
  { name: 'Diseño', icon: 'Palette' },
  { name: 'Idiomas', icon: 'Languages' },
  { name: 'Redacción', icon: 'PenTool' },
  { name: 'Marketing', icon: 'TrendingUp' },
  { name: 'Otros', icon: 'MoreHorizontal' }
];

export const ensureInitialCategories = async () => {
  const categoriesSnapshot = await getDocs(collection(db, 'categories'));
  if (categoriesSnapshot.empty) {
    console.log('🌱 Inicializando categorías base...');
    for (const cat of INITIAL_CATEGORIES) {
      await addDoc(collection(db, 'categories'), {
        ...cat,
        createdAt: serverTimestamp()
      });
    }
  }
};

export const subscribeToCategories = (onUpdate: (categories: Category[]) => void) => {
  return onSnapshot(
    query(collection(db, 'categories'), orderBy('name', 'asc')),
    (snapshot) => {
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      onUpdate(categories);
    }
  );
};

export const createCategory = async (category: Omit<Category, 'id'>) => {
  return await addDoc(collection(db, 'categories'), {
    ...category,
    createdAt: serverTimestamp()
  });
};

export const deleteCategory = async (categoryId: string) => {
  return await deleteDoc(doc(db, 'categories', categoryId));
};
