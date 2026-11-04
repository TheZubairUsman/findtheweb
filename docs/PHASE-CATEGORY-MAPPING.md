# Discovery category mapping

The directory export uses numeric category IDs; database categories use UUIDs. Community submissions retain their export category in metadata for the public filter, and use the matching database UUID as the foreign key once categories exist. Existing pending submissions keep their status during backfill.

`backend/scripts/backfill-discovery-categories.cjs` defaults to a read-only preview. `--apply` runs a single SQLite transaction, creates missing categories, and links eligible submissions. It aborts on conflicting category names or unmatched submission metadata and is repeatable. It does not import the legacy website directory. Other database engines require a separate schema migration.

The production SQLite `Websites.categoryId` column has INTEGER affinity. SQLite stores UUID strings as text in that column; the isolated test suite verifies this behavior and the foreign key. Before applying, create and verify an online SQLite backup, record the existing files for rollback, run preview, and verify the transaction, integrity, public discovery filters, and submission moderation afterwards.

## Live result, 2026-11-04

Commit `82db416972c368a5e940deb4f2d0c1df72abed12` passed GitHub Actions run `41815734308` and reached master. The local backend suite passed 21 suites and 113 tests. Preview reported 10 categories to create and no existing websites to link; the transaction created all 10. A second preview returned zero changes.

An online database backup is at `/opt/findtheweb-backend/data/category-backup-82db416.sqlite`, SHA-256 `f52a990452ae23634c60b970924761558c27515567105d176f89ec46933ffa76`; its integrity check passed. Previous code copies are in `/opt/findtheweb-discovery-backups/20261104-pre-82db416-discovery.js` and `/opt/findtheweb-discovery-backups/20261104-pre-82db416-Website.js`.

A scoped public test submission returned 202 and remained pending with the Technology UUID and legacy ID 1; it was deleted by exact ID, name, and status after verification. Final database checks showed integrity `ok`, zero foreign key errors, 10 categories, zero Website rows, and 198 BlogPost rows. Public health, categories, discovery and blog endpoints returned 200. The legacy discovery export also contains text category IDs; a text category filter returned results, while numeric category 1 returned none in the merged legacy feed. Reconciling the full export taxonomy and importing legacy websites remain separate work.

### Duplicate URL category fix

The export includes repeated URLs with different category IDs. Previously the merged discovery feed kept only the last row's category. The filter now preserves all active legacy category memberships for each merged URL. It does not infer new memberships or import legacy websites into the database. A preliminary local audit found 554 URLs with multiple existing categories. Numeric and text taxonomy reconciliation beyond existing memberships remains work for an editorial mapping.

Commit `a65626ff4874e8db27208b9b3cbcc4587e5eaa02` passed GitHub Actions run `41824137610` and reached master. Live verification returned GitHub once for category `1`, `collaboration-tools`, and `version-control`, and zero times for an unrelated category. The previous route is backed up at `/opt/findtheweb-discovery-backups/20261104-pre-a65626f-discovery.js`; deployed route SHA-256 is `557fdd2cb693f2c161bbfec93cc774d061afb17011b3778fa1f6b3e6013d9897`. Final SQLite integrity was `ok`, with zero foreign key errors and 198 blog posts.
