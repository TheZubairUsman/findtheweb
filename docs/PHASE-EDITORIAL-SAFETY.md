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

## Verified delivery

- Application build `c997b75476013bd6016b9aa128e28f64e90f0fe7` passed [CI run 40481459505](https://github.com/TheZubairUsman/findtheweb/actions/runs/40481459505): 98 backend tests in 18 suites, 60 responsive routes, 30 UI checks, and 30 Apache/PHP/rendering checks. The latter include the new process figure in both themes. Dependency audits passed. The three general accessibility surfaces and the tested figures had no detected automated violations; this does not certify full accessibility.
- Release `safety1-20261027` was previewed, backed up, and published transactionally. Article count was 198 before and after; the subsequent database integrity check returned `ok`. The guides contain 1,182/1,267 words under the release's tag-stripping counter, with six/seven-minute reading times. Titles, slugs and original publication dates remain unchanged.
- Live checks confirmed both reviewed article bodies, metadata, first-party reading covers, separate PNG social previews, one canonical and one main heading in raw HTML. The private batch-backup path returned 403 to a HEAD request.
- Delivered WebP files were 103,222 and 152,850 bytes. A live browser observed the backup article requesting its WebP reading image rather than the heavy social PNG. These are transfer/format checks, not field Core Web Vitals measurements.
- Live desktop/mobile checks confirmed loaded covers, a five-step figure, no horizontal overflow, theme-appropriate figure colors and visible numbering. The dark navigation logo was made legible. The new backup cover also appeared and loaded through the blog's search UI.
- Public artifact verification checked 235 files: 35 exact hashes matched, while 200 CDN-transformed images passed format/dimension checks. Image transformations and proportional resizing are recorded rather than represented as exact source identity.
- Local receipts are ignored under `docs/qa/editorial-safety-20261027/`; full CI browser screenshots/reports remain in the workflow artifact. Private SQLite and before/after receipts stay on the server in `editorial-backups/safety1-20261027/`. Original operator/metadata files remain in `rollback-editorial-tooling-safety1-20261027/` for rollback.

Four of 198 guides have now received these detailed editorial upgrades. The remaining 194 still require individual research, writing and illustration review. This phase does not establish search rankings, traffic, named-human authorship, or production field performance.
