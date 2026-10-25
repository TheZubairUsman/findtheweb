import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiEdit, FiTrash2, FiSearch, FiFilter, 
  FiUpload, FiDownload, FiEye, FiExternalLink,
  FiCheck, FiX, FiStar, FiTrendingUp, FiArrowLeft
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const WebsiteManager = () => {
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchWebsites();
    fetchCategories();
  }, [currentPage, searchTerm, filterTier, filterStatus]);

  const fetchWebsites = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(filterTier && { tier: filterTier }),
        ...(filterStatus && { status: filterStatus }),
      });

      const response = await fetch(`/api/v1/websites?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        setWebsites(data.data || []);
        setTotalPages(Math.ceil((data.total || data.data?.length || 0) / 20));
      }
    } catch (error) {
      console.error('Error fetching websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/v1/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Set default categories if API fails
      setCategories([
        { id: '1', name: 'Web Development' },
        { id: '2', name: 'Design Tools' },
        { id: '3', name: 'Productivity' },
        { id: '4', name: 'Marketing' },
        { id: '5', name: 'Analytics' }
      ]);
    }
  };

  const handleDelete = async (websiteId) => {
    if (!confirm('Are you sure you want to delete this website?')) return;

    try {
      const response = await fetch(`/api/v1/websites/${websiteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (response.ok) {
        fetchWebsites();
      }
    } catch (error) {
      console.error('Error deleting website:', error);
    }
  };

  const WebsiteForm = ({ website, onClose, onSave }) => {
    const [formData, setFormData] = useState({
      name: website?.name || '',
      url: website?.url || '',
      description: website?.description || '',
      categoryId: website?.categoryId || '',
      tier: website?.tier || 'standard',
      region: website?.region || 'global',
      status: website?.status || 'active',
      featured: website?.featured || false,
      verified: website?.verified || false,
      seoTitle: website?.seoTitle || '',
      seoDescription: website?.seoDescription || '',
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const url = website 
          ? `/api/v1/websites/${website.id}`
          : '/api/v1/websites';
        
        const method = website ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          onSave();
          onClose();
          fetchWebsites();
        }
      } catch (error) {
        console.error('Error saving website:', error);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              {website ? 'Edit Website' : 'Add New Website'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tier
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  value={formData.seoTitle}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Region
                </label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SEO Description
              </label>
              <textarea
                rows={2}
                value={formData.seoDescription}
                onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="mr-2"
                />
                Featured
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.verified}
                  onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                  className="mr-2"
                />
                Verified
              </label>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {website ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const getTierBadge = (tier) => {
    const colors = {
      standard: 'bg-gray-100 text-gray-800',
      premium: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-indigo-100 text-indigo-800',
    };
    return `px-2 py-1 text-xs rounded-full ${colors[tier] || colors.standard}`;
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    return `px-2 py-1 text-xs rounded-full ${colors[status] || colors.pending}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Link 
              to="/admin"
              className="flex items-center text-purple-600 hover:text-purple-700"
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <span className="text-gray-400">|</span>
            <h1 className="text-2xl font-bold text-gray-900">Website Management</h1>
          </div>
          <div className="flex space-x-4">
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <FiUpload className="w-4 h-4 mr-2" />
              Bulk Upload
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add Website
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search websites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Tiers</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterTier('');
                  setFilterStatus('');
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Website Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Website
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {websites.map((website) => (
                    <tr key={website.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">
                                {website.name}
                              </div>
                              {website.featured && (
                                <FiStar className="w-4 h-4 text-yellow-500 ml-2" />
                              )}
                              {website.verified && (
                                <FiCheck className="w-4 h-4 text-green-500 ml-1" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {website.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {website.category?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getTierBadge(website.tier)}>
                          {website.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(website.status)}>
                          {website.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          {website.weeklyHits || website.totalHits || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => window.open(website.url, '_blank')}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FiExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWebsite(website);
                              setShowEditModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(website.id)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === currentPage
                            ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {showAddModal && (
          <WebsiteForm
            onClose={() => setShowAddModal(false)}
            onSave={() => setShowAddModal(false)}
          />
        )}

        {showEditModal && selectedWebsite && (
          <WebsiteForm
            website={selectedWebsite}
            onClose={() => {
              setShowEditModal(false);
              setSelectedWebsite(null);
            }}
            onSave={() => {
              setShowEditModal(false);
              setSelectedWebsite(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default WebsiteManager;
