import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import Concierge from './Concierge';
import { CommandSearch } from './CommandSearch';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { config, addSubscriber, isGalleryActive } = useSite();
  const { user, isAdmin, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const location = useLocation();
  const isHome = location.pathname === '/';
  // const isAdminRoute = location.pathname.startsWith('/admin'); // Not used since we have isAdmin from useAuth
  const isLogin = location.pathname === '/login' || location.pathname === '/signup';

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsProfileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
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

    const handleOpenConcierge = (e: any) => {
      setIsConciergeOpen(true);
    };
    window.addEventListener('open-concierge', handleOpenConcierge);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-concierge', handleOpenConcierge);
    };
  }, [isSearchOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
      if (mobileMenuRef.current) {
        mobileMenuRef.current.scrollTop = 0;
      }
    } else {
      document.body.style.overflow = '';
    }
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
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  if (isLogin) {
    return <div className="flex flex-col min-h-screen font-sans bg-background-light">{children}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen font-sans">
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 px-6 md:px-10 lg:px-40 py-0 flex items-center justify-between border-b ${isGalleryActive ? 'opacity-0 pointer-events-none visibility-hidden' : ''} ${isScrolled || !isHome
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

            {/* Auth Link */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className={`p-2 flex items-center gap-2 rounded-full border transition-all ${isScrolled || !isHome ? 'border-gray-100 bg-gray-50' : 'border-white/10 bg-white/5'}`}
                >
                  <div className="w-6 h-6 rounded-full bg-gold text-white flex items-center justify-center text-[10px] font-black">
                    {user.displayName?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>

                {isProfileMenuOpen && (
                  <div className="absolute top-full right-0 mt-4 w-56 bg-white rounded-3xl shadow-2xl border border-gray-100 py-3 animate-fade-in text-charcoal overflow-hidden group/menu">
                    <div className="px-5 py-3 border-b border-gray-50 flex flex-col gap-0.5 mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gold">Welcome</p>
                      <p className="text-sm font-bold truncate">{user.displayName || 'Patron'}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={handleNavClick}
                      className="px-5 py-3 flex items-center gap-3 text-xs font-bold hover:bg-gold/5 hover:text-gold transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      My Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={handleNavClick}
                        className="px-5 py-3 flex items-center gap-3 text-xs font-bold hover:bg-gold/5 hover:text-gold transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-5 py-3 flex items-center gap-3 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={`p-2 transition-colors ${isScrolled || !isHome ? 'text-gray-400' : 'text-white/70'} hover:text-gold`}
                aria-label="Login"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

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

      </header>

      <main className="flex-1 page-fade-in" key={location.pathname}>{children}</main>

      <CommandSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Premium Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-[100] md:hidden transition-all duration-500 ${isMobileMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
        {/* Blurred Backdrop */}
        <div
          className={`absolute inset-0 transition-all duration-700 bg-charcoal/40 backdrop-blur-xl ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sliding Content Container */}
        <div className={`absolute inset-y-0 right-0 w-full max-w-sm bg-charcoal shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div ref={mobileMenuRef} className="flex flex-col h-full pt-24 px-10 pb-10 overflow-y-auto no-scrollbar relative">
            {/* Close Button Inside Drawer */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-8 right-8 p-3 text-white/50 hover:text-gold transition-colors touch-active"
              aria-label="Close Mobile Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col gap-1 mb-10">
              <span className="text-gold font-black uppercase tracking-[0.4em] text-[8px]">Navigation</span>
              <h2 className="text-2xl font-serif text-white italic">The Collection</h2>
            </div>

            <nav className="flex flex-col gap-6">
              {config.navLinks.map((link, i) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.id}
                    to={link.path}
                    onClick={handleNavClick}
                    className={`text-2xl font-serif transition-all stagger-item stagger-${i + 1} ${isActive
                      ? 'text-gold translate-x-2'
                      : 'text-white/80 hover:text-gold hover:translate-x-2'
                      }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="h-px w-10 bg-white/10 my-1" />

              <Link
                to="/wishlist"
                onClick={handleNavClick}
                className={`text-xl font-serif transition-all stagger-item stagger-5 ${location.pathname === '/wishlist'
                  ? 'text-gold translate-x-2'
                  : 'text-white/60 hover:text-gold hover:translate-x-2'
                  }`}
              >
                My Selection
              </Link>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={handleNavClick}
                    className={`text-xl font-serif transition-all stagger-item stagger-6 ${location.pathname === '/profile'
                      ? 'text-gold translate-x-2'
                      : 'text-white/60 hover:text-gold hover:translate-x-2'
                      }`}
                  >
                    Guest Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={handleNavClick}
                      className="text-xl font-serif text-primary/80 hover:text-primary transition-all stagger-item stagger-6"
                    >
                      Management
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-xl font-serif text-red-400/60 hover:text-red-400 transition-all text-left stagger-item stagger-6"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={handleNavClick}
                  className={`text-2xl font-serif transition-all stagger-item stagger-6 ${location.pathname === '/login'
                    ? 'text-gold translate-x-2'
                    : 'text-white/60 hover:text-gold hover:translate-x-2'
                    }`}
                >
                  Guest Entrance
                </Link>
              )}
            </nav>

            <div className="mt-auto pt-10 border-t border-white/5 animate-fade-in">
              <p className="text-gold font-black uppercase tracking-[0.2em] text-[10px] mb-4">Support 24/7</p>
              <a href={`tel:${config.footer.phone.replace(/\s/g, '')}`} className="text-xl font-bold text-white/90 hover:text-white transition-colors block mb-2">{config.footer.phone}</a>
              <p className="text-[11px] text-white/30 font-medium tracking-wider">Global Support Readiness</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[70] flex flex-col items-end gap-4 fixed-button-container ${isGalleryActive ? 'opacity-0 pointer-events-none visibility-hidden' : 'animate-fade-in'} ${isMobileMenuOpen ? 'hidden' : ''}`}>
        <Concierge
          isOpen={isConciergeOpen}
          onClose={() => setIsConciergeOpen(false)}
          roomId={location.pathname.startsWith('/rooms/') ? location.pathname.split('/').pop() : undefined}
        />
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

      <footer className="bg-white border-t border-gray-200 pt-12 md:pt-20 pb-10 px-6 md:px-10 lg:px-40">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-20">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 text-charcoal">
              <img src="/logo.png" alt="C1002 Quarters" className="h-24 md:h-40 w-auto object-contain" />
            </div>
            <p className="text-gray-500 text-xs md:text-sm leading-loose">
              {config.footer.aboutText}
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gold">Explore</h4>
            <ul className="flex flex-col gap-4 text-xs md:text-sm text-gray-500">
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
            <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gold">Contact</h4>
            <ul className="flex flex-col gap-4 text-xs md:text-sm text-gray-500">
              <li className="flex gap-3">{config.footer.address}</li>
              <li className="flex gap-3 font-bold text-charcoal">{config.footer.phone}</li>
              <li className="flex gap-3">{config.footer.email}</li>
            </ul>
          </div>
          <div className="flex flex-col gap-6">
            <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest text-gold">News</h4>
            <p className="text-xs md:text-sm text-gray-500">Sign up for news and special gifts.</p>
            <div className="relative group">
              {isSubscribed ? (
                <div className="bg-charcoal text-white p-6 rounded-2xl border border-gold/30 animate-fade-in relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gold/10 rounded-bl-full"></div>
                  <div className="relative z-10">
                    <p className="text-gold font-black uppercase tracking-[0.3em] text-[10px] mb-2">Welcome to</p>
                    <h5 className="font-serif text-xl mb-2 italic">The Inner Circle</h5>
                    <p className="text-[13px] text-white/60 leading-relaxed font-light">
                      You are now part of Accra's most exclusive stay network. Expect curated gifts shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                  <input
                    className="w-full h-12 rounded-lg border-gray-200 bg-white text-xs md:text-sm focus:ring-gold focus:border-gold placeholder:text-gray-300"
                    placeholder="Email address"
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="h-12 w-full rounded-lg bg-charcoal text-white font-bold text-xs md:text-sm uppercase tracking-widest transition-all hover:bg-primary shadow-lg"
                  >
                    Join The Circle
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] md:text-xs text-gray-400 uppercase tracking-widest">
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
