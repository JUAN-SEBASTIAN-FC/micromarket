export interface Task {
  id: string;
  title: string;
  client?: string;
  reward: number;
  category: string;
  description: string;
  urgency?: 'Urgente' | 'Estándar';
  progress?: number;
  deadline?: string;
  requirements?: string[];
  clientLogo?: string;
  files?: TaskFile[];
  status?: 'open' | 'in_progress' | 'assigned' | 'completed' | 'deleted';
  authorId?: string;
  assignedTo?: string;
  author?: {
    name: string;
    avatar: string;
    rating: number;
  };
  skills?: string[];
  createdAt?: any;
}

export interface TaskFile {
  name: string;
  size: string;
  date: string;
  type: 'pdf' | 'zip' | 'image';
}

export interface Message {
  id: string;
  sender: string;
  senderId?: string;
  avatar: string;
  text: string;
  timestamp: string;
  isMe?: boolean;
}
