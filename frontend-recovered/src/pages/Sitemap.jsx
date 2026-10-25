import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SEOHead from '../components/SEO/SEOHead';
import { BreadcrumbStructuredData } from '../components/SEO/StructuredData';
import categoriesData from '../data/categories.json';

const Sitemap = () => {
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Sitemap', url: '/sitemap' }
  ];

  const mainPages = [
    { name: 'Home', url: '/', description: 'Discover amazing websites and tools' },
    { name: 'Categories', url: '/categories', description: 'Browse all website categories' },
    { name: 'Blog', url: '/blog', description: 'Latest articles and insights' },
    { name: 'About', url: '/about', description: 'Learn about FindTheWeb' },
    { name: 'Contact', url: '/contact', description: 'Get in touch with us' }
  ];

  const legalPages = [
    { name: 'Privacy Policy', url: '/privacy-policy', description: 'How we protect your privacy' },
    { name: 'Terms of Service', url: '/terms-of-service', description: 'Terms and conditions of use' },
    { name: 'Cookie Policy', url: '/cookie-policy', description: 'Information about cookies' }
  ];

  return (
    <>
      <SEOHead 
        title="Sitemap - FindTheWeb"
        description="Complete sitemap of FindTheWeb showing all pages, categories, and resources available on our website discovery platform."
        canonicalUrl="https://findtheweb.net/sitemap"
        type="website"
      />
      
      <BreadcrumbStructuredData breadcrumbs={breadcrumbItems} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Sitemap
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Navigate through all pages and resources available on FindTheWeb. 
              Find exactly what you're looking for with our complete site structure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Main Pages */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                Main Pages
              </h2>
              <ul className="space-y-4">
                {mainPages.map((page) => (
                  <li key={page.url}>
                    <Link 
                      to={page.url}
                      className="block group hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {page.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {page.description}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                Categories
              </h2>
              <div className="max-h-96 overflow-y-auto">
                <ul className="space-y-3">
                  {categoriesData.slice(0, 20).map((category) => (
                    <li key={category.id}>
                      <Link 
                        to={`/category/${category.slug}`}
                        className="block group hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors"
                      >
                        <div className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 text-sm">
                          {category.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {category.umbrella}
                        </div>
                      </Link>
                    </li>
                  ))}
                  {categoriesData.length > 20 && (
                    <li className="pt-2">
                      <Link 
                        to="/categories"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View all {categoriesData.length} categories →
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            </div>

            {/* Legal Pages */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                Legal
              </h2>
              <ul className="space-y-4">
                {legalPages.map((page) => (
                  <li key={page.url}>
                    <Link 
                      to={page.url}
                      className="block group hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        {page.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {page.description}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Additional Info */}
          <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Need Help Finding Something?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Can't find what you're looking for? Use our search feature or contact us for assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search Website
                </Link>
                <Link 
                  to="/contact"
                  className="inline-flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>

        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default Sitemap;
