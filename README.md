<div align="center">
  <img width="1200" height="auto" alt="MicroMarket Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

  # 🚀 MicroMarket
  **La Red de Misiones Técnicas de Próxima Generación**

  [![Web App](https://img.shields.io/badge/Web_App-Live_Now-indigo?style=for-the-badge&logo=firebase)](https://micromarkets-2026.web.app)
  [![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-6-purple?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![Firebase](https://img.shields.io/badge/Firebase-12-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

  ---

  ### 🌐 [Ver en la Web: https://micromarkets-2026.web.app](https://micromarkets-2026.web.app)

</div>

## 📋 Sobre el Proyecto

**MicroMarket** es una plataforma descentralizada (Nexus Network) diseñada para la publicación, gestión y ejecución de tareas técnicas y misiones especializadas. Con una estética futurista y una experiencia de usuario premium, conecta a "Operadores" con misiones críticas en tiempo real.

## ✨ Características Principales

- **🛡️ Protocolo de Verificación:** Sistema de validación de perfiles para asegurar la calidad de los operadores.
- **⚡ Misiones en Tiempo Real:** Publicación y postulación instantánea a tareas técnicas.
- **💬 Chat Nexus:** Sistema de mensajería integrado para la coordinación de misiones.
- **📊 Análisis de Rendimiento:** Métricas detalladas, SLA y niveles de reputación para cada especialista.
- **🔔 Sistema de Notificaciones:** Alertas inteligentes e historial modal para no perder ninguna oportunidad.
- **🌓 Modo Dark/Nexus:** Interfaz optimizada con estética de "Glassmorphism" y soporte para temas dinámicos.

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + Vite + TypeScript.
- **Estilos:** Tailwind CSS (Vanilla CSS & Glassmorphism).
- **Backend/Base de Datos:** Firebase Auth + Firestore (Real-time DB).
- **Pagos:** Stripe (vía Cloud Function `stripeWebhook`).
- **Animaciones:** Framer Motion (Motion).
- **Iconografía:** Lucide React.

## 🚀 Instalación Local

Sigue estos pasos para desplegar el núcleo de MicroMarket en tu entorno local:

### Requisitos Previos
- [Node.js](https://nodejs.org/) (Versión recomendada: 18+)

### Pasos
1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repo>
   cd micromarket
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configuración del Entorno:**
   Copiá `.env.example` a `.env.local` y rellená tus credenciales de Firebase
   (Firebase Console → Project Settings → SDK setup, o
   `npx firebase-tools apps:sdkconfig WEB <APP_ID>`):
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

   > ⚠️ Tras editar `.env.local` hay que **reconstruir** (`npm run build`):
   > Vite incrusta estas variables en el bundle en tiempo de build.

4. **Ejecutar en modo Desarrollo:**
   ```bash
   npm run dev
   ```
   *La app estará disponible en: `http://localhost:3000`*

## 📁 Estructura del Proyecto

```text
src/
├── components/   # Componentes UI Premium (Loader, Layout, Sidebar)
├── contexts/     # Gestión de Estado (Auth, Theme)
├── lib/          # Configuraciones (Firebase, Utils)
├── pages/        # Vistas (Explore, MyTasks, Profile, Admin)
└── services/     # Lógica de Negocio y API de Firestore
```

---

<div align="center">
  <p>Diseñado con pasión por la excelencia técnica.</p>
  <p><b>MicroMarket &copy; 2026 - Ejecución Impecable</b></p>
</div>
