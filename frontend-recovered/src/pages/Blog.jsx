import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SEOHead from '../components/SEO/SEOHead';
import { CollectionPageSchema } from '../components/SEO/StructuredData';
import { 
  FiTrendingUp, FiMessageSquare, FiExternalLink, FiStar, 
  FiChevronUp, FiEye, FiClock, FiFilter, FiSearch,
  FiHeart, FiBookmark, FiShare2, FiAward
} from 'react-icons/fi';
import seoData from '../data/seoData.json';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [topPosts, setTopPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('trending');
  const [timeframe, setTimeframe] = useState('today');

  useEffect(() => {
    fetchPosts();
    fetchFeaturedPosts();
    fetchTopPosts();
  }, [selectedCategory, sortBy, timeframe]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams({
        limit: 20,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchTerm && { search: searchTerm }),
        sort: sortBy === 'trending' ? '-votesUp' : sortBy === 'newest' ? '-createdAt' : '-viewCount'
      });

      const response = await fetch(`/api/v1/posts?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedPosts = async () => {
    try {
      const response = await fetch('/api/v1/posts/featured?limit=3');
      const data = await response.json();
      
      if (data.success) {
        setFeaturedPosts(data.data);
      }
    } catch (error) {
      console.error('Error fetching featured posts:', error);
    }
  };

  const fetchTopPosts = async () => {
    try {
      const response = await fetch('/api/v1/posts/top?limit=5');
      const data = await response.json();
      
      if (data.success) {
        setTopPosts(data.data);
      }
    } catch (error) {
      console.error('Error fetching top posts:', error);
    }
  };

  const handleVote = async (postId, voteType) => {
    try {
      const response = await fetch(`/api/v1/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: voteType }),
      });

      if (response.ok) {
        fetchPosts(); // Refresh posts to show updated vote counts
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  const ProductCard = ({ post, rank }) => {
    const netVotes = (post.votesUp || 0) - (post.votesDown || 0);
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 p-6 group">
        <div className="flex items-start space-x-4">
          {/* Vote Section */}
          <div className="flex flex-col items-center space-y-1 min-w-[60px]">
            <button
              onClick={() => handleVote(post.id, 'like')}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors group/vote"
            >
              <FiChevronUp className="w-6 h-6 text-gray-400 group-hover/vote:text-blue-600" />
            </button>
            <span className="text-lg font-bold text-gray-900">{netVotes}</span>
            {rank && (
              <div className="text-xs text-gray-500 font-medium">#{rank}</div>
            )}
          </div>

          {/* Product Image */}
          <div className="flex-shrink-0">
            <img
              src={post.image || '/images/product-default.png'}
              alt={post.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link to={`/products/${post.slug}`}>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {post.excerpt}
                </p>
                
                {/* Tags */}
                <div className="flex items-center space-x-2 mt-2">
                  {post.tags && post.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Featured Badge */}
              {post.featured && (
                <div className="flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full ml-4">
                  <FiStar className="w-3 h-3 mr-1" />
                  Featured
                </div>
              )}
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <FiMessageSquare className="w-4 h-4 mr-1" />
                  <span>{post.commentCount || 0}</span>
                </div>
                <div className="flex items-center">
                  <FiEye className="w-4 h-4 mr-1" />
                  <span>{post.viewCount || 0}</span>
                </div>
                <div className="flex items-center">
                  <FiClock className="w-4 h-4 mr-1" />
                  <span>{getTimeAgo(post.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-red-500 transition-colors">
                  <FiHeart className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-blue-500 transition-colors">
                  <FiBookmark className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-green-500 transition-colors">
                  <FiShare2 className="w-4 h-4" />
                </button>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <FiExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FeaturedProduct = ({ post }) => (
    <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white overflow-hidden">
      <div className="absolute top-4 right-4">
        <div className="flex items-center px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
          <FiAward className="w-4 h-4 mr-1" />
          Featured
        </div>
      </div>
      
      <div className="flex items-start space-x-4">
        <img
          src={post.image || '/images/product-default.png'}
          alt={post.title}
          className="w-20 h-20 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{post.title}</h3>
          <p className="text-blue-100 mb-4 line-clamp-2">{post.excerpt}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <FiChevronUp className="w-4 h-4 mr-1" />
                <span>{(post.votesUp || 0) - (post.votesDown || 0)}</span>
              </div>
              <div className="flex items-center">
                <FiMessageSquare className="w-4 h-4 mr-1" />
                <span>{post.commentCount || 0}</span>
              </div>
            </div>
            <Link
              to={`/products/${post.slug}`}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              View Product
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Prepare structured data
  const blogItems = posts.map(post => ({
    name: post.title,
    description: post.excerpt,
    url: `https://findtheweb.zus3cu.tech/products/${post.slug}`,
    image: post.image || '/images/product-default.png'
  }));

  return (
    <>
      {/* SEO Head */}
      <SEOHead 
        title="Products - FindTheWeb"
        description="Discover the latest products, tools, and services. Vote, comment, and find your next favorite tool."
        keywords="product discovery, tools, software, apps, reviews, voting"
        image="/images/product-discovery.png"
        url="/products"
        type="website"
      />

      {/* Structured Data */}
      <CollectionPageSchema 
        name="Product Discovery"
        description="Latest products and tools discovery platform"
        url="https://findtheweb.zus3cu.tech/products"
        mainEntity={{
          name: "Products",
          numberOfItems: posts.length,
          items: blogItems
        }}
      />

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Product Discovery
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover amazing products, tools, and services. Vote for your favorites and help others find great resources.
            </p>
          </header>

          {/* Featured Products */}
          {featuredPosts.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <FiStar className="w-6 h-6 mr-2 text-yellow-500" />
                Featured Today
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredPosts.map(post => (
                  <FeaturedProduct key={post.id} post={post} />
                ))}
              </div>
            </section>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="trending">🔥 Trending</option>
                  <option value="newest">🆕 Newest</option>
                  <option value="popular">👑 Most Popular</option>
                </select>

                {/* Timeframe */}
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="all">All Time</option>
                </select>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  <option value="productivity">Productivity</option>
                  <option value="design">Design</option>
                  <option value="development">Development</option>
                  <option value="marketing">Marketing</option>
                  <option value="ai">AI & ML</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post, index) => (
                    <ProductCard 
                      key={post.id} 
                      post={post} 
                      rank={sortBy === 'trending' ? index + 1 : null}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search or filter criteria.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                      setSortBy('trending');
                    }}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Top Products */}
              {topPosts.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FiTrendingUp className="w-5 h-5 mr-2 text-red-500" />
                    Top Products
                  </h3>
                  <div className="space-y-4">
                    {topPosts.map((post, index) => (
                      <div key={post.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/products/${post.slug}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                          >
                            {post.title}
                          </Link>
                          <div className="text-xs text-gray-500 mt-1">
                            {(post.votesUp || 0) - (post.votesDown || 0)} votes
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Product CTA */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-2">Submit Your Product</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Share your amazing product with our community and get discovered by thousands of users.
                </p>
                <a
                  href="/contact"
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors inline-block"
                >
                  Submit Product
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
