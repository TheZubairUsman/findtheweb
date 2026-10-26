# Critical dependency remediation — 2026-10-26

## Result

Production dependency audit changed from 32 findings (3 critical) to 17 findings
(0 critical, 12 high, 5 moderate). This closes the three critical dependency
entries in this release; it is not a claim that all security findings are fixed.

| Package | Previous | Deployed |
| --- | --- | --- |
| handlebars | 4.7.8 | 4.7.10 |
| proxy-addr | 2.0.7 | 2.0.8 |
| tar | 6.2.1 | 7.5.22 |
| sqlite3 | 5.1.7 | 6.0.1 |
| bcrypt | 5.1.1 | 6.0.0 |

Updating bcrypt and SQLite removed obsolete install-tooling chains instead of
forcing tar 7 into dependencies that declare tar 6. Node.js minimum is now
20.17.0; the verified live runtime is Node 22.23.4.

## Evidence and tests

- 16 suites and 86 tests passed locally.
- Four compatibility tests cover existing bcrypt hash verification, rejecting
  an overbroad mapped-IPv6 proxy trust case, normal escaped template rendering,
  and file-backed SQLite data surviving close/reopen with integrity `ok`.
- GitHub Actions run 40351078235 passed for implementation commit 6283216.
- CI includes `npm audit --omit=dev --audit-level=critical` to reject critical
  dependency regressions. High/moderate findings remain visible in the audit.
- Linux native candidate passed in-memory SQLite write/read, read-only access
  to the production database with integrity `ok`, and old bcrypt hash checks.
- After activation, SQLite integrity remained `ok` and monitored table counts
  were preserved, including all 198 blog posts and the existing administrator.
- Live health, frontend home/blog, filtered blog API, sitemap and RSS returned
  200; anonymous contact inbox read returned 401.
- A short-lived server-internal token verified authenticated read-only blog
  management and contact inbox requests (both 200). Token and response contents
  were not printed or persisted. This was not a real-password browser login.
- Live `npm audit --omit=dev` confirmed zero critical findings. Its ordinary
  nonzero exit status for remaining high findings must not be described as a
  fully clean audit.

## Production-compatible build

The SQLite 6 downloaded Linux binary required GLIBC 2.38, while the existing
Debian Bookworm container supplies GLIBC 2.36. The isolated smoke test caught
this before any live dependency replacement.

`backend/scripts/build-security-deps.sh` installs the locked dependencies and
compiles SQLite from source inside a disposable Node 22 Bookworm container.
Python, make and g++ are installed only in the build container. The live
container image, environment, port mapping and source bind mount are retained.
Host networking is used to match this VPS's working network configuration;
the isolated default-bridge npm install failed before this was identified.

The prepared directory was `/opt/findtheweb-deps-20261026-criticalfix1`.
Only its dependency tree and manifests were activated after native verification.
No database migration, account reset, or unrelated service restart was needed.

## Rollback and receipts

`/opt/findtheweb-backend/rollback-security-20261026-criticalfix1` retains:

- Consistent SQLite snapshot from VACUUM INTO (mode 0600).
- Previous package.json and package-lock.json.
- Previous Linux node_modules tree.
- Baseline data counts and post-activation verification.json (mode 0600).

Activation used `activate-security-deps.sh`, with automatic dependency rollback
on failed startup/verification. Routine code rollback restores the old modules
and manifests with the service stopped, then starts the existing container.
Do not overwrite the live database with the snapshot during routine rollback:
messages or other data may have arrived after the snapshot.

## Sources and remaining work

- [Handlebars patched-version advisory](https://github.com/advisories/GHSA-p8wg-vrv2-v86f)
- [proxy-addr patched-version advisory](https://github.com/advisories/GHSA-jqcg-44mw-7w3h)
- [tar patched-version advisory](https://github.com/advisories/GHSA-r292-9mhp-454m)

Remaining production packages flagged by the audit include Express/body-parser,
path-to-regexp, nodemailer, Sequelize and related utilities, react-router,
tar-fs, validator and uuid. Triage their reachable paths and compatible updates
next; avoid treating this critical-only gate as a complete security audit.
