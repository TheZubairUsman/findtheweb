import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SEOHead from '../components/SEO/SEOHead';
import { ArticleSchema } from '../components/SEO/StructuredData';
import { 
  FiCalendar, FiUser, FiClock, FiEye, FiArrowLeft,
  FiTag, FiShare2, FiBookOpen, FiChevronRight
} from 'react-icons/fi';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/v1/blog/posts/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setPost(data.data);
        setRelatedPosts(data.data.relatedPosts || []);
      } else {
        setError(data.message || 'Post not found');
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // Could add a toast notification here
    }
  };

  const RelatedPostCard = ({ post }) => (
    <Link
      to={`/blog/${post.slug}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      {post.featuredImage && (
        <div className="h-32 overflow-hidden">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2 line-clamp-2">
          {post.title}
        </h3>
        
        {post.excerpt && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {post.excerpt}
          </p>
        )}
        
        <div className="flex items-center text-xs text-gray-500 space-x-3">
          <div className="flex items-center">
            <FiCalendar className="w-3 h-3 mr-1" />
            <span>{formatDate(post.publishedAt)}</span>
          </div>
          <div className="flex items-center">
            <FiClock className="w-3 h-3 mr-1" />
            <span>{getReadingTime(post.readingTime)}</span>
          </div>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="h-64 bg-gray-300 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <FiBookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error === 'Post not found' ? 'Blog Post Not Found' : 'Error Loading Post'}
            </h1>
            <p className="text-gray-600 mb-6">
              {error === 'Post not found' 
                ? 'The blog post you\'re looking for doesn\'t exist or has been removed.'
                : 'There was an error loading the blog post. Please try again later.'
              }
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/blog')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Posts
              </button>
              <button
                onClick={() => window.location.reload()}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Head */}
      <SEOHead 
        title={post.seoTitle || `${post.title} - FindTheWeb Blog`}
        description={post.seoDescription || post.excerpt}
        keywords={post.seoKeywords || post.tags?.join(', ')}
        image={post.featuredImage}
        url={`/blog/${post.slug}`}
        type="article"
      />

      {/* Structured Data */}
      <ArticleSchema 
        headline={post.title}
        description={post.excerpt}
        author={post.author?.name || 'FindTheWeb'}
        datePublished={post.publishedAt}
        dateModified={post.updatedAt}
        image={post.featuredImage}
        url={`https://findtheweb.zus3cu.tech/blog/${post.slug}`}
        publisher="FindTheWeb"
      />

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <FiChevronRight className="w-4 h-4" />
            <Link to="/blog" className="hover:text-blue-600">Blog</Link>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-gray-900 truncate">{post.title}</span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </button>

          {/* Article Header */}
          <header className="mb-8">
            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.categories.map(category => (
                  <span
                    key={category}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {category}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-t border-b border-gray-200">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <FiUser className="w-4 h-4 mr-2" />
                  <span>By {post.author?.name || 'Admin'}</span>
                </div>
                <div className="flex items-center">
                  <FiCalendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                <div className="flex items-center">
                  <FiClock className="w-4 h-4 mr-2" />
                  <span>{getReadingTime(post.readingTime)}</span>
                </div>
                <div className="flex items-center">
                  <FiEye className="w-4 h-4 mr-2" />
                  <span>{post.viewCount || 0} views</span>
                </div>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiShare2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-8">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Link
                    key={tag}
                    to={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-full text-sm transition-colors"
                  >
                    <FiTag className="w-3 h-3 mr-1" />
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedPosts.map(relatedPost => (
                  <RelatedPostCard key={relatedPost.id} post={relatedPost} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogPost;
