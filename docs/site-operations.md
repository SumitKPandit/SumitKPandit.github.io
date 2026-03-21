---
title: Site Operations Guide
description: Documentation for building, deploying, and maintaining this website
---

# Site Operations Guide

## Overview

This website is built using [Eleventy (11ty)](https://www.11ty.dev/), a simple static site generator. It is hosted on GitHub Pages and deployed automatically using GitHub Actions.

## Tech Stack

- **Static Site Generator**: Eleventy (11ty) v3.x
- **Hosting**: GitHub Pages
- **CI/CD**: GitHub Actions
- **Domain**: sumitkpandit.in (custom domain via CNAME)
- **CSS**: Custom stylesheet (style.css)
- **Icons**: Feather Icons (via CDN)

## How the Site is Built

### Source Files

The site is built from the following source files:

| Path | Description |
|------|-------------|
| `index.md` | Homepage content |
| `about.md` | About page |
| `blog.md` | Blog listing page |
| `resume.md` | Resume page |
| `book.md` | Book/page |
| `_includes/layouts/` | 11ty templates (base.njk, page.njk) |
| `_includes/components/` | Reusable components (header.njk, footer.njk) |
| `style.css` | Main stylesheet |
| `content/blog/*.md` | Individual blog posts |

### Build Process

1. Eleventy processes markdown files (`.md`) using Nunjucks templates (`.njk`)
2. Templates are located in `_includes/layouts/` and `_includes/components/`
3. Output is generated in the `_site/` directory
4. CSS and other static assets are copied as-is

### Build Command

```bash
npm run build
# or
npx @11ty/eleventy
```

## How the Site is Deployed

### GitHub Actions Workflow

The deployment is automated via `.github/workflows/eleventy.yml`:

1. **Trigger**: On every push to the `main` branch
2. **Build**: Runs `npm ci` to install dependencies, then `npm run build` to generate the site
3. **Deploy**: Uses `peaceiris/actions-gh-pages` to push the built site to the `gh-pages` branch
4. **Serve**: GitHub Pages serves content from the `gh-pages` branch

### GitHub Pages Configuration

To view or modify the deployment settings:

1. Go to: **Repository Settings → Pages**
2. **Source**: "Deploy from a branch"
3. **Branch**: `gh-pages`
4. **Folder**: `/ (root)`

### Deployment Flow

```
Local (main branch) 
    → git push
        → GitHub Actions (builds 11ty)
            → gh-pages branch (built files)
                → GitHub Pages (serves to sumitkpandit.in)
```

## How to Make Changes

### Making Content Changes

1. **Edit source files**: Modify `.md` files in the root or `content/blog/` directory
2. **Test locally**: Run `npm start` to preview at `http://localhost:8080`
3. **Commit and push**: GitHub Actions will automatically build and deploy

Example:
```bash
# Edit a file
nano index.md

# Test locally
npm start

# Commit and push
git add .
git commit -m "Update homepage content"
git push origin main
```

### Making Design Changes

1. **Styles**: Edit `style.css`
2. **Templates**: Edit files in `_includes/layouts/` or `_includes/components/`
3. **Test locally**: Run `npm start` to preview changes
4. **Commit and push**

### Adding a New Blog Post

Create a new file in `content/blog/`:

```markdown
---
title: Your Post Title
description: A brief description for meta tags
date: 2026-03-21
layout: layouts/base.njk
---

Your content here...
```

## Acceptance Criteria for Changes

Before pushing any changes, verify the following:

### ✅ Build Success

```bash
npm run build
# Must complete without errors
```

### ✅ Local Preview Works

```bash
npm start
# Visit http://localhost:8080 and verify:
# - All pages load correctly
# - CSS styles are applied
# - Navigation works
# - No console errors
```

### ✅ Content Checklist

- [ ] Homepage loads with all sections
- [ ] About page loads
- [ ] Blog page loads and lists posts
- [ ] Resume page loads
- [ ] Navigation links work
- [ ] Mobile responsive (test at various widths)
- [ ] Custom fonts load (if any)
- [ ] Icons display correctly

### ✅ Design Checklist

- [ ] CSS variables are properly defined
- [ ] Colors match the design system
- [ ] Typography is consistent
- [ ] Spacing follows the design tokens
- [ ] Hover/active states work
- [ ] Responsive breakpoints function correctly

### ✅ Technical Checklist

- [ ] No broken links
- [ ] Images have alt text
- [ ] Meta descriptions are present
- [ ] Semantic HTML is used
- [ ] No console errors

## Troubleshooting

### Site Down or Broken After Push

1. **Check GitHub Actions**: Go to repository → Actions → Check for failed runs
2. **Check build errors**: Click on the failed workflow to see error details
3. **Revert if needed**: 
   ```bash
   git revert HEAD
   git push origin main
   ```

### CSS Not Loading

1. Ensure `style.css` is tracked in git: `git ls-files | grep style.css`
2. Verify `.nojekyll` exists to prevent Jekyll processing
3. Check the `_site/style.css` was generated

### Deployment Not Triggering

1. Verify workflow file exists: `.github/workflows/eleventy.yml`
2. Check that push was to `main` branch
3. Verify GitHub Actions is enabled in repository settings

### Custom Domain Issues

1. Verify `CNAME` file contains the correct domain
2. Check DNS settings at your domain provider
3. Ensure GitHub Pages source is set correctly

## Useful Commands

```bash
# Install dependencies
npm install

# Build the site
npm run build

# Start local server with live reload
npm start

# Clean the _site directory
rm -rf _site && npm run build
```

## Files to Never Modify Directly

- `_site/` directory (generated output - never edit directly)
- Any file in `gh-pages` branch (auto-generated by CI/CD)

## Contact

For questions about this site, refer to the repository or contact the maintainer.
