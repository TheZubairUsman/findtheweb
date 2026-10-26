# Blog discovery reliability — 2026-10-26

## Scope and result

Replaced unsupported PostgreSQL array operators in related article selection
with portable published-post selection and application-side relevance scoring.
Category matches receive three points and tag matches one point. Results exclude
the current article, unrelated articles, drafts, and future publication dates.
Selection no longer stops at the latest 100 posts. Only card metadata is loaded;
article bodies and private author fields are excluded from related cards.

This implementation scans published card metadata. At substantially larger
catalog sizes, move relevance selection into indexed database queries.

## Verification

- Four regression tests cover combined category/tag filtering, case-insensitive
  search, related-post eligibility, and the public article detail response.
- Live health, combined filters, and incident-response article detail returned 200.
- The live incident-response article returned three Cybersecurity related articles.
- Backend model syntax validated in the production container before restart.
- Rollback copy: `/opt/findtheweb-backend/src/models/BlogPost.js.rollback-20261026-discovery`.

## QA evidence limits carried forward

The earlier QA report overstated completeness. API coverage of 198 articles is
not manual visual verification of 198 articles. Mobile/tablet layouts,
authenticated admin writing flows, contact delivery, and every button have not
been demonstrated end to end. These remain pending; this phase is scoped to
blog discovery reliability and does not close those checks.

## Next release work

Finish responsive and authenticated workflow QA, then address article depth and
topic-specific imagery. Existing short articles should not be represented as
comprehensive technical guides merely because their title and cover differ.
