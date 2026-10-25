import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  FiPlus, FiEdit, FiTrash2, FiEye, FiSave, FiX,
  FiSearch, FiFilter, FiUpload, FiDownload, FiExternalLink,
  FiStar, FiTrendingUp, FiCheck, FiAlertCircle
} from 'react-icons/fi';

const ProductManager = () => {
  const { adminToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    category: '',
    tier: 'standard',
    status: 'active',
    featured: false,
    tags: [],
    logo: '',
    screenshots: [],
    pricing: {
      free: true,
      freemium: false,
      paid: false,
      price: ''
    },
    features: [],
    pros: [],
    cons: []
  });

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, tierFilter, statusFilter]);

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(tierFilter !== 'all' && { tier: tierFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(`/api/v1/websites?${params}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
        setTotalPages(Math.ceil((data.total || data.data?.length || 0) / 20));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      url: '',
      category: '',
      tier: 'standard',
      status: 'active',
      featured: false,
      tags: [],
      logo: '',
      screenshots: [],
      pricing: {
        free: true,
        freemium: false,
        paid: false,
        price: ''
      },
      features: [],
      pros: [],
      cons: []
    });
    setShowEditor(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      url: product.url || '',
      category: product.category || '',
      tier: product.tier || 'standard',
      status: product.status || 'active',
      featured: product.featured || false,
      tags: product.tags || [],
      logo: product.logo || '',
      screenshots: product.screenshots || [],
      pricing: product.pricing || {
        free: true,
        freemium: false,
        paid: false,
        price: ''
      },
      features: product.features || [],
      pros: product.pros || [],
      cons: product.cons || []
    });
    setShowEditor(true);
  };

  const handleSaveProduct = async () => {
    try {
      const url = editingProduct 
        ? `/api/v1/websites/${editingProduct.id}`
        : '/api/v1/websites';
      
      const method = editingProduct ? 'PUT' : 'POST';

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
        fetchProducts();
      } else {
        alert(data.message || 'Error saving product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/v1/websites/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchProducts();
      } else {
        alert(data.message || 'Error deleting product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const getTierBadge = (tier) => {
    const colors = {
      standard: 'bg-gray-100 text-gray-800',
      premium: 'bg-blue-100 text-blue-800',
      enterprise: 'bg-purple-100 text-purple-800'
    };
    return colors[tier] || colors.standard;
  };

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.active;
  };

  if (showEditor) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
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
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter product name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the product..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL *
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Productivity, Design, Development"
                  />
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Features & Details</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Features (comma-separated)
                  </label>
                  <textarea
                    value={formData.features.join(', ')}
                    onChange={(e) => setFormData({...formData, features: e.target.value.split(',').map(f => f.trim()).filter(Boolean)})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Feature 1, Feature 2, Feature 3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pros (comma-separated)
                    </label>
                    <textarea
                      value={formData.pros.join(', ')}
                      onChange={(e) => setFormData({...formData, pros: e.target.value.split(',').map(p => p.trim()).filter(Boolean)})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Pro 1, Pro 2, Pro 3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cons (comma-separated)
                    </label>
                    <textarea
                      value={formData.cons.join(', ')}
                      onChange={(e) => setFormData({...formData, cons: e.target.value.split(',').map(c => c.trim()).filter(Boolean)})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Con 1, Con 2, Con 3"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status & Settings */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">Status & Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tier
                    </label>
                    <select
                      value={formData.tier}
                      onChange={(e) => setFormData({...formData, tier: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="standard">Standard</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending Review</option>
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
                      Featured Product
                    </label>
                  </div>
                </div>
              </div>

              {/* Media */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={formData.logo}
                  onChange={(e) => setFormData({...formData, logo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/logo.png"
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
                  placeholder="productivity, saas, free"
                />
              </div>

              {/* Pricing */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-4">Pricing Model</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="free"
                      checked={formData.pricing.free}
                      onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, free: e.target.checked}})}
                      className="mr-2"
                    />
                    <label htmlFor="free" className="text-sm text-gray-700">Free</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="freemium"
                      checked={formData.pricing.freemium}
                      onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, freemium: e.target.checked}})}
                      className="mr-2"
                    />
                    <label htmlFor="freemium" className="text-sm text-gray-700">Freemium</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="paid"
                      checked={formData.pricing.paid}
                      onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, paid: e.target.checked}})}
                      className="mr-2"
                    />
                    <label htmlFor="paid" className="text-sm text-gray-700">Paid</label>
                  </div>

                  {formData.pricing.paid && (
                    <div>
                      <input
                        type="text"
                        value={formData.pricing.price}
                        onChange={(e) => setFormData({...formData, pricing: {...formData.pricing, price: e.target.value}})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Starting at $9/month"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleSaveProduct}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <FiSave className="w-4 h-4 mr-2" />
                  {editingProduct ? 'Update' : 'Create'}
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
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <button
          onClick={handleCreateProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Tiers</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No products found. Add your first product!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {product.logo && (
                          <img
                            src={product.logo}
                            alt=""
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {product.name}
                            {product.featured && (
                              <FiStar className="w-4 h-4 text-yellow-500 ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.category || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierBadge(product.tier)}`}>
                        {product.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <a
                          href={product.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
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
  );
};

export default ProductManager;
