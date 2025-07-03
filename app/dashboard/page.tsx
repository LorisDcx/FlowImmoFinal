"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { projectService, RealEstateProject } from '@/firebase/services';
import { subscriptionService, Subscription } from '@/firebase/subscriptionService';
import Link from 'next/link';

export default function Dashboard() {
  const { currentUser, loading, userProfile } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<RealEstateProject[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectsCount, setProjectsCount] = useState({ all: 0, favorites: 0 });

  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, loading, router]);

  // Charger les projets de l'utilisateur et les informations d'abonnement
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          setIsLoading(true);
          
          // Charger les projets
          const userProjects = await projectService.getProjectsByUserId(currentUser.uid);
          setProjects(userProjects);
          
          // Calculer les statistiques de projets
          setProjectsCount({
            all: userProjects.length,
            favorites: userProjects.filter(p => p.favorite).length
          });
          
          // Charger les informations d'abonnement si l'utilisateur est premium
          if (userProfile?.userType === 'premium') {
            const subscription = await subscriptionService.getActiveSubscription(currentUser.uid);
            setActiveSubscription(subscription);
          }
        } catch (err) {
          console.error("Erreur lors du chargement des données:", err);
          setError("Impossible de charger vos données. Veuillez réessayer plus tard.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadUserData();
  }, [currentUser, userProfile]);

  // Si l'utilisateur n'est pas connecté et le chargement est terminé
  if (!loading && !currentUser) {
    return null; // La redirection s'occupera de cela
  }

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <button
          onClick={() => router.push('/calculator')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Nouveau calcul
        </button>
      </div>

      {userProfile && (
        <div className="bg-white shadow rounded-lg mb-8 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Profile section */}
            <div className="p-6 flex-1">
              <div className="flex items-start">
                <div className="h-12 w-12 rounded-full bg-[color:var(--primary)] flex items-center justify-center text-white font-bold text-xl">
                  {userProfile.displayName ? userProfile.displayName[0].toUpperCase() : 'U'}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold">{userProfile.displayName || 'Utilisateur'}</h2>
                  <p className="text-gray-600">{userProfile.email}</p>
                  <div className="flex items-center mt-1">
                    {userProfile.userType === 'premium' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ✨ Premium
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Compte Gratuit
                      </span>
                    )}
                    <span className="text-xs text-gray-500 ml-2">
                      Membre depuis {new Date(userProfile.createdAt instanceof Date ? userProfile.createdAt : 
                        ((userProfile.createdAt as any)?.seconds * 1000 || Date.now())).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-500">Projets totaux</div>
                  <div className="text-2xl font-bold">{projectsCount.all}</div>
                </div>
                <div className="border rounded-lg p-3">
                  <div className="text-sm text-gray-500">Projets favoris</div>
                  <div className="text-2xl font-bold">{projectsCount.favorites}</div>
                </div>
              </div>
            </div>
            
            {/* Subscription section */}
            <div className={`p-6 md:w-1/3 ${userProfile.userType === 'premium' ? 'bg-gradient-to-br from-amber-50 to-yellow-100' : 'bg-gray-50'}`}>
              {userProfile.userType === 'premium' ? (
                <div>
                  <h3 className="text-lg font-semibold flex items-center">
                    <span className="mr-2">✨</span> Abonnement Premium
                  </h3>
                  {activeSubscription ? (
                    <div className="mt-2">
                      <p className="text-sm">
                        <span className="font-medium">Plan:</span> {activeSubscription.planName}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Tarif:</span> {activeSubscription.amount} {activeSubscription.currency}/mois
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Début:</span> {new Date(activeSubscription.startDate instanceof Date ? activeSubscription.startDate : 
                          ((activeSubscription.startDate as any)?.seconds * 1000 || Date.now())).toLocaleDateString()}
                      </p>
                      <div className="mt-3">
                        <Link href="/profile" 
                          className="text-sm text-blue-600 hover:text-blue-800 underline">
                          Gérer mon abonnement
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm mt-2">Vous bénéficiez des fonctionnalités premium de FlowImmo.</p>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold">Passez à Premium</h3>
                  <p className="text-sm mt-2 mb-3">Débloquez toutes les fonctionnalités avancées pour optimiser vos investissements immobiliers.</p>
                  <Link href="/premium" 
                    className="inline-block px-4 py-2 bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--secondary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                    Découvrir l'offre Premium
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Mes projets immobiliers</h2>
          <div className="text-sm text-gray-500">
            {userProfile?.userType !== 'premium' && projects.length >= 3 && (
              <span className="text-amber-600 font-medium mr-3">
                Limite: {projects.length}/3 projets 
                <Link href="/premium" className="underline ml-1">Passer à Premium</Link>
              </span>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <p>Chargement de vos projets...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">Vous n'avez pas encore de projets immobiliers.</p>
            <Link href="/calculator" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Créer mon premier projet
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix d'achat
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rendement brut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cash-flow mensuel
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className={project.favorite ? "bg-blue-50" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">{project.description || 'Aucune description'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.inputs.purchasePrice.toLocaleString()} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {project.results.returns.gross.toFixed(2)} %
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.results.cashflow.monthly.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(project.createdAt instanceof Date ? project.createdAt : 
                        ('seconds' in project.createdAt ? project.createdAt.seconds * 1000 : new Date())).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          router.push(`/calculator?projectId=${project.id}`);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Êtes-vous sûr de vouloir supprimer ce projet?')) {
                            try {
                              await projectService.deleteProject(project.id);
                              setProjects(projects.filter(p => p.id !== project.id));
                            } catch (err) {
                              console.error("Erreur lors de la suppression:", err);
                              alert("Impossible de supprimer le projet. Veuillez réessayer.");
                            }
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
