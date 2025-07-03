"use client";

import React from 'react';
import Link from 'next/link';

const CtaSection = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--primary-dark)]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-black">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 animate-fade-in">
            Prêt à optimiser vos investissements immobiliers ?
          </h2>
          <p className="text-xl mb-10 opacity-90 animate-fade-in animation-delay-300">
            Rejoignez des milliers d'investisseurs qui utilisent FlowImmo pour prendre des décisions éclairées et maximiser leur rentabilité.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in animation-delay-500">
            <Link 
              href="/register" 
              className="btn btn-accent py-3 px-8 rounded-lg bg-[color:var(--accent)] text-[color:var(--primary)] font-semibold text-lg transition-all hover:bg-opacity-90 transform hover:-translate-y-1 shadow-lg"
            >
              Créer un compte gratuit
            </Link>
            <Link 
              href="/calculator" 
              className="btn btn-outline-white py-3 px-8 rounded-lg border-2 border-black text-black font-semibold text-lg transition-all hover:bg-white hover:bg-opacity-10 transform hover:-translate-y-1"
            >
              Essayer la démo
            </Link>
          </div>
          
          {/* Trust badges */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-80">
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">🔒</div>
              <p className="text-sm">Paiement sécurisé</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-sm">Mise en route instantanée</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">🔄</div>
              <p className="text-sm">Remboursement 30 jours</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">🛠️</div>
              <p className="text-sm">Support réactif</p>
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
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" 
            className="fill-[color:var(--background)]"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default CtaSection;
