(function () {
  'use strict';

  var siteUrl = 'https://findtheweb.zus3cu.tech';
  var title = 'FindTheWeb | Curated Websites, Tools & Hidden Gems';
  var description = 'Find useful websites, AI tools, productivity apps, and hidden internet gems through a focused, hand-picked directory.';
  var apiBase = 'https://api.zus3cu.tech/findtheweb';
  var analyticsEndpoint = apiBase + '/api/v1/analytics/events';

  function installApiBridge() {
    if (window.__findthewebApiBridgeInstalled || typeof window.fetch !== 'function') return;
    var nativeFetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
      var url = typeof input === 'string' ? input : input && input.url;
      if (url && /^\/api\/v1\//.test(url)) {
        var rewritten = apiBase + url.replace('/api/v1', '');
        if (typeof input === 'string') input = rewritten;
        else input = new Request(rewritten, input);
      }
      return nativeFetch(input, init);
    };
    window.__findthewebApiBridgeInstalled = true;
  }

  function setMeta(selector, attribute, value) {
    var node = document.querySelector(selector);
    if (node && node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
  }

  function setPageSeo(pageTitle, pageDescription) {
    document.title = pageTitle;
    setMeta('meta[name="title"]', 'content', pageTitle);
    setMeta('meta[name="description"]', 'content', pageDescription);
    setMeta('meta[property="og:title"]', 'content', pageTitle);
    setMeta('meta[property="og:description"]', 'content', pageDescription);
    setMeta('meta[name="twitter:title"]', 'content', pageTitle);
    setMeta('meta[name="twitter:description"]', 'content', pageDescription);
  }

  function sendAnalytics(event, extra) {
    try {
      var body = Object.assign({
        event: event,
        path: window.location.pathname,
        referrer: document.referrer || undefined,
      }, extra || {});
      window.fetch(analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(function () {});
    } catch (_) {}
  }

  function installDiscoveryTracking() {
    if (window.__findthewebDiscoveryTrackingInstalled) return;
    window.__findthewebDiscoveryTrackingInstalled = true;
    document.addEventListener('click', function (event) {
      var link = event.target && event.target.closest ? event.target.closest('a') : null;
      if (!link) return;
      var href = link.getAttribute('href') || '';
      if (href.indexOf('/blog/') === 0) sendAnalytics('article_open', { slug: href.split('/').pop() });
      if (href.indexOf('/products') === 0 || href.indexOf('/discover') === 0) sendAnalytics('product_click');
    }, { passive: true });
    sendAnalytics('page_view');
  }

  function sanitizeRichContent() {
    document.querySelectorAll('[data-blog-content], .blog-content, .article-content, .prose').forEach(function (container) {
      container.querySelectorAll('script, style, iframe, object, embed, form').forEach(function (node) { node.remove(); });
      container.querySelectorAll('*').forEach(function (node) {
        Array.prototype.slice.call(node.attributes).forEach(function (attribute) {
          if (/^on/i.test(attribute.name) || (typeof attribute.value === 'string' && /^javascript:/i.test(attribute.value))) {
            node.removeAttribute(attribute.name);
          }
        });
      });
    });
  }

  function ensureStructuredData() {
    var canonical = siteUrl + window.location.pathname;
    var existing = document.getElementById('findtheweb-breadcrumb-schema');
    if (!existing) {
      existing = document.createElement('script');
      existing.id = 'findtheweb-breadcrumb-schema';
      existing.type = 'application/ld+json';
      document.head.appendChild(existing);
    }
    existing.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [{ '@type': 'ListItem', position: 1, name: 'FindTheWeb', item: siteUrl },
        { '@type': 'ListItem', position: 2, name: document.title, item: canonical }],
    });
  }

  function cleanAdminErrorPanel() {
    if (window.location.pathname.indexOf('/admin') !== 0) return;
    document.querySelectorAll('h1, h2').forEach(function (node) {
      if (node.textContent.trim() !== 'Something went wrong') return;
      var panel = node.parentElement;
      if (panel && panel.textContent.indexOf("We're sorry") !== -1) panel.style.display = 'none';
    });
  }

  function renderRecoveryPage() {
    if (window.location.pathname === '/products') {
      window.location.replace('/blog');
      return;
    }
    var root = document.getElementById('root');
    if (!root || !root.textContent.includes('Something went wrong')) return;

    if (window.location.pathname === '/products') {
      setPageSeo('Products | FindTheWeb', 'Explore focused collections of useful products, tools, and workflows for modern work.');
      root.innerHTML = `
        <div class="ftw-product-page">
          <header class="ftw-product-hero">
            <span class="ftw-kicker">FindTheWeb collections</span>
            <h1>Tools that move good work forward.</h1>
            <p>Explore practical software, AI utilities, and focused workflows selected for people who value clarity over noise.</p>
            <a class="ftw-solid-button" href="/categories">Explore the directory</a>
          </header>
          <main class="ftw-product-content">
            <div class="ftw-section-heading"><span class="ftw-kicker">Curated for momentum</span><h2>Start with a direction</h2><p>Choose a collection, then discover the tools that fit your way of working.</p></div>
            <div class="ftw-product-grid">
              <article><span class="ftw-card-number">01</span><h3>AI &amp; automation</h3><p>Find assistants, workflow builders, and research tools that reduce repetitive work.</p><a href="/category/ai-workflow-integrators">Browse AI tools <span>→</span></a></article>
              <article><span class="ftw-card-number">02</span><h3>Productivity systems</h3><p>Discover planning, focus, note-taking, and collaboration tools for calmer execution.</p><a href="/category/productivity-tools">Browse productivity <span>→</span></a></article>
              <article><span class="ftw-card-number">03</span><h3>Developer toolkit</h3><p>Explore coding environments, APIs, debugging utilities, and infrastructure resources.</p><a href="/category/coding-environments">Browse developer tools <span>→</span></a></article>
            </div>
            <section class="ftw-product-cta"><h2>Know a tool worth sharing?</h2><p>Help the next curious builder find it.</p><a class="ftw-outline-button" href="/contact">Submit a website</a></section>
          </main>
        </div>`;
      return;
    }

    if (window.location.pathname === '/blog') {
      setPageSeo('The FindTheWeb Journal | Ideas for Better Work', 'Practical ideas about discovering better tools, building useful workflows, and navigating the modern web.');
      root.innerHTML = `
        <div class="ftw-journal-page">
          <header class="ftw-journal-header"><div><span class="ftw-kicker">The FindTheWeb Journal</span><h1>Ideas for a more useful internet.</h1><p>Notes on tools, workflows, AI, and the small discoveries that make modern work feel lighter.</p></div><a class="ftw-outline-button" href="/categories">Explore tools</a></header>
          <main class="ftw-journal-layout">
            <section class="ftw-feature-story"><span class="ftw-story-label">Featured essay · 6 min read</span><h2>How to build a calmer personal toolkit</h2><p>A practical way to move from endless tabs to a small, trusted collection of tools that actually supports your work.</p><a href="/categories">Read the collection <span>→</span></a></section>
            <section class="ftw-story-list" aria-label="Latest stories">
              <article><div><span class="ftw-story-label">Discovery</span><h3>Search less. Choose better.</h3><p>What makes a web resource worth saving—and how a curated directory can help.</p></div><span class="ftw-story-meta">4 min read</span></article>
              <article><div><span class="ftw-story-label">AI &amp; work</span><h3>The practical AI stack for a solo builder</h3><p>A framework for separating useful automation from novelty and noise.</p></div><span class="ftw-story-meta">7 min read</span></article>
              <article><div><span class="ftw-story-label">Workflow</span><h3>Designing a digital workspace that stays findable</h3><p>Simple principles for organizing tools, references, and ideas without overengineering.</p></div><span class="ftw-story-meta">5 min read</span></article>
            </section>
          </main>
          <footer class="ftw-journal-footer"><span>New discoveries, thoughtfully organized.</span><a href="/contact">Suggest a story or resource →</a></footer>
        </div>`;
    }
  }

  function renderDiscoveryPage() {
    var match = window.location.pathname.match(/^\/discover\/([^/]+)/);
    if (!match) return;
    var root = document.getElementById('root');
    if (!root) return;
    var id = decodeURIComponent(match[1]);
    var marker = 'data-ftw-discovery';
    if (root.getAttribute(marker) === id) return;
    root.setAttribute(marker, id);
    setPageSeo('Discovering… | FindTheWeb', 'A practical product profile with trade-offs, privacy notes, and useful next steps.');
    root.innerHTML = '<main class="ftw-discovery-page"><div class="ftw-discovery-loading"><span class="ftw-kicker">FindTheWeb discovery</span><h1>Loading a clearer choice…</h1><p>We are checking the product profile and its practical fit.</p></div></main>';
    fetch(apiBase + '/api/v1/discover/' + encodeURIComponent(id))
      .then(function (response) { if (!response.ok) throw new Error('not found'); return response.json(); })
      .then(function (payload) {
        var item = payload && payload.data;
        if (!item) throw new Error('empty');
        var product = item.product || {};
        var pricing = product.pricing || {};
        var privacy = product.privacy || {};
        var esc = function (value) { return String(value == null ? '' : value).replace(/[&<>\"']/g, function (ch) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' })[ch]; }); };
        var list = function (values) { return (values || []).filter(Boolean).map(function (value) { return '<li>' + esc(value) + '</li>'; }).join(''); };
        var alternatives = (product.alternatives || []).map(function (alt) { return '<li><strong>' + esc(alt.name) + '</strong>' + (alt.reason ? ' — ' + esc(alt.reason) : '') + (alt.url ? ' <a href="' + esc(alt.url) + '" target="_blank" rel="noreferrer">Visit</a>' : '') + '</li>'; }).join('');
        setPageSeo(item.name + ' | FindTheWeb', item.description || 'A practical product profile from FindTheWeb.');
        root.innerHTML = '<main class="ftw-discovery-page"><a class="ftw-discovery-back" href="/categories">← Back to discovery</a><header class="ftw-discovery-hero"><span class="ftw-kicker">' + esc(item.category || 'Web resource') + '</span><h1>' + esc(item.name) + '</h1><p>' + esc(item.description || 'A useful resource worth a closer look.') + '</p><div class="ftw-discovery-actions"><a class="ftw-solid-button" href="' + esc(item.url) + '" target="_blank" rel="noreferrer" data-ftw-product-visit>Visit website ↗</a><span class="ftw-discovery-trust">' + (item.verified ? '✓ Verified listing' : 'Curated listing') + '</span></div></header><section class="ftw-discovery-grid"><article><span class="ftw-kicker">Decision guide</span><h2>Is it a good fit?</h2><h3>Best for</h3><ul>' + list(product.bestFor) + '</ul><h3>Not for</h3><ul>' + list(product.notFor) + '</ul><h3>What it helps with</h3><p>' + esc(product.problem || 'Use the product description and your own workflow as the starting point for evaluation.') + '</p></article><aside><span class="ftw-kicker">Quick facts</span><h2>Before you try it</h2><dl><dt>Pricing</dt><dd>' + esc(pricing.summary || pricing.model || 'Check the provider for current pricing.') + (pricing.startingAt ? ' · from ' + esc(pricing.startingAt) : '') + '</dd><dt>Privacy &amp; security</dt><dd>' + esc(privacy.securityNotes || privacy.dataCollection || 'Review permissions and data handling before sharing sensitive information.') + '</dd>' + (product.lastVerifiedAt ? '<dt>Last verified</dt><dd>' + esc(product.lastVerifiedAt) + '</dd>' : '') + '</dl></aside></section>' + (product.useCases && product.useCases.length ? '<section class="ftw-discovery-section"><span class="ftw-kicker">Use cases</span><h2>Try it with a specific outcome</h2><ul class="ftw-discovery-list">' + list(product.useCases) + '</ul></section>' : '') + (alternatives ? '<section class="ftw-discovery-section"><span class="ftw-kicker">Alternatives</span><h2>Compare before committing</h2><ul class="ftw-discovery-list">' + alternatives + '</ul></section>' : '') + '</main>';
        document.querySelector('[data-ftw-product-visit]').addEventListener('click', function () { sendAnalytics('product_click', { productId: item.id, productName: item.name }); });
      }).catch(function () { root.innerHTML = '<main class="ftw-discovery-page"><div class="ftw-discovery-loading"><span class="ftw-kicker">FindTheWeb discovery</span><h1>We could not load this profile.</h1><p>Return to the directory and choose another resource.</p><a class="ftw-solid-button" href="/categories">Back to discovery</a></div></main>'; });
  }

  function applyAdminPolish() {
    var isAdmin = window.location.pathname.indexOf('/admin') === 0;
    document.body.classList.toggle('ftw-admin-shell', isAdmin);
  }

  function removeRetiredProductNavigation() {
    if (window.location.pathname.indexOf('/admin') === 0) return;
    document.querySelectorAll('a[href="/products"], a[href^="/products/"]').forEach(function (link) {
      var navigation = link.closest('nav, header, footer');
      if (navigation) link.remove();
    });
  }

  function applyReleasePolish() {
    installApiBridge();
    document.title = title;
    setMeta('meta[name="title"]', 'content', title);
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:image"]', 'content', siteUrl + '/logo.png');
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', siteUrl + '/logo.png');

    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = siteUrl + window.location.pathname;
    ensureStructuredData();
    sanitizeRichContent();
    installDiscoveryTracking();

    document.querySelectorAll('script[type="application/ld+json"]').forEach(function (node) {
      if (node.textContent.indexOf('findtheweb.com') !== -1) {
        node.textContent = node.textContent.replace(/https?:\/\/findtheweb\.com/g, siteUrl);
      }
    });

    document.querySelectorAll('a[href*="findtheweb.com"]').forEach(function (link) {
      link.href = link.href.replace(/https?:\/\/findtheweb\.com/g, siteUrl);
    });

    var heading = Array.prototype.find.call(document.querySelectorAll('h1'), function (node) {
      return node.textContent.trim() === 'Discover the Best Web Resources';
    });
    if (heading) {
      heading.textContent = 'Find useful websites faster.';
      heading.classList.add('ftw-release-title');
      var hero = heading.closest('section');
      if (hero) hero.classList.add('ftw-release-hero');
    }

    document.querySelectorAll('input[placeholder="Search websites and tools"]').forEach(function (input) {
      input.placeholder = 'Search 5,000+ websites, tools, and resources';
    });

    renderRecoveryPage();
    renderDiscoveryPage();
    removeRetiredProductNavigation();
    applyAdminPolish();
    cleanAdminErrorPanel();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      applyReleasePolish();
    });
  }

  document.addEventListener('DOMContentLoaded', schedule);
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, attributes: true });
  schedule();
}());
