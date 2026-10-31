# Editorial library upgrade

## Scope and release boundary

Upgrade the 192 remaining short articles across the ten existing categories. Preserve the six previously reviewed articles, all 198 original slugs/titles and publication dates. Each replacement needs individually researched primary-source evidence, original practical writing, a labelled hypothetical example, an actionable checklist, a readable process figure, and its own conceptual cover with an optimized reading image. Generated illustrations do not represent tested products or real incidents. No search ranking or traffic outcome is established by this work.

The assignment is recorded in `content/library-20261028/progress.json`. Six disjoint editorial teams own 32 articles each. The integrator owns audits, batch preparation, deployment and receipts. A saved draft, passing local gate, prepared release, successful transaction, and verified public article are different states. The library must not be described as complete while any assigned article remains unpublished or unverified.

## Review and operational controls

`tools/audit-editorial-library.cjs` checks fresh comparison hashes, title preservation, safe balanced markup, meaningful article structure, 900–1600 words, inline source coverage and per-source claim notes, metadata limits, actual PNG/WebP headers/dimensions and delivery budgets. It detects exact repeated substantive paragraphs and duplicate bodies across drafts. These mechanical checks do not independently prove every claim; primary-source review and editorial reading remain necessary.

`tools/plan-editorial-library.cjs` uses deterministic groups of at most ten articles. Preparation requires every article in that group to pass both text and asset checks. It never publishes. `tools/prepare-editorial-release.cjs` now explicitly projects comparison fields from a richer inventory, preventing an old inventory body from replacing reviewed new copy. A regression test covers that failure mode.

Publication uses the existing version-2 backend CLI: preview, consistent SQLite backup, transactional apply and field-scoped guarded rollback. Never restore a whole database over concurrent user changes. Existing credentials and authentication settings remain outside this content release. Private backups and local QA receipts are not public deployment artifacts.

## Layout defect found during local review

The sitemap guide's preformatted XML extended a 375px React article page to 569px. Inline-code wrapping did not cover preformatted blocks. Article code blocks now scroll inside their own width, preserving copyable whitespace; wide tables receive a contained horizontal scroller. Light/dark styles are maintained. The existing isolated browser fixture now contains a long XML line and a diagnostic table so route/rendering checks exercise these layouts.

The focused sitemap recheck passed, followed by 25 complete article fixtures in light/dark mobile, desktop and fallback mobile layouts: 100 local layout states, with zero browser exceptions. `tools/qa-editorial-library.cjs` exercises the actual React reader against local draft fixtures and a sanitized fallback layout. It does not claim to be a production interaction audit. Receipts are ignored under `docs/qa/editorial-library-20261028/`.

## Publication status

On 31 October, a fresh production inventory still contained 198 published articles; body/cover comparison hashes, metadata and original publication dates matched the earlier baseline. The first two ten-article batches were prepared. Further writing and artwork remain in progress. Transaction and live verification receipts must be recorded before changing this section to published.
