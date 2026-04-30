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

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Transcribe Financial Receipts - Q3 Batch",
    client: "Acme Corp",
    reward: 12.50,
    category: "Entrada de Datos",
    urgency: "Urgente",
    description: "Accurately extract date, vendor, and total amount from 50 scanned retail receipts into the provided spreadsheet template.",
    progress: 0,
    deadline: "24 Oct, 2024",
    requirements: [
      "Agregar artículos al carrito",
      "Continuar como invitado",
      "Grabar pantalla y hablar en voz alta",
      "Enviar resumen escrito"
    ],
    clientLogo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLfJc-VIViTvLO7oovdlpiysZvdhIxq-M_nSdyOxYQzr1UogOPfUqJoFXdUDhXtp6pOqaMyj_S9QN1rqsAEpRaOLPXLoUjNMBv9a3qHZHtrfgAfnP1WPhFLtWlGj6eVVClkGd2zHZ9RxuTanLXp2OhIUrbWgiPxQKOAYWTIA34drfosKZKePKUBM9KjRILeIyRGCI8aoanY-DEanECoaSi1M8jxfrEZw0H8ylwVpA1qDlg9VxlbAug43Le7cGtXnNY82p5_ZltQGw",
    files: [
      { name: "project_brief_v2.pdf", size: "2.4 MB", date: "Añadido ayer", type: 'pdf' }
    ]
  },
  {
    id: "2",
    title: "Beta Test E-commerce Checkout Flow",
    client: "Acme Commerce Group",
    reward: 25.00,
    category: "Prueba de Aplicaciones",
    description: "Navigate through the new mobile checkout process, add 3 items to cart, and document any friction points or bugs encountered.",
    progress: 30,
    urgency: "Urgente",
    deadline: "25 Oct, 2024",
    requirements: [
      "Agregar artículos al carrito",
      "Continuar como invitado",
      "Grabar pantalla y hablar en voz alta",
      "Enviar resumen escrito"
    ]
  },
  {
    id: "3",
    title: "Consumer Habits: Streaming Services",
    client: "Global Insights",
    reward: 4.00,
    category: "Encuestas",
    description: "Complete a 10-minute survey detailing your current subscriptions, viewing preferences, and likelihood to churn in the next 6 months.",
    progress: 0
  },
  {
    id: "4",
    title: "Categorize Product Images for ML Model",
    client: "TechAI Solution",
    reward: 18.00,
    category: "Entrada de Datos",
    description: "Review 100 images of clothing items and assign appropriate tags (color, style, fabric) based on the provided guidelines document.",
    progress: 30
  }
];

export const mockMessages: Message[] = [
  {
    id: "m1",
    sender: "Sarah Jenkins",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBV9hO03Oo1PoIxcA2ILtWtWzWxNOZLnrpdhu9bWENllFX1W57vSujwFXwj_aMmZA-TIrwqZJHWHO4FptM9UGS8Nf-BhBb29RTPIhwWc0AkMrmoWrnytngM4djzYyB3j2M-sKtzkmuxnnDV-1y4XLqcSFSytWc4SyZW1SY5dUAIf_uhv2PiOydkxfFYB_e9SWL9BUlDC-77ho_1tEJOthuYk6RVS65zkAA4TlScx-m8p31EMTGXVTFmzDmdIaFJv_i1KVvnWOYEyM8",
    text: "¡Hola! Solo estaba revisando el progreso para el rediseño de la página principal. ¿Necesitas algún recurso más de nuestra parte?",
    timestamp: "10:42 AM",
    isMe: false
  },
  {
    id: "m2",
    sender: "Me",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFS7aX7Dm5OCuVA2SkMZ9tuggIJpQo-ni1uwCbJTCUmm2UIIdoQnfB5JaAzYt5JkDVTdiDH3J5flpkJGc3MhQ1sLT5-x8SXMSlFT4xiMfQ5l0yvnRC6uBl75t7O1BeV8ssk5mOBkR6RhFdhXkFfuEnyLrTZDNBYYyBYnrHp836HNmW1ysT23tGK4P0LxfAR84G8B13j_BbkwOobCtL5xZxmu4DktHYKkUe30PNOow4o25p3SHXjE1VIY8k0DZPaxZymAI55rD3LHo",
    text: "¡Hola Sarah! La página principal va muy bien. Actualmente estoy implementando la sección hero. Puede que necesite las versiones en alta resolución de las fotos de los productos más tarde hoy.",
    timestamp: "10:45 AM",
    isMe: true
  }
];
