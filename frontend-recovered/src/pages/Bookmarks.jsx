import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import WebsiteCard from '../components/WebsiteCard';
import SEOHead from '../components/SEO/SEOHead';
import { useBookmarks } from '../context/BookmarkContext';

export default function Bookmarks() {
  const { bookmarks } = useBookmarks();
  const [search, setSearch] = useState('');
  const matches = bookmarks.filter(item => `${item.name || ''} ${item.description || ''}`.toLowerCase().includes(search.toLowerCase().trim()));
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
    <SEOHead title="Saved websites - FindTheWeb" description="Your personal reading list of useful websites and tools." noindex />
    <Header />
    <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Saved websites</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">{bookmarks.length} saved {bookmarks.length === 1 ? 'website' : 'websites'}. Your list stays in this browser.</p>
      {bookmarks.length > 0 ? <>
        <label htmlFor="saved-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search saved websites</label>
        <input id="saved-search" type="search" value={search} onChange={event=>setSearch(event.target.value)} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 mb-8" />
        {matches.length ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{matches.map(item=><WebsiteCard key={item.id} website={item}/>)}</div>
          : <p role="status" className="text-gray-600 dark:text-gray-300">No saved websites match your search.</p>}
      </> : <section className="rounded-lg border border-gray-200 bg-white dark:bg-gray-800 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">No saved websites yet</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Use the heart on a website card to save it for later.</p>
        <Link to="/categories" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg">Explore categories</Link>
      </section>}
    </main>
  </div>;
}
