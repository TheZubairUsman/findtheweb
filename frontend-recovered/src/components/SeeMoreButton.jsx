import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const SeeMoreButton = ({ onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-3 px-4 mt-4 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
    >
      <div className="flex items-center justify-center gap-2">
        <span>See More</span>
        <ChevronDownIcon className="w-4 h-4" />
      </div>
    </button>
  );
};

export default SeeMoreButton;
