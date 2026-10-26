import React, { useState, useEffect } from 'react';
import { FiStar, FiTrendingUp, FiExternalLink, FiEye, FiAward, FiZap } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const TierSection = () => {
  const [websites, setWebsites] = useState({
    enterprise: [],
    premium: [],
    standard: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('enterprise');

  useEffect(() => {
    fetchWebsitesByTier();
  }, []);

  const fetchWebsitesByTier = async () => {
    try {
      const tiers = ['enterprise', 'premium', 'standard'];
      const promises = tiers.map(async (tier) => {
        const response = await fetch(`/api/v1/websites/tier/${tier}?limit=6&sort=-weeklyHits`);
        const data = await response.json();
        return { tier, websites: data.success ? data.data : [] };
      });

      const results = await Promise.all(promises);
      const websitesByTier = {};
      
      results.forEach(({ tier, websites }) => {
        websitesByTier[tier] = websites;
      });

      setWebsites(websitesByTier);
    } catch (error) {
      console.error('Error fetching websites by tier:', error);
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

  const getTierConfig = (tier) => {
    const configs = {
      enterprise: {
        name: 'Enterprise',
        icon: FiAward,
        color: 'purple',
        gradient: 'from-purple-600 to-indigo-700',
        description: 'Premium enterprise solutions and advanced tools',
        badge: 'bg-purple-100 text-purple-800 border-purple-200',
        cardBorder: 'border-purple-200',
        cardHover: 'hover:border-purple-300 hover:shadow-purple-100'
      },
      premium: {
        name: 'Premium',
        icon: FiZap,
        color: 'blue',
        gradient: 'from-blue-600 to-cyan-600',
        description: 'High-quality tools and services for professionals',
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        cardBorder: 'border-blue-200',
        cardHover: 'hover:border-blue-300 hover:shadow-blue-100'
      },
      standard: {
        name: 'Standard',
        icon: FiStar,
        color: 'green',
        gradient: 'from-green-600 to-emerald-600',
        description: 'Reliable and useful websites for everyone',
        badge: 'bg-green-100 text-green-800 border-green-200',
        cardBorder: 'border-green-200',
        cardHover: 'hover:border-green-300 hover:shadow-green-100'
      }
    };
    return configs[tier] || configs.standard;
  };

  const WebsiteCard = ({ website, tier }) => {
    const config = getTierConfig(tier);
    
    return (
      <div className={`bg-white rounded-lg border-2 ${config.cardBorder} ${config.cardHover} transition-all duration-200 p-6 group`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
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
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {website.description}
            </p>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.badge}`}>
              <config.icon className="w-3 h-3 mr-1" />
              {config.name}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <FiTrendingUp className="w-4 h-4 mr-1" />
            <span>{website.weeklyHits || 0} hits</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleWebsiteClick(website.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiEye className="w-4 h-4" />
            </button>
            <a
              href={website.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleWebsiteClick(website.id)}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              <FiExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  };

  const TierTab = ({ tier, isActive, onClick }) => {
    const config = getTierConfig(tier);
    const count = websites[tier]?.length || 0;
    
    return (
      <button
        onClick={() => onClick(tier)}
        className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          isActive
            ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
        }`}
      >
        <config.icon className="w-5 h-5 mr-2" />
        <span>{config.name}</span>
        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
          isActive ? 'bg-white bg-opacity-20' : 'bg-gray-100'
        }`}>
          {count}
        </span>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const activeConfig = getTierConfig(activeTab);
  const activeWebsites = websites[activeTab] || [];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Discover by Tier
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore curated websites organized by quality and features. From enterprise solutions 
            to everyday tools, find exactly what you need.
          </p>
        </div>

        {/* Tier Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {['enterprise', 'premium', 'standard'].map((tier) => (
            <TierTab
              key={tier}
              tier={tier}
              isActive={activeTab === tier}
              onClick={setActiveTab}
            />
          ))}
        </div>

        {/* Active Tier Description */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${activeConfig.gradient} text-white`}>
            <activeConfig.icon className="w-5 h-5 mr-2" />
            <span className="font-medium">{activeConfig.description}</span>
          </div>
        </div>

        {/* Websites Grid */}
        {activeWebsites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {activeWebsites.map((website) => (
              <WebsiteCard
                key={website.id}
                website={website}
                tier={activeTab}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeConfig.name.toLowerCase()} websites yet
            </h3>
            <p className="text-gray-600">
              We're working on adding more {activeConfig.name.toLowerCase()} websites to this section.
            </p>
          </div>
        )}

        {/* View All Button */}
        {activeWebsites.length > 0 && (
          <div className="text-center">
            <Link
              to="/categories"
              className={`inline-flex items-center px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r ${activeConfig.gradient} hover:shadow-lg transition-all duration-200`}
            >
              Browse All Categories
              <FiExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default TierSection;
