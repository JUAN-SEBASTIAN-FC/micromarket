import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { AlertProvider } from './contexts/AlertContext.tsx';
import { Toaster } from 'sonner';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AlertProvider>
        <AuthProvider>
          <App />
          <Toaster position="top-right" richColors theme="system" />
        </AuthProvider>
      </AlertProvider>
    </ThemeProvider>
  </StrictMode>,
);

