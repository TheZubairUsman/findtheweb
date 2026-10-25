# FindTheWeb Phase 4 — Release Reconstruction

Status: in progress; the highest-risk release gaps are now covered by tests and recovery tooling.

## Why this phase is open

The deployed frontend is a compiled static artifact. The repository contains
the artifact and its source maps, but not the original frontend source tree or
a reproducible frontend build command. That is a maintainability and rollback
risk even though the current public routes are healthy.

## First deliverables completed

- Added a frontend release contract test under `backend/tests/frontend-release.test.js`.
- Added CI syntax validation for `dist/findtheweb-release.js`.
- Removed the retired Products link at runtime on public pages while preserving
  the private admin surface.
- Added production-domain defaults for email configuration and seeder rollback.
- Verified the live backup exists before changing the Hostinger release file.
- Recovered 46 frontend source files from embedded source maps into
  `frontend-recovered/src/` with `npm run recover:frontend`.
- Added `backend/scripts/verify-production.js` and the
  `npm run verify:production` smoke command for public/API/auth/SEO checks.
- Added `dist/release-manifest.json` with SHA-256 hashes for the core release
  files and the Hostinger rollback instruction.
- Replaced stale public canonical-domain references in generated chunks and
  added a regression test for them.

## Remaining acceptance gates

1. Commit the recovered frontend source tree and restore its dependency/build
   manifest; source recovery itself is complete.
2. Add a documented frontend build that produces `dist/` from a clean checkout.
3. Add desktop and mobile browser smoke tests for home, blog, article,
   discovery, admin login, and the retired Products redirect.
4. Add a release manifest with asset hashes and a tested Hostinger rollback.
5. Remove stale legacy-domain references from generated chunks, then rerun the
   public SEO and crawler checks.

Do not mark Phase 4 complete until all five gates are evidenced in CI and on the
live domain.
