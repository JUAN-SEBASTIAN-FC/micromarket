import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import {
  onAuthStateChanged,
  User,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

export type UserRole = 'user' | 'admin';
export type UserStatus = 'incomplete' | 'pending' | 'approved';

export interface UserProfile {
  uid: string;
  isPlus: boolean;
  role: UserRole;
  status: UserStatus;
  name?: string;
  email?: string;
  photoUrl?: string;
  certificates?: string[];
  documents?: string[];
  dni?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  updatePlusStatus: (status: boolean) => Promise<void>;
  completeUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  loginWithGoogle: () => Promise<any>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<any>;
  loginWithEmail: (email: string, pass: string) => Promise<any>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout to prevent permanent blank screen
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.warn("AuthContext: Loading timeout reached. Forcing state to ready.");
        setLoading(false);
      }
    }, 5000);

    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Cleanup previous profile listener
      if (unsubProfile) {
        unsubProfile();
        unsubProfile = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Subscribe to real-time profile updates
        const userRef = doc(db, 'users', firebaseUser.uid);
        unsubProfile = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Merge Firestore data with Auth defaults to ensure no data loss
            setProfile({ 
              uid: firebaseUser.uid,
              email: firebaseUser.email || undefined,
              name: firebaseUser.displayName || undefined,
              photoUrl: firebaseUser.photoURL || undefined,
              ...data 
            } as UserProfile);
          } else {
            // Virtual profile for users who haven't completed onboarding
            setProfile({
              uid: firebaseUser.uid,
              isPlus: false,
              role: 'user',
              status: 'incomplete',
              email: firebaseUser.email || undefined,
              name: firebaseUser.displayName || undefined,
              photoUrl: firebaseUser.photoURL || undefined,
            });
          }
          setLoading(false);
          clearTimeout(safetyTimeout);
        }, (error) => {
          console.error("AuthContext: Error in profile listener:", error);
          // Fallback if listener fails
          setProfile({
            uid: firebaseUser.uid,
            isPlus: false,
            role: 'user',
            status: 'incomplete',
            email: firebaseUser.email || undefined,
            name: firebaseUser.displayName || undefined,
          });
          setLoading(false);
          clearTimeout(safetyTimeout);
        });
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error with Google Sign-In", error);
      throw error;
    }
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      // Mandar verificación pero no bloquear el flujo
      sendEmailVerification(userCredential.user).catch(console.error);

      const { updateProfile } = await import('firebase/auth');
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }

      // IMPORTANTE: NO se crea aquí el documento de Firestore. El doc se crea
      // una sola vez en completeUserProfile (regla 'create'). Crearlo aquí y
      // volver a escribirlo en el onboarding provocaba una race condition con
      // el listener onSnapshot (leía el doc antes de que propagara) que hacía
      // rebotar al usuario de vuelta al formulario de registro.
      // El perfil "virtual" con status 'incomplete' lo provee onAuthStateChanged.
      return userCredential;
    } catch (error) {
      console.error("Error registering with email", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      return await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Error logging in", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  };

  const updatePlusStatus = async (status: boolean) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { isPlus: status }, { merge: true });
    setProfile(prev => prev ? { ...prev, isPlus: status } : null);
  };

  const completeUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) {
      throw new Error("No hay usuario autenticado.");
    }
    const userRef = doc(db, 'users', user.uid);

    // El rol nunca lo decide el cliente: se conserva el actual ('user' por
    // defecto). Se reenvía SIEMPRE de forma explícita para que las reglas de
    // Firestore puedan comprobar que no cambió (request.resource.data.role).
    const currentRole: UserRole = profile?.role === 'admin' ? 'admin' : 'user';

    // Estado final: los admin y quienes ya estaban aprobados quedan 'approved';
    // el resto pasa a 'pending' (a la espera de verificación).
    const finalStatus: UserStatus =
      (currentRole === 'admin' || profile?.status === 'approved') ? 'approved' : 'pending';

    const updateData = {
      ...data,
      uid: user.uid,
      role: currentRole,
      status: finalStatus,
      updatedAt: serverTimestamp()
    };

    // El doc puede no existir todavía (primer onboarding) o ya existir (edición
    // de perfil / admin promovido). setDoc con merge cubre ambos casos: dispara
    // la regla 'create' la primera vez y 'update' las siguientes.
    await setDoc(userRef, updateData, { merge: true });

    // Sincronizar el perfil de Firebase Auth (no bloqueante: si falla por
    // longitud de URL u otro motivo, el registro en Firestore ya quedó hecho).
    if (data.photoUrl || data.name) {
      try {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(user, {
          displayName: data.name || user.displayName,
          photoURL: data.photoUrl || user.photoURL
        });
      } catch (authError: any) {
        console.warn("AuthContext: No se pudo actualizar el perfil de Firebase Auth:", authError.message);
      }
    }

    // Actualizar el estado local de inmediato (el onSnapshot lo confirmará).
    setProfile(prev => {
      if (prev) return { ...prev, ...updateData as any };
      return updateData as any;
    });
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, updatePlusStatus, completeUserProfile,
      loginWithGoogle, registerWithEmail, loginWithEmail, resetPassword, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
