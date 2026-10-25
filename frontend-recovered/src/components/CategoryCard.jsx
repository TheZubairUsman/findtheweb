import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../hooks/useAnalytics';

const CategoryCard = ({ category }) => {
  const navigate = useNavigate();
  const { trackClick } = useAnalytics();

  const handleClick = () => {
    // Track category click analytics
    trackClick('category_click', {
      categoryId: category.id,
      categoryName: category.name,
      categorySlug: category.slug,
      umbrella: category.umbrella,
      source: 'category_card'
    });
    
    navigate(`/category/${category.slug}`);
  };

  // Generate structured data for the category
  const categoryStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category.name,
    "description": category.description,
    "url": `https://findtheweb.zus3cu.tech/category/${category.slug}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": `${category.name} Tools`,
      "description": category.description,
      "numberOfItems": category.websiteCount || 0
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://findtheweb.zus3cu.tech"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Categories",
          "item": "https://findtheweb.zus3cu.tech/categories"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": category.name,
          "item": `https://findtheweb.zus3cu.tech/category/${category.slug}`
        }
      ]
    }
  };

  return (
    <motion.article
      onClick={handleClick}
      className="card p-6 cursor-pointer group hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700 focus-visible:focus"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`View ${category.name} websites and tools`}
      title={`Browse ${category.name} category`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }}
      itemScope
      itemType="https://schema.org/CollectionPage"
    >
      {/* Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categoryStructuredData) }}
      />
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Category Icon */}
          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200 dark:from-primary-800 dark:to-primary-700">
            {category.icon ? (
              <span 
                className="text-2xl" 
                role="img" 
                aria-label={`${category.name} icon`}
                itemProp="image"
                style={{
                  filter: 'saturate(1.2) brightness(1.1)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {category.icon}
              </span>
            ) : (
              <span 
                className="text-2xl"
                role="img"
                aria-label="Default category icon"
                style={{
                  filter: 'saturate(1.2) brightness(1.1)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                🔍
              </span>
            )}
          </div>

          {/* Category Title */}
          <h3 
            className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors duration-200 dark:text-white dark:group-hover:text-primary-400"
            itemProp="name"
          >
            {category.name}
          </h3>

          {/* Category Description */}
          <p 
            className="text-gray-600 text-sm leading-relaxed dark:text-gray-300"
            itemProp="description"
          >
            {category.description}
          </p>

          {/* Website Count */}
          {category.websiteCount && (
            <div className="mt-2">
              <span 
                className="text-xs text-gray-500 dark:text-gray-400"
                itemProp="numberOfItems"
              >
                {category.websiteCount} {category.websiteCount === 1 ? 'tool' : 'tools'}
              </span>
            </div>
          )}

          {/* Umbrella Category */}
          {category.umbrella && (
            <div className="mt-3">
              <span 
                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300"
                itemProp="isPartOf"
                title={`Part of ${category.umbrella} category`}
              >
                {category.umbrella}
              </span>
            </div>
          )}
        </div>

        {/* Arrow Icon */}
        <ChevronRightIcon 
          className="h-5 w-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-200 dark:text-gray-500 dark:group-hover:text-primary-400" 
          aria-hidden="true"
        />
      </div>
    </motion.article>
  );
};

export default CategoryCard;