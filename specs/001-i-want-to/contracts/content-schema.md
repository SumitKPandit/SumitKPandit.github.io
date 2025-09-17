# Contract: Content Schema Validation

## Purpose
Ensure all Markdown front-matter adheres to required schema and constitutional constraints before build completes.

## Scope
Entities: Persona, ResumeEntry, Skill, BlogArticle, PortfolioCollection, PortfolioItem.

## Validation Rules (Must Fail Build on Violation)
| ID | Rule | Applies To | Failure Message |
|----|------|-----------|----------------|
| CS-001 | Required fields present | All | `Missing required field: {field} in {path}` |
| CS-002 | Unique slug scope rules | PortfolioItem (global), others (per entity set) | `Duplicate slug '{slug}' in {entity}` |
| CS-003 | One primary persona only | Persona set | `Primary persona cardinality violation` |
| CS-004 | Tag count <= 6 | BlogArticle | `Too many tags ({count}) in {slug}` |
| CS-005 | Valid enum values | BlogArticle.category, Skill.proficiency | `Invalid enum value '{value}' for {field}` |
| CS-006 | Draft future date allowed only; otherwise publishDate <= today | BlogArticle, PortfolioItem | `Future publishDate not allowed for published content` |
| CS-007 | Hero image must include alt | BlogArticle, PortfolioItem (if heroImage) | `heroAlt required when heroImage set` |
| CS-008 | Collection exists for portfolio item | PortfolioItem | `Unknown collection '{collection}' referenced` |
| CS-009 | Image assets exist (and dimensions retrievable) | PortfolioItem images, heroImage | `Missing image or dimensions: {asset}` |
| CS-010 | Resume dates valid (start <= end) | ResumeEntry | `Invalid date range in {slug}` |
| CS-011 | readingTime derived >=1 when words present | BlogArticle | `Derived readingTime invalid for {slug}` |
| CS-012 | No broken internal links in body | All with links | `Broken link: {href} referenced in {slug}` |
| CS-013 | Draft content excluded from sitemap | Draft content | `Draft content incorrectly in sitemap: {slug}` |
| CS-014 | Alt text present for each PortfolioItem image | PortfolioItem | `Missing alt text for image in {slug}` |
| CS-015 | Persona ordering unique | Persona | `Duplicate persona ordering value {ordering}` |

## Derived Field Logic
- `readingTime = ceil(totalWords / 200)`
- `excerpt` derived if absent: first sentence(s) up to ~35 words, stripped of markdown
- `durationMonths = monthsBetween(startDate, endDateOrNow)`

## Non-Functional Constraints
- Validation must execute under 5s for <= 1000 content files
- Fail-fast strategy: collect all errors then fail (batch reporting) for author efficiency

## Out of Scope
- EXIF extraction (future)
- Multi-language variant linking

## Test Strategy (Contract Tests)
- Fixture set with intentionally invalid samples for each rule above
- Positive golden set with one valid instance per entity

