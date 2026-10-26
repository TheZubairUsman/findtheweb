import React from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useBookmarks } from '../context/BookmarkContext';
import { useAnalytics } from '../hooks/useAnalytics';

const WebsiteCard = ({ website }) => {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { trackClick, trackBookmark } = useAnalytics();
  const bookmarked = isBookmarked(website.id);

  const handleBookmarkToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (bookmarked) {
      removeBookmark(website.id);
      trackBookmark('remove', {
        websiteId: website.id,
        websiteName: website.name,
        category: website.categoryName
      });
    } else {
      addBookmark(website);
      trackBookmark('add', {
        websiteId: website.id,
        websiteName: website.name,
        category: website.categoryName
      });
    }
  };

  const handleVisit = () => {
    // Track click analytics
    trackClick('website_visit', {
      websiteId: website.id,
      websiteName: website.name,
      websiteUrl: website.url,
      category: website.categoryName,
      source: 'website_card'
    });
    
    window.open(website.url, '_blank', 'noopener,noreferrer');
  };

  // Generate structured data for the website
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": website.name,
    "description": website.description,
    "url": website.url,
    "category": website.categoryName
  };

  return (
    <article 
      className="card p-6 hover:shadow-lg transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700"
      itemScope 
      itemType="https://schema.org/WebSite"
    >
      {/* Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
      />
      
      <div className="flex items-start justify-between mb-4">
        {/* Website Thumbnail/Icon */}
        <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center dark:from-gray-700 dark:to-gray-600">
          {website.thumbnail ? (
            <img 
              src={website.thumbnail} 
              alt={`${website.name} logo`}
              className="w-8 h-8 object-cover rounded seo-image"
              loading="lazy"
              itemProp="image"
            />
          ) : (
            <span className="text-xl" role="img" aria-label="Website icon">🌐</span>
          )}
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkToggle}
          className={`p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus-visible:focus ${
            bookmarked
              ? 'text-red-500 hover:text-red-600'
              : 'text-gray-400 hover:text-red-500'
          }`}
          aria-label={bookmarked ? `Remove ${website.name} from bookmarks` : `Add ${website.name} to bookmarks`}
          title={bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
        >
          {bookmarked ? (
            <HeartSolidIcon className="h-5 w-5" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Website Title */}
      <h3 
        className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 dark:text-white"
        itemProp="name"
      >
        {website.name}
      </h3>

      {/* Website Description */}
      <p 
        className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 dark:text-gray-300"
        itemProp="description"
      >
        {website.description}
      </p>

      {/* Website Metadata */}
      <div className="flex items-center justify-between mb-4">
        {/* Region */}
        {website.regions && website.regions.length > 0 && (
          <div className="flex items-center space-x-1">
            <span 
              className="text-xs text-gray-500 dark:text-gray-400"
              itemProp="availableAtOrFrom"
              title={`Available in: ${website.regions.join(', ')}`}
            >
              {website.regions.map(region => {
                const regionFlags = {
                  'global': '🌐',
                  'us': '🇺🇸',
                  'in': '🇮🇳',
                  'jp': '🇯🇵'
                };
                return regionFlags[region] || region;
              }).join(' ')}
            </span>
          </div>
        )}

        {/* Category */}
        {website.categoryName && (
          <span 
            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300"
            itemProp="category"
          >
            {website.categoryName}
          </span>
        )}
      </div>

      {/* Visit Button */}
      <button
        onClick={handleVisit}
        className="w-full btn-primary flex items-center justify-center space-x-2 focus-visible:focus"
        aria-label={`Visit ${website.name} website`}
        title={`Open ${website.name} in new tab`}
        itemProp="url"
      >
        <span role="img" aria-label="Globe icon">🌐</span>
        <span>Visit Website</span>
      </button>
    </article>
  );
};

export default WebsiteCard;
