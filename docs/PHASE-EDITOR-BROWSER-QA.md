# Editor browser QA and contact audit — 2026-10-26

## Reproduced and fixed

- A malformed theme bundle fragment prevented a fresh browser from parsing the
  app. Corrected the statement separator and added a real ES module parser gate:
  `node --experimental-vm-modules tools/check-bundle-syntax.cjs` (12 modules pass).
- The editor saved drafts but fetched its list from the public endpoint, which
  excludes drafts. The editor now lists `/api/v1/admin/posts` with authentication.
- Removed the hard-coded sample "Published posts" section from the admin HTML.
- Corrected the contact form's `_next` redirect from the old domain to
  `https://findtheweb.zus3cu.tech/thank-you` in source and shipped bundle.

## Browser evidence

`node backend/scripts/editor-browser-qa.cjs` serves the shipped assets locally,
with API URLs redirected to the loopback host. It uses an in-memory SQLite
database, random runtime signing secret, test-only editor, development mail
transport and binds only to 127.0.0.1:5097.

Using a clean browser context, verified login, protected editor navigation,
draft creation and listing, loading that draft in the editor, content editing,
publishing, and anonymous retrieval of the published content. Draft appeared in
the table after the list endpoint fix. Published retrieval returned 200 with
the edited HTML. No production article or account was changed.

During a combined automated form fill, content saved while status remained
draft. Explicitly selecting Published in the browser and saving again passed.
This observation does not establish a backend publication defect; multi-field
state updates under rapid input remain a follow-up usability check.

## Contact findings

The contact page posts to FormSubmit for the existing support mailbox. All
backend SMTP setting presence checks returned false. Backend SMTP therefore
cannot establish delivery for this form. No external test message was sent.
FormSubmit mailbox activation and actual inbox receipt remain unverified and
require mailbox access. A redirect correction is not evidence of delivery.

## Remaining checks

Inbox receipt, editor keyboard/accessibility labels, rapid multi-field editing,
and measured Core Web Vitals remain pending. Frontend rebuild recovery is still
needed to replace mechanical bundle patches with a reproducible build.

Rollback is the parent commit `7ad0959`; no backend deployment or database
migration is part of this frontend release.
