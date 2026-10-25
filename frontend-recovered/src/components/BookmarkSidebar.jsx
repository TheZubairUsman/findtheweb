import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { useBookmarks } from '../context/BookmarkContext';

const BookmarkSidebar = ({ isOpen, onClose }) => {
  const { bookmarks, removeBookmark } = useBookmarks();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-xl dark:bg-gray-900">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <StarIcon className="h-6 w-6 text-primary-600" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Bookmarks
                        </h2>
                      </div>
                      <button
                        onClick={onClose}
                        className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        aria-label="Close bookmarks"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                      {bookmarks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full px-6 py-12">
                          <StarIcon className="h-12 w-12 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-white">
                            No bookmarks yet
                          </h3>
                          <p className="text-gray-500 text-center dark:text-gray-400">
                            Start exploring websites and click the heart icon to bookmark your favorites.
                          </p>
                        </div>
                      ) : (
                        <div className="px-6 py-4">
                          <div className="mb-4">
                            <h3 className="text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                              FindTheWeb
                            </h3>
                          </div>
                          
                          <div className="space-y-3">
                            {bookmarks.map((bookmark) => (
                              <div
                                key={bookmark.id}
                                className="bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-gray-900 line-clamp-2 dark:text-white">
                                    {bookmark.name}
                                  </h4>
                                  <button
                                    onClick={() => removeBookmark(bookmark.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                                    aria-label={`Remove ${bookmark.name} from bookmarks`}
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                </div>
                                
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2 dark:text-gray-300">
                                  {bookmark.description}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  {/* Region */}
                                  {bookmark.regions && bookmark.regions.length > 0 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {bookmark.regions.map(region => {
                                        const regionFlags = {
                                          'global': '🌐',
                                          'us': '🇺🇸',
                                          'in': '🇮🇳',
                                          'jp': '🇯🇵'
                                        };
                                        return regionFlags[region] || region;
                                      }).join(' ')}
                                    </span>
                                  )}
                                  
                                  {/* Visit Button */}
                                  <button
                                    onClick={() => window.open(bookmark.url, '_blank', 'noopener,noreferrer')}
                                    className="btn-primary text-xs px-3 py-1"
                                    aria-label={`Visit ${bookmark.name}`}
                                  >
                                    Visit
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default BookmarkSidebar; 