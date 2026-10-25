import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEOHead from '../components/SEO/SEOHead';
import { CollectionPageStructuredData, BreadcrumbStructuredData } from '../components/SEO/StructuredData';
import Breadcrumbs from '../components/SEO/Breadcrumbs';
import categories from '../data/categories.json';

const ProgrammaticPages = () => {
  const { type, slug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define programmatic page templates
  const pageTemplates = {
    'best-tools-for': {
      titleTemplate: 'Best {category} Tools & Websites - FindTheWeb',
      descriptionTemplate: 'Discover the best {category} tools and websites. Curated collection of top-rated {category} resources to boost your productivity.',
      keywordsTemplate: 'best {category} tools, {category} websites, {category} resources, top {category} apps',
      h1Template: 'Best {category} Tools & Websites',
      contentTemplate: 'Find the most effective {category} tools and websites to enhance your workflow and productivity.'
    },
    'free-tools-for': {
      titleTemplate: 'Free {category} Tools & Websites - FindTheWeb',
      descriptionTemplate: 'Find the best free {category} tools and websites. No cost, high quality {category} resources for everyone.',
      keywordsTemplate: 'free {category} tools, free {category} websites, no cost {category} resources',
      h1Template: 'Free {category} Tools & Websites',
      contentTemplate: 'Discover amazing free {category} tools that deliver professional results without breaking the bank.'
    },
    'top-rated': {
      titleTemplate: 'Top Rated {category} Tools - FindTheWeb',
      descriptionTemplate: 'Explore top-rated {category} tools and websites based on user reviews and expert recommendations.',
      keywordsTemplate: 'top rated {category} tools, best {category} apps, highly rated {category} websites',
      h1Template: 'Top Rated {category} Tools',
      contentTemplate: 'Browse our collection of the highest-rated {category} tools, vetted by our community and experts.'
    },
    'alternatives-to': {
      titleTemplate: '{category} Alternatives - FindTheWeb',
      descriptionTemplate: 'Find the best alternatives to popular {category} tools. Compare features, pricing, and user reviews.',
      keywordsTemplate: '{category} alternatives, {category} competitors, alternative {category} tools',
      h1Template: 'Best {category} Alternatives',
      contentTemplate: 'Explore powerful alternatives to mainstream {category} tools and find the perfect fit for your needs.'
    }
  };

  useEffect(() => {
    const loadPageData = () => {
      setLoading(true);
      
      // Find category by slug
      const category = categories.find(cat => 
        cat.slug === slug || cat.name.toLowerCase().replace(/\s+/g, '-') === slug
      );

      if (!category || !pageTemplates[type]) {
        setPageData(null);
        setLoading(false);
        return;
      }

      const template = pageTemplates[type];
      const categoryName = category.name;
      const categorySlug = category.slug;

      // Generate page data from template
      const generatedPageData = {
        title: template.titleTemplate.replace(/{category}/g, categoryName),
        description: template.descriptionTemplate.replace(/{category}/g, categoryName.toLowerCase()),
        keywords: template.keywordsTemplate.replace(/{category}/g, categoryName.toLowerCase()),
        h1: template.h1Template.replace(/{category}/g, categoryName),
        content: template.contentTemplate.replace(/{category}/g, categoryName.toLowerCase()),
        category: category,
        type: type,
        slug: slug
      };

      setPageData(generatedPageData);

      // Generate sample websites for this category (in a real app, fetch from API)
      const sampleWebsites = generateSampleWebsites(category, type);
      setWebsites(sampleWebsites);
      
      setLoading(false);
    };

    loadPageData();
  }, [type, slug]);

  const generateSampleWebsites = (category, pageType) => {
    // This would typically fetch from your database
    // For demo purposes, we'll generate sample data
    const baseWebsites = [
      {
        id: 1,
        name: `${category.name} Pro`,
        description: `Professional ${category.name.toLowerCase()} tool with advanced features`,
        url: `https://example-${category.slug}-pro.com`,
        image: `/images/websites/${category.slug}-pro.png`,
        rating: 4.8,
        pricing: pageType === 'free-tools-for' ? 'Free' : 'Freemium',
        tags: [category.name.toLowerCase(), 'professional', 'advanced']
      },
      {
        id: 2,
        name: `${category.name} Studio`,
        description: `Creative ${category.name.toLowerCase()} platform for professionals`,
        url: `https://example-${category.slug}-studio.com`,
        image: `/images/websites/${category.slug}-studio.png`,
        rating: 4.6,
        pricing: pageType === 'free-tools-for' ? 'Free' : 'Paid',
        tags: [category.name.toLowerCase(), 'creative', 'studio']
      },
      {
        id: 3,
        name: `${category.name} Express`,
        description: `Quick and easy ${category.name.toLowerCase()} solution`,
        url: `https://example-${category.slug}-express.com`,
        image: `/images/websites/${category.slug}-express.png`,
        rating: 4.4,
        pricing: 'Free',
        tags: [category.name.toLowerCase(), 'quick', 'easy']
      }
    ];

    return baseWebsites;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!pageData) {
    return <Navigate to="/" replace />;
  }

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
    { name: pageData.category.name, url: `/category/${pageData.category.slug}` },
    { name: pageData.h1, url: `/programmatic/${type}/${slug}`, isLast: true }
  ];

  const pageUrl = `https://findtheweb.zus3cu.tech/programmatic/${type}/${slug}`;

  return (
    <>
      <SEOHead
        title={pageData.title}
        description={pageData.description}
        keywords={pageData.keywords}
        url={pageUrl}
        type="website"
        image={`/images/og-programmatic-${type}-${slug}.png`}
      />

      <CollectionPageStructuredData
        name={pageData.h1}
        description={pageData.description}
        url={pageUrl}
        numberOfItems={websites.length}
        items={websites.map(website => ({
          name: website.name,
          description: website.description,
          url: website.url,
          image: website.image
        }))}
      />

      <BreadcrumbStructuredData breadcrumbs={breadcrumbItems} />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Breadcrumbs />

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {pageData.h1}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              {pageData.content}
            </p>
            
            {/* Category Badge */}
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
              <span className="text-2xl mr-2">{pageData.category.icon}</span>
              <span className="font-medium">{pageData.category.name} Category</span>
            </div>
          </div>

          {/* Filter and Sort */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">Filter by:</span>
                <select className="border border-gray-300 rounded-lg px-3 py-2">
                  <option value="all">All Tools</option>
                  <option value="free">Free Only</option>
                  <option value="paid">Paid Only</option>
                  <option value="freemium">Freemium</option>
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">Sort by:</span>
                <select className="border border-gray-300 rounded-lg px-3 py-2">
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name A-Z</option>
                  <option value="newest">Newest First</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{websites.length}</span> results for{' '}
              <span className="font-semibold">{pageData.h1.toLowerCase()}</span>
            </p>
          </div>

          {/* Websites Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {websites.map((website) => (
              <div key={website.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src={website.image}
                  alt={website.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{website.name}</h3>
                    <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                      <span>⭐</span>
                      <span className="ml-1 font-medium">{website.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">{website.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      website.pricing === 'Free' 
                        ? 'bg-green-100 text-green-800'
                        : website.pricing === 'Freemium'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {website.pricing}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {website.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex space-x-3">
                    <a
                      href={website.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Visit Website
                    </a>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      ♡
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Related Categories */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Categories</h2>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.slug}
                  to={`/programmatic/${type}/${category.slug}`}
                  className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Discover More Tools</h2>
            <p className="mb-6 opacity-90">
              Explore our complete collection of curated tools and websites across all categories.
            </p>
            <Link
              to="/"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Browse All Categories
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProgrammaticPages;
