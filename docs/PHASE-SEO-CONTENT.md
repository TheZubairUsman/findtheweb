# SEO and editorial release — 27 October 2026

## Scope and release gates

Article URLs gain complete published-only HTML before JavaScript starts. A small PHP gateway reads the dedicated backend endpoint, preserving the same content for readers and crawlers. It forwards no visitor credentials, uses a fixed upstream with TLS verification, and returns real 404 or retryable 503 responses. React takes over the page for normal browsing. Home and category listings remain client rendered.

The build includes gateway rewrite rules only when `frontend-recovered/server/seo-ready.flag` exists. Deploy code without this source flag first, verify PHP executes on the live hosting service, then enable it and rebuild. The same gate enables current database-backed sitemap and RSS feeds. Drafts and future publication dates are excluded. To disable rendering, remove the source flag, rebuild, and deploy both generated routing files and the frontend; removing only the live flag file does not change compiled rules. For the previous frontend, restore repository `.htaccess`, `frontend-recovered/`, `dist/`, and its frontend CI configuration from `24c148e`; restoring only `dist/` leaves the root routing change active. Backend and content receipts are separate.

Initial tests exercised a `dist/` document root. Actual Git hosting deploys the repository root, whose separate SPA fallback bypassed the article rules. The final build generates both root and `dist/` routing configurations. Source/editorial/operational folders are explicitly denied at the public root. Enabled and disabled builds were checked locally, and the final Apache/PHP integration also tests the real repository-root layout, including protected folders and missing articles.

The root configuration leaves internal `dist/` requests to the artifact's rules, avoiding a repeated rewrite pass. Apache and LiteSpeed treat the last-rule flag differently; see the [Apache flag reference](https://httpd.apache.org/docs/2.4/rewrite/flags.html) and [LiteSpeed migration guidance](https://docs.litespeedtech.com/lsws/cp/cpanel/switch-apache/).

198 existing SVG covers have PNG exports for social preview compatibility. This converts existing artwork; it is not a new illustration set. The source-image hash prevents an obsolete export from replacing a subsequently edited cover. New or changed SVG images need a new export.

## Content quality

The audit found 198 short articles and extensive repeated paragraph patterns. Two existing guides have original, sourced replacements with step-by-step workflows and semantic process diagrams. Their existing addresses and publication dates are retained. The other 196 require individual editorial review. No articles are automatically deleted or marked noindex based on word count.

Publication checks the original content hash and metadata before any update, saves previous fields, and applies both updates in a transaction. It does not overwrite concurrent editorial changes. The consistent database backup is emergency recovery material; restoring the whole database over new user activity is not the normal rollback procedure.

## Validation

- Backend: 18 suites, 93 tests passed, including sanitizer, draft/future visibility, metadata privacy, guarded editorial updates, and preservation of the editorial modification date when counting reader views.
- CI checks reproducible builds, dependency audits, existing browser journeys, real Apache/PHP responses, JavaScript-disabled mobile/desktop reading, and React takeover.
- Live activation requires dependency/native-module checks, consistent backup, integrity/count checks, direct PHP probes, article/feed checks, and deployed file hashes.

Search indexing, rankings, social platform cache refreshes, traffic, and Search Console results are not established by these technical checks. See `CONTENT-QUALITY-AUDIT-20261027.md` for measured editorial limitations.

Before a large acquisition campaign, measure renderer/backend capacity and design cache invalidation around publish/archive events. Rendering currently fetches fresh published data for each request, and API rate limits still apply. This phase does not establish high-traffic capacity. The next editorial batch must review sources, article-specific illustrations and technical usefulness individually for the remaining 196 guides.

## Verified release evidence

- Final application/rewrite commit: `e7135fc2a346830993cb63bb6dfd1b06389e15b1`. [CI run 40457028731](https://github.com/TheZubairUsman/findtheweb/actions/runs/40457028731) passed both jobs: 93 backend tests, reproducible builds, dependency audits, 60 responsive route checks, 30 UI checks, and 25 Apache/PHP/no-JavaScript/hosting-layout checks. This includes replacement of server article schema when React takes over, avoiding duplicate article schema. Automated accessibility checks found no violations on the three tested surfaces; this is not a full accessibility certification.
- Backend backup and rollback dependencies retained under `/opt/findtheweb-backend/rollback-seo-20261027-render1`. SQLite integrity is `ok`; all 198 articles remain. The two pilot updates were applied transactionally with previous fields and after-content hashes retained there. Both now have a six-minute reading time and roughly 1,000 words. Other article bodies were not rewritten.
- Direct PHP and canonical live article routes passed for both upgraded guides, raw article metadata/body, PNG preview delivery, missing article 404, 202 sitemap URLs, and RSS. Five sensitive/internal paths returned 403 to HEAD checks; their bodies were not downloaded. Article addresses and original publication dates were preserved.
- Final JavaScript-enabled live browser check: one main heading, one canonical, one preview image meta tag, one article schema after React takeover, complete article text, and no horizontal overflow. This was checked after the schema fix reached production.
- Public file verification checked 231 files: 33 code/text hashes matched exactly, and 198 CDN-served PNGs passed format/dimension checks. All 198 PNGs also decoded in a real browser. CDN delivery changes their encoded bytes and decoded pixels; neither byte nor pixel identity with the Git originals is claimed. Representative live article layout was visually reviewed.
- Ignored local receipts: `docs/qa/seo-20261027/cdn-covers.json` and the copied live checks; full CI browser reports/screenshots are retained in the workflow artifact.
