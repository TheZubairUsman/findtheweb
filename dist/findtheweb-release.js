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
        var rewritten = apiBase + url;
        if (typeof input === 'string') input = rewritten;
        else input = new Request(rewritten, input);
      }
      return nativeFetch(input, init);
    };
    window.__findthewebApiBridgeInstalled = true;
  }

  // Install before the application module can make its first API request.
  installApiBridge();

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

      function applyBlogA11y() {
        if (!/^\/blog(?:\/|$)/.test(window.location.pathname)) return;
        var root = document.getElementById('root');
        if (!root) return;
        var existingTarget = document.getElementById('main-content');
        if (existingTarget && existingTarget.getAttribute('role') === 'navigation') existingTarget.removeAttribute('id');
        var mainTarget = root.querySelector('.min-h-screen.bg-gray-50 > .max-w-7xl') || root.querySelector('.min-h-screen.bg-gray-50 .max-w-7xl');
        if (mainTarget) {
          mainTarget.id = 'main-content';
          mainTarget.setAttribute('role', 'main');
        }
        root.querySelectorAll('input[placeholder="Search articles..."]').forEach(function (input) {
          if (!input.getAttribute('aria-label')) input.setAttribute('aria-label', 'Search articles');
        });
        root.querySelectorAll('select').forEach(function (select, index) {
          if (!select.getAttribute('aria-label')) select.setAttribute('aria-label', index === 0 ? 'Filter by category' : 'Filter by tag');
        });
        root.querySelectorAll('a[aria-label="Visit SCOLTECH GROUP website"]').forEach(function (link) {
          link.setAttribute('aria-label', link.textContent.trim());
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

  function renderSubmissionPage() {
    if (window.location.pathname !== '/submit') return;
    var root = document.getElementById('root');
    if (!root || root.querySelector('.ftw-submit-page')) return;
    setPageSeo('Submit a Website | FindTheWeb', 'Share a useful website with the FindTheWeb community. Every submission is reviewed before publication.');
    root.innerHTML = '<main class="ftw-submit-page"><header class="ftw-submit-hero"><span class="ftw-kicker">Community submissions</span><h1>Know a website worth finding?</h1><p>Share a useful resource with the FindTheWeb community. Every submission is reviewed by our team before it becomes public.</p></header><form class="ftw-submit-form" novalidate><div class="ftw-form-field"><label for="ftw-submit-name">Website name</label><input id="ftw-submit-name" name="name" required minlength="3" maxlength="100" placeholder="e.g. Linear" autocomplete="organization" /></div><div class="ftw-form-field"><label for="ftw-submit-url">Website URL</label><input id="ftw-submit-url" name="url" type="url" required maxlength="500" placeholder="https://example.com" inputmode="url" /></div><div class="ftw-form-field"><label for="ftw-submit-description">Why is it useful?</label><textarea id="ftw-submit-description" name="description" required minlength="10" maxlength="5000" rows="6" placeholder="Tell us what it helps people do and who it is for."></textarea><small>10–5000 characters. Clear, specific descriptions help us review faster.</small></div><div class="ftw-submit-two"><div class="ftw-form-field"><label for="ftw-submit-category">Category ID</label><select id="ftw-submit-category" name="categoryId" required><option value="">Loading categories…</option></select></div><div class="ftw-form-field"><label for="ftw-submit-email">Your email <span>(optional)</span></label><input id="ftw-submit-email" name="submitterEmail" type="email" maxlength="160" placeholder="you@example.com" autocomplete="email" /></div></div><div class="ftw-form-field ftw-honeypot" aria-hidden="true"><label for="ftw-submit-company">Company</label><input id="ftw-submit-company" name="company" tabindex="-1" autocomplete="off" /></div><div class="ftw-submit-actions"><button class="ftw-solid-button" type="submit">Send for review</button><a class="ftw-outline-button" href="/categories">Browse the directory</a></div><p class="ftw-submit-status" role="status" aria-live="polite"></p></form></main>';
    var form = root.querySelector('form');
    var status = root.querySelector('.ftw-submit-status');
    var categorySelect = root.querySelector('#ftw-submit-category');
    fetch(apiBase + '/api/v1/categories').then(function (response) { return response.ok ? response.json() : Promise.reject(new Error('categories')); }).then(function (payload) {
      var categories = Array.isArray(payload && payload.data) ? payload.data : [];
      categorySelect.innerHTML = '<option value="">Choose a category</option>' + categories.map(function (category) { return '<option value="' + escAttr(category.id) + '">' + escHtml(category.name || 'Category') + '</option>'; }).join('');
    }).catch(function () { categorySelect.innerHTML = '<option value="">Choose a category</option>'; });
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var data = Object.fromEntries(new FormData(form).entries());
      if (!data.name || data.name.trim().length < 3 || !data.url || !data.description || data.description.trim().length < 10 || !data.categoryId) {
        status.className = 'ftw-submit-status is-error'; status.textContent = 'Please complete the required fields before sending.'; return;
      }
      var button = form.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'Sending…'; status.className = 'ftw-submit-status'; status.textContent = '';
      fetch(apiBase + '/api/v1/discover/submissions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(function (response) { return response.json().then(function (payload) { if (!response.ok) throw new Error(payload.message || 'Unable to send submission'); return payload; }); }).then(function () { form.reset(); status.className = 'ftw-submit-status is-success'; status.textContent = 'Thanks — your submission is queued for review. We will only publish resources that meet our quality bar.'; }).catch(function (error) { status.className = 'ftw-submit-status is-error'; status.textContent = error.message || 'Unable to send submission. Please try again.'; }).finally(function () { button.disabled = false; button.textContent = 'Send for review'; });
    });
  }

  function escHtml(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]; }); }
  function escAttr(value) { return escHtml(value).replace(/`/g, '&#96;'); }

  function renderAdminSubmissions() {
    if (window.location.pathname !== '/admin/submissions') return;
    var root = document.getElementById('root');
    if (!root || root.querySelector('.ftw-moderation-page')) return;
    var token = localStorage.getItem('adminToken');
    setPageSeo('Moderate Submissions | FindTheWeb', 'Review and moderate community website submissions.');
    if (!token) { root.innerHTML = '<main class="ftw-moderation-page"><div class="ftw-moderation-empty"><span class="ftw-kicker">Private workspace</span><h1>Admin access required</h1><p>Sign in to review community submissions.</p><a class="ftw-solid-button" href="/admin/login">Go to admin login</a></div></main>'; return; }
    root.innerHTML = '<main class="ftw-moderation-page"><header class="ftw-moderation-header"><div><span class="ftw-kicker">Community queue</span><h1>Review submissions</h1><p>Approve only resources that are useful, clear, safe, and relevant to FindTheWeb.</p></div><button class="ftw-outline-button" type="button" data-ftw-refresh>Refresh queue</button></header><div class="ftw-moderation-status" role="status" aria-live="polite">Loading queue…</div><section class="ftw-moderation-list" aria-live="polite"></section></main>';
    var list = root.querySelector('.ftw-moderation-list'); var status = root.querySelector('.ftw-moderation-status');
    function loadQueue() { status.textContent = 'Loading queue…'; fetch(apiBase + '/api/v1/admin/submissions?status=pending&limit=50', { headers: { Authorization: 'Bearer ' + token } }).then(function (response) { return response.json().then(function (payload) { if (!response.ok) throw new Error(payload.message || 'Unable to load queue'); return payload; }); }).then(function (payload) { var items = Array.isArray(payload.data) ? payload.data : []; status.textContent = items.length ? items.length + ' submission' + (items.length === 1 ? '' : 's') + ' awaiting review.' : 'No pending submissions.'; list.innerHTML = items.map(function (item) { return '<article class="ftw-moderation-card" data-submission-id="' + escAttr(item.id) + '"><div><span class="ftw-story-label">Pending review</span><h2>' + escHtml(item.name) + '</h2><a href="' + escAttr(item.url) + '" target="_blank" rel="noreferrer">' + escHtml(item.url) + '</a><p>' + escHtml(item.description) + '</p><small>Category: ' + escHtml(item.categoryId) + (item.submitterEmail ? ' · Submitter: ' + escHtml(item.submitterEmail) : '') + '</small></div><div class="ftw-moderation-actions"><button type="button" data-decision="approve">Approve</button><button type="button" data-decision="reject">Reject</button></div></article>'; }).join(''); }).catch(function (error) { status.className = 'ftw-moderation-status is-error'; status.textContent = error.message || 'Unable to load queue.'; }); }
    root.querySelector('[data-ftw-refresh]').addEventListener('click', loadQueue);
    root.addEventListener('click', function (event) { var button = event.target.closest('[data-decision]'); if (!button) return; var card = button.closest('[data-submission-id]'); var decision = button.getAttribute('data-decision'); button.disabled = true; fetch(apiBase + '/api/v1/admin/submissions/' + encodeURIComponent(card.getAttribute('data-submission-id')), { method: 'PATCH', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ decision: decision }) }).then(function (response) { return response.json().then(function (payload) { if (!response.ok) throw new Error(payload.message || 'Unable to review submission'); return payload; }); }).then(function () { card.remove(); loadQueue(); }).catch(function (error) { status.className = 'ftw-moderation-status is-error'; status.textContent = error.message || 'Unable to review submission.'; button.disabled = false; }); });
    loadQueue();
  }

  function renderCommunityWorkspace() {
    if (window.location.pathname !== '/community') return;
    var root = document.getElementById('root');
    if (!root || root.querySelector('.ftw-community-page')) return;
    var token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
    setPageSeo('Community Workspace | FindTheWeb', 'Build your public FindTheWeb profile and curate collections of useful websites.');
    if (!token) {
      root.innerHTML = '<main class="ftw-community-page"><div class="ftw-community-empty"><span class="ftw-kicker">Creator workspace</span><h1>Build your FindTheWeb profile.</h1><p>Sign in to manage your profile and publish curated collections.</p><a class="ftw-solid-button" href="/admin/login">Sign in to continue</a></div></main>';
      return;
    }
    root.innerHTML = '<main class="ftw-community-page"><header class="ftw-community-header"><div><span class="ftw-kicker">Creator workspace</span><h1>Your corner of the useful web.</h1><p>Shape a public profile, save the tools you trust, and share focused collections with other curious builders.</p></div><a class="ftw-outline-button" href="/submit">Suggest a website</a></header><section class="ftw-community-grid"><form class="ftw-community-card ftw-profile-form"><span class="ftw-kicker">Public profile</span><h2>Tell people what you find useful.</h2><label>Handle<input name="handle" maxlength="40" required /></label><label>Display name<input name="displayName" maxlength="100" required /></label><label>Short bio<textarea name="bio" maxlength="280" rows="4"></textarea></label><label class="ftw-checkbox"><input name="isPublic" type="checkbox" checked /> Make my profile public</label><button class="ftw-solid-button" type="submit">Save profile</button><p class="ftw-community-status" role="status" aria-live="polite"></p><a class="ftw-profile-link" hidden></a></form><section class="ftw-community-card"><span class="ftw-kicker">Collections</span><h2>Curate with intent.</h2><form class="ftw-collection-create"><label>Collection name<input name="name" maxlength="120" required placeholder="e.g. Calm productivity stack" /></label><label>Description<textarea name="description" maxlength="500" rows="3" placeholder="What makes this collection useful?"></textarea></label><label class="ftw-checkbox"><input name="isPublic" type="checkbox" checked /> Publish publicly</label><button class="ftw-solid-button" type="submit">Create collection</button></form><p class="ftw-community-status ftw-collection-status" role="status" aria-live="polite"></p><div class="ftw-collection-list" aria-live="polite">Loading collections…</div></section></section></main>';
    root.querySelector('.ftw-community-header').insertAdjacentHTML('afterend', '<section class="ftw-community-metrics" aria-label="Creator analytics"><div><strong data-metric="followers">—</strong><span>Followers</span></div><div><strong data-metric="collections">—</strong><span>Collections</span></div><div><strong data-metric="savedWebsites">—</strong><span>Saved websites</span></div></section>');
    var headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
    var profileForm = root.querySelector('.ftw-profile-form');
    var profileStatus = root.querySelector('.ftw-profile-form .ftw-community-status');
    var profileLink = root.querySelector('.ftw-profile-link');
    var collections = root.querySelector('.ftw-collection-list');
    var collectionStatus = root.querySelector('.ftw-collection-status');
    var getJson = function (url, options) { return fetch(apiBase + url, options).then(function (response) { return response.json().then(function (payload) { if (!response.ok) throw new Error(payload.message || 'Unable to complete request'); return payload; }); }); };
    function loadCollections() {
      getJson('/api/v1/community/collections', { headers: headers }).then(function (payload) {
        var items = Array.isArray(payload.data) ? payload.data : [];
        collections.innerHTML = items.length ? items.map(function (item) { return '<article class="ftw-collection-item"><div><span class="ftw-story-label">' + (item.isPublic ? 'Public collection' : 'Private collection') + '</span><h3>' + escHtml(item.name) + '</h3><p>' + escHtml(item.description || 'No description yet.') + '</p></div><a class="ftw-outline-button" href="/collections/' + encodeURIComponent(item.id) + '">Open collection →</a></article>'; }).join('') : '<div class="ftw-community-note">No collections yet. Start with one focused list.</div>';
      }).catch(function (error) { collections.textContent = error.message; });
    }
    getJson('/api/v1/community/me', { headers: headers }).then(function (payload) {
      var profile = payload.data.profile;
      profileForm.handle.value = profile.handle || '';
      profileForm.displayName.value = profile.displayName || '';
      profileForm.bio.value = profile.bio || '';
      profileForm.isPublic.checked = profile.isPublic !== false;
      profileLink.hidden = false; profileLink.href = '/profile/' + encodeURIComponent(profile.handle); profileLink.textContent = 'View public profile →';
    }).catch(function (error) { profileStatus.className = 'ftw-community-status is-error'; profileStatus.textContent = error.message; });
    getJson('/api/v1/community/analytics', { headers: headers }).then(function (payload) { Object.keys(payload.data || {}).forEach(function (key) { var metric = root.querySelector('[data-metric="' + key + '"]'); if (metric) metric.textContent = payload.data[key]; }); }).catch(function () {});
    profileForm.addEventListener('submit', function (event) {
      event.preventDefault(); profileStatus.textContent = 'Saving…';
      getJson('/api/v1/community/me', { method: 'PATCH', headers: headers, body: JSON.stringify({ handle: profileForm.handle.value, displayName: profileForm.displayName.value, bio: profileForm.bio.value, isPublic: profileForm.isPublic.checked }) }).then(function (payload) { profileStatus.className = 'ftw-community-status is-success'; profileStatus.textContent = 'Profile saved.'; profileLink.hidden = false; profileLink.href = '/profile/' + encodeURIComponent(payload.data.handle); profileLink.textContent = 'View public profile →'; }).catch(function (error) { profileStatus.className = 'ftw-community-status is-error'; profileStatus.textContent = error.message; });
    });
    root.querySelector('.ftw-collection-create').addEventListener('submit', function (event) {
      event.preventDefault(); var form = event.currentTarget; collectionStatus.textContent = 'Creating…';
      getJson('/api/v1/community/collections', { method: 'POST', headers: headers, body: JSON.stringify({ name: form.name.value, description: form.description.value, isPublic: form.isPublic.checked }) }).then(function () { form.reset(); form.isPublic.checked = true; collectionStatus.className = 'ftw-community-status is-success'; collectionStatus.textContent = 'Collection created.'; loadCollections(); }).catch(function (error) { collectionStatus.className = 'ftw-community-status is-error'; collectionStatus.textContent = error.message; });
    });
    loadCollections();
  }

  function renderPublicProfilePage() {
    var match = window.location.pathname.match(/^\/profile\/([^/]+)/);
    if (!match) return;
    var root = document.getElementById('root');
    if (!root || root.querySelector('.ftw-public-profile-page')) return;
    var handle = decodeURIComponent(match[1]);
    setPageSeo('Profile | FindTheWeb', 'Explore a FindTheWeb contributor profile and their curated collections.');
    root.innerHTML = '<main class="ftw-public-profile-page"><div class="ftw-public-profile-loading"><span class="ftw-kicker">FindTheWeb contributor</span><h1>Loading profile…</h1></div></main>';
    fetch(apiBase + '/api/v1/community/profiles/' + encodeURIComponent(handle)).then(function (response) { if (!response.ok) throw new Error('Profile not found'); return response.json(); }).then(function (payload) {
      var profile = payload.data.profile; var collections = payload.data.collections || [];
      setPageSeo(profile.displayName + ' (@' + profile.handle + ') | FindTheWeb', profile.bio || 'A curated FindTheWeb contributor profile.');
      root.innerHTML = '<main class="ftw-public-profile-page"><header class="ftw-public-profile-header"><a class="ftw-discovery-back" href="/blog">← Back to FindTheWeb</a><span class="ftw-profile-avatar">' + escHtml((profile.displayName || 'F').slice(0, 1).toUpperCase()) + '</span><span class="ftw-kicker">@' + escHtml(profile.handle) + '</span><h1>' + escHtml(profile.displayName) + '</h1><p>' + escHtml(profile.bio || 'Curating useful corners of the web.') + '</p><span class="ftw-profile-stat">' + escHtml(profile.followerCount || 0) + ' followers</span></header><section class="ftw-public-collections"><div class="ftw-section-heading"><span class="ftw-kicker">Curated collections</span><h2>Useful lists, thoughtfully organized.</h2></div>' + (collections.length ? '<div class="ftw-public-collection-grid">' + collections.map(function (item) { return '<a class="ftw-public-collection-card" href="/collections/' + encodeURIComponent(item.id) + '"><span class="ftw-story-label">Collection</span><h3>' + escHtml(item.name) + '</h3><p>' + escHtml(item.description || 'Explore this focused collection.') + '</p><span>Open collection →</span></a>'; }).join('') + '</div>' : '<div class="ftw-community-note">This contributor has not published a collection yet.</div>') + '</section></main>';
    }).catch(function () { root.innerHTML = '<main class="ftw-public-profile-page"><div class="ftw-community-empty"><h1>Profile not found.</h1><p>This profile may be private or no longer available.</p><a class="ftw-solid-button" href="/blog">Back to FindTheWeb</a></div></main>'; });
  }

  function renderPublicCollectionPage() {
    var match = window.location.pathname.match(/^\/collections\/([^/]+)/);
    if (!match) return;
    var root = document.getElementById('root');
    if (!root || root.querySelector('.ftw-public-collection-page')) return;
    var id = decodeURIComponent(match[1]);
    setPageSeo('Collection | FindTheWeb', 'A focused collection of useful websites curated on FindTheWeb.');
    root.innerHTML = '<main class="ftw-public-collection-page"><div class="ftw-public-profile-loading"><span class="ftw-kicker">FindTheWeb collection</span><h1>Loading collection…</h1></div></main>';
    var collectionToken = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
    fetch(apiBase + '/api/v1/community/collections/' + encodeURIComponent(id), collectionToken ? { headers: { Authorization: 'Bearer ' + collectionToken } } : undefined).then(function (response) { if (!response.ok) throw new Error('Collection not found'); return response.json(); }).then(function (payload) {
      var item = payload.data; var entries = item.items || [];
      setPageSeo(item.name + ' | FindTheWeb', item.description || 'A focused collection of useful websites.');
      root.innerHTML = '<main class="ftw-public-collection-page"><header class="ftw-public-profile-header"><a class="ftw-discovery-back" href="/blog">← Back to FindTheWeb</a><span class="ftw-kicker">Curated collection</span><h1>' + escHtml(item.name) + '</h1><p>' + escHtml(item.description || 'A focused list of useful websites.') + '</p></header><section class="ftw-public-collection-content"><div class="ftw-public-website-list">' + (entries.length ? entries.map(function (entry) { var website = entry.website || {}; return '<article data-collection-website="' + escAttr(website.id) + '"><div><span class="ftw-story-label">Website</span><h2>' + escHtml(website.name || 'Website') + '</h2><p>' + escHtml(website.description || entry.note || 'Explore this resource.') + '</p>' + (entry.note ? '<small>' + escHtml(entry.note) + '</small>' : '') + '</div><div class="ftw-collection-entry-actions"><a class="ftw-solid-button" href="' + escAttr(website.url || '#') + '" target="_blank" rel="noreferrer">Visit ↗</a>' + (item.canManage ? '<button class="ftw-outline-button" type="button" data-remove-website="' + escAttr(website.id) + '">Remove</button>' : '') + '</div></article>'; }).join('') : '<div class="ftw-community-note">This collection is empty so far.</div>') + '</div>' + (item.canManage ? '<form class="ftw-collection-manager"><span class="ftw-kicker">Manage collection</span><h2>Add a useful website</h2><label>Website<select name="websiteId" required><option value="">Loading websites…</option></select></label><label>Curator note<textarea name="note" maxlength="280" rows="3" placeholder="Why is this useful?"></textarea></label><button class="ftw-solid-button" type="submit">Add to collection</button><p class="ftw-community-status" role="status" aria-live="polite"></p></form>' : '') + '</section></main>';
      if (item.canManage && collectionToken) {
        var manager = root.querySelector('.ftw-collection-manager'); var select = manager.querySelector('select'); var managerStatus = manager.querySelector('.ftw-community-status');
        fetch(apiBase + '/api/v1/websites?limit=100&status=active').then(function (response) { return response.json(); }).then(function (body) { var websites = Array.isArray(body.data) ? body.data : []; select.innerHTML = '<option value="">Choose a website…</option>' + websites.map(function (website) { return '<option value="' + escAttr(website.id) + '">' + escHtml(website.name) + '</option>'; }).join(''); }).catch(function () { select.innerHTML = '<option value="">Unable to load websites</option>'; });
        manager.addEventListener('submit', function (event) { event.preventDefault(); managerStatus.textContent = 'Adding…'; fetch(apiBase + '/api/v1/community/collections/' + encodeURIComponent(id) + '/items', { method: 'POST', headers: { Authorization: 'Bearer ' + collectionToken, 'Content-Type': 'application/json' }, body: JSON.stringify({ websiteId: select.value, note: manager.note.value }) }).then(function (response) { return response.json().then(function (body) { if (!response.ok) throw new Error(body.message || 'Unable to add website'); return body; }); }).then(function () { window.location.reload(); }).catch(function (error) { managerStatus.className = 'ftw-community-status is-error'; managerStatus.textContent = error.message; }); });
        root.querySelectorAll('[data-remove-website]').forEach(function (button) { button.addEventListener('click', function () { button.disabled = true; fetch(apiBase + '/api/v1/community/collections/' + encodeURIComponent(id) + '/items/' + encodeURIComponent(button.getAttribute('data-remove-website')), { method: 'DELETE', headers: { Authorization: 'Bearer ' + collectionToken } }).then(function (response) { if (!response.ok) throw new Error('Unable to remove website'); window.location.reload(); }).catch(function (error) { button.disabled = false; window.alert(error.message); }); }); });
      }
    }).catch(function () { root.innerHTML = '<main class="ftw-public-collection-page"><div class="ftw-community-empty"><h1>Collection not found.</h1><p>This collection may be private or no longer available.</p><a class="ftw-solid-button" href="/blog">Back to FindTheWeb</a></div></main>'; });
  }

  function renderMemberAuthPage() {
    var path = window.location.pathname;
    if (path !== '/member/login' && path !== '/member/register') return;
    var root = document.getElementById('root');
    if (!root || root.querySelector('.ftw-member-auth-page')) return;
    var register = path === '/member/register';
    setPageSeo(register ? 'Join FindTheWeb' : 'Member sign in | FindTheWeb', 'Join FindTheWeb to follow contributors and curate useful website collections.');
    root.innerHTML = '<main class="ftw-member-auth-page"><section class="ftw-member-auth-card"><span class="ftw-kicker">FindTheWeb community</span><h1>' + (register ? 'Create your curator account.' : 'Welcome back, curator.') + '</h1><p>' + (register ? 'Build a profile, follow thoughtful contributors, and save useful discoveries.' : 'Sign in to manage your profile and collections.') + '</p><form novalidate>' + (register ? '<label>First name<input name="firstName" required maxlength="60" autocomplete="given-name" /></label><label>Last name<input name="lastName" maxlength="60" autocomplete="family-name" /></label>' : '') + '<label>Email<input name="email" type="email" required autocomplete="email" /></label><label>Password<input name="password" type="password" required minlength="8" autocomplete="' + (register ? 'new-password' : 'current-password') + '" /></label><button class="ftw-solid-button" type="submit">' + (register ? 'Create account' : 'Sign in') + '</button><p class="ftw-member-auth-status" role="status" aria-live="polite"></p></form><p class="ftw-member-auth-switch">' + (register ? 'Already have an account? <a href="/member/login">Sign in</a>' : 'New to FindTheWeb? <a href="/member/register">Create an account</a> · <a href="/member/forgot-password">Forgot password?</a>') + '</p><a class="ftw-outline-button" href="/blog">Back to FindTheWeb</a></section></main>';
    var form = root.querySelector('form'); var status = root.querySelector('.ftw-member-auth-status');
    form.addEventListener('submit', function (event) {
      event.preventDefault(); var data = Object.fromEntries(new FormData(form).entries()); var button = form.querySelector('button'); button.disabled = true; status.textContent = register ? 'Creating account…' : 'Signing in…';
      fetch(apiBase + '/api/v1/auth/' + (register ? 'register' : 'login'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(function (response) { return response.json().then(function (payload) { if (!response.ok) throw new Error(payload.message || 'Unable to authenticate'); return payload; }); }).then(function (payload) { if (register) { status.className = 'ftw-member-auth-status is-success'; status.textContent = payload.message || 'Account created. Check your email to verify it.'; button.disabled = false; form.reset(); } else { localStorage.setItem('memberToken', payload.token); window.location.href = '/community'; } }).catch(function (error) { status.className = 'ftw-member-auth-status is-error'; status.textContent = error.message || 'Unable to authenticate.'; button.disabled = false; });
    });
  }

  function renderMemberRecoveryPage() {
    var path = window.location.pathname;
    if (path !== '/member/verify' && path !== '/member/forgot-password' && path !== '/member/reset-password') return;
    var root = document.getElementById('root');
    if (!root || root.querySelector('.ftw-member-auth-page')) return;
    var verify = path === '/member/verify'; var reset = path === '/member/reset-password';
    setPageSeo(verify ? 'Verify email | FindTheWeb' : reset ? 'Reset password | FindTheWeb' : 'Forgot password | FindTheWeb', 'Secure FindTheWeb member account recovery.');
    var title = verify ? 'Verify your email.' : reset ? 'Choose a new password.' : 'Recover your account.';
    var copy = verify ? 'Confirming your verification link…' : reset ? 'Use a strong password with at least 8 characters.' : 'Enter your email and we will send a secure reset link if the account exists.';
    var form = verify ? '' : '<form novalidate>' + (reset ? '<label>New password<input name="password" type="password" required minlength="8" autocomplete="new-password" /></label>' : '<label>Email<input name="email" type="email" required autocomplete="email" /></label>') + '<button class="ftw-solid-button" type="submit">' + (reset ? 'Update password' : 'Send reset link') + '</button></form>';
    root.innerHTML = '<main class="ftw-member-auth-page"><section class="ftw-member-auth-card"><span class="ftw-kicker">FindTheWeb account</span><h1>' + title + '</h1><p>' + copy + '</p>' + form + '<p class="ftw-member-auth-status" role="status" aria-live="polite"></p><p class="ftw-member-auth-switch"><a href="/member/login">Back to sign in</a></p></section></main>';
    var status = root.querySelector('.ftw-member-auth-status'); var token = new URLSearchParams(window.location.search).get('token');
    var submit = function (payload, endpoint, success) { fetch(apiBase + endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then(function (response) { return response.json().then(function (body) { if (!response.ok) throw new Error(body.message || 'Request failed'); return body; }); }).then(function (body) { status.className = 'ftw-member-auth-status is-success'; status.textContent = success || body.message || 'Done.'; }).catch(function (error) { status.className = 'ftw-member-auth-status is-error'; status.textContent = error.message || 'Request failed.'; }); };
    if (verify) { if (!token) { status.textContent = 'Verification token is missing.'; return; } submit({ token: token }, '/api/v1/auth/verify-email', 'Email verified. You can now sign in.'); return; }
    root.querySelector('form').addEventListener('submit', function (event) { event.preventDefault(); var data = Object.fromEntries(new FormData(event.currentTarget).entries()); if (reset) { if (!token) { status.textContent = 'Reset token is missing.'; return; } data.token = token; submit(data, '/api/v1/auth/reset-password', 'Password updated. You can now sign in.'); } else submit(data, '/api/v1/auth/forgot-password', 'If the email exists, a reset link has been sent.'); });
  }

  function enhancePublicFollow() {
    if (!/^\/profile\/[^/]+/.test(window.location.pathname)) return;
    var page = document.querySelector('.ftw-public-profile-page');
    var header = page && page.querySelector('.ftw-public-profile-header');
    if (!header || header.querySelector('[data-ftw-follow]')) return;
    var handle = decodeURIComponent(window.location.pathname.split('/')[2] || '');
    var token = localStorage.getItem('adminToken') || localStorage.getItem('memberToken');
    var button = document.createElement('button'); button.type = 'button'; button.className = 'ftw-solid-button ftw-follow-button'; button.setAttribute('data-ftw-follow', ''); button.textContent = token ? 'Follow' : 'Sign in to follow';
    header.appendChild(button);
    if (!token) { button.addEventListener('click', function () { window.location.href = '/member/login'; }); return; }
    var authHeaders = { Authorization: 'Bearer ' + token };
    fetch(apiBase + '/api/v1/community/profiles/' + encodeURIComponent(handle) + '/following', { headers: authHeaders }).then(function (response) { return response.ok ? response.json() : null; }).then(function (payload) { if (payload && payload.data.following) { button.textContent = 'Following'; button.setAttribute('data-following', 'true'); } }).catch(function () {});
    button.addEventListener('click', function () {
      var following = button.getAttribute('data-following') === 'true'; button.disabled = true;
      fetch(apiBase + '/api/v1/community/profiles/' + encodeURIComponent(handle) + '/follow', { method: following ? 'DELETE' : 'POST', headers: authHeaders }).then(function (response) { if (!response.ok) throw new Error('Unable to update follow'); button.setAttribute('data-following', following ? 'false' : 'true'); button.textContent = following ? 'Follow' : 'Following'; }).catch(function () { button.textContent = 'Try again'; }).finally(function () { button.disabled = false; });
    });
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
    var isBlogRoute = /^\/blog(?:\/|$)/.test(window.location.pathname);
    // Let the blog's SEO component own editorial titles and descriptions.
    // The release observer runs repeatedly, so unconditional defaults would
    // overwrite article-specific metadata after React renders.
    // React route metadata (and compatibility-page metadata) owns its title,
    // description and preview image. Never replace these with home defaults.

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
    renderSubmissionPage();
    renderAdminSubmissions();
    renderCommunityWorkspace();
    renderMemberAuthPage();
    renderMemberRecoveryPage();
    renderPublicProfilePage();
    renderPublicCollectionPage();
    enhancePublicFollow();
    removeRetiredProductNavigation();
    applyAdminPolish();
        applyBlogA11y();
  }

  var scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(function () {
      scheduled = false;
      // Do not observe our own writes: otherwise metadata/attribute updates
      // schedule another animation frame forever, even on an idle page.
      observer.disconnect();
      try { applyReleasePolish(); }
      finally { observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true }); }
    });
  }

  document.addEventListener('DOMContentLoaded', schedule);
  var observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
  schedule();
}());
