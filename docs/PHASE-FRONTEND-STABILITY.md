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
| Retired Products navigation | Removed from source navigation; router redirects to Blog |
| Corrupt/persisted bookmarks caused refresh issues | Validate and initialize stored bookmarks before saving state |
| Duplicate footer on cookie/sitemap pages | Shared application footer only |
| Mobile featured section reserved 1,960 pixels | Content-sized layout; hide empty featured section |
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

## Limits and release safety

- New screenshots establish a baseline; a historical pixel regression comparison
  is inconclusive because no comparable fixture baseline existed.
- Automated accessibility checks do not certify WCAG conformance. A complete
  screen-reader review and production field INP/Core Web Vitals remain pending.
- Community/discovery compatibility screens remain in the maintained release
  script; migrating them into React is a separate architectural cleanup.
- SMTP delivery and production password entry are not tested by local fixtures.
- Preserve old hashed files for open/cached clients. The new entry imports only
  the new frontend graph. Restore `dist/` from `0abcdba` to roll back this release;
  no backend restart or database restore is needed.
