import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiSave, FiX,
  FiSearch, FiFilter, FiCalendar, FiTag, FiImage
} from './editorIcons';

const BlogManager = () => {
  const { adminToken } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const saveLock = useRef(false);
  const requestVersion = useRef(0);
  const editorTrigger = useRef(null);
  const [categoryText, setCategoryText] = useState('');
  const [tagText, setTagText] = useState('');
  const updateField = (field, value) => setFormData(previous => ({ ...previous, [field]: value }));
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
    if (!showEditor && !editorTrigger.current) return;
    const frame = requestAnimationFrame(() => {
      const target = showEditor ? document.getElementById('editor-title')
        : editorTrigger.current?.isConnected ? editorTrigger.current : document.getElementById('editor-new-post');
      target?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [showEditor]);

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, searchTerm]);

  const fetchPosts = async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter === 'all' ? 'all' : statusFilter,
        ...(searchTerm && { search: searchTerm }),
        limit: 50
      });

      const response = await fetch(`/api/v1/admin/posts?${params}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to load posts.');
      if (version === requestVersion.current) {
        setPosts(data.data);
      }
    } catch (error) {
      if (version === requestVersion.current) setNotice(error.message || 'Unable to load posts. Try again.');
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  };

  const handleCreatePost = () => {
    editorTrigger.current = document.activeElement;
    setNotice('');
    setCategoryText('');
    setTagText('');
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
    editorTrigger.current = document.activeElement;
    setNotice('');
    setCategoryText((post.categories || []).join(', '));
    setTagText((post.tags || []).join(', '));
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
    if (saveLock.current) return;
    if (!formData.title.trim() || !formData.content.trim()) {
      setNotice('Title and content are required. Your draft has not been saved.');
      return;
    }
    saveLock.current = true;
    setSaving(true);
    setNotice('Saving post…');
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
      if (!response.ok || !data.success) throw new Error(data.message || 'Unable to save post.');
      if (data.success) {
        setShowEditor(false);
        setNotice('Post saved successfully.');
        fetchPosts();
      }
    } catch (error) {
      setNotice((error.message || 'Unable to save post.') + ' Your content is still in the editor.');
    } finally {
      saveLock.current = false;
      setSaving(false);
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
            aria-label="Close editor"
            disabled={saving}
            onClick={() => setShowEditor(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>
        <p id="editor-status" role="status" aria-live="polite">{notice}</p>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="editor-title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  id="editor-title" required aria-required="true" aria-describedby="editor-status"
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter post title..."
                />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="editor-slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  id="editor-slug"
                  onChange={(e) => updateField('slug', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="auto-generated-from-title"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label htmlFor="editor-excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  id="editor-excerpt"
                  onChange={(e) => updateField('excerpt', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the post..."
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="editor-content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  id="editor-content" required aria-required="true" aria-describedby="editor-status"
                  onChange={(e) => updateField('content', e.target.value)}
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
                    <label htmlFor="editor-status-select" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      id="editor-status-select"
                      onChange={(e) => updateField('status', e.target.value)}
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
                      onChange={(e) => updateField('featured', e.target.checked)}
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
                      onChange={(e) => updateField('allowComments', e.target.checked)}
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
                <label htmlFor="editor-image" className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  value={formData.featuredImage}
                  id="editor-image"
                  onChange={(e) => updateField('featuredImage', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Categories */}
              <div>
                <label htmlFor="editor-categories" className="block text-sm font-medium text-gray-700 mb-2">
                  Categories (comma-separated)
                </label>
                <input
                  type="text"
                  id="editor-categories" value={categoryText}
                  onChange={(e) => { setCategoryText(e.target.value); updateField('categories', e.target.value.split(',').map(c => c.trim()).filter(Boolean)); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Technology, Design, Business"
                />
              </div>

              {/* Tags */}
              <div>
                <label htmlFor="editor-tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="editor-tags" value={tagText}
                  onChange={(e) => { setTagText(e.target.value); updateField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean)); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="react, javascript, tutorial"
                />
              </div>

              {/* SEO Settings */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">SEO Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="editor-seo-title" className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Title
                    </label>
                    <input
                      type="text"
                      value={formData.seoTitle}
                      id="editor-seo-title"
                      onChange={(e) => updateField('seoTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Custom SEO title"
                    />
                  </div>

                  <div>
                    <label htmlFor="editor-seo-description" className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Description
                    </label>
                    <textarea
                      value={formData.seoDescription}
                      id="editor-seo-description"
                      onChange={(e) => updateField('seoDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Meta description for search engines"
                    />
                  </div>

                  <div>
                    <label htmlFor="editor-seo-keywords" className="block text-sm font-medium text-gray-700 mb-2">
                      SEO Keywords
                    </label>
                    <input
                      type="text"
                      value={formData.seoKeywords}
                      id="editor-seo-keywords"
                      onChange={(e) => updateField('seoKeywords', e.target.value)}
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
                  disabled={saving}
                  aria-busy={saving}
                  aria-describedby="editor-status"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  {saving ? 'Saving…' : editingPost ? 'Update' : 'Create'}
                </button>
                <button
                  disabled={saving}
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
          id="editor-new-post"
          onClick={handleCreatePost}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          New Post
        </button>
      </div>

      {/* Filters */}
      <p role="status" aria-live="polite">{notice}</p>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                aria-label="Search posts"
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            aria-label="Filter posts by status"
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
                            aria-label={`View ${post.title}`}
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiEye className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          aria-label={`Edit ${post.title}`}
                          onClick={() => handleEditPost(post)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          aria-label={`Delete ${post.title}`}
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
