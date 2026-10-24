# FindTheWeb Product Update Plan

## Goal

Position FindTheWeb as a focused discovery product: useful websites, AI tools, productivity apps, and hidden internet gems that people can find quickly and trust.

## Release phases

### Phase 1 — Production foundation

- Align title, description, canonical URL, Open Graph, Twitter Card, and structured data with `findtheweb.zus3cu.tech`.
- Remove stale `findtheweb.com` crawler references and keep the sitemap limited to the production domain.
- Verify HTTPS, homepage status, crawl files, favicon, and share-preview asset paths.
- Preserve the current deployment as a rollback artifact before upload.

### Phase 2 — Product experience

- Lead with one clear promise: find useful websites faster.
- Make search the primary interaction, with visible category, region, and tier filters.
- Add curated collections such as AI tools, productivity, design, developer tools, research, and security.
- Improve empty states, trust signals, submission flow, bookmarks, and mobile navigation.
- Keep the visual identity calm, editorial, and distinct from generic directory templates.

### Phase 3 — Search growth

- Give each public category and article page one search intent, one H1, unique metadata, and canonical URL.
- Add internal links between collections, individual listings, articles, and the submission page.
- Publish genuinely useful comparison and “best tools for…” guides; do not create thin programmatic pages.
- Connect Search Console and measure impressions, clicks, indexed pages, search-to-click rate, and Core Web Vitals.

### Phase 4 — Maintainable engineering release

- Restore or recover the original frontend source tree; this snapshot currently contains only the compiled `dist/` frontend.
- Rebuild the frontend from source, add automated SEO checks, and keep deployment artifacts reproducible.
- Add a staging preview and a documented rollback procedure before future production releases.

## Release gates

- Local build or artifact validation passes.
- Homepage, categories, blog, legal pages, and 404 route load without console errors.
- Responsive smoke tests pass at mobile, tablet, and desktop widths.
- No public secret, `.env`, debug token, or private admin asset is included.
- Production upload is preceded by a dated backup and followed by live 200/asset/SEO checks.
