# Studio editor usability — 2026-10-26

## Implemented

- Form changes use functional state updates with values captured before the
  update, preserving other fields when input arrives rapidly.
- Categories and tags retain their raw comma-separated input while storing
  parsed arrays for submission. A trailing comma is no longer removed while
  the editor is still typing.
- Save validates required fields, locks concurrent clicks, announces pending
  and success/failure states, and keeps content available after failure.
- List requests use a sequence guard to ignore stale responses.
- Editor fields have explicit label associations; icon actions have accessible
  names. Opening the editor focuses Title; closing restores the triggering
  control when present, otherwise New Post. Required fields describe the status.

## Reproducible editor build

From `backend`, run `npm ci` and `npm run build:editor`. Esbuild is pinned to
0.28.2. The build consumes the recovered BlogManager and local SVG icon source.
It bridges React and authentication to the existing release runtime. Two
consecutive builds produced identical editor hashes. All 12 browser modules
passed `node --experimental-vm-modules tools/check-bundle-syntax.cjs`.

This reconstructs the editor chunk only; it is not a complete frontend rebuild.
The runtime bridge deliberately names the current vendor/core bundles and must
be updated when those runtime exports change.

CI now runs for both `master` and `main`, rebuilds the editor, rejects generated
artifact drift, and parses browser modules before backend tests. Previously it
only targeted `main` while the active repository uses `master`.

## Browser verification (ephemeral local database)

- Empty required fields: displayed validation message; zero save requests.
- Multi-field fill: title, content, categories and tags retained together.
- Status selected with keyboard: Published persisted. Automated select filling
  did not change status; that tool behavior is not recorded as a product pass.
- Simulated 503 save: failure announced and content retained.
- Double click with delayed network: exactly one subsequent real save request.
- Saved public article returned 200 with expected content, both categories,
  both tags and Published status.
- All editor inputs/selects/textareas had connected labels or accessible names.
- Keyboard Enter opened the editor, focus moved to Title, Tab moved to Slug,
  and closing restored focus to New Post.

This is a targeted keyboard/form audit, not a full WCAG conformance claim.

## Dependency audit follow-up

The registry audit returned 32 production dependency findings: 2 low, 5
moderate, 22 high, 3 critical. Critical entries are handlebars, proxy-addr and
tar (the latter through sqlite3). These findings were recorded without applying
an automatic breaking dependency upgrade. Triage exploitability, update safe
patches, and test any sqlite3 major change in a separate security release.

## Release scope

Frontend/editor and CI changes only; no live backend restart or database change
is needed. Parent release `367693b` provides the code rollback point. The loader
and HTML cache keys advance to `20261026editorux1`.
