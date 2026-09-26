'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import LocaleSwitcher from './LocaleSwitcher';

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/products', label: t('products') },
    { href: '/factory', label: t('factory') },
    { href: '/services', label: t('services') },
    { href: '/contact', label: t('contact') },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="/images/logo/logo-primary.jpg" 
              alt="Yayuhong Knitwear Logo" 
              className="w-10 h-10 rounded-lg object-cover shadow-sm"
            />
            <div className="hidden sm:block">
              <div className={`font-bold text-base leading-tight ${isScrolled ? 'text-[var(--color-primary)]' : 'text-white'}`}>
                {locale === 'zh' ? '亚裕鸿毛织' : 'Yayuhong Knit'}
              </div>
              <div className={`text-xs ${isScrolled ? 'text-[var(--color-text-muted)]' : 'text-white/60'}`}>
                {locale === 'zh' ? '快时尚源头工厂' : 'Fast Fashion Factory'}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link text-sm font-medium ${
                  isScrolled
                    ? isActive(item.href)
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]'
                    : isActive(item.href)
                    ? 'text-[var(--color-secondary-light)]'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side: Locale + CTA + Mobile menu */}
          <div className="flex items-center gap-3">
            <LocaleSwitcher isScrolled={isScrolled} />
            
            <Link
              href="/contact"
              className="hidden md:inline-flex btn-primary !py-2.5 !px-5 text-sm"
            >
              {t('getQuote')}
            </Link>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                className={`w-6 h-6 transition-colors ${isScrolled ? 'text-[var(--color-primary)]' : 'text-white'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 bg-white rounded-xl shadow-lg p-4 animate-fade-in-up">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`py-3 px-4 rounded-lg text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-[var(--color-warm-gray)] text-[var(--color-accent)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-warm-gray)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-primary mt-2 justify-center"
              >
                {t('getQuote')}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
