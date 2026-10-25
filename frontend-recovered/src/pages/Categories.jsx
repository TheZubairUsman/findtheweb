import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import Header from '../components/Header';
import SEOHead from '../components/SEO/SEOHead';
import { BreadcrumbStructuredData } from '../components/SEO/StructuredData';
import categories from '../data/categories.json';
import websites from '../data/websites.json';

const Categories = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories', isLast: true }
  ];

  // Function to get website count for a category
  const getWebsiteCount = (categoryId) => {
    return websites.filter(website => website.categoryId === categoryId).length;
  };

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    const query = searchQuery.toLowerCase();
    return categories.filter(category => 
      category.name.toLowerCase().includes(query) ||
      (category.description && category.description.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);

  return (
    <>
      <SEOHead
        title="All Categories - FindTheWeb"
        description="Browse all website categories on FindTheWeb. Discover productivity tools, development resources, design assets, and more curated web gems."
        keywords="categories, web tools, productivity, development, design, resources"
        url="https://findtheweb.zus3cu.tech/categories"
        type="website"
      />

      <BreadcrumbStructuredData breadcrumbs={breadcrumbItems} />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              All Categories
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Explore our curated collection of websites organized by category. 
              Find exactly what you're looking for.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Categories Grid */}
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group block bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 border border-gray-200 dark:border-gray-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-800 dark:to-primary-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                          {category.icon ? (
                            <span 
                              className="text-2xl"
                              role="img"
                              aria-label={`${category.name} icon`}
                              style={{
                                filter: 'saturate(1.2) brightness(1.1)',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                            >
                              {category.icon}
                            </span>
                          ) : (
                            <MagnifyingGlassIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {category.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                          {category.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
                            {getWebsiteCount(category.id)} {getWebsiteCount(category.id) === 1 ? 'tool' : 'tools'}
                          </span>
                          <span className="text-sm font-medium text-primary-600 dark:text-primary-400 group-hover:underline inline-flex items-center">
                            Explore
                            <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No categories found matching "{searchQuery}".
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Categories;
