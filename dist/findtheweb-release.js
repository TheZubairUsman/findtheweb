(function () {
  'use strict';

  var siteUrl = 'https://findtheweb.zus3cu.tech';
  var title = 'FindTheWeb | Curated Websites, Tools & Hidden Gems';
  var description = 'Find useful websites, AI tools, productivity apps, and hidden internet gems through a focused, hand-picked directory.';

  function setMeta(selector, attribute, value) {
    var node = document.querySelector(selector);
    if (node && node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
  }

  function applyReleasePolish() {
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
