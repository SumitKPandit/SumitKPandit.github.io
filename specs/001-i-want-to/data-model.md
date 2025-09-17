# Data Model & Content Schemas

All content stored as Markdown + YAML front-matter under `content/` respecting constitution constraints.

## Global Front-Matter Conventions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | yes | Human-readable title |
| slug | string (kebab-case) | yes | Unique per entity scope; computed from filename if absent (validation enforces uniqueness) |
| description / excerpt | string | conditional | Short summary (blog: excerpt required or auto-derived) |
| publishDate | date (ISO 8601) | conditional | Required for dated content (articles, portfolio if time-relevant) |
| modifiedDate | date | optional | Auto-set or manual update when body changes |
| draft | boolean | no | `true` excludes from indices/navigation/sitemap |
| heroImage | path | optional | Primary media asset |
| heroAlt | string | required if heroImage | Accessible alt text |
| canonical | string (URL path) | computed | Derived canonical path; override only if consolidation required |
| tags | string[] | rules | 0–6 items, kebab-case words |
| category | string | conditional | Required for BlogArticle (enum) |
| ogImage | path | optional | Social preview image reference |

## Enumerations
- Blog Categories: `philosophy`, `software`, `photography`, `intersections`
- Skill Proficiency: `expert`, `proficient`, `foundational`

## Entities

### Persona (Static Configuration)
Stored as structured data (e.g., JSON or Markdown summary) in `/content/persona/*.md`.
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | yes | Display label |
| key | string | yes | `philosopher|developer|photographer` |
| primary | boolean | yes | Only one true (philosopher) |
| intro | string (markdown) | yes | Short introduction |
| featuredRefs | string[] | optional | Slugs referencing related content |
| ordering | number | yes | Sort priority |

Validation Rule: Exactly one persona must have `primary: true`.

### Resume Entry
`/content/resume/*.md`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | yes | Role title |
| organization | string | yes | Employer/client |
| startDate | date | yes | ISO format |
| endDate | date | conditional | Omit if current |
| current | boolean | conditional | If true, endDate omitted |
| achievements | string[] | optional | Bullet highlights |
| skills | string[] | optional | Cross-linked skill keys |
| location | string | optional | City / remote indicator |

Derived: duration (months) computed at build.

### Skill / Capability
`/content/skills/*.md`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | yes | Human readable |
| key | string | yes | Unique slug |
| proficiency | enum | yes | `expert|proficient|foundational` |
| group | string | yes | Category grouping (e.g., language, platform) |
| description | string | optional | Clarifying context |

### Blog Article
`/content/blog/YYYY/slug.md`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | yes | |
| slug | string | yes | Usually from filename |
| publishDate | date | yes | Past or present only |
| modifiedDate | date | optional | |
| draft | boolean | no | Default false |
| category | enum | yes | From allowed set |
| tags | string[] | no | 0–6 distinct tokens |
| excerpt | string | conditional | Auto-derived if absent |
| heroImage | path | optional | |
| heroAlt | string | conditional | Required if heroImage |
| readingTime | number | derived | Minutes (ceil(words / 200)) |

Constraints: No future `publishDate` unless `draft: true` (validation error otherwise).

### Portfolio Collection
`/content/portfolio/collections/*.md`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | yes | |
| slug | string | yes | Unique |
| description | string | optional | Contextual narrative |
| ordering | number | yes | Display ordering |

### Portfolio Item
`/content/portfolio/items/*.md`
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | yes | |
| slug | string | yes | Unique globally |
| collection | string | yes | Must match existing collection slug |
| publishDate | date | optional | For chronology sorting if provided |
| images | path[] | yes | One or more image paths |
| alt | string | yes | Representative alt text |
| description | string | optional | Narrative/context |
| ordering | number | optional | Relative ordering within collection |

Validation: Each image path must have accessible dimensions metadata available (width/height) captured during build process.

### Contact Submission (Transient / Non-Public)
Not stored in public Markdown (private channel or structured data store). Represented for contract clarity.
| Field | Type | Notes |
|-------|------|-------|
| name | string | Required |
| email | string | Validated format |
| subject | string | Optional |
| message | string | Required |
| timestamp | datetime | Recorded at receipt |
| sourceHash | string | Privacy-safe hashed IP/fingerprint |
| spamFlag | boolean | True if honeypot or rate limit triggered |
| expiresAt | datetime | 12 months from timestamp |

## Relationships
- Persona → BlogArticle (featuredRefs) many references
- PortfolioCollection → PortfolioItem (1:N)
- BlogArticle ↔ Skill (indirect via tags or explicit mention - no hard foreign key)
- ResumeEntry ↔ Skill (M:N via `skills` list)

## Validation & Build Rules
1. Unique slug per entity scope (global for portfolio items, per category for blog acceptable because date path disambiguates).
2. Draft exclusion: `draft: true` prevents inclusion in sitemap, feed, indices.
3. Tag limit: >6 tags triggers build error.
4. Required alt text if any hero or media imagery.
5. Broken internal links or missing referenced images fail build.
6. Persona uniqueness: exactly one primary persona.
7. Proficiency enum strict; unknown values fail validation.
8. Content date sanity: publishDate > today (and not draft) fails.

## Derived Fields & Generation
| Field | Source | Method |
|-------|--------|--------|
| readingTime | BlogArticle body | Count words / 200, round up |
| excerpt | BlogArticle body | First sentence(s) up to ~35 words if not provided |
| duration | ResumeEntry | Month diff between startDate and endDate/current |
| canonical | slug + path pattern | Deterministic path construction |

## Future Extensions (Deferred)
- Multi-language content (i18n directories)
- Full-text local search index generation
- Portfolio item EXIF metadata extraction for camera/lens details

