import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAnalytics } from '../hooks/useAnalytics';
import { useLocation } from 'react-router-dom';

const regions = [
  { id: 'global', name: 'Global', flag: '🌐' },
  { id: 'us', name: 'United States', flag: '🇺🇸' },
  { id: 'in', name: 'India', flag: '🇮🇳' },
  { id: 'jp', name: 'Japan', flag: '🇯🇵' },
];

const SearchBar = ({ onSearchChange, categories = [] }) => {
  const location = useLocation();
  const isCategoryPage = location.pathname.startsWith('/category/');
  const { trackSearch, trackClick } = useAnalytics();
  const [searchState, setSearchState] = useState({
    keyword: '',
    region: 'global',
    categoryId: isCategoryPage && categories.length > 0 ? categories[0].id : ''
  });
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Generate search suggestions based on categories and common terms
  const generateSuggestions = (query) => {
    if (!query || query.length < 2) return [];
    
    const commonSearchTerms = [
      'design tools', 'productivity apps', 'code editors', 'social media',
      'project management', 'analytics tools', 'email marketing', 'file sharing',
      'video conferencing', 'photo editing', 'web development', 'mobile apps'
    ];
    
    const categorySuggestions = categories
      .filter(cat => cat.name.toLowerCase().includes(query.toLowerCase()))
      .map(cat => ({ type: 'category', text: cat.name, id: cat.id }));
    
    const termSuggestions = commonSearchTerms
      .filter(term => term.toLowerCase().includes(query.toLowerCase()))
      .map(term => ({ type: 'term', text: term }));
    
    return [...categorySuggestions, ...termSuggestions].slice(0, 5);
  };

  const handleInputChange = (field, value) => {
    const newState = { ...searchState, [field]: value };
    setSearchState(newState);
    
    if (field === 'keyword') {
      const suggestions = generateSuggestions(value);
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0 && value.length > 1);
      
      // Debounce search tracking
      if (value.length > 2) {
        setIsSearching(true);
        setTimeout(() => {
          trackSearch(value, {
            region: newState.region,
            categoryId: newState.categoryId,
            source: 'search_bar'
          });
          setIsSearching(false);
        }, 500);
      }
    }
    
    onSearchChange(newState);
  };

  const handleSuggestionClick = (suggestion) => {
    trackClick('search_suggestion_click', {
      suggestionType: suggestion.type,
      suggestionText: suggestion.text,
      source: 'search_suggestions'
    });
    
    if (suggestion.type === 'category') {
      handleInputChange('categoryId', suggestion.id);
      handleInputChange('keyword', '');
    } else {
      handleInputChange('keyword', suggestion.text);
    }
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    trackClick('search_clear', {
      previousKeyword: searchState.keyword,
      source: 'search_bar'
    });
    
    setSearchState({
      keyword: '',
      region: 'global',
      categoryId: ''
    });
    setShowSuggestions(false);
    onSearchChange({
      keyword: '',
      region: 'global',
      categoryId: ''
    });
    searchInputRef.current?.focus();
  };

  // Handle keyboard navigation for suggestions
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;
    
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      searchInputRef.current?.focus();
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate structured data for search functionality
  const searchStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://findtheweb.zus3cu.tech",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://findtheweb.zus3cu.tech/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Structured Data */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(searchStructuredData) }}
      />
      
      <div className="space-y-4" role="search" aria-label="Website search">
        {/* Keyword Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            ref={searchInputRef}
            type="search"
            placeholder={isCategoryPage ? `Search in ${categories[0]?.name || 'category'}...` : 'Search websites, tools, and resources...'}
            value={searchState.keyword}
            onChange={(e) => handleInputChange('keyword', e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (searchState.keyword.length > 1) {
                const suggestions = generateSuggestions(searchState.keyword);
                setSearchSuggestions(suggestions);
                setShowSuggestions(suggestions.length > 0);
              }
            }}
            className="input-field pl-10 pr-10 focus-visible:focus"
            aria-label="Search websites and tools"
            aria-describedby="search-help"
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck="false"
          />
          
          {/* Clear Search Button */}
          {searchState.keyword && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus-visible:focus"
              aria-label="Clear search"
              title="Clear search"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </button>
          )}
          
          {/* Loading Indicator */}
          {isSearching && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            </div>
          )}
          
          {/* Search Suggestions */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
              role="listbox"
              aria-label="Search suggestions"
            >
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.text}-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                  role="option"
                  aria-selected="false"
                >
                  <div className="flex items-center space-x-3">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {suggestion.text}
                    </span>
                    {suggestion.type === 'category' && (
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded dark:bg-primary-900 dark:text-primary-300">
                        Category
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div id="search-help" className="sr-only">
          Use the search box to find websites, tools, and resources. You can also filter by region and category below.
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Region Filter */}
          <fieldset className="flex-1">
            <legend className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
              Region
            </legend>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Select region">
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => {
                    handleInputChange('region', region.id);
                    trackClick('region_filter', {
                      regionId: region.id,
                      regionName: region.name,
                      source: 'search_filters'
                    });
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus-visible:focus ${
                    searchState.region === region.id
                      ? 'bg-primary-100 text-primary-700 border border-primary-300 dark:bg-primary-900 dark:text-primary-300 dark:border-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-600'
                  }`}
                  role="radio"
                  aria-checked={searchState.region === region.id}
                  aria-label={`Filter by ${region.name}`}
                  title={`Show websites available in ${region.name}`}
                >
                  <span className="mr-1" role="img" aria-label={`${region.name} flag`}>
                    {region.flag}
                  </span>
                  {region.name}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Category Filter */}
          {!isCategoryPage && categories.length > 0 && (
            <div className="flex-1">
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2 dark:text-white">
                Category
              </label>
              <select
                id="category-filter"
                value={searchState.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                className="block w-full pl-3 pr-10 py-2.5 text-base border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                aria-label="Filter by category"
              >
                <option value="">All Categories</option>
                {[...categories]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} {category.websiteCount ? `(${category.websiteCount})` : ''}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(searchState.keyword || searchState.region !== 'global' || searchState.categoryId) && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            
            {searchState.keyword && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                "{searchState.keyword}"
                <button
                  onClick={() => handleInputChange('keyword', '')}
                  className="ml-1 p-0.5 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 focus-visible:focus"
                  aria-label="Remove keyword filter"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {searchState.region !== 'global' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {regions.find(r => r.id === searchState.region)?.name}
                <button
                  onClick={() => handleInputChange('region', 'global')}
                  className="ml-1 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 focus-visible:focus"
                  aria-label="Remove region filter"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {searchState.categoryId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                {categories.find(c => c.id === searchState.categoryId)?.name}
                <button
                  onClick={() => handleInputChange('categoryId', '')}
                  className="ml-1 p-0.5 rounded-full hover:bg-green-200 dark:hover:bg-green-800 focus-visible:focus"
                  aria-label="Remove category filter"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;