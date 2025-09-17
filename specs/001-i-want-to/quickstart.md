# Quickstart: Multi-Persona Static Site (Nuxt + Tailwind + Markdown)

## 1. Prerequisites
- Node.js 20 LTS
- pnpm (preferred) or npm
- GitHub repository with Pages enabled (build from `gh-pages` or `/docs` strategy TBD)
- VS Code + extensions: Tailwind CSS IntelliSense, ESLint, Markdown All in One

## 2. Install Dependencies (Planned)
(Implementation phase will add actual `package.json`)
```
pnpm add -D typescript @nuxtjs/tailwindcss @nuxt/content @nuxtjs/eslint-config-typescript eslint prettier feather-icons
```

## 3. Run Dev Server (Later)
```
pnpm dev
```
Expect: Local site at `http://localhost:3000` with placeholder personas & navigation.

## 4. Content Authoring Workflow
1. Create markdown file under `content/blog/` or `content/portfolio/collections/<collection>/`.
2. Add required front-matter per `data-model.md` schemas.
3. Keep slugs URL-safe (lowercase, hyphen-separated).
4. Set `draft: true` until ready; remove draft to publish.
5. Commit & push; GitHub Actions pipeline will validate schema & build.

## 5. Adding a Persona
Create `content/personas/<slug>.md`:
```
---
name: "Your Name"
role: "Philosopher"
primary: true
ordering: 1
summary: "One line identity statement."
avatar: "/images/avatars/you.jpg"
---
Longer bio paragraph (optional; can be in body)
```
Only one `primary: true` allowed.

## 6. Resume Entries
Create `content/resume/<slug>.md`:
```
---
company: "Acme Inc"
role: "Senior Engineer"
startDate: "2022-01-01"
endDate: "2024-03-31" # or omit for current
summary: "Built accessible, high-performance web systems."
accomplishments:
  - "Reduced LCP by 35%"
  - "Led migration to Nuxt SSG"
---
```

## 7. Blog Articles
```
---
title: "Timeless Design Principles"
slug: "timeless-design-principles"
category: "philosophy"
tags: [design, minimalism]
publishDate: "2025-01-04"
heroImage: "/images/blog/timeless.jpg"
heroAlt: "Abstract minimal geometric form"
draft: true
---
Intro paragraph...
```
Remove `draft` when ready. Tag count <= 6, one category.

## 8. Portfolio Items
```
---
slug: "desert-light-study"
collection: "photography"
title: "Desert Light Study"
description: "Series exploring transient light in arid terrain."
images:
  - src: "/images/portfolio/desert1.jpg"
    alt: "Angular dune shadow"
  - src: "/images/portfolio/desert2.jpg"
    alt: "Soft dawn gradient"
publishDate: "2025-01-05"
draft: false
---
Optional narrative body.
```
Collections defined by directory name presence; add intro via `content/portfolio/collections/<collection>/index.md`.

## 9. Contact Form (Planned)
- Client posts JSON to `/api/contact` (serverless / external adapter TBD).
- Honeypot field named `website` hidden via CSS; must remain empty.
- Up to 3 submissions/hour per IP hash.

## 10. Validation & Linting
(Planned scripts to be added to `package.json`):
```
"scripts": {
  "dev": "nuxt dev",
  "build": "nuxt generate",
  "lint": "eslint .",
  "validate:content": "ts-node scripts/validate-content.ts",
  "check": "pnpm lint && pnpm validate:content && nuxt generate --dry"
}
```
CI runs `pnpm check` → fails build on any schema or accessibility contract violation.

## 11. Performance & Accessibility Checks
- Use `nuxt generate` then run Lighthouse CI (planned) targeting budgets: LCP < 2.5s, CLS < 0.05.
- Run `axe` via headless Playwright test on key pages (home, blog index, one article, portfolio item).

## 12. Theming & Tokens
- Tailwind config will expose CSS variables: `--color-bg`, `--color-fg`, `--color-accent`, `--radius-sm/md/lg`.
- Dark mode default: root class `dark` applied; light mode toggle planned.

## 13. Deployment (Planned)
1. Build static output: `nuxt generate` → `.output/public` (or `dist/` depending on Nuxt version).
2. Publish to `gh-pages` branch via GitHub Action.
3. Ensure `404.html` present for SPA fallback.

## 14. Common Errors
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Build fails: missing required field | Front-matter typo | Compare with schema in `data-model.md` |
| Draft article appears live | `draft` not boolean or removed | Set `draft: true` or remove before publish |
| Tag overflow error | >6 tags | Reduce tag list |
| Duplicate slug error | Two files share slug | Rename one slug |

## 15. Next Steps After Plan Approval
- Generate tasks list (`/tasks` command) → implement validation scripts & base Nuxt project skeleton.

