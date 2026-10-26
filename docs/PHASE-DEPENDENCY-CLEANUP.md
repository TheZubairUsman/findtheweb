# Dependency cleanup — 2026-10-27

This release closes the remaining 12 high and 5 moderate entries in the
backend production dependency graph. Both local full and production npm audits
report zero known vulnerabilities with the current advisory database.

Compatible dependency updates retain Express 4 and Sequelize 6. Nodemailer is
pinned to 10.2.1. UUID is pinned and overridden to CommonJS-compatible 11.1.1
so Sequelize does not retain its vulnerable nested UUID 8 dependency. UUID 14
was deliberately not forced into existing CommonJS consumers.

Validation before deployment:

- 16 suites, 88 tests pass, including admin login, editorial lifecycle,
  community ownership, contact authorization and SQLite persistence.
- New tests check email composition using a local JSON transport and Sequelize
  UUID default generation. No real email is sent.
- Editor rebuild remains reproducible; 70 source files and 12 browser modules
  pass syntax checks.
- CI now rejects any production audit finding at low severity or above.

The release-specific build and activation scripts now target
`/opt/findtheweb-deps-20261027-highfix1`. The new rollback directory is
`/opt/findtheweb-backend/rollback-security-20261027-highfix1`.
The previous critical-fix rollback directory is retained separately. SQLite
is compiled in a disposable Bookworm container to match the live native runtime.
Activation keeps the existing image and environment and restores the old
dependency tree and manifests automatically if verification fails.

Scope: a zero npm audit count covers known dependency advisories in this lockfile.
It does not establish that the whole application is vulnerability-free. In
particular, existing shipped frontend vendor bundles are not rebuilt by updating
backend-installed React Router; their separate source/build migration remains
outside this dependency release. Deprecated packages and future advisories need
continued maintenance. SMTP delivery is not validated by JSON transport tests.

Advisory references:

- https://github.com/advisories/GHSA-6457-6jrx-69cr
- https://github.com/advisories/GHSA-27r3-jxmh-p828
- https://github.com/advisories/GHSA-8c8m-p3m8-cjg8
