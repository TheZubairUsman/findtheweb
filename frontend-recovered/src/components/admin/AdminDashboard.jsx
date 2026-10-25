import React, { useState, useEffect } from 'react';
import { 
  FiGlobe, FiFileText, FiTrendingUp, FiEye, 
  FiThumbsUp, FiRefreshCw, FiDownload, FiUpload, 
  FiSettings, FiLogOut, FiShield
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/v1/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/admin/login';
  };

  const StatCard = ({ title, value, icon: Icon, change, color = 'purple' }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value?.toLocaleString() || '0'}</p>
          {change && (
            <p className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '+' : ''}{change}% from last period
            </p>
          )}
        </div>
        <div className="p-3 rounded-full bg-purple-100">
          <Icon className="w-6 h-6 text-purple-600" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-2xl font-bold text-purple-600">
                FindTheWeb
              </Link>
              <span className="text-gray-400">|</span>
              <div className="flex items-center space-x-2">
                <FiShield className="w-5 h-5 text-purple-600" />
                <span className="text-lg font-semibold text-gray-900">Admin Panel</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name || 'Administrator'}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiLogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">Manage your FindTheWeb platform</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <FiRefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Websites"
              value={dashboardData.totalWebsites || 0}
              icon={FiGlobe}
              color="purple"
            />
            <StatCard
              title="Total Posts"
              value={dashboardData.totalPosts || 0}
              icon={FiFileText}
              color="purple"
            />
            <StatCard
              title="Platform Status"
              value="Active"
              icon={FiTrendingUp}
              color="purple"
            />
          </div>
        )}

        {/* Website Tiers Summary */}
        {dashboardData?.websitesByTier && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Websites by Tier</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{dashboardData.websitesByTier.standard}</p>
                <p className="text-sm text-gray-600">Standard</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-900">{dashboardData.websitesByTier.premium}</p>
                <p className="text-sm text-purple-600">Premium</p>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-2xl font-bold text-indigo-900">{dashboardData.websitesByTier.enterprise}</p>
                <p className="text-sm text-indigo-600">Enterprise</p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Websites */}
          {dashboardData?.recentWebsites && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Websites</h3>
              <div className="space-y-4">
                {dashboardData.recentWebsites.slice(0, 5).map((website, index) => (
                  <div key={website.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{website.name}</p>
                        <p className="text-sm text-gray-600">{website.tier}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{website.totalHits || 0}</p>
                      <p className="text-sm text-gray-600">hits</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Posts */}
          {dashboardData?.recentPosts && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h3>
              <div className="space-y-4">
                {dashboardData.recentPosts.slice(0, 5).map((post, index) => (
                  <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{post.title}</p>
                        <p className="text-sm text-gray-600">{new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{post.voteCount || 0}</p>
                      <p className="text-sm text-gray-600">votes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/websites"
              className="flex items-center justify-center p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <FiGlobe className="w-5 h-5 mr-2" />
              Manage Websites
            </Link>
            <button className="flex items-center justify-center p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
              <FiDownload className="w-5 h-5 mr-2" />
              Export Data
            </button>
            <button className="flex items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              <FiUpload className="w-5 h-5 mr-2" />
              Bulk Upload
            </button>
            <button className="flex items-center justify-center p-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
              <FiSettings className="w-5 h-5 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
