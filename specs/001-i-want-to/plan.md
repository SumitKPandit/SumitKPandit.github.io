
# Implementation Plan: Multi-Persona Static Site (Blog + Portfolio + Resume)

**Branch**: `001-i-want-to` | **Date**: 2025-09-17 | **Spec**: `specs/001-i-want-to/spec.md`
**Input**: Feature specification from `/specs/001-i-want-to/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Deliver a minimalist, timeless, multi-persona personal website (primary persona: philosopher; secondary: developer & photographer) featuring: markdown-authored blog, portfolio collections, resume, about page, and secure contact form. Site must be static (Nuxt SSG) deployable to GitHub Pages, mobile-first, dark-mode default, high accessibility (WCAG AA), strong SEO (structured data), strict content front-matter validation, and performance budgets enforced (LCP <2.5s, CLS <0.05, TBT <150–200ms). Technical approach: Nuxt 3 + @nuxt/content for markdown ingestion, Tailwind CSS with design tokens (CSS variables), Feather Icons for consistent iconography, shadcn/ui-inspired accessible component patterns copied locally, contract-driven validation scripts executed in CI prior to build.

## Technical Context
**Language/Version**: TypeScript (ES2022) / Node.js 20 LTS  
**Primary Dependencies**: Nuxt 3, @nuxt/content, Tailwind CSS, Feather Icons (inline), shadcn/ui pattern (local components), ESLint + Prettier  
**Storage**: Markdown files + static assets (no runtime DB). Contact submissions adapter (future) external – out of scope Phase 1.  
**Testing**: Vitest (unit), Playwright (accessibility & integration), custom schema validation scripts, Lighthouse CI (performance)  
**Target Platform**: Static site (GitHub Pages) served via CDN (GitHub + user browser cache)  
**Project Type**: single (static web)  
**Performance Goals**: LCP < 2.5s (stretch 2.0s) on 4G, CLS < 0.05, TBT < 150–200ms build pages, HTML < 30KB critical path, initial CSS < 12KB (after purge)  
**Constraints**: Static generation only (no server SSR at runtime); dark mode default; no blocking client JS for content render; strict accessibility gates; 6 tag max; one primary persona; contact form rate limit 3/hour/source  
**Scale/Scope**: Initial content: ~10 blog posts, 2–3 portfolio collections (≤24 items), evolving to ≤500 markdown files without refactor.

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Principle Alignment:
- Mobile-First: All components planned mobile baseline (nav, typography scale). ✅
- Content-Driven: Markdown-only model; no CMS divergence. ✅
- Performance Discipline: Targets defined; plan includes purge, SSG, icon subset, no client hydration beyond essentials. ✅
- Accessibility First: Contracts include axe checks, semantic nav, alt requirements. ✅
- Design Tokens: Tailwind + CSS variables strategy established. ✅

No violations or complexity deviations required at this stage.

Post-Design Re-evaluation (Phase 1 complete): Still compliant; contracts codify schema, navigation, alt text, and performance gate strategies. ✅

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (Single project) – static web site; no separate backend required.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load template → seed tasks.md
- Derive tasks from: contracts (content-schema, contact-submission, navigation), entities (Persona, ResumeEntry, Skill, BlogArticle, PortfolioCollection, PortfolioItem, ContactSubmission), quickstart steps
- Map each contract to: validation script test, failing test scaffolds, implementation tasks
- Each entity → model type definition + sample content fixtures + validation test
- User stories → integration test (navigation integrity, blog listing pagination, portfolio collection page, contact submission flow)
- Accessibility & performance → separate tasks (axe tests, Lighthouse CI config)

**Ordering Strategy**:
1. Contract test scaffolds (failing) [P]
2. Data validation scripts
3. Content fixtures
4. Nuxt project scaffolding & Tailwind config
5. Layout + tokens + typography
6. Navigation component + sitemap generation
7. Blog list + article page
8. Portfolio collections + item pages
9. Resume page assembly
10. Contact form (client + placeholder adapter)
11. SEO meta & structured data injection
12. Accessibility & performance test harness
13. Cleanup & polish tasks

**Parallelization [P]**: Independent validation scripts, fixtures, contract test scaffolds, component test shells.

**Estimated Output**: ~28 tasks

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented (none currently)

---
*Based on Constitution (current) - See `.specify/memory/constitution.md`*
