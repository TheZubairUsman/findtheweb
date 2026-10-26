# Contact inbox reliability — 2026-10-26

## Shipped scope

The public contact form saves messages directly in the first-party database.
A reference UUID is acknowledged only after persistence succeeds. A failure
keeps the visitor's text available for retry. No mailbox activation or SMTP
connection is required for this support-inbox path.

Administrators can open `/admin/messages` from the dashboard/editor link, read
messages, page through them, refresh, and mark read/unread. API authentication
is enforced independently of the UI. Responses containing messages use
`Cache-Control: no-store`. Name, email, subject and body render with
`textContent`, not executable HTML. Contact API allowlists fields, validates
types and bounds, rejects a honeypot, and limits each IP to five attempts/hour.

## Verification

- Full backend suite: 15 suites, 82 tests passed.
- Seven contact regressions: persistence before acknowledgement, validation,
  honeypot rejection, anonymous read/update rejection, authenticated read and
  status update, storage failure without success, and rate limiting.
- All 12 browser modules passed the ES module parser; contact helper passed
  JavaScript syntax validation.
- Local isolated browser: submitted message, received reference, logged in,
  opened inbox, read message, and marked it read. Embedded script text was
  rendered literally; no script executed.
- Test messages and credentials were confined to an ephemeral local database.

## Release and rollback

Live SQLite backup and old backend entrypoint are retained at
`/opt/findtheweb-backend/rollback-contact-2026-10-26T14-53-59-485Z`.
The `prepare-contact-release.cjs` script uses SQLite VACUUM INTO for a consistent
snapshot and a separate `schema` mode that creates only the contact table.
No existing table is altered or dropped.

For code rollback, restore the old backend entrypoint from that directory and
revert the frontend contact helper. Keep the new table: it may contain support
requests received after launch. Do not restore the old whole database over
newer production data as a routine code rollback.

## Limits

This is support inbox delivery, not outbound email notification. SMTP and
external mailbox receipt remain unconfigured/unverified. No claim is made that
a confirmation email was sent. Operators must check the inbox while email
notifications are unavailable. Status is read/unread only; retention controls,
search, assignment and reply sending are future work. Existing admin bearer
token storage remains unchanged.
