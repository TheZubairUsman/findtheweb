import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiExternalLink, FiEye, FiStar, FiClock, FiBarChart } from 'react-icons/fi';

const TopHitsSection = () => {
  const [topWebsites, setTopWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');

  useEffect(() => {
    fetchTopWebsites();
  }, [timeframe]);

  const fetchTopWebsites = async () => {
    try {
      const response = await fetch(`/api/v1/websites?sort=-weeklyHits&limit=12&status=active`);
      const data = await response.json();
      
      if (data.success) {
        setTopWebsites(data.data);
      }
    } catch (error) {
      console.error('Error fetching top websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWebsiteClick = async (websiteId) => {
    try {
      await fetch(`/api/v1/websites/${websiteId}/hit`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error tracking hit:', error);
    }
  };

  const formatHits = (hits) => {
    if (hits >= 1000000) {
      return `${(hits / 1000000).toFixed(1)}M`;
    } else if (hits >= 1000) {
      return `${(hits / 1000).toFixed(1)}K`;
    }
    return hits.toString();
  };

  const getHitsTrend = (hits) => {
    if (hits > 1000) return 'high';
    if (hits > 100) return 'medium';
    return 'low';
  };

  const TopWebsiteCard = ({ website, rank }) => {
    const trend = getHitsTrend(website.weeklyHits || 0);
    const trendColors = {
      high: 'text-red-500 bg-red-50',
      medium: 'text-orange-500 bg-orange-50',
      low: 'text-green-500 bg-green-50'
    };

    const rankColors = {
      1: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white',
      2: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white',
      3: 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 p-6 group relative overflow-hidden">
        {/* Rank Badge */}
        <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          rankColors[rank] || 'bg-gray-100 text-gray-600'
        }`}>
          {rank}
        </div>

        {/* Website Info */}
        <div className="pr-10">
          <div className="flex items-center mb-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-lg">
              {website.name}
            </h3>
            {website.featured && (
              <FiStar className="w-4 h-4 text-yellow-500 ml-2" />
            )}
            {website.verified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center ml-1">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {website.description}
          </p>

          {/* Category */}
          {website.category && (
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 mb-4">
              {website.category.name}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}>
                <FiTrendingUp className="w-3 h-3 mr-1" />
                <span>{formatHits(website.weeklyHits || 0)} hits</span>
              </div>
              
              {website.tier && (
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  website.tier === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                  website.tier === 'premium' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {website.tier}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleWebsiteClick(website.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Track view"
              >
                <FiEye className="w-4 h-4" />
              </button>
              <a
                href={website.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleWebsiteClick(website.id)}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Visit website"
              >
                <FiExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Trending indicator for top 3 */}
        {rank <= 3 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FiBarChart className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">
              Trending Now
            </h2>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover the most popular websites and tools that are making waves in the community. 
            These are the resources everyone's talking about.
          </p>
        </div>

        {/* Time Filter */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1 flex">
            {[
              { key: 'day', label: 'Today' },
              { key: 'week', label: 'This Week' },
              { key: 'month', label: 'This Month' }
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setTimeframe(option.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  timeframe === option.key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top Websites Grid */}
        {topWebsites.length > 0 ? (
          <>
            {/* Top 3 - Featured */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                🏆 Top Performers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topWebsites.slice(0, 3).map((website, index) => (
                  <TopWebsiteCard
                    key={website.id}
                    website={website}
                    rank={index + 1}
                  />
                ))}
              </div>
            </div>

            {/* Rest of the websites */}
            {topWebsites.length > 3 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  📈 Also Trending
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topWebsites.slice(3, 12).map((website, index) => (
                    <TopWebsiteCard
                      key={website.id}
                      website={website}
                      rank={index + 4}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No trending data yet
            </h3>
            <p className="text-gray-600">
              Check back soon to see which websites are trending!
            </p>
          </div>
        )}

        {/* Stats Summary */}
        {topWebsites.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {topWebsites.reduce((sum, site) => sum + (site.weeklyHits || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Weekly Hits</div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {topWebsites.length}
                </div>
                <div className="text-sm text-gray-600">Trending Websites</div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {new Set(topWebsites.map(site => site.category?.name).filter(Boolean)).size}
                </div>
                <div className="text-sm text-gray-600">Categories Represented</div>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Want to see your website here?</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Submit your website to our directory and join thousands of other amazing resources 
              that help people discover new tools and services.
            </p>
            <a 
              href="/contact" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              Submit Your Website
              <FiExternalLink className="w-4 h-4 ml-2" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopHitsSection;
