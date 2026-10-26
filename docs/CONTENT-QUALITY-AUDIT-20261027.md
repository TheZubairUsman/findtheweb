# FindTheWeb content quality audit — 2026-10-27

## Scope

Content-only audit of `tmp/content-audit-snapshot.json`, supplied as 198 public, published posts with projected safe fields. Only this report and `content/editorial-upgrades-20261027.json` are owned by this subtask. No production writes, account fields, package changes, commits, deletions, or indexing directives. Main owns PHP/API integration and deployment.

Raw snapshot file SHA-256: `4dfd66082b4a9b3ba3f6f29d0a28fdb3ea980c560e625682a0e007dd6170749e`.

## Measured baseline

| Measure | Observed |
| --- | ---: |
| Records | 198 |
| Unique slugs / case-insensitive titles / exact HTML bodies | 198 / 198 / 198 |
| Total body words | 63,707 |
| Minimum / median / mean / maximum words | 281 / 295 / 321.75 / 359 |
| Under 300 words | 100 (50.51%) |
| 300–499 words | 98 (49.49%) |
| 500–999 / 1,000+ words | 0 / 0 |
| Distinct h2/h3 heading sequences | 2 |
| Posts with an HTML anchor containing href | 100 (50.51%) |
| Distinct normalized paragraphs repeated across posts | 8 |
| Per-post distinct paragraph instances | 890 |
| Instances belonging to repeated paragraphs | 598 (67.19%) |

Method: replace HTML tags with spaces, decode HTML entities, then tokenize with Python Unicode regex `r"\b[\w]+(?:['’-][\w]+)*\b"`. Counts include headings, lists, code tokens, anchor text, and notes, but exclude attributes and URLs occurring only in attributes. They are editorial counts, not browser layout or search-engine measurements. Short length alone establishes neither poor quality nor a penalty.

Paragraph method: extract p elements, strip tags, decode entities, collapse whitespace, deduplicate within each post, then count the posts containing each text. The 598/890 result is a paragraph-instance share, not a duplicated-word percentage. Lists and headings are excluded from it.

Category memberships: Web Performance & SEO, Remote Work, Privacy & Data, Learning & Research, Developer Tools, Cybersecurity, Cloud & DevOps, Automation & No-Code, and AI & Automation each have 20 posts; Web Discovery has 18. These sum to 198.

Shortest examples: `automation-testing-for-non-developers` (281), `a-production-ready-cloud-deployment-checklist` (282), `api-documentation-that-developers-actually-use` (283). Three longest examples, each 359: `how-to-turn-a-repetitive-browser-task-into-a-safe-automation`, `how-to-test-whether-a-new-tool-is-worth-your-time`, and `how-to-judge-whether-a-free-online-tool-is-worth-using`.

## Repetition

Exactly 100 posts share five headings: Start with the decision; A useful working model; What good implementation looks like; A checklist you can use today; Sources and further reading. The other 98 share six: Start with the real problem; A simple evaluation method; What to look for; A practical starting plan; Quick checklist; Final thought.

| Repeated paragraph opening, abbreviated for identification | Posts |
| --- | ---: |
| Before choosing a tool or process, write down the outcome | 100 |
| Good implementation is visible in the details | 100 |
| Editorial note: This article is an original FindTheWeb synthesis | 100 |
| Prefer tools and workflows that are understandable, reversible | 98 |
| Spend 20 minutes on the smallest useful version | 98 |
| The best online discovery is not the tool with the loudest claim | 98 |
| Before choosing a documentation solution | 2 |
| Before choosing a backups solution | 2 |

Full normalized paragraph texts match exactly within each row. All 198 posts belong to one of the two heading groups. Whole bodies remain unique because titles, introductions, and other substitutions differ. Generic shared advice provides little subject-specific explanation; replace it with actual decisions, examples, failure cases, and sources. The editorial note is boilerplate and should not itself be equated with substantive duplication.

Decoded content contains no literal backslash-double-quote sequences. JSON escaping is not evidence of malformed live links. Anchor presence does not establish validity, source relevance, or successful navigation.

## Title overlap

Screen all 19,503 unordered pairs using lowercased word-token sets and Jaccard similarity: intersection size divided by union size. Remove exactly these stopwords: `a an the to for of in and with your how is on from`. Five pairs meet the editorial threshold of 0.40. Scores are rounded only after thresholding.

| Pair | Jaccard |
| --- | ---: |
| How to Build a Personal Start Here Page / How to Build a Personal “Start Here” Page for the Web | 0.833 |
| A Practical Guide to Data Minimization / A Beginner’s Guide to Data Minimization | 0.600 |
| A Practical Note-Taking System for Developers / A Practical Note-Taking System for Technical Projects | 0.500 |
| A Practical Introduction to Containers / A Practical Introduction to Webhooks | 0.500 |
| The Difference Between a Demo, a Prototype, and a Product / The Difference Between Uptime and a Healthy Product | 0.429 |

Review the first two pairs side by side for intent; clarify audience distinctions in the note-taking pair. Containers versus webhooks illustrates a formula-driven false positive; the final pair also shares wording without establishing the same task. There are no exact duplicate titles. This lexical screen misses synonyms and cannot establish query overlap, ranking competition, canonical selection, or a benefit from consolidation. No analytics, Search Console queries, backlinks, keyword volumes, traffic, or ranking evidence was available or inferred.

## Two original pilot replacements

The JSON is a top-level array of two records with only `slug`, `expectedContentSha256`, `content`, `excerpt`, `seoTitle`, `seoDescription`, `seoKeywords`, and `sources`. Keywords are descriptive arrays, not measured search opportunities. Existing titles are preserved verbatim in seoTitle; no title or slug mutation is requested. The page template is expected to supply h1; bodies use h2/h3.

| Preserved title and slug | Before | Replacement | Excluding pre blocks |
| --- | ---: | ---: | ---: |
| Technical SEO for a JavaScript Website — `technical-seo-for-a-javascript-website` | 287 | 1,050 | 1,022 |
| A Human Workflow for Checking AI-Generated Code — `a-human-workflow-for-checking-ai-generated-code` | 355 | 1,092 | 1,078 |

Initial hashes are SHA-256 of the JSON-decoded original content string encoded as UTF-8, without trimming, normalization, entity decoding, or newline conversion:

- SEO pilot: `c3d587f650848e7a68aac38de4f56c12de27aa8a853ae916d22a4db76e518802`
- Code-review pilot: `b6a05789d74de1f2abead23cdbe20939a68f80cea81c48bcf9f70571222f7146`

The SEO pilot supplies route sampling, read-only HTTP commands, rendering tradeoffs, direct navigation, metadata and link checks, and failure-state evidence. The code-review pilot supplies a behavioral contract, read-only Git inspection, authorization and query-boundary review, independent tests, and human acceptance criteria. Commands are illustrative, not claims of tests performed on FindTheWeb. Each body includes exactly one figure/figcaption/ol flow and explicit official source links. Neither uses script, style, iframe, invented firsthand experience, copied Medium material, or fabricated outcomes.

## Primary sources checked via web on 2026-10-27

Sources support the attributed technical facts. Examples, checklists, and editorial reasoning are original synthesis; sources do not endorse FindTheWeb or prove a search-performance improvement.

- [Google: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: JavaScript troubleshooting](https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript)
- [Google: Crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google: Canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [GitHub: Copilot Chat responsible use](https://docs.github.com/en/copilot/responsible-use/chat), verified through the older chat-in-github URL, which redirected here.
- [GitHub: Copilot Agents application card](https://docs.github.com/en/copilot/responsible-use/agents)
- [OWASP: Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
- [OWASP: SQL injection prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [OWASP: Secure code review](https://cheatsheetseries.owasp.org/cheatsheets/Secure_Code_Review_Cheat_Sheet.html)

The attempted older GitHub responsible-use/copilot-code-review URL could not be fetched; the verified Agents card supplies review limitations instead. The attempted OWASP Code_Review_Cheat_Sheet URL returned 404; Secure_Code_Review_Cheat_Sheet is used instead. Failed URLs are excluded from article source arrays.

## Prioritization and integration handoff

1. Review the two pilots and apply by exact slug only. Compare the live stored content hash with expectedContentSha256 before changing a record. A mismatch means stop that record and inspect newer content; never force a stale replacement. Main should retain the original content and metadata for rollback.
2. Confirm the production sanitizer preserves figure, figcaption, ol, pre, code, headings, and source anchors. Check rendered content, escaping, title display, and mobile reading flow. Artifact structure checks do not establish production renderer behavior.
3. Prioritize remaining security and technical guidance by the consequences of incorrect advice and distinct reader tasks. Replace generic sections with subject-specific examples, constraints, failure cases, and primary references. These priorities do not rely on invented traffic.
4. Manually review title-overlap candidates. Separate audiences and tasks when both pages deserve to exist. Consider consolidation or redirects only after reviewing page purpose and available user/search evidence. Do not auto-noindex or delete posts based on word counts, repetition, or similarity.
5. Continue in small editorial batches. Require factual verification, distinct usefulness, relevant sources, coherent headings, accurate excerpts, and preserved URL identity. A word target is not a substitute for usefulness.

Two pilot upgrades do not complete remediation of all 198 posts. If applied, 196 still require individual editorial review. Baseline measurements remain snapshot results, not post-deployment results. Publication, indexing, rankings, traffic, user outcomes, live HTML behavior, and existing implementation issues remain unverified by this subtask.
