import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import CategoryCard from '../components/CategoryCard';
import SeeMoreButton from '../components/SeeMoreButton';
import TierSection from '../components/TierSection';
import TopHitsSection from '../components/TopHitsSection';
import SEOHead from '../components/SEO/SEOHead';
import { WebsiteSchema, OrganizationSchema, ItemListSchema } from '../components/SEO/StructuredData';
import { chunkArray } from '../utils/arrayUtils';
import categoriesData from '../data/categories.json';
import seoData from '../data/seoData.json';
import { Link } from 'react-router-dom';

const Home = () => {
  const [searchCriteria, setSearchCriteria] = useState({
    keyword: '',
    region: 'global',
    categoryId: ''
  });
  const [filteredCategories, setFilteredCategories] = useState(categoriesData);
  const [visibleChunks, setVisibleChunks] = useState(1);

  useEffect(() => {
    // Filter categories based on search criteria
    let filtered = categoriesData;

    // Filter by keyword
    if (searchCriteria.keyword) {
      const keyword = searchCriteria.keyword.toLowerCase();
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(keyword) ||
        category.description.toLowerCase().includes(keyword) ||
        category.umbrella.toLowerCase().includes(keyword)
      );
    }

    // Filter by category (if a specific category is selected)
    if (searchCriteria.categoryId) {
      filtered = filtered.filter(category => category.id === searchCriteria.categoryId);
    }

    setFilteredCategories(filtered);
  }, [searchCriteria]);

  const handleSearchChange = (newCriteria) => {
    setSearchCriteria(newCriteria);
    setVisibleChunks(1); // Reset to first chunk when search changes
  };

  // Create chunked categories
  const chunkedCategories = useMemo(() => chunkArray(filteredCategories, 4), [filteredCategories]);

  const handleSeeMore = () => {
    setVisibleChunks(prev => prev + 1);
  };

  // Prepare structured data for categories
  const categoryItems = filteredCategories.slice(0, visibleChunks * 4).map(category => ({
    name: category.name,
    description: category.description,
    url: `https://findtheweb.zus3cu.tech/category/${category.slug}`,
    image: category.icon || '/images/category-default.png'
  }));

  return (
    <>
      {/* SEO Head */}
      <SEOHead 
        title={seoData.pages.home.title}
        description={seoData.pages.home.description}
        keywords={seoData.pages.home.keywords}
        image={seoData.pages.home.image}
        url="/"
        type={seoData.pages.home.type}
      />

      {/* Structured Data */}
      <WebsiteSchema 
        name={seoData.site.name}
        url={seoData.site.url}
        description={seoData.site.description}
        author={seoData.site.author}
        sameAs={[
          `https://twitter.com/${seoData.site.twitter}`,
          `https://facebook.com/${seoData.site.facebook}`,
          `https://linkedin.com/${seoData.site.linkedin}`
        ]}
      />

      <OrganizationSchema 
        name={seoData.site.name}
        url={seoData.site.url}
        logo={seoData.site.logo}
        description={seoData.site.description}
        sameAs={[
          `https://twitter.com/${seoData.site.twitter}`,
          `https://facebook.com/${seoData.site.facebook}`,
          `https://linkedin.com/${seoData.site.linkedin}`
        ]}
      />

      <ItemListSchema 
        name="Website Categories"
        description="Curated categories of amazing websites and tools"
        url="https://findtheweb.zus3cu.tech"
        items={categoryItems}
        numberOfItems={filteredCategories.length}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Discover the Best Web Resources
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Find hand-picked websites, tools, and resources to boost your productivity and creativity.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <Link 
                to="/categories"
                className="bg-white text-blue-700 px-8 py-3 rounded-full font-semibold hover:bg-blue-50 transition-colors duration-200"
              >
                Explore Categories
              </Link>
              <Link 
                to="/blog"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
              >
                Read Our Blog
              </Link>
            </div>
          </div>
        </section>

        {/* Top Hits Section */}
        <TopHitsSection />

        {/* Tier Section */}
        <TierSection />

        {/* Search Bar */}
        <SearchBar 
          onSearchChange={handleSearchChange}
          categories={categoriesData}
        />

        {/* Categories Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12" id="categories">
          <section aria-label="Website categories">
            <header className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">
                Explore Categories
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Discover useful websites organized by topic and region. Each category is carefully curated 
                to bring you the best tools and resources available.
              </p>
            </header>

            {/* Search Results Info */}
            {searchCriteria.keyword && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200">
                <p className="text-blue-800 dark:text-blue-200">
                  Showing {filteredCategories.length} categories matching "{searchCriteria.keyword}"
                </p>
              </div>
            )}

            {/* Categories Grid - Chunked */}
            {chunkedCategories.slice(0, visibleChunks).map((chunk, chunkIndex) => (
              <div key={chunkIndex} className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {chunk.map((category) => (
                    <CategoryCard key={category.id} category={category} />
                  ))}
                </div>
              </div>
            ))}

            {/* Show See More button if there are more chunks */}
            {visibleChunks < chunkedCategories.length && (
              <div className="text-center">
                <SeeMoreButton onClick={handleSeeMore} />
              </div>
            )}

            {/* No Results */}
            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-white">
                  No categories found
                </h3>
                <p className="text-gray-600 mb-4 dark:text-gray-300">
                  Try adjusting your search criteria to find more categories.
                </p>
                <button
                  onClick={() => setSearchCriteria({ keyword: '', region: 'global', categoryId: '' })}
                  className="btn-primary"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Category Statistics */}
            {filteredCategories.length > 0 && (
              <div className="mt-12 pt-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
                  Platform Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {filteredCategories.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Categories</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {filteredCategories.filter(cat => cat.umbrella === 'Productivity & Workflow').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Productivity Tools</div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {filteredCategories.filter(cat => cat.umbrella === 'AI & Emerging Tech').length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">AI Tools</div>
                  </div>
                </div>
              </div>
            )}

            {/* Call to Action */}
            <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center text-white">
              <h3 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                We're constantly adding new websites and tools to our collection. 
                Suggest a website or category and help us grow the community.
              </p>
              <a 
                href="/contact" 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
              >
                Suggest a Website
              </a>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Home;