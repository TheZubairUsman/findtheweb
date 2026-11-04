import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../components/Header';
import SEOHead from '../components/SEO/SEOHead';
import { useBookmarks } from '../context/BookmarkContext';
import { apiUrl } from '../utils/apiUrl';

const safeWebUrl = value => {
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
};

export default function DiscoveryItem() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setItem(null);
    fetch(apiUrl(`/api/v1/discover/${encodeURIComponent(id)}`), { signal: controller.signal })
      .then(async response => { const body = await response.json(); if (!response.ok || !body.success || !body.data) throw Error(body.message || 'Website not found'); return body.data; })
      .then(data => { if (!controller.signal.aborted) setItem(data); })
      .catch(err => { if (!controller.signal.aborted) setError(err.message || 'Website not found'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [id]);

  const product = item?.product || {};
  const destination = safeWebUrl(item?.url);
  const saved = item && isBookmarked(item.id);
  return <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
    <SEOHead title={item ? `${item.name} | FindTheWeb` : 'Website details | FindTheWeb'} description={item?.description || 'Explore a website on FindTheWeb.'} url={`https://findtheweb.zus3cu.tech/discover/${encodeURIComponent(id)}`} type="website" />
    <Header />
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link to="/discover" className="text-blue-700 underline dark:text-blue-300">← Back to discovery</Link>
      {loading && <p role="status" className="py-12">Loading website…</p>}
      {!loading && error && <div role="alert" className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error}</div>}
      {!loading && item && <>
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-9">
          <div className="mb-3 flex flex-wrap gap-2 text-sm"><span className="rounded-full bg-blue-50 px-3 py-1 text-blue-800 dark:bg-blue-950 dark:text-blue-200">{item.tier || 'Website'}</span>{item.verified && <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Verified listing</span>}</div>
          <h1 className="text-4xl font-bold tracking-tight">{item.name}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600 dark:text-gray-300">{product.problem || item.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {destination && <a href={destination} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Visit website ↗</a>}
            <button type="button" onClick={() => saved ? removeBookmark(item.id) : addBookmark(item)} className="rounded-lg border border-gray-300 px-5 py-3 font-semibold dark:border-gray-700">{saved ? 'Remove saved website' : 'Save for later'}</button>
          </div>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"><h2 className="text-xl font-semibold">What it does</h2><p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">{item.description}</p>{product.audience && <p className="mt-4"><strong>Best suited to:</strong> {product.audience}</p>}</section>
          <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"><h2 className="text-xl font-semibold">Before you try it</h2><p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">{product.pricing?.summary || 'Pricing details have not been independently checked.'}</p><p className="mt-3 leading-7 text-gray-600 dark:text-gray-300">{product.privacy?.securityNotes || 'Review the provider’s current privacy and security terms before sharing sensitive data.'}</p>{product.lastVerifiedAt && <p className="mt-4 text-sm text-gray-500">Information checked: {product.lastVerifiedAt}</p>}</section>
        </div>
        {Array.isArray(product.bestFor) && product.bestFor.length > 0 && <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"><h2 className="text-xl font-semibold">Useful for</h2><ul className="mt-3 list-inside list-disc space-y-2">{product.bestFor.map((reason, index) => <li key={index}>{reason}</li>)}</ul></section>}
        {Array.isArray(product.alternatives) && product.alternatives.length > 0 && <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"><h2 className="text-xl font-semibold">Other options to consider</h2><p className="mt-2 text-sm text-gray-600 dark:text-gray-300">These are editorial suggestions, not a ranked comparison.</p><ul className="mt-4 grid gap-3 sm:grid-cols-2">{product.alternatives.map((option, index) => { const href = safeWebUrl(option.url); return <li key={`${option.name}-${index}`} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"><h3 className="font-semibold">{href ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline dark:text-blue-300">{option.name} ↗</a> : option.name}</h3>{option.reason && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{option.reason}</p>}</li>; })}</ul></section>}
        {Array.isArray(product.articleSlugs) && product.articleSlugs.length > 0 && <section className="mt-6"><h2 className="mb-3 text-xl font-semibold">Related reading</h2><ul className="space-y-2">{product.articleSlugs.map(slug => <li key={slug}><Link to={`/blog/${encodeURIComponent(slug)}`} className="text-blue-700 underline dark:text-blue-300">{slug.replaceAll('-', ' ')}</Link></li>)}</ul></section>}
      </>}
    </main>
  </div>;
}
