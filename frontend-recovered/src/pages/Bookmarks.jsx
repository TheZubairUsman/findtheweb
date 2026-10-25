import React from 'react';
import { Link } from 'react-router-dom';

const Bookmarks = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="text-gray-500 hover:text-gray-700">
              ← Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Bookmarks
            </h1>
            <div></div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">
            Bookmarks page functionality will be implemented in future phases.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Bookmarks; 