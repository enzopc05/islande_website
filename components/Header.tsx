'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  
  // Force scrolled appearance on non-home pages (like admin)
  const isHome = pathname === '/';
  const forceScrolledStyle = !isHome;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Bloquer le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const shouldShowScrolledStyle = scrolled || forceScrolledStyle;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        shouldShowScrolledStyle
          ? 'glass-light shadow-xl py-4 border-b border-black/5'
          : 'glass-effect py-6'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-4 group">
            <div className="relative">
              <div className={`w-10 h-10 border-2 transition-all duration-300 flex items-center justify-center ${
                shouldShowScrolledStyle ? 'border-[var(--midnight)]' : 'border-white'
              } group-hover:border-[var(--glacier-blue)]`}>
                <svg className={`w-5 h-5 transition-colors ${
                  shouldShowScrolledStyle ? 'text-[var(--midnight)]' : 'text-white'
                } group-hover:text-[var(--glacier-blue)]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <div>
              <h1
                className={`text-xl font-display font-bold tracking-tight transition-colors ${
                  shouldShowScrolledStyle ? 'text-[var(--midnight)]' : 'text-white'
                }`}
              >
                ICELAND
              </h1>
              <p
                className={`text-xs font-serif italic transition-colors ${
                  shouldShowScrolledStyle ? 'text-gray-600' : 'text-white/70'
                }`}
              >
                2026
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-sans uppercase tracking-wider transition-all hover:scale-105 ${
                shouldShowScrolledStyle
                  ? 'text-gray-700 hover:text-[var(--glacier-blue)]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Accueil
            </Link>
            <Link
              href="/#carte"
              className={`text-sm font-sans uppercase tracking-wider transition-all hover:scale-105 ${
                shouldShowScrolledStyle
                  ? 'text-gray-700 hover:text-[var(--glacier-blue)]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Carte
            </Link>
            <Link
              href="/galerie"
              className={`text-sm font-sans uppercase tracking-wider transition-all hover:scale-105 ${
                shouldShowScrolledStyle
                  ? 'text-gray-700 hover:text-[var(--glacier-blue)]'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Galerie
            </Link>
            <Link
              href="/admin"
              className={`px-6 py-2.5 text-xs font-sans uppercase tracking-wider transition-all hover:scale-105 ${
                shouldShowScrolledStyle
                  ? 'bg-[var(--glacier-blue)] text-white hover:bg-[var(--deep-ocean)]'
                  : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
              }`}
            >
              Admin
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors relative z-50 ${
              shouldShowScrolledStyle
                ? 'text-gray-900 hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            }`}
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg
              className="w-6 h-6 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Content */}
        <nav
          className={`absolute top-0 right-0 bottom-0 w-4/5 max-w-sm glass-effect border-l border-white/10 transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full pt-24 px-8">
            {/* Navigation Links */}
            <div className="flex flex-col space-y-6">
              <Link
                href="/"
                className="text-2xl font-display font-bold text-white hover:text-[var(--glacier-blue)] transition-colors"
              >
                Accueil
              </Link>
              <Link
                href="/#carte"
                className="text-2xl font-display font-bold text-white hover:text-[var(--glacier-blue)] transition-colors"
              >
                Carte
              </Link>
              <Link
                href="/galerie"
                className="text-2xl font-display font-bold text-white hover:text-[var(--glacier-blue)] transition-colors"
              >
                Galerie
              </Link>
              <div className="h-px bg-white/10 my-4"></div>
              <Link
                href="/admin"
                className="text-2xl font-display font-bold text-[var(--glacier-blue)] hover:text-white transition-colors"
              >
                Admin →
              </Link>
            </div>

            {/* Footer */}
            <div className="mt-auto pb-8">
              <div className="text-xs text-white/40 uppercase tracking-widest font-sans">
                Iceland Août 2026
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
