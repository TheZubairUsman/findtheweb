import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiSave, FiX,
  FiSearch, FiFilter, FiCalendar, FiTag, FiImage
} from 'react-icons/fi';

const BlogManager = () => {
  const { adminToken } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    status: 'draft',
    categories: [],
    tags: [],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    featured: false,
    allowComments: true
  });

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, searchTerm]);

  const fetchPosts = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter === 'all' ? 'all' : statusFilter,
        ...(searchTerm && { search: searchTerm }),
        limit: 50
      });

      const response = await fetch(`/api/v1/blog/posts?${params}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

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

  const handleCreatePost = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featuredImage: '',
      status: 'draft',
      categories: [],
      tags: [],
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      featured: false,
      allowComments: true
    });
    setShowEditor(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      featuredImage: post.featuredImage || '',
      status: post.status || 'draft',
      categories: post.categories || [],
      tags: post.tags || [],
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      seoKeywords: post.seoKeywords || '',
      featured: post.featured || false,
      allowComments: post.allowComments !== false
    });
    setShowEditor(true);
  };

  const handleSavePost = async () => {
    try {
      const url = editingPost 
        ? `/api/v1/blog/posts/${editingPost.id}`
        : '/api/v1/blog/posts';
      
      const method = editingPost ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setShowEditor(false);
        fetchPosts();
      } else {
        alert(data.message || 'Error saving post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`/api/v1/blog/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchPosts();
      } else {
        alert(data.message || 'Error deleting post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  };

  if (showEditor) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h2>
          <button
            onClick={() => setShowEditor(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter post title..."
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="auto-generated-from-title"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the post..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="Write your blog post content here... (HTML supported)"
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">Publish Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="featured" className="text-sm text-gray-700">
                      Featured Post
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="allowComments"
                      checked={formData.allowComments}
                      onChange={(e) => setFormData({...formData, allowComments: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="allowComments" className="text-sm text-gray-700">
                      Allow Comments
                    </label>
                  </div>
                </div>
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({...formData, featuredImage: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categories (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.categories.join(', ')}
                  onChange={(e) => setFormData({...formData, categories: e.target.value.split(',').map(c => c.trim()).filter(Boolean)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Technology, Design, Business"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="react, javascript, tutorial"
                />
              </div>

              {/* SEO Settings */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">SEO Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({...formData, seoTitle: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Custom SEO title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      value={formData.seoDescription}
                      onChange={(e) => setFormData({...formData, seoDescription: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Meta description for search engines"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Keywords
                    </label>
                    <input
                      type="text"
                      value={formData.seoKeywords}
                      onChange={(e) => setFormData({...formData, seoKeywords: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSavePost}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  {editingPost ? 'Update' : 'Create'}
                </button>
                <button
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog Management</h1>
        <button
          onClick={handleCreatePost}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          New Post
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No blog posts found. Create your first post!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {post.featuredImage && (
                          <img
                            src={post.featuredImage}
                            alt=""
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {post.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            /{post.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(post.status)}`}>
                        {post.status}
                      </span>
                      {post.featured && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {post.publishedAt ? formatDate(post.publishedAt) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {post.viewCount || 0}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {post.status === 'published' && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiEye className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleEditPost(post)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManager;
