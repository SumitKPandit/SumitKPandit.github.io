# Phase 0 Research: Personal Multi-Persona Website

## Overview
This document consolidates technology choices, rationale, alternatives, risks, and performance/accessibility/SEO strategies for the multi-persona (philosopher, developer, photographer) personal site.

## Decisions Summary
| Area | Decision | Rationale | Alternatives | Status |
|------|----------|-----------|-------------|--------|
| Framework | Nuxt static generation (SSG) | File-based routing, content module, hybrid rendering if needed, performance & SEO synergy | Astro (more content-first), Next.js (React), SvelteKit | Adopt |
| Styling | Tailwind CSS utility-first with design tokens | Rapid iteration, consistent theming (light/dark), purge for small CSS | Vanilla CSS, SCSS architecture, CSS Modules | Adopt |
| Component Patterns | shadcn/ui style (copy + adapt) | Accessible primitives, customizable, no lock-in | Headless UI (Vue), Vuetify (heavier) | Adopt |
| Icons | Feather Icons (24x24 stroke) | Minimal, coherent visual style, themeable stroke color | Heroicons (fill/bold), Phosphor (varied weights) | Adopt |
| Content Source | Markdown + front-matter | Simple authoring, versionable, no external CMS | Headless CMS (Contentful, Sanity), JSON-only | Adopt |
| Persona Emphasis | Philosopher primary, other two discoverable | Aligns with user intent, brand personality clarity | Equal weight (less narrative hierarchy) | Adopt |
| Theming | CSS variables + Tailwind tokens, dark default | Accessibility, maintainable scale, easy overrides | Inline theme classes, runtime themers | Adopt |
| Portfolio Paging | 12 items/page | Balance visual density & load performance | Infinite scroll (performance risk), Masonry w/o pagination | Adopt |
| Contact Spam Control | Honeypot + rate limiting | Low-friction privacy friendly | reCAPTCHA (UX overhead), hCaptcha | Adopt |
| Taxonomy | One required category + up to 6 tags | Minimizes fragmentation while enabling discovery | Unlimited tags (chaotic), only categories (too rigid) | Adopt |
| Skill Proficiency | 3-tier (Expert/Proficient/Foundational) | Clarity without granularity noise | 5+ level scales (overfit) | Adopt |
| Structured Data | Person, WebSite, BreadcrumbList, Article, CreativeWork/ImageObject | Rich snippets & SEO integrity | Minimal meta only (lost enhancement) | Adopt |
| Image Formats | Source + modern (WebP/AVIF when feasible) | Performance & Core Web Vitals | JPEG only (larger), heavy WebGL | Adopt |
| Draft Handling | `draft: true` front-matter exclusion | Single clear flag | Dedicated folders, suffix-based | Adopt |
| Build Validation | Fail on schema/link issues | Prevents regressions & dead content | Manual QA only | Adopt |

## Rationale Details
### Nuxt
Leverages Vue + Vite for fast dev feedback; SSG matches GitHub Pages deployment, while preserving the option for ISR/fallback if ever migrated. Nuxt Content module reduces custom parsing overhead.

### Tailwind + Tokens
Utility-first speeds prototyping; enforcing tokens (variables) controls aesthetic drift. Purging unused styles ensures small CSS (<10kB compressed target initial route). Dark-first design aligns with primary philosopher aesthetic while still accessible.

### shadcn/ui Style
Copy-and-adapt pattern yields fully owned components, enabling deeper customization while retaining accessible semantics.

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Over-customization causing visual inconsistency | Brand dilution | Enforce token-only color/spacing usage & design review gate |
| Large portfolio images slow LCP | Performance regression | Pre-generate responsive sizes, lazy-load below the fold |
| Taxonomy misuse (too many tags) | Navigation noise | Limit to 6 tags enforced in build validation |
| Contact form abuse | Spam noise | Honeypot + rate limiting + optional future provider integration |
| Accessibility regressions in custom components | Exclusion & legal risk | Axe + manual keyboard checks per PR |
| Content schema drift | Build failures or silent SEO degradation | Schema validation scripts in CI |

## Performance Strategy
- Static pre-render all core pages
- Responsive images with dimension attributes to eliminate CLS
- Lazy-load non-critical media & below-the-fold images
- Preconnect to font host (if external) & self-host fonts if licensing permits
- Target Core Web Vitals: LCP <2.0s (mobile), CLS <0.05 (stricter than constitution), TBT <150ms

## Accessibility Strategy
- Semantic landmarks: header, nav, main, footer, aside when appropriate
- Skip link visible on focus
- Focus outline preserved (never removed without replacement)
- Color contrast: verify tokens via automated contrast checks; adjust if < WCAG AA
- All interactive icons have text or aria-label; decorative icons aria-hidden

## SEO Strategy
- Canonical tags per page + structured data JSON-LD injection
- Clean, human-readable slugs (kebab-case)
- Auto-generated sitemap + robots meta (noindex drafts)
- Open Graph & Twitter card meta with fallback site-wide image
- Consistent internal linking: related articles (category match), persona cross-links

## Content Model Highlights
- Each entity front-matter validated (required fields enumerated in data-model.md)
- Derived fields: reading time (words / 200 wpm), excerpt (first 25–40 words if not provided)

## Alternatives Considered (Brief)
- Astro: stronger content-first stance, but Nuxt synergy with Vue skillset + ecosystem chosen.
- Next.js: heavier React runtime; preference for Vue reactivity simplicity.
- External CMS: increases maintenance overhead and breaks “Markdown only” principle.

## Open Questions (Deferred / Future Scope)
- Internationalization rollout (deferred until demand).
- Advanced search (full-text) vs. simple filter (initial release: category + tag filter only).
- Analytics integration (only if privacy-preserving solution chosen later).

## Conclusion
All unknowns resolved. Ready to proceed to Phase 1 design & contracts with clear, enforceable boundaries.
