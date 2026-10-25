import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import SEOHead from '../components/SEO/SEOHead';
import { CollectionPageSchema } from '../components/SEO/StructuredData';
import { 
  FiCalendar, FiUser, FiClock, FiEye, FiSearch,
  FiFilter, FiTag, FiBookOpen, FiTrendingUp, FiStar
} from 'react-icons/fi';

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
    fetchFeaturedPosts();
    fetchCategories();
    fetchTags();
  }, [currentPage, selectedCategory, selectedTag, searchTerm]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 9,
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedTag && { tag: selectedTag }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/v1/blog/posts?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedPosts = async () => {
    try {
      const response = await fetch('/api/v1/blog/posts?featured=true&limit=3');
      const data = await response.json();
      
      if (data.success) {
        setFeaturedPosts(data.data);
      }
    } catch (error) {
      console.error('Error fetching featured posts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/blog/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/v1/blog/tags');
      const data = await response.json();
      
      if (data.success) {
        setTags(data.data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (readingTime) => {
    return readingTime === 1 ? '1 min read' : `${readingTime} min read`;
  };

  const BlogCard = ({ post, featured = false }) => (
    <article className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${featured ? 'md:col-span-2' : ''}`}>
      {post.featuredImage && (
        <div className={`relative ${featured ? 'h-64' : 'h-48'} overflow-hidden`}>
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          {post.featured && (
            <div className="absolute top-4 right-4">
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                <FiStar className="w-4 h-4 mr-1" />
                Featured
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="p-6">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.categories.slice(0, 2).map(category => (
              <span
                key={category}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        )}
        
        {/* Title */}
        <Link to={`/blog/${post.slug}`}>
          <h2 className={`font-bold text-gray-900 hover:text-blue-600 transition-colors mb-3 ${featured ? 'text-2xl' : 'text-xl'}`}>
            {post.title}
          </h2>
        </Link>
        
        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {post.excerpt}
          </p>
        )}
        
        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <FiUser className="w-4 h-4 mr-1" />
              <span>{post.author?.name || 'Admin'}</span>
            </div>
            <div className="flex items-center">
              <FiCalendar className="w-4 h-4 mr-1" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
            <div className="flex items-center">
              <FiClock className="w-4 h-4 mr-1" />
              <span>{getReadingTime(post.readingTime)}</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <FiEye className="w-4 h-4 mr-1" />
            <span>{post.viewCount || 0} views</span>
          </div>
        </div>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.slice(0, 3).map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className="text-gray-500 hover:text-blue-600 text-xs flex items-center"
              >
                <FiTag className="w-3 h-3 mr-1" />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );

  const FeaturedSection = () => (
    <section className="mb-12">
      <div className="flex items-center mb-6">
        <FiStar className="w-6 h-6 text-yellow-500 mr-2" />
        <h2 className="text-2xl font-bold text-gray-900">Featured Posts</h2>
      </div>
      
      {featuredPosts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map(post => (
            <BlogCard key={post.id} post={post} featured />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FiBookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No featured posts available</p>
        </div>
      )}
    </section>
  );

  // Prepare structured data
  const blogItems = posts.map(post => ({
    name: post.title,
    description: post.excerpt,
    url: `https://findtheweb.zus3cu.tech/blog/${post.slug}`,
    image: post.featuredImage
  }));

  return (
    <>
      {/* SEO Head */}
      <SEOHead 
        title="Blog - FindTheWeb"
        description="Read our latest articles about web development, design, technology trends, and digital insights."
        keywords="blog, articles, web development, design, technology, insights"
        image="/images/blog-hero.png"
        url="/blog"
        type="website"
      />

      {/* Structured Data */}
      <CollectionPageSchema 
        name="FindTheWeb Blog"
        description="Latest articles and insights about web development and technology"
        url="https://findtheweb.zus3cu.tech/blog"
        mainEntity={{
          name: "Blog Posts",
          numberOfItems: posts.length,
          items: blogItems
        }}
      />

      <div className="min-h-screen bg-gray-50">
        <Header />
        
          <div id="main-content" role="main" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover insights, tutorials, and stories about web development, design, and the latest technology trends.
            </p>
          </header>

          {/* Featured Posts */}
          <FeaturedSection />

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    aria-label="Search articles"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4 items-center">
                {/* Category Filter */}
                <select
                  aria-label="Filter by category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                {/* Tag Filter */}
                <select
                  aria-label="Filter by tag"
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Tags</option>
                  {tags.slice(0, 20).map(tag => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>

                {/* Clear Filters */}
                {(selectedCategory || selectedTag || searchTerm) && (
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedTag('');
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="mb-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : posts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiBookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setSelectedTag('');
                    setCurrentPage(1);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogPage;
