# Discovery MVP release 1

## Purpose

Give readers a public path from a problem to a useful website profile. This release adds a searchable, paginated discovery feed and a product detail page with an external visit link, local save control, practical description and optional editorial context. It uses the existing moderated discovery API. The public `/products` route remains retired.

## Live data contract

The published frontend is on `findtheweb.zus3cu.tech`; its API is on `api.zus3cu.tech/findtheweb`. Production calls from the new discovery pages and the existing blog pages now use the API host directly. Local browser QA keeps relative `/api/v1/` calls. The production API has a scoped CORS allowance for the site origin. Never turn an HTML SPA response into a successful API result.

The directory still falls back to its legacy export while the Website database has no active rows. The fallback now excludes records without an ID, nonempty name and HTTP(S) URL. Product details only render safe external URLs. The listing's `verified` badge reflects the stored field; absence of the badge must not imply a fresh manual review.

## Verification and deployment

Run backend tests, production dependency audit, a frontend build, browser QA at mobile/tablet/desktop widths, and GitHub CI before publishing. Verify the exact static manifest at the live domain. Back up the production backend route before copying the filtered legacy reader; restart only the FindTheWeb backend container; verify the container health, public JSON API, blog API, and SQLite integrity. Record rollback file paths and hashes. Do not publish a release whose CI or live checks fail.

## Remaining Phase 2 work

The submission form, maker claims, review moderation, alternatives ranking, and article-to-product discovery links still need a separate guarded release. The existing API submission route requires a database-backed category and is not ready to expose while production has no Category rows. Keep the public submission flow closed until category identity, moderation visibility, and spam safeguards are verified end to end.
