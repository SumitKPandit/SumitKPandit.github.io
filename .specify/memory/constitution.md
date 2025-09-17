# SumitKPandit.github.io Frontend Constitution

Authoritative, non‑negotiable standards for developing and operating the mobile‑first, responsive static website + blog built with Nuxt, Tailwind CSS, Feather Icons, and shadcn/ui–style component patterns, with all content (text, data, media references) sourced from Markdown and deployed on GitHub Pages.

## Core Principles

### I. Mobile‑First, Progressive Enhancement (NON‑NEGOTIABLE)
All UI, layout, and interaction decisions begin from the smallest viewport. Tailwind's responsive utilities (e.g. `sm:`, `md:`, `lg:`) MAY ONLY be added to progressively enhance; never to “fix” desktop-first breakage. Core content, navigation, and reading experience must remain fully usable without JavaScript and before hydration. Transitions and enhancements (Nuxt page/layout transitions, interactive components) layer on top of a functionally complete baseline. Any feature failing on a mobile 3G throttled profile (LCP > 2.5s on primary content) is rejected.

### II. Content-Driven, File-Based Publishing
All posts, pages, taxonomy indexes, media metadata, and structured site data live as Markdown (and front‑matter YAML/JSON) under a clearly defined `content/` (Nuxt Content module compatible) hierarchy. No opaque CMS schemas. Nuxt's file-based routing + content module generate routes; ad hoc dynamic routes WITHOUT content parity are disallowed. Each Markdown asset MUST declare: title, description, canonical slug, publish date, modified date, open graph image ref (if applicable), and author metadata. Build MUST fail if required front‑matter keys are missing. Asset naming enforces lowercase kebab-case slugs. Images/video are referenced by relative path with descriptive file names (no hashes manually). No inline base64 for images >2KB.

### III. Performance & Static Generation First
The site MUST be generated statically (Nuxt SSG) unless a page demonstrably requires runtime server rendering; default is pre-rendered output deployable on GitHub Pages. Nuxt modules selected must add measurable value; unused modules are banned. Tailwind build MUST purge/"content scan" all unused utilities resulting in <10kB compressed critical CSS for initial route (aligned with Tailwind guidance). Core Web Vitals guardrails (measured locally in CI using Lighthouse CI or equivalent): LCP <2.5s, CLS <0.1, TBT <200ms for representative article and listing pages. Images must use modern formats (AVIF/WebP) where source quality allows; provide dimension attributes or `aspect-*` utilities to eliminate layout shift. Third‑party scripts require explicit approval + performance budget impact note.

### IV. Accessibility & Inclusive Design
All interactive components adhere to accessible roles, keyboard navigation, discernible text, and focus management principles (shadcn/ui and Radix primitives style philosophy). Color theming MUST maintain WCAG AA contrast for body text and UI controls in both light and dark modes. Feather Icons usage: each decorative icon is `aria-hidden="true"`; meaningful icons require `role="img"` + accessible title or an adjacent text label. No icon conveys meaning alone if state/intent can’t be derived by screen reader. Skip-to-content link is mandatory and visible on focus. Dark mode toggling honors user `prefers-color-scheme` by default. Any PR introducing a component lacking unit + accessibility behavior tests (where JS logic exists) is rejected.

### V. Design System & Theming with Tailwind + Tokens
All visual design emerges from a defined token layer (CSS variables or Tailwind theme extensions) – colors, spacing scale, typography, radii, z-index tiers, and shadows. Raw hex/OKLCH values MAY NOT appear directly in components (except within the central theme definition). Theme supports light/dark via data attribute (`data-theme`) or class toggling and CSS variable overrides; component classes read from variables. Adding a new “one-off” utility combination that logically belongs to a semantic component requires refactoring into a composable or partial. Feather Icons are sized using design tokens (e.g. `size-4`, `size-5`) ensuring consistent rhythm. Component source is copy-based (shadcn/ui practice) but immediately conformed to Vue/Nuxt idioms (script setup, composables) and documented; no opaque downstream package lock‑in. Visual regressions guarded by screenshot diff (optional but recommended) for critical templates.

## Additional Constraints & Standards

1. Technology Stack Boundaries: Nuxt (Vue 3, Vite, Nitro) + Tailwind CSS + Markdown content. Adding a competing CSS framework, runtime CSS-in-JS, or global ad-hoc stylesheets is forbidden. Minimal global CSS limited to Tailwind layers and theme variable definitions.
2. Iconography: Only Feather Icons (current version noted at adoption) unless a gap is documented. Custom SVGs must follow 24×24, stroke-based (2px default) aesthetic to maintain visual consistency.
3. Markdown Content Integrity: Front‑matter validation step runs in CI (failing build on missing required keys or future-dated publish dates unless flagged as draft). Draft gating: `draft: true` excludes from production build.
4. Image & Media Handling: All media stored locally (or via an allowed CDN) with width×height metadata. Video embeds (e.g. YouTube) must be lazy-loaded and privacy-enhanced (nocookie domain) with aspect containment.
5. Caching & Revalidation: Since deployment is static via GitHub Pages, any dynamic freshness concerns must be solved through re-generation (CI pipeline) – no client polling without justification.
6. Security & Privacy: No client-side analytics that collect PII without explicit consent. If analytics added, must be lightweight (<2KB script) and privacy-respecting. CSP meta tag recommended (script-src 'self'). No inline event handlers.
7. Internationalization (Forward-Compatible): All user-facing strings sourced from content or a dedicated locale resource file to avoid hard‑coding in components; preparing for future i18n does not justify premature complexity.
8. Error Surfaces: Custom 404 and fallback route pre-rendered; broken internal links cause CI failure (link checker over generated site output).
9. Dependency Hygiene: Unused dependencies removed within the same PR that deprecates usage. Weekly audit for vulnerabilities; high severity triggers immediate patch.
10. Commit & PR Hygiene: Conventional Commit prefixes (feat, fix, perf, docs, chore, refactor, a11y) required; release notes generated from commit log.

## Development Workflow & Quality Gates

1. Branch Policy: All changes via feature branches + PR; direct commits to `main` prohibited.
2. Test Strategy: (a) Content schema validation tests (front‑matter). (b) Component unit tests (props contract, accessibility roles). (c) E2E smoke test over built static output (critical paths: home, blog index, sample post, 404). (d) Performance smoke (Lighthouse CI median over 3 runs) must meet budgets. Red-Green-Refactor enforced: failing test before implementation for new logic.
3. Linting & Formatting: ESLint (Nuxt recommended + accessibility plugin) + Prettier run pre-commit. Style violations block commit (husky or lint-staged optional if added later). Tailwind class ordering standardized (e.g. using plugin) to reduce diff noise.
4. Build Verification: Nuxt generate must complete with zero warnings (treat warnings as errors) regarding missing head/meta, unknown components, or unresolved routes.
5. Accessibility Gate: Automated axe (or similar) run on key pages must return zero serious/critical issues. Manual keyboard-only navigation spot-check performed for new interactive components.
6. SEO & Metadata: Each page defines unique `<title>` and meta description; Open Graph + Twitter card tags validated. Canonical URL set once per page. Structured data (JSON-LD) added where relevant (articles) sourced from front‑matter.
7. Observability: Minimal console logging in production (errors only). Optional lightweight privacy-friendly analytics allowed only if budgets preserved. Build size and performance metrics recorded in PR description (template).
8. Documentation: Any new component or token changes require README snippet or inline JSDoc-style comment explaining intent and usage guidelines.
9. Release & Versioning: Site constitution version increments (semantic) when governance, principles, or required gates change. Content-only updates do not bump constitution version.
10. Rollback Preparedness: Previous successful static build artifact retained (Git tag or release) enabling instant rollback via GitHub Pages branch pointer.

## Governance

This Constitution supersedes ad hoc preferences. Deviations require a formal amendment PR referencing the impacted clauses, rationale, measurable impact (performance, accessibility, maintainability), and migration plan. Reviewers MUST verify:
* Mobile-first adherence (no desktop-first hacks).
* Content integrity (front‑matter, link validity).
* Accessibility conformance (tests + manual spot-check).
* Performance budgets not regressed.
* Theming consistency (no raw style leaks bypassing tokens).

Blocking a PR is mandatory if any non‑negotiable clause is violated. Amendments: require consensus of maintainers (>=2 approvals) and version bump in this file. Emergency hotfixes may bypass some review steps only for security or production outage; a retrospective compliance PR must follow within 24 hours.

**Version**: 1.0.0 | **Ratified**: 2025-09-17 | **Last Amended**: 2025-09-17
