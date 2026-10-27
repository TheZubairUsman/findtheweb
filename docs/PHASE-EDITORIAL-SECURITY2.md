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

## Live findings fixed during QA

The phishing guide's longest inline example overflowed a 375px mobile viewport (428px document width). Inline code now wraps without changing its copyable text; the same viewport measured 360px content width afterward, with no horizontal overflow. The actual long example was added to the rendering fixture, so existing mobile checks exercise this case in both JavaScript and initial HTML reading.

A prematurely requested image path had been cached by an edge as a successful SPA HTML response. The image existed at the origin, but one bare-URL GET still returned `text/html` with a cache HIT and age 703 seconds. FindTheWeb's site-specific Hostinger cache was cleared through its dashboard; the same requests then returned `image/webp`, first MISS and then HIT, with the expected byte sizes. Other websites/settings were not changed.

Both hosting layouts now return real 404 responses for missing static assets instead of successful application HTML. Regression checks cover missing image and script paths in each layout. Future rollouts should wait for the provider's completed deployment before probing new bare asset URLs. Verification checks cover MIME as well as decoded headers and reports a wrong cached type clearly; this is not a guarantee about every browser's local cache or every future edge state.

## Verified delivery

- Application commit `518718c3669df8aa7e01f92e2bf42001b7279bd4` passed [CI run 40570263942](https://github.com/TheZubairUsman/findtheweb/actions/runs/40570263942): 102 backend tests, 60 responsive route checks, 30 UI checks and 34 Apache/PHP/rendering checks. Dependency audits passed. Automated checks found no violations on the three tested accessibility surfaces; a complete accessibility certification is outside this scope.
- Release `security2-20261028` was previewed, backed up and published transactionally. The two guides contain 1,160/1,168 words and each has a six-minute reading time. Article count remained 198, and the post-publication database integrity check returned `ok`.
- Public verification matched the reviewed bodies, original publication dates, unique raw canonical/main heading, optimized reader images and separate PNG previews. The bare WebP URLs delivered 136,728/122,718 bytes. The batch-backup path returned 403 to HEAD; SQLite and before/after receipts have filesystem mode 600.
- Live mobile and desktop reading, image decoding, numbered process figures and a password-manager blog search card were checked. The mobile overflow fix was verified on the actual published page. Screenshot and structured observations are retained locally.
- Public artifact verification checked 239 files: 37 exact source hashes and 202 CDN-transformed images with validated format/dimensions. It does not claim every image is byte-identical to its source.
- Local receipts are ignored under `docs/qa/editorial-security2-20261028/`. Private database and field rollback receipts remain in the backend's `editorial-backups/security2-20261028/`; original metadata files remain in `rollback-editorial-tooling-security2-20261028/`. No database backup or credential file was committed or downloaded as a public artifact.

Six of 198 guides now have detailed editorial upgrades. The remaining 192 still need individual review. Search rankings, traffic and field Core Web Vitals are not established by this phase.
