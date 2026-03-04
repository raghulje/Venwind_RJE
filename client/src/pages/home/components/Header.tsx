import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

interface HeaderData {
  companyName?: string;
  logoUrl?: string;
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [headerData, setHeaderData] = useState<HeaderData>({});
  const location = useLocation();

  useEffect(() => {
    const fetchHeaderData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cms/home/cms/header`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data && Object.keys(result.data).length > 0) {
            setHeaderData(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching header content from API:', error);
        // Fallback to localStorage
        const savedContent = localStorage.getItem('cms_home_header');
        if (savedContent) {
          try {
            setHeaderData(JSON.parse(savedContent));
          } catch (e) {
            console.error('Error loading header from localStorage:', e);
          }
        }
      }
    };

    fetchHeaderData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        setIsScrolled(true);
        if (currentScrollY > lastScrollY) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        setIsScrolled(false);
        setIsVisible(true);
      }

      // Show scroll to top button when scrolled down
      setShowScrollTop(currentScrollY > 500);
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isHomePage = location.pathname === '/';

  return (
    <>
      <style>{`
        .nav-link {
          position: relative;
          display: inline-block;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background-color: #8DC63F;
          transition: width 0.3s ease;
        }
        .nav-link:hover::after {
          width: 100%;
        }
        .nav-link.active::after {
          width: 100%;
        }
      `}</style>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${isHomePage && !isScrolled ? 'bg-transparent' : 'bg-white shadow-md'}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <a href="/" className="block">
                {headerData.logoUrl ? (
                  <img 
                    src={headerData.logoUrl} 
                    alt={headerData.companyName || "Venwind Refex"} 
                    className="h-16 w-auto"
                  />
                ) : headerData.companyName ? (
                  <span className="text-xl font-bold text-gray-900">{headerData.companyName}</span>
                ) : (
                  <img 
                    src="https://venwindrefex.com/wp-content/uploads/2023/11/logo-venwind-glow.png" 
                    alt="Venwind Refex" 
                    className="h-16 w-auto"
                  />
                )}
              </a>
            </div>

            <nav className="hidden lg:flex items-center space-x-8">
              <a href="/" className={`nav-link ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'} text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/') ? 'active' : ''}`}>HOME</a>
              <a href="/about-us" className={`nav-link ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'} text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/about-us') ? 'active' : ''}`}>ABOUT US</a>
              <a href="/investor-relations" className={`nav-link ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'} text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/investor-relations') ? 'active' : ''}`}>INVESTOR RELATIONS</a>
              <a href="/products" className={`nav-link ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'} text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/products') ? 'active' : ''}`}>PRODUCTS</a>
              <a href="/technology" className={`nav-link ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'} text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/technology') ? 'active' : ''}`}>TECHNOLOGY</a>
              <a href="/sustainability" className={`nav-link ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'} text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/sustainability') ? 'active' : ''}`}>SUSTAINABILITY</a>
              <a href="/careers" className={`nav-link ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'} text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/careers') ? 'active' : ''}`}>CAREERS</a>
              <a href="/contact" className={`nav-link ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'} text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/contact') ? 'active' : ''}`}>CONTACT</a>
            </nav>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'} p-2 cursor-pointer`}
            >
              <i className={`${isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'} text-2xl`}></i>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div 
        className={`fixed top-20 left-0 right-0 bg-white shadow-lg z-40 lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
      >
        <nav className="flex flex-col p-6 space-y-4">
          <a href="/" className={`nav-link text-gray-900 text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/') ? 'active' : ''}`}>HOME</a>
          <a href="/about-us" className={`nav-link text-gray-900 text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/about-us') ? 'active' : ''}`}>ABOUT US</a>
          <a href="/investor-relations" className={`nav-link text-gray-900 text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/investor-relations') ? 'active' : ''}`}>INVESTOR RELATIONS</a>
          <a href="/products" className={`nav-link text-gray-900 text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/products') ? 'active' : ''}`}>PRODUCTS</a>
          <a href="/technology" className={`nav-link text-gray-900 text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/technology') ? 'active' : ''}`}>TECHNOLOGY</a>
          <a href="/sustainability" className={`nav-link text-gray-900 text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/sustainability') ? 'active' : ''}`}>SUSTAINABILITY</a>
          <a href="/careers" className={`nav-link text-gray-900 text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/careers') ? 'active' : ''}`}>CAREERS</a>
          <a href="/contact" className={`nav-link text-gray-900 text-sm font-bold hover:text-[#8DC63F] transition-colors whitespace-nowrap ${isActive('/contact') ? 'active' : ''}`}>CONTACT</a>
        </nav>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 z-50 bg-[#8DC63F] hover:bg-[#7AB62F] text-white w-12 h-12 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <i className="ri-arrow-up-line text-xl"></i>
      </button>
    </>
  );
}