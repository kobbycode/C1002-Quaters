
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import Concierge from './Concierge';
import { CommandSearch } from './CommandSearch';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config, addSubscriber } = useSite();
  const [isScrolled, setIsScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin');
  const isLogin = location.pathname === '/login';

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const updateWishlistCount = () => {
      const saved = localStorage.getItem('luxe_wishlist');
      if (saved) {
        setWishlistCount(JSON.parse(saved).length);
      } else {
        setWishlistCount(0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', updateWishlistCount);
    const interval = setInterval(updateWishlistCount, 1000);

    updateWishlistCount();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', updateWishlistCount);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
      // Reset window scroll position
      window.scrollTo(0, 0);
      // Reset mobile menu scroll position
      if (mobileMenuRef.current) {
        mobileMenuRef.current.scrollTop = 0;
      }
    } else {
      // Restore body scroll when mobile menu is closed
      document.body.style.overflow = '';
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      addSubscriber(newsletterEmail);
      setIsSubscribed(true);
      setNewsletterEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  // Skip layout elements for admin panel or login page
  if (isAdmin || isLogin) {
    return <div className="flex flex-col min-h-screen font-sans">{children}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 px-6 md:px-10 lg:px-40 py-0 flex items-center justify-between border-b ${isScrolled || !isHome
          ? 'bg-white text-charcoal border-gray-100 shadow-sm'
          : 'bg-black/10 backdrop-blur-md text-white border-white/10'
          }`}
      >
        <Link to="/" className="flex items-center gap-3 group z-[60]">
          <div className="transition-transform hover:scale-105 -my-12">
            <img src="/logo.png" alt="C1002 Quarters" className={`h-40 w-auto object-contain ${isScrolled || !isHome ? '' : 'brightness-0 invert'}`} />
          </div>
        </Link>

        <div className="flex flex-1 justify-end gap-4 md:gap-6 items-center">
          <nav className="hidden md:flex items-center gap-9">
            {config.navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.id}
                  to={link.path}
                  onClick={handleNavClick}
                  className={`text-sm font-medium transition-colors ${isActive
                    ? 'text-primary'
                    : 'hover:text-primary'
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 md:gap-4 z-[60]">
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`p-2 transition-colors ${isScrolled || !isHome ? 'text-gray-400' : 'text-white/70'} hover:text-gold`}
              aria-label="Search"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <Link to="/wishlist" className="relative group p-2">
              <svg className={`w-6 h-6 transition-colors ${wishlistCount > 0 ? 'text-gold' : (isScrolled || !isHome ? 'text-gray-400' : 'text-white/70')} group-hover:text-gold`} fill={wishlistCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/rooms"
              className="hidden sm:flex min-w-[100px] sm:min-w-[120px] items-center justify-center rounded-lg h-9 sm:h-10 px-4 sm:px-6 bg-primary text-white text-xs sm:text-sm font-bold tracking-wide hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              Book Now
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-black/5 relative z-[101]"
              aria-label="Toggle Mobile Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        <div className={`fixed top-0 left-0 w-screen h-screen z-[100] bg-charcoal transition-transform duration-500 md:hidden overscroll-contain ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div ref={mobileMenuRef} className="flex flex-col h-full pt-20 px-10 pb-10 overflow-y-auto overscroll-contain">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-white hover:text-primary transition-colors z-[101]"
              aria-label="Close Mobile Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <nav className="flex flex-col gap-6">
              {config.navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.id}
                    to={link.path}
                    onClick={handleNavClick}
                    className={`text-2xl font-serif transition-colors ${isActive
                      ? 'text-primary'
                      : 'text-white hover:text-primary'
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                to="/wishlist"
                onClick={handleNavClick}
                className={`text-2xl font-serif transition-colors ${location.pathname === '/wishlist'
                  ? 'text-primary'
                  : 'text-white hover:text-primary'
                  }`}
              >
                Wishlist
              </Link>
            </nav>
            <div className="mt-12 pt-10 border-t border-white/10">
              <p className="text-gold font-black uppercase tracking-[0.2em] text-[10px] mb-4">Concierge 24/7</p>
              <a href={`tel:${config.footer.phone.replace(/\s/g, '')}`} className="text-2xl font-bold text-white">{config.footer.phone}</a>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <CommandSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      <div className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[70] flex flex-col items-end gap-4 ${isMobileMenuOpen ? 'hidden' : ''}`}>
        <Concierge isOpen={isConciergeOpen} onClose={() => setIsConciergeOpen(false)} />
        {!isConciergeOpen && (
          <button
            onClick={() => setIsConciergeOpen(true)}
            className="flex items-center gap-3 group"
            aria-label="Access AI Concierge"
          >
            <div className="hidden md:block bg-charcoal/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 border border-white/10">
              AI Concierge
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full animate-pulse opacity-30"></div>
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 relative z-10 transition-transform hover:scale-110 active:scale-95">
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              </div>
            </div>
          </button>
        )}
      </div>

      <footer className="bg-white border-t border-gray-200 pt-20 pb-10 px-6 md:px-10 lg:px-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 text-charcoal">
              <img src="/logo.png" alt="C1002 Quarters" className="h-40 w-auto object-contain" />
            </div>
            <p className="text-gray-500 text-sm leading-loose">
              {config.footer.aboutText}
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gold">Explore</h4>
            <ul className="flex flex-col gap-4 text-sm text-gray-500">
              {config.navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <li key={link.id}>
                    <Link
                      to={link.path}
                      onClick={handleNavClick}
                      className={isActive ? 'text-primary' : 'hover:text-primary'}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gold">Contact</h4>
            <ul className="flex flex-col gap-4 text-sm text-gray-500">
              <li className="flex gap-3">{config.footer.address}</li>
              <li className="flex gap-3 font-bold text-charcoal">{config.footer.phone}</li>
              <li className="flex gap-3">{config.footer.email}</li>
            </ul>
          </div>
          <div className="flex flex-col gap-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-gold">News</h4>
            <p className="text-sm text-gray-500">Sign up for news and special gifts.</p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                className="w-full h-12 rounded-lg border-gray-200 bg-white text-sm focus:ring-gold focus:border-gold"
                placeholder="Email address"
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className={`h-12 w-full rounded-lg text-white font-bold text-sm uppercase tracking-widest transition-all ${isSubscribed ? 'bg-green-500' : 'bg-charcoal hover:bg-primary'}`}
              >
                {isSubscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} C1002 Quarters. All Rights Reserved.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-gold">Privacy</Link>
            <Link to="#" className="hover:text-gold">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
