"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

export default function PremiumPage() {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Lien Stripe Checkout
  const stripeCheckoutLink = "https://buy.stripe.com/test_9B69AV1IB50158Nd0u2go00";
  
  // Simuler la mise à jour du statut premium (pour test seulement, à remplacer par webhook Stripe)
  const handleActivatePremiumTest = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        userType: "premium",
        premiumActivatedAt: new Date(),
      });
      
      alert("Mode premium activé avec succès ! (Version de test)");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Erreur lors de l'activation premium:", error);
      alert("Une erreur est survenue lors de l'activation du mode premium.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckoutRedirect = () => {
    // Rediriger vers la page de paiement Stripe
    window.location.href = stripeCheckoutLink;
  };

  const features = [
    {
      name: "Sauvegarde illimitée",
      description: "Sauvegardez autant de projets immobiliers que vous souhaitez",
      included: true
    },
    {
      name: "Analyse approfondie",
      description: "Accédez à des métriques avancées et à des analyses détaillées",
      included: true
    },
    {
      name: "Simulation multi-scénarios",
      description: "Comparez plusieurs scénarios pour un même bien",
      included: true
    },
    {
      name: "Prévisions financières",
      description: "Projetez vos revenus sur 10, 15 ou 20 ans",
      included: true
    },
    {
      name: "Exports PDF personnalisés",
      description: "Générez des rapports détaillés avec votre logo",
      included: true
    },
    {
      name: "Support prioritaire",
      description: "Obtenez des réponses à vos questions dans les 24h",
      included: true
    }
  ];

  if (currentUser && userProfile?.userType === "premium") {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto mt-12 text-center">
            <div className="inline-block p-4 bg-yellow-100 rounded-full mb-6">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="text-4xl font-bold mb-6 text-[color:var(--primary)]">
              Vous êtes déjà un membre Premium !
            </h1>
            <p className="text-xl mb-8 text-gray-600">
              Profitez de toutes les fonctionnalités avancées de FlowImmo pour optimiser vos investissements immobiliers.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-[color:var(--primary)] text-white rounded-lg hover:bg-opacity-90 transition-all"
              >
                Voir mes projets
              </button>
              <button
                onClick={() => router.push('/calculator')}
                className="px-6 py-3 border border-[color:var(--primary)] text-[color:var(--primary)] rounded-lg hover:bg-gray-50 transition-all"
              >
                Nouvelle simulation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto mt-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[color:var(--primary)]">
              Passez à l'offre <span className="text-[color:var(--secondary)]">Premium</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Débloquez toutes les fonctionnalités de FlowImmo et optimisez vos investissements immobiliers comme jamais auparavant.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-[color:var(--secondary)] mb-12">
            <div className="bg-gradient-to-r from-[color:var(--secondary)] to-[color:var(--primary)] p-6 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Plan Premium</h2>
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl font-bold">9,90€</span>
                <span className="text-xl">/mois</span>
              </div>
              <p className="opacity-80 mt-2">Accès à toutes les fonctionnalités</p>
            </div>
            
            <div className="p-6">
              <div className="grid gap-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1 text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium">{feature.name}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-4">
                <button
                  onClick={handleCheckoutRedirect}
                  disabled={isLoading}
                  className="w-full py-4 bg-[color:var(--secondary)] text-white rounded-lg font-bold hover:bg-opacity-90 transition-all"
                >
                  {isLoading ? "Traitement..." : "Passer à l'offre Premium"}
                </button>
                {/* Bouton pour test uniquement - À retirer en production */}
                {currentUser && (
                  <button
                    onClick={handleActivatePremiumTest}
                    disabled={isLoading}
                    className="w-full py-2 border border-gray-300 text-sm text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    [Test] Activer Premium sans paiement
                  </button>
                )}
                {!currentUser && (
                  <button
                    onClick={() => router.push('/login?redirect=/premium')}
                    className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    Se connecter pour continuer
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 text-center text-sm text-gray-600">
              Paiement sécurisé via Stripe - Annulation possible à tout moment
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold mb-4 text-[color:var(--primary)]">Questions fréquentes</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Comment fonctionne l'abonnement Premium ?</h3>
                <p className="text-gray-600">L'abonnement est mensuel et vous donne accès à toutes les fonctionnalités avancées de FlowImmo. Vous pouvez annuler à tout moment.</p>
              </div>
              <div>
                <h3 className="font-medium">Puis-je annuler mon abonnement ?</h3>
                <p className="text-gray-600">Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace personnel.</p>
              </div>
              <div>
                <h3 className="font-medium">Comment est géré le paiement ?</h3>
                <p className="text-gray-600">Les paiements sont sécurisés et traités par Stripe, l'un des leaders mondiaux du paiement en ligne.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
