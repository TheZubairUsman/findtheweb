# SEO and editorial release — 27 October 2026

## Scope and release gates

Article URLs gain complete published-only HTML before JavaScript starts. A small PHP gateway reads the dedicated backend endpoint, preserving the same content for readers and crawlers. It forwards no visitor credentials, uses a fixed upstream with TLS verification, and returns real 404 or retryable 503 responses. React takes over the page for normal browsing. Home and category listings remain client rendered.

The gateway is inactive until `frontend-recovered/server/seo-ready.flag` is deliberately published. Deploy code without this flag first, verify PHP executes on the live hosting service, then enable it. The same gate enables current database-backed sitemap and RSS feeds. Drafts and future publication dates are excluded. Removing the flag disables these rewrites; restoring `dist/` from commit `24c148e` restores the prior frontend.

198 existing SVG covers have PNG exports for social preview compatibility. This converts existing artwork; it is not a new illustration set. The source-image hash prevents an obsolete export from replacing a subsequently edited cover. New or changed SVG images need a new export.

## Content quality

The audit found 198 short articles and extensive repeated paragraph patterns. Two existing guides have original, sourced replacements with step-by-step workflows and semantic process diagrams. Their existing addresses and publication dates are retained. The other 196 require individual editorial review. No articles are automatically deleted or marked noindex based on word count.

Publication checks the original content hash and metadata before any update, saves previous fields, and applies both updates in a transaction. It does not overwrite concurrent editorial changes. The consistent database backup is emergency recovery material; restoring the whole database over new user activity is not the normal rollback procedure.

## Validation

- Local backend: 18 suites, 92 tests passed, including sanitizer, draft/future visibility, metadata privacy, and guarded editorial update tests.
- CI checks reproducible builds, dependency audits, existing browser journeys, real Apache/PHP responses, JavaScript-disabled mobile/desktop reading, and React takeover.
- Live activation requires dependency/native-module checks, consistent backup, integrity/count checks, direct PHP probes, article/feed checks, and deployed file hashes.

Search indexing, rankings, social platform cache refreshes, traffic, and Search Console results are not established by these technical checks. See `CONTENT-QUALITY-AUDIT-20261027.md` for measured editorial limitations. Live receipts will be added after rollout.
