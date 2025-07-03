"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Types pour l'authentification
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<User>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;
  userProfile: UserProfile | null;
}

// Type pour le profil utilisateur stocké dans Firestore
export interface UserProfile {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  userType?: 'free' | 'premium';
  createdAt: Date;
  // Vous pouvez ajouter d'autres champs selon vos besoins
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Composant Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction d'inscription
  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      // Créer un compte utilisateur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Mettre à jour le profil utilisateur avec le nom
      await updateProfile(user, {
        displayName: name
      });

      // Créer un document utilisateur dans Firestore
      const userProfileData: UserProfile = {
        uid: user.uid,
        displayName: name,
        email: user.email || "",
        photoURL: user.photoURL || "",
        userType: 'free', // Type d'utilisateur par défaut
        createdAt: new Date()
      };

      await setDoc(doc(db, "users", user.uid), userProfileData);
    } catch (error) {
      throw error;
    }
  };

  // Fonction de connexion
  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Fonction de déconnexion
  const logOut = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  // Fonction de réinitialisation du mot de passe
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };

  // Fonction de mise à jour du profil utilisateur
  const updateUserProfile = async (displayName?: string, photoURL?: string): Promise<void> => {
    if (!currentUser) throw new Error("Aucun utilisateur connecté");
    
    const updates: { displayName?: string; photoURL?: string } = {};
    if (displayName) updates.displayName = displayName;
    if (photoURL) updates.photoURL = photoURL;
    
    try {
      await updateProfile(currentUser, updates);
      
      // Mettre à jour également dans Firestore
      await setDoc(doc(db, "users", currentUser.uid), {
        ...updates,
        updatedAt: new Date()
      }, { merge: true });
      
      // Récupérer le profil mis à jour
      fetchUserProfile(currentUser.uid);
    } catch (error) {
      throw error;
    }
  };

  // Fonction pour récupérer le profil utilisateur depuis Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserProfile(userDoc.data() as UserProfile);
      } else {
        // Si le document n'existe pas, créer un profil par défaut
        const defaultProfile: UserProfile = {
          uid,
          displayName: currentUser?.displayName || "",
          email: currentUser?.email || "",
          photoURL: currentUser?.photoURL || "",
          userType: 'free',
          createdAt: new Date()
        };
        
        await setDoc(userDocRef, defaultProfile);
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du profil utilisateur:", error);
    }
  };

  // Observer le changement d'état de l'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Si un utilisateur est connecté, récupérer son profil
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    // Fonction de nettoyage
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signUp,
    signIn,
    logOut,
    resetPassword,
    updateUserProfile,
    userProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
