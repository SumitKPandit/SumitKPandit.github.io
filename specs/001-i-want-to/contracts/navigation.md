# Contract: Navigation & Sitemap Generation

## Purpose
Guarantee consistent, accessible navigation structure and sitemap integrity derived solely from content + config.

## Inputs
- `personas` collection (ordered)
- `blog` articles (filtered: draft=false)
- `portfolio` collections & items (draft=false)
- `site.config.(primaryNav, social, metadata)`

## Outputs
1. Primary Nav JSON structure
```json
[
  { "label": "About", "href": "/about" },
  { "label": "Blog", "href": "/blog" },
  { "label": "Portfolio", "href": "/portfolio" },
  { "label": "Resume", "href": "/resume" },
  { "label": "Contact", "href": "/contact" }
]
```
2. Sitemap URL list (excludes drafts, contact POST endpoint) sorted lexicographically.
3. Breadcrumb trails for hierarchical pages (portfolio collections/items).

## Rules
| ID | Rule | Failure Handling |
|----|------|------------------|
| NAV-001 | No 404 links in nav | Fail build |
| NAV-002 | All nav items keyboard reachable sequentially | Axe test failure blocks deploy |
| NAV-003 | Sitemap excludes drafts | Fail build |
| NAV-004 | Breadcrumb includes collection before item | Fail build |
| NAV-005 | Canonical URLs unique | Fail build |
| NAV-006 | Primary nav order stable (no per-page mutation) | Fail build |
| NAV-007 | Max 7 primary nav items | Fail build |

## Accessibility
- Provide skip link `#main` first focusable element.
- Nav landmarks: `<header role="banner">`, `<nav aria-label="Primary">`.
- Current page: `aria-current="page"` on matching link.

## Generation Algorithm (Simplified)
1. Load config + content indices.
2. Build canonical slug map; ensure uniqueness.
3. Construct nav array from fixed order (About, Blog, Portfolio, Resume, Contact) with existence checks.
4. Derive sitemap: static pages + blog articles + portfolio pages (collections & items) + resume.
5. Apply filters (exclude drafts, duplicates), sort.
6. Validate rules.

## Non-Functional
- Generation must complete < 300ms for <= 2000 URLs.
- Deterministic output given same content hash.

## Test Fixtures
- Case: draft article present -> ensure not in sitemap.
- Case: duplicate canonical attempt -> expect failure.
- Case: missing portfolio collection referenced -> earlier content-schema rule will fail (dependency).

