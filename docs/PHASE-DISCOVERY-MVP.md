# Discovery MVP release 1

## Purpose

Give readers a public path from a problem to a useful website profile. This release adds a searchable, paginated discovery feed and a product detail page with an external visit link, local save control, practical description and optional editorial context. It uses the existing moderated discovery API. The public `/products` route remains retired.

## Live data contract

The published frontend is on `findtheweb.zus3cu.tech`; its API is on `api.zus3cu.tech/findtheweb`. Production calls from the new discovery pages and the existing blog pages now use the API host directly. Local browser QA keeps relative `/api/v1/` calls. The production API has a scoped CORS allowance for the site origin. Never turn an HTML SPA response into a successful API result.

Follow-up verification found the same stale relative path in contact, admin authentication and management, and homepage website sections. These callers now share the production API URL helper while keeping the isolated browser QA host unchanged. The API's CORS preflight accepts the site origin and the required `Authorization` and `Content-Type` headers. Live admin and contact writes still require a separate authorized identity or a scoped test submission; do not infer success from a public GET alone.

The directory still falls back to its legacy export while the Website database has no active rows. The fallback now excludes records without an ID, nonempty name and HTTP(S) URL. Product details only render safe external URLs. The listing's `verified` badge reflects the stored field; absence of the badge must not imply a fresh manual review.

## Verification and deployment

Run backend tests, production dependency audit, a frontend build, browser QA at mobile/tablet/desktop widths, and GitHub CI before publishing. Verify the exact static manifest at the live domain. Back up the production backend route before copying the filtered legacy reader; restart only the FindTheWeb backend container; verify the container health, public JSON API, blog API, and SQLite integrity. Record rollback file paths and hashes. Do not publish a release whose CI or live checks fail.

### Release result, 2026-11-04

- Application commit `b6a714a7b1a238965ac57b886429e70a3c246b37` passed CI run `41765611873`. Cache version fix commit `7efe1667719a0bf43edf544c6dadfc22672e4e98` passed CI run `41767003075`; both reached `master`.
- Local backend suite passed 20 suites and 106 tests before the added legacy-record regression test; that focused test file then passed all five tests. Full browser QA passed 60 route/viewport states, all interactions, and zero listed accessibility findings. Production dependency audit reported zero high or critical findings.
- Public frontend release manifest matched local bytes exactly. Headless Chrome loaded `/discover`, opened a real product profile, saved it, and loaded `/blog` with no page errors. Public API responses for the discovery feed, product detail, and blog list were valid JSON with the allowed site origin.
- Backend route SHA-256 after deployment: `a162a87b45b4ea7811adb2c111b1f83dbe3e79d27694e4eb779ee11c5fe900b8`. Scoped rollback copy: `/opt/findtheweb-discovery-backups/20261104-b6a714a-discovery.js`, SHA-256 `64f93f2019275a1a4dd733b37e7e7a1ea2e1730935aa8c9a2f50a3c1ffcc6d55`. Postrestart SQLite integrity was `ok` with 198 BlogPost rows and zero Website rows; discovery still uses its filtered legacy export.

## Submission release boundary

The public submission form and private moderation queue existed before this release, but the form selected numeric categories from the directory export while the database expected category foreign keys. A follow-up change accepts a valid export category, stores its name and ID in the private submission metadata, and leaves the database foreign key null until categories are backfilled. Pending records stay hidden. Approval adds a listing to the combined discovery feed without hiding the thousands of legacy directory entries. The moderator sees the chosen category name. Publish this change only after its own CI, isolated submission-to-moderation browser test, scoped backend backup, and live verification.

### Submission release result, 2026-11-04

- Commit `2f8e8590f1778b732562c38f29ee6127a50e9aac` passed CI run `41776634988` and was pushed to `master`. Local backend tests: 20 suites, 108 tests passed. Browser QA: 60 route/viewport states and the submission, admin queue, rejection, discovery and blog interactions passed. Backend production dependency audit found zero high or critical findings.
- The production static manifest matched local bytes. The scoped backend route was backed up at `/opt/findtheweb-discovery-backups/20261104-2f8e859-discovery.js` (SHA-256 `a162a87b45b4ea7811adb2c111b1f83dbe3e79d27694e4eb779ee11c5fe900b8`); deployed route SHA-256 is `73d5a9658c49b871470894ec4f67b50936642331f8aabd0e92ad8a82cd71c7d5`.
- Before the live write test, an online SQLite backup was saved at `/opt/findtheweb-discovery-backups/20261104-pre-submit-test.sqlite` (SHA-256 `d1d1445d7a4136571c7aa634b1cb134e949c8a7f3274a4a8b4dd43b4028d89f3`). The public form returned HTTP 202 for a unique QA resource. Database inspection confirmed `pending`, the Technology category in private metadata, and a null foreign key. Public search returned zero matches. The unique QA record was deleted with an exact ID, name and pending-status condition; Website rows returned to zero. Final SQLite integrity was `ok` with 198 BlogPost rows. Headless Chrome rechecked discovery and blog with zero page errors.

Maker claims, structured reviews, alternatives ranking, article-to-product discovery links, and the category database backfill remain Phase 2 work. The later backfill should replace the temporary combined feed with a paginated database query after counts and URLs match.

## Discovery and editorial links, 2026-11-04

The article page now requests an explicit, curated list of related websites from the discovery API. The endpoint returns at most six active listings with allowlisted ID, name, and description. It rejects malformed slugs and never returns pending submissions or private metadata. Website profiles now display curated alternatives as editorial suggestions, with external links restricted to HTTP(S) URLs.

The legacy export contains duplicate URLs with different IDs. The active database listing can therefore mask the original catalog ID during feed merging. Product knowledge now resolves a known catalog entry by matching its URL when the active listing has a different ID; this also restores the reciprocal article links on those profiles. Empty metadata article lists no longer erase a curated relationship.

Local verification: 20 backend suites and 109 tests passed; the full browser sweep passed 60 route/viewport states, interaction checks, and listed accessibility checks. A targeted Chrome check verified that the GitHub profile shows its curated GitLab alternative. Production dependency audits reported zero high/critical findings. The release manifest had 626 files with zero local hash mismatches. GitHub CI, deployment, and live copy verification are still required before calling this update published.
