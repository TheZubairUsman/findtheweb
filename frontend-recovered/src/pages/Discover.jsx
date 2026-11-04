import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import SEOHead from '../components/SEO/SEOHead';
import { apiUrl } from '../utils/apiUrl';

const sorts = ['newest', 'trending', 'popular'];

export default function Discover() {
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState(params.get('q') || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const query = params.toString();
  const page = Math.max(1, Number(params.get('page')) || 1);
  const sort = sorts.includes(params.get('sort')) ? params.get('sort') : 'newest';

  useEffect(() => {
    setDraft(params.get('q') || '');
  }, [params]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetch(apiUrl(`/api/v1/discover?${query}`), { signal: controller.signal })
      .then(async response => {
        const body = await response.json();
        if (!response.ok || !body.success || !Array.isArray(body.data)) throw Error(body.message || 'Discovery is unavailable');
        return body;
      })
      .then(body => { if (!controller.signal.aborted) setResult(body); })
      .catch(err => { if (!controller.signal.aborted) setError(err.message || 'Discovery is unavailable'); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, retry]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    next.delete('page');
    setParams(next);
  };

  return <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
    <SEOHead title="Discover useful websites | FindTheWeb" description="Explore useful web tools with practical descriptions and clear links to each product." url="https://findtheweb.zus3cu.tech/discover" type="website" />
    <Header />
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">FindTheWeb Discovery</p>
        <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">Find a useful website for your next task.</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">Search the directory, compare what a tool helps with, and save promising options for later.</p>
      </div>
      <form className="mb-5 flex max-w-3xl gap-2" onSubmit={event => { event.preventDefault(); update('q', draft.trim().slice(0, 100)); }}>
        <label htmlFor="discover-search" className="sr-only">Search websites</label>
        <input id="discover-search" value={draft} onChange={event => setDraft(event.target.value)} maxLength={100} placeholder="Search websites and problems…" className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
        <button type="submit" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Search</button>
      </form>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label htmlFor="discover-sort" className="font-medium">Sort by</label>
        <select id="discover-sort" value={sort} onChange={event => update('sort', event.target.value)} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
          <option value="newest">Newest</option><option value="trending">Trending</option><option value="popular">Most visited</option>
        </select>
        <Link to="/categories" className="text-blue-700 underline dark:text-blue-300">Browse categories</Link>
      </div>
      {loading && <p role="status" className="py-12">Loading websites…</p>}
      {!loading && error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">{error} <button className="ml-2 underline" onClick={() => setRetry(value => value + 1)}>Try again</button></div>}
      {!loading && !error && result && <>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">{result.pagination?.total || 0} websites found</p>
        {result.data.length === 0 ? <div className="rounded-xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900"><h2 className="text-xl font-semibold">No matches yet</h2><p className="mt-2 text-gray-600 dark:text-gray-300">Try a shorter search or browse all categories.</p></div> :
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{result.data.map(item => <Link key={item.id} to={`/discover/${encodeURIComponent(item.id)}`} className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-3 flex items-center justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-xl dark:bg-blue-950" aria-hidden="true">🌐</span>{item.verified && <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">Verified</span>}</div>
            <h2 className="text-xl font-semibold group-hover:text-blue-700 dark:group-hover:text-blue-300">{item.name}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">{item.product?.problem || item.description}</p>
            <span className="mt-4 inline-block text-sm font-medium text-blue-700 dark:text-blue-300">View details →</span>
          </Link>)}</div>}
        <nav aria-label="Discovery pages" className="mt-8 flex gap-3">{page > 1 && <button className="rounded-lg border px-4 py-2 dark:border-gray-700" onClick={() => { const next = new URLSearchParams(params); next.set('page', String(page - 1)); setParams(next); }}>Previous</button>}{page < (result.pagination?.pages || 1) && <button className="rounded-lg border px-4 py-2 dark:border-gray-700" onClick={() => { const next = new URLSearchParams(params); next.set('page', String(page + 1)); setParams(next); }}>Next</button>}</nav>
      </>}
    </main>
  </div>;
}
