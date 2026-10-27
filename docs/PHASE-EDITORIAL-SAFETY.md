# Editorial safety batch — 27 October 2026

## Scope

Two existing guides are upgraded while preserving their titles, URLs, and publication dates:

- `what-to-check-before-you-trust-a-browser-extension`: publisher identity, permissions, restricted access, updates, removal, and a decision checklist.
- `what-to-keep-in-a-personal-backup-plan`: coverage, usable exports, independent recovery access, version retention, a manifest, and safe restore rehearsals.

Each guide uses primary official sources, a clearly hypothetical example, and an accessible numbered process figure. OS and browser advice is scoped to the documented controls, without claiming a hands-on product test or guaranteed protection. Some CISA source material was available through search-index excerpts when direct retrieval returned 403; that is not recorded as a successful direct fetch.

Two original AI-generated editorial cover illustrations replace the old text-banner covers for these guides. They are conceptual artwork, not screenshots, real customer photographs, or evidence of a tested product. Originals are versioned under `dist/editorial-images/`, alongside optimized WebP reading copies. The originals were about 1.9/2.1 MB; the WebP source files are 103,222 and 152,850 bytes. Raw server HTML and React use the lightweight reading image, while metadata retains PNG social previews. The social-image map is tied to the exact reviewed reading URL, so a later cover edit is not replaced by an obsolete preview. Figure styling supports the site's light and dark themes. Cover URLs remain first-party.

## Publishing safeguards

`backend/scripts/editorial-batch.cjs` supports `inspect <slugs>`, `preview <release-id>`, `apply <release-id>`, and `rollback <release-id>`. Release IDs contain only lowercase letters, digits and hyphens. Input lives in the backend's private `editorial-releases/<release-id>.json`; a release can contain at most ten unique slugs.

Inspection projects only public article metadata and comparison hashes. Preview writes no articles and creates no backup. Apply rechecks the audited title, content hash, metadata and previous-cover hash, makes a consistent SQLite snapshot, saves previous fields, then updates the batch transactionally. New covers must use reviewed first-party image paths. Active HTML is rejected. Publication status, original dates and unrelated rows are preserved.

Private backups and before/after receipts live in `editorial-backups/<release-id>/` with restricted filesystem permissions. Rollback restores only the fields from that batch, and refuses to overwrite a later edit, changed publication state, or changed publication date. It does not replace the entire database. A receipt cannot guarantee recovery from every filesystem/power failure; inspect database state before manual intervention if a process is interrupted between commit and receipt creation.

New CLI publishing modes require version 2 of the reviewed service; they cannot accidentally use the older service's semantics. Operator tooling alone is installed separately from the running web process without a restart. The updated reading/social-image metadata service and map require one targeted backend restart, with original files backed up and health verified. The former one-off pilot publisher remains available for its existing receipts.

## Validation and scope limits

Meaningful tests cover preview without writes, old-body/cover restoration, concurrent edits blocking an entire rollback, duplicate slugs, changed covers, and preservation of publication identity. CI also runs the existing security, rendering and browser checks. Live publication requires successful CI, verified image delivery, a clean preview, backup receipts, and checks of the public articles after the transaction.

This batch upgrades two of the remaining 196 guides; it does not rewrite the full library or establish search rankings, traffic, or field performance. After successful publication, four of 198 guides will have received these detailed editorial upgrades and 194 will remain for individual review.
