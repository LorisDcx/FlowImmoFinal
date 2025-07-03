"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { currentUser, logOut, userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'Accueil', href: '/' },
    { name: 'Calculateur', href: '/calculator' },
    { name: 'Premium', href: '/premium' },
    ...(currentUser ? [{ name: 'Dashboard', href: '/dashboard' }] : []),
  ];

  const isActive = (path: string) => pathname === path;
  
  const handleLogout = async () => {
    try {
      await logOut();
      router.push('/');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
    setProfileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="relative">
            <span className="text-2xl font-bold text-[color:var(--primary)]">
              Flow<span className="text-[color:var(--secondary)]">Immo</span>
            </span>
            <span className="absolute -top-1 -right-3 h-2 w-2 bg-[color:var(--accent)] rounded-full animate-pulse-subtle"></span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link 
              href={link.href} 
              key={link.name}
              className={`font-medium transition-all duration-300 ${
                isActive(link.href)
                  ? 'text-[color:var(--secondary)] border-b-2 border-[color:var(--secondary)]'
                  : 'text-[color:var(--text-secondary)] hover:text-[color:var(--primary)]'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Authentication Buttons or User Profile */}
        <div className="hidden md:flex items-center space-x-4">
          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-[color:var(--primary)]">
                  {userProfile?.displayName || currentUser.email?.split('@')[0]}
                </span>
                <div className="w-8 h-8 bg-[color:var(--primary)] text-white rounded-full flex items-center justify-center">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <svg className={`w-4 h-4 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setProfileMenuOpen(false)}>
                    Tableau de bord
                  </Link>
                  <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setProfileMenuOpen(false)}>
                    Mon profil
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100">
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="btn btn-outline">
                Connexion
              </Link>
              <Link href="/register" className="btn btn-primary animate-pulse-subtle">
                Essai Gratuit
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden flex items-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        >
          <svg 
            className={`w-6 h-6 transition-transform duration-300 ${mobileMenuOpen ? 'rotate-90' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            {mobileMenuOpen ? (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            ) : (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div 
          className={`fixed right-0 top-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-5">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xl font-bold text-[color:var(--primary)]">
                Flow<span className="text-[color:var(--secondary)]">Immo</span>
              </span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Fermer le menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col space-y-6">
              {navLinks.map((link) => (
                <Link 
                  href={link.href} 
                  key={link.name}
                  className={`font-medium transition-all duration-300 ${
                    isActive(link.href)
                      ? 'text-[color:var(--secondary)]'
                      : 'text-[color:var(--text-secondary)] hover:text-[color:var(--primary)]'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-200">
                {currentUser ? (
                  <>
                    <div className="mb-3 flex items-center">
                      <div className="w-8 h-8 bg-[color:var(--primary)] text-white rounded-full flex items-center justify-center mr-2">
                        {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="font-medium">{userProfile?.displayName || 'Utilisateur'}</p>
                        <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                    <Link 
                      href="/profile" 
                      className="block w-full text-center py-2 mb-3 border border-[color:var(--primary)] text-[color:var(--primary)] rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mon profil
                    </Link>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-center py-2 bg-red-600 text-white rounded-md"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="block w-full text-center py-2 mb-3 border border-[color:var(--primary)] text-[color:var(--primary)] rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Connexion
                    </Link>
                    <Link 
                      href="/register" 
                      className="block w-full text-center py-2 bg-[color:var(--primary)] text-white rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Essai Gratuit
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
