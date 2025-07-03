"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { currentUser, userProfile, updateUserProfile, logOut } = useAuth();
  const router = useRouter();
  
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!currentUser && !isLoading) {
      router.push('/login?redirect=/profile');
    } else if (userProfile) {
      setDisplayName(userProfile.displayName || '');
    }
  }, [currentUser, userProfile, router, isLoading]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      setIsLoading(true);
      
      await updateUserProfile(displayName);
      
      setSuccess('Profil mis à jour avec succès !');
      setIsEditMode(false);
      
      // Réinitialiser le message de succès après 3 secondes
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du profil:", err);
      setError('Une erreur est survenue lors de la mise à jour du profil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/');
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
    }
  };

  // Afficher un indicateur de chargement si l'utilisateur n'est pas encore chargé
  if (!currentUser || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto mt-12">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-center">Chargement du profil...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto mt-12">
          <h1 className="text-3xl font-bold mb-8 text-center">Mon Profil</h1>
          
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* En-tête du profil */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
              <div className="flex items-center">
                <div className="w-20 h-20 rounded-full bg-white text-blue-600 flex items-center justify-center text-3xl font-bold">
                  {(userProfile.displayName || currentUser.email?.charAt(0) || "U").toUpperCase()}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold">
                    {userProfile.displayName || "Utilisateur"}
                  </h2>
                  <p className="opacity-90">{currentUser.email}</p>
                  <div className="mt-2">
                    <span className="inline-block bg-white bg-opacity-20 text-sm rounded-full px-3 py-1">
                      {userProfile.userType === 'premium' ? '✨ Compte Premium' : 'Compte Gratuit'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contenu du profil */}
            <div className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-500 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-500 text-green-700 px-4 py-3 rounded mb-4">
                  {success}
                </div>
              )}
              
              {isEditMode ? (
                <form onSubmit={handleUpdateProfile}>
                  <div className="mb-4">
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom d'affichage
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditMode(false);
                        setDisplayName(userProfile.displayName || '');
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                      disabled={isLoading}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Mise à jour...' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Adresse email</h3>
                      <p className="mt-1">{currentUser.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nom d'affichage</h3>
                      <p className="mt-1">{userProfile.displayName || "Non défini"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Type de compte</h3>
                      <p className="mt-1">
                        {userProfile.userType === 'premium' ? 'Premium' : 'Gratuit'}
                        {userProfile.userType !== 'premium' && (
                          <button className="ml-2 text-blue-600 text-sm underline">
                            Passer au premium
                          </button>
                        )}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date d'inscription</h3>
                      <p className="mt-1">
                        {userProfile.createdAt instanceof Date 
                          ? userProfile.createdAt.toLocaleDateString() 
                          : new Date((userProfile.createdAt as any)?.seconds * 1000 || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Modifier le profil
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <button 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800"
                >
                  Déconnexion
                </button>
                <Link href="/reset-password" className="text-blue-600 hover:text-blue-800">
                  Changer de mot de passe
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface Link {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function Link({ href, children, className, onClick }: Link) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
    router.push(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
