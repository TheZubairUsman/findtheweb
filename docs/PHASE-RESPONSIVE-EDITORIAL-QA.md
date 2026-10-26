# Responsive and editorial QA — 2026-10-26

## Changes deployed

- Blog card and article metadata wrap on narrow screens instead of overflowing.
- Footer creator text can shrink and wrap inside the tablet grid.
- Article hero images keep their complete 1200:630 aspect ratio instead of
  cropping headline text on mobile.
- Release stylesheet cache key advanced to `20261026responsive2`.

## Browser evidence

Live browser inspection covered home, blog, an article, categories, contact and
admin login at requested widths 375, 768 and 1440. Initial window resizing did
not create the requested mobile width, so explicit viewport emulation was used.
The final article check waited for the actual React article and hero image;
hidden legacy fallback markup is not evidence of a loaded article.

| Final article viewport | Client width | Scroll width | Hero size |
| --- | --- | --- | --- |
| Mobile | 375 | 375 | 343 x 180 |
| Tablet | 768 | 768 | 720 x 378 |
| Desktop | 1440 | 1440 | 832 x 437 |

Before fixes, the article overflowed to 394px on mobile and the footer to 781px
on tablet. Both passed the final article width check after deployment. Mobile
navigation expanded and exposed Home, Categories, Blog, About and Contact after
the existing navigation cleanup completed. Light mode changed the article
background to rgb(247, 249, 252). Dark mode was visually inspected. No console
warnings/errors were returned for the inspected article navigation.

## Isolated editorial integration test

`backend/tests/editorial-lifecycle.test.js` uses the Jest in-memory SQLite
database and a test-only editor. It verifies login, draft creation, anonymous
draft rejection, edit/publish, public retrieval, archive, anonymous archived
post rejection, deletion, and missing-post response. No production article was
created, edited or deleted. The lifecycle and frontend-release suites passed:
2 suites, 4 tests.

## Limits and next work

The editorial result is an API integration test, not a browser test of the
logged-in editor. That UI workflow, contact email delivery, full keyboard/axe
audit and measured Core Web Vitals remain pending. Screenshots were inspected
but there is no committed visual baseline, so visual regression comparison is
inconclusive. Article content depth and distinct editorial illustrations also
remain separate work.

Verdict: deployed responsive fixes verified on the representative article;
full-site QA and authenticated editor browser acceptance are not complete.

Rollback: restore the stylesheet and HTML from parent commit `8c4fec1` using a
reviewed revert of the responsive changes. No database migration was required.
