import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBookmarks } from '../context/BookmarkContext';
import { useAnalytics } from '../hooks/useAnalytics';
import BookmarkSidebar from './BookmarkSidebar';
import ThemeToggleButton from './ThemeToggleButton';
import GitHubStarsChip from './GitHubStarsChip';
import { StarIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { bookmarkCount } = useBookmarks();
  const { trackClick } = useAnalytics();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleBookmarkClick = () => {
    trackClick('bookmarks_open', {
      bookmarkCount,
      source: 'header'
    });
    setIsSidebarOpen(true);
  };

  const handleLogoClick = () => {
    trackClick('logo_click', {
      currentPath: location.pathname,
      source: 'header'
    });
  };

  const navigationItems = [
    { name: 'Home', href: '/', current: location.pathname === '/' },
    { name: 'Categories', href: '/categories', current: location.pathname === '/categories' },
    { name: 'Blog', href: '/blog', current: location.pathname.startsWith('/blog') },
    { name: 'About', href: '/about', current: location.pathname === '/about' },
    { name: 'Contact', href: '/contact', current: location.pathname === '/contact' }
  ];

  // Generate structured data for the header/navigation
  const navigationStructuredData = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    "name": "Main Navigation",
    "url": "https://findtheweb.zus3cu.tech",
    "hasPart": navigationItems.map(item => ({
      "@type": "WebPage",
      "name": item.name,
      "url": `https://findtheweb.zus3cu.tech${item.href}`
    }))
  };

  // Scroll handler for hide/show header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px - hide header
        setIsVisible(false);
      } else {
        // Scrolling up - show header
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <>
      {/* Skip Navigation Link for Accessibility */}
      <a 
        href="#main-content" 
        onClick={event => {
          const target = document.querySelector('#root main, #root [role="main"]') || document.querySelector('#root h1');
          if (target) { event.preventDefault(); target.tabIndex = -1; target.focus(); target.scrollIntoView({block:'start'}); }
        }}
        className="skip-nav sr-only focus:not-sr-only focus:absolute focus:top-6 focus:left-6 focus:z-50"
      >
        Skip to main content
      </a>

      {/* Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(navigationStructuredData) }}
      />

      <header 
        className={`bg-white/95 backdrop-blur-xl sticky top-0 z-40 shadow-sm dark:bg-gray-900/95 ${isVisible ? 'translate-y-0' : '-translate-y-full'} transition-transform duration-300`}
        role="banner"
        itemScope
        itemType="https://schema.org/WPHeader"
      >
        <nav 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="flex justify-between items-center h-14">
            {/* Site Logo and Name */}
            <div className="flex items-center space-x-3">
              <Link 
                to="/" 
                onClick={handleLogoClick}
                className="flex items-center space-x-3 focus-visible:focus"
                aria-label="FindTheWeb - Go to homepage"
                itemProp="url"
              >
                <img 
                  src="/logo.png" 
                  alt="FindTheWeb - Discover Hidden Internet Gems" 
                  className="h-28 w-auto seo-image"
                  itemProp="logo"
                  width="112"
                  height="112"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                to="/"
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  location.pathname === '/' ? 'text-blue-600 font-medium' : ''
                }`}
              >
                Home
              </Link>
              <Link
                to="/categories"
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  location.pathname.startsWith('/categories') || location.pathname.startsWith('/category') ? 'text-blue-600 font-medium' : ''
                }`}
              >
                Categories
              </Link>
              <Link
                to="/blog"
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  location.pathname.startsWith('/blog') ? 'text-blue-600 font-medium' : ''
                }`}
              >
                Blog
              </Link>
              <Link
                to="/about"
                className={`text-gray-700 hover:text-blue-600 transition-colors ${
                  location.pathname === '/about' ? 'text-blue-600 font-medium' : ''
                }`}
              >
                About
              </Link>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-3">
              {/*<GitHubStarsChip />*/}
              <ThemeToggleButton />
              
              {/* Bookmarks Button */}
              <button
                onClick={handleBookmarkClick}
                className="flex items-center space-x-2 bg-primary-50 hover:bg-primary-100 text-primary-700 px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-600 dark:hover:bg-primary-700 dark:text-white focus-visible:focus"
                aria-label={`Open bookmarks sidebar (${bookmarkCount} bookmarked sites)`}
                title={`View your ${bookmarkCount} bookmarked websites`}
              >
                <StarIcon className="h-5 w-5" />
                <span className="font-medium">{bookmarkCount}</span>
                <span className="sr-only">bookmarked websites</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800 focus-visible:focus"
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
              <div className="flex flex-col space-y-3">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 text-base font-medium rounded-lg transition-colors duration-200 focus-visible:focus ${
                      item.current
                        ? 'text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20'
                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary-400 dark:hover:bg-gray-800'
                    }`}
                    aria-current={item.current ? 'page' : undefined}
                    onClick={() => {
                      trackClick('mobile_nav_click', { 
                        itemName: item.name, 
                        itemHref: item.href,
                        source: 'mobile_nav'
                      });
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Bookmark Sidebar */}
      <BookmarkSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </>
  );
};

export default Header;
