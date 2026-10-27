# Account-security editorial batch — 28 October 2026

## Scope

Upgrade the existing password-manager setup and phishing-page guides, preserving their titles, slugs and original publication dates. Each uses original practical writing, current primary sources, a hypothetical example, an actionable checklist and a numbered process figure. The articles distinguish account sign-in, local vault unlock, recovery, OTP limitations and the scope of passkey phishing resistance. They do not endorse a product, claim a hands-on test, or promise immunity to compromise.

The two original AI-generated editorial illustrations are conceptual artwork rather than product screenshots or incident evidence. PNG originals and optimized WebP reading copies are versioned separately. Social previews retain PNG while reader pages use WebP. Optimized source files are 136,728 and 122,718 bytes; actual delivery is checked before publication.

## Reusable preparation and rollout

`tools/prepare-editorial-release.cjs` accepts a versioned JSON configuration, checks fresh projected live metadata against the researched draft, validates sources/markup/assets, and emits the guarded release input. An explicit `--update-map` updates only those articles' reviewed PNG social-preview mappings. The helper restricts JSON inputs/outputs to repository content/tmp paths, prevents input replacement, rejects duplicate/stale records and refuses to silently replace a different existing release. Matching existing output is idempotent.

Image optimization accepts explicit versioned PNG basenames and refuses to overwrite an existing WebP asset. Metadata rollout accepts a validated release ID, uses separate candidate/rollback paths, retains the original service and map, verifies database integrity and previews that release after a targeted restart. Live verification checks the corresponding release's private backup path instead of a hardcoded earlier batch.

Publication uses the previously tested version-2 operator CLI: inspect, preview, consistent SQLite backup, transactional apply, and field-scoped guarded rollback. No credentials or environment settings are changed. Do not restore a whole database over concurrent activity. Interrupted receipts require inspection before intervention.

## Validation scope

Preparation tests exercise idempotence without input changes, stale research, duplicates, paths outside the content workspace, input replacement, and conflicting existing output. Existing backend, rendering, theme, accessibility and responsive-browser checks remain required before production. Publication requires verified asset delivery and clean live guards, followed by raw article/metadata, dates, reader cover, blog-card and database checks.

This batch targets two of the remaining 194 articles. Successful publication will bring detailed upgrades to six of 198 guides, leaving 192 for individual review. Search rankings, traffic and field Core Web Vitals are not established by these checks.
