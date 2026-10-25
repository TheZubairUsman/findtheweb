import React, { useEffect, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BookmarkProvider } from './context/BookmarkContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Categories from './pages/Categories';
import Category from './pages/Category';
import Bookmarks from './pages/Bookmarks';
import About from './pages/About';
import Contact from './pages/Contact';
import Support from './pages/Support';
import ThankYou from './pages/ThankYou';
import ProgrammaticPages from './pages/ProgrammaticPages';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import Sitemap from './pages/Sitemap';
import Footer from './components/Footer';
import SEOHead from './components/SEO/SEOHead';
import { Analytics } from './components/SEO/Analytics';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
const WebsiteManager = lazy(() => import('./components/admin/WebsiteManager'));
const BlogManager = lazy(() => import('./components/admin/BlogManager'));
const ProductManager = lazy(() => import('./components/admin/ProductManager'));

// Scroll to top on route change
const ScrollToTop = ({ children }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return children || null;
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider>
            <BookmarkProvider>
              <div className="min-h-screen flex flex-col relative">
                <div className="relative z-10 flex-1">
                  <ScrollToTop>
                    <Routes>
                      {/* Home Route */}
                      <Route path="/" element={<Home />} />

                      {/* Categories Routes */}
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/category/:slug" element={<Category />} />

                      {/* Blog Routes */}
                      <Route path="/products" element={<Blog />} />
                      <Route path="/blog" element={<BlogPage />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />

                      {/* Bookmarks Route */}
                      <Route path="/bookmarks" element={<Bookmarks />} />

                      {/* About Route */}
                      <Route path="/about" element={<About />} />

                      {/* Contact Route */}
                      <Route path="/contact" element={<Contact />} />

                      {/* Support Route */}
                      <Route path="/support" element={<Support />} />

                      {/* Thank You Route */}
                      <Route path="/thank-you" element={<ThankYou />} />

                      {/* Programmatic Pages */}
                      <Route path="/best/:category" element={<ProgrammaticPages />} />
                      <Route path="/tools/:category" element={<ProgrammaticPages />} />
                      <Route path="/websites/:category" element={<ProgrammaticPages />} />

                      {/* Legal Pages */}
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-service" element={<TermsOfService />} />
                      <Route path="/cookie-policy" element={<CookiePolicy />} />
                      <Route path="/sitemap" element={<Sitemap />} />

                      {/* Admin Routes */}
                      <Route path="/admin/login" element={<AdminLogin />} />
                      <Route 
                        path="/admin" 
                        element={
                          <ProtectedRoute>
                            <AdminDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/websites" 
                        element={
                          <ProtectedRoute>
                            <WebsiteManager />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/blog" 
                        element={
                          <ProtectedRoute>
                            <BlogManager />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/products" 
                        element={
                          <ProtectedRoute>
                            <ProductManager />
                          </ProtectedRoute>
                        } 
                      />

                      {/* 404 Route */}
                      <Route path="*" element={
                        <div className="min-h-screen flex items-center justify-center">
                          <div className="text-center">
                            <SEOHead 
                              title="Page Not Found - FindTheWeb"
                              description="The page you're looking for doesn't exist. Discover amazing websites and tools on FindTheWeb."
                              noindex={true}
                            />
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                            <p className="text-gray-600 mb-4">Page not found</p>
                            <a href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                              Go Home
                            </a>
                          </div>
                        </div>
                      } />
                    </Routes>
                  </ScrollToTop>
                </div>
                <Footer />
                <Analytics />
              </div>
            </BookmarkProvider>
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;