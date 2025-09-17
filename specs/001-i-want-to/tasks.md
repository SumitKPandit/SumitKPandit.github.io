# Tasks: Multi-Persona Static Site (Nuxt SSG)

**Input**: Design documents from `/specs/001-i-want-to/`
**Prerequisites**: `plan.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Execution Flow (main)
(See tasks generation template; adapted here for this feature.)

## Format
`[ID] [P?] Description`  
[P] = Can execute in parallel (different files, no dependency/conflict)

---
## Phase 3.1: Setup & Scaffolding
- [ ] T001 Initialize Node/TypeScript project (create `package.json`, set `type":"module"`, add scripts placeholders) in repository root
- [ ] T002 Add dependencies & devDependencies (Nuxt 3, @nuxt/content, Tailwind CSS, ESLint, Prettier, Vitest, Playwright, Lighthouse CI config placeholder) in `package.json`
- [ ] T003 Configure ESLint + Prettier (`.eslintrc.cjs`, `.prettierrc`) with TypeScript + Nuxt rules
- [ ] T004 Add `.nvmrc` (Node 20) & `.editorconfig` for consistency
- [ ] T005 Create base Nuxt structure: `nuxt.config.ts`, `app.vue`, `pages/index.vue`, `pages/blog/index.vue`, `pages/portfolio/index.vue`, `pages/resume.vue`, `pages/contact.vue`
- [ ] T006 Integrate Tailwind: add `tailwind.config.ts`, `postcss.config.cjs`, `assets/css/tokens.css`, `assets/css/main.css` and import in `app.vue`
- [ ] T007 Define design tokens via CSS variables in `assets/css/tokens.css` (colors, radii, spacing scale) and map to Tailwind theme extension
- [ ] T008 Add dark mode default class on `<html>` using Nuxt app config plugin `plugins/dark-mode.client.ts`
- [ ] T009 Create content folders: `content/blog/`, `content/portfolio/collections/`, `content/portfolio/items/`, `content/personas/`, `content/resume/`, `content/skills/`
- [ ] T010 Add initial placeholder markdown fixtures (one per entity) per `data-model.md` schemas
- [ ] T011 Commit: "chore: initial project scaffolding"

## Phase 3.2: Contract & Schema Tests (TDD Gate) ⚠️ MUST FAIL INITIALLY
- [ ] T012 [P] Contract test: content schema validation rules in `tests/contract/content-schema.spec.ts`
- [ ] T013 [P] Contract test: navigation generation contract in `tests/contract/navigation.spec.ts`
- [ ] T014 [P] Contract test: contact submission handling in `tests/contract/contact-submission.spec.ts`
- [ ] T015 [P] Integration test: homepage navigation + skip link + aria landmarks in `tests/integration/navigation-home.spec.ts`
- [ ] T016 [P] Integration test: blog index pagination + tag & category integrity in `tests/integration/blog-index.spec.ts`
- [ ] T017 [P] Integration test: single article rendering (readingTime, excerpt derivation) in `tests/integration/blog-article.spec.ts`
- [ ] T018 [P] Integration test: portfolio collection & item breadcrumbs + images alt enforcement in `tests/integration/portfolio.spec.ts`
- [ ] T019 [P] Integration test: resume aggregation (duration calculation) in `tests/integration/resume.spec.ts`
- [ ] T020 [P] Integration test: contact form spam scenarios (honeypot + rate limit stub) in `tests/integration/contact-form.spec.ts`
- [ ] T021 [P] Accessibility axe smoke test covering core pages in `tests/integration/accessibility.spec.ts`
- [ ] T022 [P] Performance/Lighthouse budget test harness stub in `tests/performance/lighthouse.spec.ts`
- [ ] T023 Ensure all tests currently FAIL (no implementation) and commit "test: add failing contract & integration tests"

## Phase 3.3: Core Models & Validation Utilities
- [ ] T024 [P] Implement TypeScript model types for entities in `src/models/content-types.ts`
- [ ] T025 [P] Implement schema validation utility (front-matter parsing, rule enforcement) in `src/lib/validation/contentValidation.ts`
- [ ] T026 [P] Implement link & image existence checker in `src/lib/validation/assetsCheck.ts`
- [ ] T027 [P] Implement readingTime & excerpt derivation helpers in `src/lib/derivations/text.ts`
- [ ] T028 [P] Implement persona primary uniqueness & ordering check in `src/lib/validation/personaRules.ts`
- [ ] T029 Wire validation script CLI `scripts/validate-content.ts` (loads all markdown, applies validators, exits non-zero on errors)
- [ ] T030 Add npm script `validate:content` calling ts-node on `scripts/validate-content.ts`
- [ ] T031 Update tests to import compiled helpers (Vitest config `vitest.config.ts`)
- [ ] T032 Commit: "feat: content model types & validation utilities"

## Phase 3.4: Nuxt Content Integration & Pages
- [ ] T033 Configure `@nuxt/content` in `nuxt.config.ts` (markdown parsing, content dir indexing)
- [ ] T034 Implement global layout with semantic landmarks in `layouts/default.vue` (header/nav/main/footer, skip link)
- [ ] T035 Implement navigation builder composable `src/composables/useNavigation.ts` using contract rules
- [ ] T036 Implement sitemap generation script `scripts/generate-sitemap.ts` (exclude drafts) + add npm script `build:sitemap`
- [ ] T037 Implement blog index page logic (pagination, categories, tags) in `pages/blog/index.vue`
- [ ] T038 Implement dynamic blog article page `pages/blog/[...slug].vue` (reading time, structured data injection)
- [ ] T039 Implement portfolio collection index page `pages/portfolio/index.vue` (list collections ordered)
- [ ] T040 Implement portfolio collection detail page `pages/portfolio/collections/[slug].vue`
- [ ] T041 Implement portfolio item page `pages/portfolio/items/[slug].vue`
- [ ] T042 Implement resume page assembly (duration calculation) in `pages/resume.vue`
- [ ] T043 Implement personas/about page (primary + secondary persona presentation) in `pages/about.vue`
- [ ] T044 Commit: "feat: core pages & navigation integration"

## Phase 3.5: Contact Form & Adapter Layer
- [ ] T045 Create contact API placeholder route (Nuxt server route) `server/api/contact.post.ts`
- [ ] T046 Implement validation + honeypot handling + rate limit in-memory (development only) in `server/api/contact.post.ts`
- [ ] T047 Abstract adapter interface `src/services/contactAdapter.ts`
- [ ] T048 Implement dummy adapter (logs only) `src/services/adapters/logContactAdapter.ts`
- [ ] T049 Implement ipHash utility with secret env (fallback dev salt) `src/lib/security/ipHash.ts`
- [ ] T050 Add environment variable loading `.env.example` (CONTACT_SALT)
- [ ] T051 Implement client-side contact form component `src/components/ContactForm.vue`
- [ ] T052 Integration test update: ensure contact form tests now pass (remove expected failures) adjust `tests/integration/contact-form.spec.ts`
- [ ] T053 Commit: "feat: contact form endpoint + adapter abstraction"

## Phase 3.6: SEO, Accessibility & Performance Enhancements
- [ ] T054 Implement structured data injection utility `src/lib/seo/structuredData.ts`
- [ ] T055 Insert canonical + meta tags plugin `plugins/meta.global.ts`
- [ ] T056 Add Open Graph/Twitter meta defaults in `nuxt.config.ts`
- [ ] T057 Implement Lighthouse CI config `lighthouserc.json` with budgets (LCP, CLS, TBT, size)
- [ ] T058 Expand accessibility tests to assert aria-current, alt text presence, skip link focus order
- [ ] T059 Add script `scripts/run-lh-ci.mjs` and npm script `test:perf`
- [ ] T060 Commit: "feat: seo meta, structured data, performance budgets"

## Phase 3.7: Refinement & Polish
- [ ] T061 [P] Add unit tests for derivation helpers in `tests/unit/derivations.spec.ts`
- [ ] T062 [P] Add unit tests for validation error aggregation in `tests/unit/validation-aggregation.spec.ts`
- [ ] T063 [P] Add unit tests for navigation builder edge cases in `tests/unit/navigation.spec.ts`
- [ ] T064 Refactor duplicate validation logic (consolidate into `contentValidation.ts`)
- [ ] T065 Optimize image handling: add placeholder generation stub (deferred actual processing) `scripts/image-placeholders.ts`
- [ ] T066 Add README section for authoring & content validation workflow
- [ ] T067 Add GitHub Action workflow `.github/workflows/ci.yml` (lint, validate, test, generate, lighthouse in PR) 
- [ ] T068 Final accessibility manual checklist doc `docs/accessibility-checklist.md`
- [ ] T069 Commit: "chore: tests & polish"

## Phase 3.8: Deployment Enablement
- [ ] T070 Configure GitHub Pages deployment action `.github/workflows/deploy.yml` (build with `nuxt generate`, push to `gh-pages`)
- [ ] T071 Add `CNAME` (if custom domain desired) & `404.html` generation step
- [ ] T072 Smoke test build locally: `pnpm build && ls .output/public` verify expected pages
- [ ] T073 Commit: "chore: deployment pipeline"

## Phase 3.9: Hard Gates Validation
- [ ] T074 Run full pipeline locally: `pnpm check` + tests + perf + axe; ensure all pass
- [ ] T075 Remove any leftover TODO/FIXME markers (search) and commit final cleanup
- [ ] T076 Tag release `v0.1.0-initial` and prepare CHANGELOG stub

---
## Dependencies Overview
- Setup (T001–T011) precedes all tests.
- Tests (T012–T023) must exist & fail before implementations (T024+).
- Validation utilities (T024–T031) precede content integration (T033+).
- Navigation builder (T035) depends on validation utilities & initial content fixtures.
- Contact form implementation (T045–T052) depends on model & validation utilities.
- SEO/performance/accessibility enhancements (T054–T059) depend on pages (T033–T043).
- Deployment (T070–T073) depends on passing gates (T054–T059, T061–T069).

## Parallelizable [P] Groups Examples
Group A (after T011): T012–T022 (independent test files)  
Group B (after failing tests commit): T024–T028 (distinct utility files)  
Group C: T061–T063 (unit tests in separate files)  

## Validation Checklist
- [ ] All three contracts mapped to tests (T012, T013, T014)
- [ ] All entities have model coverage via content types (T024)
- [ ] Tests precede implementation (ordering preserves TDD)
- [ ] Parallel markers only on distinct file paths
- [ ] Sitemap, navigation, schema, contact scenarios covered
- [ ] Performance & accessibility gates represented (T022, T054–T059)
- [ ] Deployment pipeline tasks included (T070–T073)

## Parallel Execution Snippet Example
```
# Example: Run all contract + integration tests in parallel initially
pnpm vitest run tests/contract/content-schema.spec.ts & \
pnpm vitest run tests/contract/navigation.spec.ts & \
pnpm vitest run tests/contract/contact-submission.spec.ts & \
wait
```

## Notes
- Ensure initial contract/integration tests fail BEFORE starting implementation.
- Commit after each logical milestone group for clear history.
- Keep CSS growth monitored (<12KB initial main bundle after purge).
- Avoid adding dependencies that violate constitution (e.g., heavy UI kits, random analytics).

