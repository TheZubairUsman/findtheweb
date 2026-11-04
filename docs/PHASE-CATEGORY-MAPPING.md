# Discovery category mapping

The directory export uses numeric category IDs; database categories use UUIDs. Community submissions retain their export category in metadata for the public filter, and use the matching database UUID as the foreign key once categories exist. Existing pending submissions keep their status during backfill.

`backend/scripts/backfill-discovery-categories.cjs` defaults to a read-only preview. `--apply` runs a single SQLite transaction, creates missing categories, and links eligible submissions. It aborts on conflicting category names or unmatched submission metadata and is repeatable. It does not import the legacy website directory. Other database engines require a separate schema migration.

The production SQLite `Websites.categoryId` column has INTEGER affinity. SQLite stores UUID strings as text in that column; the isolated test suite verifies this behavior and the foreign key. Before applying, create and verify an online SQLite backup, record the existing files for rollback, run preview, and verify the transaction, integrity, public discovery filters, and submission moderation afterwards.
