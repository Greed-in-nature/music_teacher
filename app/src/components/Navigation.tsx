import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './AuthModal';
import PostAdModal from './PostAdModal';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [postAdModalOpen, setPostAdModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isHomePage = location.pathname === '/';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Tanárok', href: '#teachers' },
    { label: 'Hangszer', href: '#instruments' },
    { label: 'Hogyan működik?', href: '#how-it-works' },
    { label: 'Árak', href: '#pricing' },
  ];

  const scrollToSection = (href: string) => {
    if (!isHomePage) {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(href);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.querySelector(href);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleLoginClick = () => {
    setAuthTab('login');
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleRegisterClick = () => {
    setAuthTab('register');
    setAuthModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handlePostAdClick = () => {
    if (!isAuthenticated) {
      setAuthTab('login');
      setAuthModalOpen(true);
    } else {
      setPostAdModalOpen(true);
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className={`nav-fixed transition-all duration-300 ${scrolled || !isHomePage ? 'nav-scrolled py-3' : 'py-5'}`}>
        <div className="w-full px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/"
            className="text-xl font-semibold tracking-tight"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            ZeneTanár.hu
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {isHomePage && navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                className="text-sm font-medium hover:text-[#D7A04D] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Link 
                    to="/admin"
                    className="flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                  >
                    <Shield size={16} />
                    Admin
                  </Link>
                )}
                <Link 
                  to="/profil"
                  className="flex items-center gap-2 text-sm font-medium hover:text-[#D7A04D] transition-colors"
                >
                  <User size={16} />
                  {user?.first_name}
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Kijelentkezés"
                >
                  <LogOut size={18} />
                </button>
                <button 
                  onClick={handlePostAdClick}
                  className="btn-primary text-sm"
                >
                  Hirdetés feladása
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleLoginClick}
                  className="btn-ghost text-sm"
                >
                  Bejelentkezés
                </button>
                <button 
                  onClick={handlePostAdClick}
                  className="btn-primary text-sm"
                >
                  Hirdetés feladása
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-[#F4F2EE] border-t border-gray-200 py-6 px-6 shadow-lg">
            <div className="flex flex-col gap-4">
              {isHomePage && navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                  className="text-lg font-medium py-2"
                >
                  {link.label}
                </a>
              ))}
              
              {isAuthenticated && (
                <>
                  <hr className="my-2" />
                  <Link 
                    to="/profil"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2"
                  >
                    <User size={18} />
                    Profilom
                  </Link>
                  {isAdmin && (
                    <Link 
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-2 text-purple-600"
                    >
                      <Shield size={18} />
                      Adminisztráció
                    </Link>
                  )}
                </>
              )}
              
              <hr className="my-2" />
              
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 py-2 text-red-600"
                  >
                    <LogOut size={18} />
                    Kijelentkezés
                  </button>
                  <button 
                    onClick={handlePostAdClick}
                    className="btn-primary w-full text-center mt-2"
                  >
                    Hirdetés feladása
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleLoginClick}
                    className="btn-ghost w-full text-center"
                  >
                    Bejelentkezés
                  </button>
                  <button 
                    onClick={handleRegisterClick}
                    className="btn-primary w-full text-center"
                  >
                    Regisztráció
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Modals */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        defaultTab={authTab}
      />
      <PostAdModal 
        open={postAdModalOpen} 
        onOpenChange={setPostAdModalOpen}
      />
    </>
  );
};

export default Navigation;
