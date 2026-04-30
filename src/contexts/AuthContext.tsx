import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  User, 
  signInAnonymously,
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
  loginAsAnonymous: () => Promise<void>;
  updatePlusStatus: (status: boolean) => Promise<void>;
  completeUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  loginWithGoogle: () => Promise<any>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<any>;
  registerAdminWithEmail: (email: string, pass: string, name: string, secretKey: string) => Promise<any>;
  registerAdminWithGoogle: (secretKey: string) => Promise<any>;
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

  const loginAsAnonymous = async () => {
    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Error signing in anonymously", error);
      throw error;
    }
  };

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

      // Crear el documento en Firestore con el estado inicial correcto
      const userRef = doc(db, 'users', userCredential.user.uid);
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: email,
        name: name || '',
        status: 'incomplete',
        role: 'user',
        isPlus: false
      };
      
      await setDoc(userRef, newProfile, { merge: true });
      setProfile(newProfile); // Actualizar estado local inmediatamente
      
      return userCredential;
    } catch (error) {
      console.error("Error registering with email", error);
      throw error;
    }
  };

  const registerAdminWithEmail = async (email: string, pass: string, name: string, secretKey: string) => {
    if (secretKey !== import.meta.env.VITE_ADMIN_MASTER_KEY) {
      throw new Error("Clave maestra inválida.");
    }
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      
      const { updateProfile } = await import('firebase/auth');
      await updateProfile(userCredential.user, { displayName: name });

      const userRef = doc(db, 'users', userCredential.user.uid);
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: email,
        name: name,
        status: 'incomplete',
        role: 'admin',
        isPlus: false
      };
      
      await setDoc(userRef, newProfile, { merge: true });
      setProfile(newProfile);
      
      return userCredential;
    } catch (error) {
      console.error("Error registering admin", error);
      throw error;
    }
  };

  const registerAdminWithGoogle = async (secretKey: string) => {
    if (secretKey !== import.meta.env.VITE_ADMIN_MASTER_KEY) {
      throw new Error("Clave maestra inválida.");
    }
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      const userRef = doc(db, 'users', result.user.uid);
      const newProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email || '',
        name: result.user.displayName || '',
        status: 'incomplete',
        role: 'admin',
        isPlus: false
      };
      
      await setDoc(userRef, newProfile, { merge: true });
      setProfile(newProfile);
      
      return result;
    } catch (error) {
      console.error("Error registering admin with Google", error);
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
    // Determine status: always pending for new completions unless already approved, or if the user is an admin
    const finalStatus: UserStatus = (profile?.role === 'admin' || profile?.status === 'approved') ? 'approved' : 'pending';
    
    const updateData = {
      ...data,
      uid: user.uid,
      status: finalStatus,
      updatedAt: serverTimestamp()
    };
    
    await setDoc(userRef, updateData, { merge: true });
    
    // Also update Firebase Auth profile for consistency
    if (data.photoUrl || data.name) {
      try {
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(user, {
          displayName: data.name || user.displayName,
          photoURL: data.photoUrl || user.photoURL
        });
      } catch (authError: any) {
        // Silently fail auth profile update if it's a URL length issue or similar
        // This ensures the main registration (Firestore) isn't blocked
        console.warn("AuthContext: Could not update Firebase Auth profile:", authError.message);
      }
    }

    // Update local profile state
    setProfile(prev => {
      if (prev) return { ...prev, ...updateData as any };
      return updateData as any;
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, profile, loading, loginAsAnonymous, updatePlusStatus, completeUserProfile,
      loginWithGoogle, registerWithEmail, registerAdminWithEmail, registerAdminWithGoogle, loginWithEmail, resetPassword, logout 
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
