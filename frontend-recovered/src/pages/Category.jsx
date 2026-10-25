import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import WebsiteCard from '../components/WebsiteCard';
import categoriesData from '../data/categories.json';
import websitesData from '../data/websites.json';

const Category = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState({
    keyword: '',
    region: 'global'
  });

  useEffect(() => {
    // Find the category by slug
    const foundCategory = categoriesData.find(cat => cat.slug === slug);
    setCategory(foundCategory);

    if (foundCategory) {
      // Filter websites by category
      const categoryWebsites = websitesData.filter(website => 
        website.categoryId === foundCategory.id
      );
      setWebsites(categoryWebsites);
    }
  }, [slug]);

  useEffect(() => {
    if (!category) return;

    // Filter websites based on search criteria
    let filtered = websitesData.filter(website => website.categoryId === category.id);

    // Filter by keyword
    if (searchCriteria.keyword) {
      const keyword = searchCriteria.keyword.toLowerCase();
      filtered = filtered.filter(website =>
        website.name.toLowerCase().includes(keyword) ||
        website.description.toLowerCase().includes(keyword)
      );
    }

    // Filter by region
    if (searchCriteria.region && searchCriteria.region !== 'global') {
      filtered = filtered.filter(website =>
        website.regions && website.regions.includes(searchCriteria.region)
      );
    }

    setWebsites(filtered);
  }, [category, searchCriteria]);

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Category not found
            </h1>
            <Link to="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      {/* Search Bar */}
      <SearchBar 
        onSearchChange={setSearchCriteria}
        categories={[category]}
      />

      {/* Category Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <li>
              <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">
                Home
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-gray-900 dark:text-white font-medium">
              {category.name}
            </li>
          </ol>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            {category.icon && (
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center dark:from-primary-800 dark:to-primary-700">
                <span className="text-2xl">{category.icon}</span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {category.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                {category.description}
              </p>
            </div>
          </div>
          
          {category.umbrella && (
            <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm dark:bg-gray-700 dark:text-gray-300">
              {category.umbrella}
            </span>
          )}
        </div>

        {/* Search Results Info */}
        {searchCriteria.keyword && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200">
            <p className="text-blue-800 dark:text-blue-200">
              Showing {websites.length} websites matching "{searchCriteria.keyword}" in {category.name}
            </p>
          </div>
        )}

        {/* Websites Grid */}
        {websites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {websites.map((website) => (
              <WebsiteCard key={website.id} website={website} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-white">
              No websites found
            </h3>
            <p className="text-gray-600 mb-4 dark:text-gray-300">
              Try adjusting your search criteria to find more websites in this category.
            </p>
            <button
              onClick={() => setSearchCriteria({ keyword: '', region: 'global' })}
              className="btn-primary"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Category Statistics */}
        {websites.length > 0 && (
          <div className="mt-12 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{websites.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Websites</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {websites.filter(site => site.regions && site.regions.includes('global')).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Global</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {websites.filter(site => site.regions && site.regions.some(r => r !== 'global')).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Regional</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Category; 