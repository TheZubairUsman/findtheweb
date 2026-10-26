# Frontend stability and security — 2026-10-27

## Changes

The maintained source now builds the complete React application rather than
patching a compiled vendor bundle. `frontend-recovered/package-lock.json` locks
the frontend graph, including React Router 7.18.4 and DOMPurify. `npm ci` followed
by `npm run build` emits hashed modules, HTML and a SHA-256 release manifest.
Two consecutive builds are checked for identical release-manifest hashes.
CI installs, audits and rebuilds both applications and rejects artifact drift.

The existing 103 categories and 5,317 catalog entries were recovered from literal
data in the shipped JavaScript using AST parsing, without executing the bundle.
The catalog is loaded only on pages needing it; the main application entry
dropped from approximately 1.5 MB to approximately 73 KB before compression.
This is entry size, not total transferred JavaScript or a Core Web Vitals claim.
The base stylesheet is a preserved source snapshot; the original Tailwind
configuration remains unavailable.

| Issue | Resolution |
| --- | --- |
| Old bundled router could not be safely updated | New locked frontend graph and source build |
| API calls depended on timing and inconsistent prefix stripping | API bridge installed before React, retaining canonical `/api/v1` paths |
| Nested admin login response rejected | Supports canonical nested response and legacy alias |
| Admin UI accepted only one claim format | Strict boolean `isAdmin` or `role: admin`; API remains authoritative |
| Periodic refresh called a nonexistent endpoint | Removed periodic call that logged out editors on a 404 |
| Article HTML sanitized after DOM insertion | DOMPurify sanitizes before React renders rich HTML |
| Out-of-order article/list requests | AbortController cleanup and latest-request state |
| Filter pagination and tag navigation | Reset pages when criteria change; tag links preserve context |
| Theme/metadata observer constantly observed its own writes | Observer pauses around compatibility updates; removed polling |
| Page metadata overwritten with homepage defaults | Route owns metadata and canonical path; null cover uses logo fallback |
| Static fallback tags duplicated route metadata | Helmet adopts fallback tags before mount; article preview and canonical remain unique |
| Retired Products navigation | Removed from source navigation; router redirects to Blog |
| Corrupt/persisted bookmarks caused refresh issues | Validate and initialize stored bookmarks before saving state |
| Duplicate footer on cookie/sitemap pages | Shared application footer only |
| Delayed editor autofocus could interrupt input | Preserve an already selected field; controlled slow-frame regression |
| Mobile featured section reserved 1,960 pixels | Content-sized layout; hide empty featured section |
| Featured cards left an unused desktop column | Equal-width three-card row; covers retain their full aspect ratio |
| Dedicated bookmarks page was a placeholder | Browser-local saved list, search, removal and shared navigation |
| Footer external-link tracking called a missing event | Track external links without preventing native navigation |
| Blog hero text contrast | Explicit readable hero text in both themes |
| Broken category aliases and `/discover` | Redirect to real catalog/category pages rather than placeholder results |

## QA evidence

The local host binds only to 127.0.0.1:5097 and uses an in-memory database,
random signing key, test administrator and seeded articles. Marketing scripts
are stripped from QA HTML. Editor publication and contact persistence tests
therefore do not alter production data or send email.

Browser evidence is under `docs/qa/frontend-20261027/`. The runner waits for a
visible React heading before recording a page, rather than accepting a blank
or loading screenshot. Routes are checked at 375, 768 and 1440 pixels. Separate
interaction checks exercise theme persistence, filtering/search, redirect,
article refresh, rich-content sanitization, protected editor navigation, login,
draft creation, publication without a cover, and contact-to-admin-inbox storage.
Axe checks cover the blog, contact page and authenticated editor.

The backend regression run passes 16 suites and 88 tests. The frontend package
audit reports zero known vulnerabilities. See machine-readable browser reports
for final pass/fail evidence; a route smoke check is not an exhaustive claim
that every possible state or external link was manually verified.

Initial implementation CI run `40390337749` passed both jobs on Linux. Local
browser QA completed 60 route/viewport checks and 21 interactions with zero
uncaught exceptions; a subsequent focused run includes the unique-metadata
regression and passes 22 interactions. Axe reported zero violations on the
three tested surfaces. A separate idle probe observed two head mutations in
one second rather than a continuous per-frame loop. Actual card paint changed
from RGB(255,255,255) to RGB(23,32,51) when toggling theme.

The first live promotion verified all 32 release files against their SHA-256
manifest, plus public/API/SEO smoke checks. Direct browser checks confirmed
the live new module graph, article covers, category/search results, theme
persistence and article refresh. Production forms and accounts were not mutated.
The metadata follow-up remains subject to the same CI and live hash verification.

The prior public HTML and compatibility JS/CSS were downloaded before promotion
and match rollback commit `0abcdba` exactly. A local archive is retained at
`tmp/frontend-rollback-0abcdba.zip`; its contents are public frontend files only.
`node tools/verify-frontend-release.cjs` records a machine-readable live receipt.

Follow-up CI captured client-side empty-field validation during a rapid editor
save, with no rejected HTTP write. A controlled delayed-frame probe reproduced
focus moving from Content back to Title. The focus guard preserves the selected
field, and the focused browser run now passes 23 interactions including that
regression, draft save, publication and inbox persistence.

The final visual/navigation pass adds bookmark sidebar, persistence, search and
removal, mobile navigation, footer-link and three-card-grid checks. All 30 focused
checks pass locally, with zero uncaught exceptions or rejected writes. External
profile navigation is intercepted with a test page; no external message is sent.

## Limits and release safety

## Final verified release

Implementation commit: `4f7fd2113e866f27544c4726df40484d838e483e`.
[CI run 40397058581](https://github.com/TheZubairUsman/findtheweb/actions/runs/40397058581)
passed both jobs: reproducible build/audit/backend checks and the complete
Chromium browser run. The final browser result is 60 route/viewport checks,
30 UI checks, zero uncaught exceptions, zero rejected test writes, and zero
axe violations across blog, contact and editor. Backend: 16 suites, 88 tests.
Both locked dependency audits report zero known vulnerabilities.

The exact implementation was fast-forwarded to master and deployed. All 33
current release files match their manifest hashes on the public domain.
Public/API/SEO smoke checks pass; anonymous administrator API access returns
401 and the browser editor entry redirects to `/admin/login`. All 198 published
articles remain available. No production account, article or contact message
was created or edited by the QA journeys.

Manual live browser checks confirm three equal-width featured cards on one
desktop row, uncropped covers, working saved-websites empty state, theme
persistence, filter/search results, article refresh and one article-specific
preview image/canonical tag. The current entry is approximately 74 KB before
compression. The schema now uses the verified project repository, removing
unverified social identity placeholders introduced during recovery.

Local ignored receipts are `docs/qa/frontend-20261027/ci-report.json` and
`live-release.json`; screenshots and the full browser report are also attached
to the CI workflow artifact. The temporary loopback QA host has been stopped.

## Remaining scope

- New screenshots establish a baseline; a historical pixel regression comparison
  is inconclusive because no comparable fixture baseline existed.
- Automated accessibility checks do not certify WCAG conformance. A complete
  screen-reader review and production field INP/Core Web Vitals remain pending.
- Community/discovery compatibility screens remain in the maintained release
  script; migrating them into React is a separate architectural cleanup.
- SMTP delivery and production password entry are not tested by local fixtures.
- Article metadata is client-rendered. Crawler/social-preview HTML that works
  without JavaScript still requires prerendering/server-generated metadata in
  the next SEO phase; unique browser metadata alone does not establish it.
- Preserve old hashed files for open/cached clients. The new entry imports only
  the new frontend graph. Restore `dist/` from `0abcdba` to roll back this release;
  no backend restart or database restore is needed.
