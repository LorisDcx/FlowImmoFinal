"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const HeroSection = () => {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <div className="animate-fade-in animation-delay-100">
              <span className="text-sm font-semibold text-[color:var(--accent)] uppercase tracking-wider mb-2 inline-block">
                Simulateur immobilier intelligent
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {currentUser ? (
                  <>
                    <span className="text-[color:var(--primary)]">Bonjour</span>,{' '}
                    <span className="text-[color:var(--secondary)]">{userProfile?.displayName || 'Investisseur'}</span> !
                  </>
                ) : (
                  <>
                    <span className="text-[color:var(--primary)]">Simulez</span> et{' '}
                    <span className="text-[color:var(--secondary)]">Optimisez</span> vos{' '}
                    <span className="relative">
                      <span className="relative z-10">Investissements</span>
                      <span className="absolute bottom-2 left-0 w-full h-3 bg-[color:var(--accent-light)] opacity-40 -z-0"></span>
                    </span>
                  </>
                )}
              </h1>
              <p className="text-lg md:text-xl mb-8 text-[color:var(--text-secondary)]">
                {currentUser ? (
                  <>Continuez à simuler vos projets immobiliers ou consultez vos simulations enregistrées dans votre espace personnel.</>  
                ) : (
                  <>Calculez précisément la rentabilité de vos investissements immobiliers 
                  et prenez des décisions éclairées en quelques clics avec FlowImmo.</>
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {currentUser ? (
                  <>
                    <Link 
                      href="/calculator" 
                      className="btn btn-primary inline-block py-3 px-6 rounded-lg bg-[color:var(--primary)] text-white font-semibold transition-all hover:bg-[color:var(--primary-dark)] transform hover:-translate-y-1"
                    >
                      Nouvelle simulation
                    </Link>
                    <Link 
                      href="/dashboard" 
                      className="btn btn-outline inline-block py-3 px-6 rounded-lg border-2 border-[color:var(--primary)] text-[color:var(--primary)] font-semibold transition-all hover:bg-[color:var(--primary)] hover:text-white transform hover:-translate-y-1"
                    >
                      Mes projets
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/calculator" 
                      className="btn btn-primary inline-block py-3 px-6 rounded-lg bg-[color:var(--primary)] text-white font-semibold transition-all hover:bg-[color:var(--primary-dark)] transform hover:-translate-y-1"
                    >
                      Essayer gratuitement
                    </Link>
                    <Link 
                      href="/premium" 
                      className="btn btn-outline inline-block py-3 px-6 rounded-lg border-2 border-[color:var(--primary)] text-[color:var(--primary)] font-semibold transition-all hover:bg-[color:var(--primary)] hover:text-white transform hover:-translate-y-1"
                    >
                      Découvrir Premium
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-8 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                  ))}
                </div>
                <p className="ml-4 text-sm text-[color:var(--text-secondary)]">
                  {currentUser && userProfile?.userType === 'premium' ? (
                    <><span className="font-bold">✨ Premium</span> - Accès à toutes les fonctionnalités</>
                  ) : (
                    <><span className="font-bold">+2500</span> utilisateurs satisfaits</>
                  )}
                </p>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 relative animate-fade-in animation-delay-300">
            <div className="relative">
              {/* Image principale */}
              <div className="bg-[color:var(--secondary)] rounded-xl p-5 shadow-xl transform rotate-1 transition-transform hover:rotate-0">
                <div className="bg-white bg-opacity-20 rounded-lg overflow-hidden">
                  <div className="h-64 md:h-80 bg-gradient-to-br from-[color:var(--secondary-light)] to-[color:var(--secondary)] rounded-lg relative">
                    {/* Ici nous aurons une vraie image/capture d'écran */}
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      <span className="text-xl font-medium">Interface FlowImmo</span>
                    </div>
                    
                    {/* Éléments flottants */}
                    <div className="absolute top-6 right-6 bg-white p-3 rounded-lg shadow-lg animate-float">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-[color:var(--accent)]"></div>
                        <div className="ml-2">
                          <div className="h-2 w-16 bg-gray-300 rounded-full"></div>
                          <div className="h-2 w-10 bg-gray-200 rounded-full mt-1"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-6 left-6 bg-white p-2 rounded-lg shadow-lg animate-float animation-delay-500">
                      <div className="h-3 w-20 bg-[color:var(--primary)] rounded-full"></div>
                      <div className="h-2 w-12 bg-gray-200 rounded-full mt-1"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Badge flottant */}
              <div className="absolute -bottom-5 -right-5 bg-white p-3 rounded-lg shadow-lg animate-pulse-subtle">
                <div className="flex items-center">
                  <div className="text-[color:var(--accent)] text-2xl font-bold mr-2">+15%</div>
                  <div className="text-xs text-[color:var(--text-secondary)]">de ROI<br/>moyen</div>
                </div>
              </div>
              
              {/* Élément décoratif */}
              <div className="absolute -bottom-10 -left-10 w-20 h-20 bg-[color:var(--accent-light)] rounded-full opacity-30 z-[-1]"></div>
              <div className="absolute -top-5 -right-5 w-10 h-10 bg-[color:var(--primary-light)] rounded-full opacity-20 z-[-1]"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vague décorative en bas */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg 
          className="relative block w-full h-[60px]" 
          data-name="Layer 1" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none"
        >
          <path 
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
            className="fill-[color:var(--background-alt)]"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
