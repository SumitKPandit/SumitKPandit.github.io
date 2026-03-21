# Design System

## Overview

This design system defines the visual language for sumitkpandit.github.io. It follows a classic, elegant aesthetic with serif typography and warm accents.

---

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-color` | `#fdfdfc` | Page background |
| `--text-color` | `#2c2c2c` | Primary text |
| `--accent-color` | `#a0522d` | Links, list bullets, interactive elements |
| `--muted-color` | `#6b6b6b` | Secondary text, labels |
| `--border-color` | `#d4d4d4` | Form inputs, dividers |

---

## Typography

### Font Family

| Element | Font | Fallback |
|---------|------|----------|
| Body | Georgia | Times New Roman, serif |

### Font Sizes

| Token | Value | Usage |
|-------|-------|-------|
| `h1` | 2.2rem | Page title |
| `h2` | 0.85rem | Section headers (uppercase) |
| Body | 1.05rem | Paragraphs, lists |
| Label | 0.9rem | Form labels |
| Footer | 0.85rem | Footer text |

### Font Styles

| Element | Weight | Style | Letter Spacing |
|---------|--------|-------|----------------|
| h1 | 400 | Italic | 0.02em |
| h2 | 400 | Normal | 0.15em |
| Body | 400 | Normal | - |
| Footer | 400 | Italic | - |

---

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--spacing-sm` | 8px | Small gaps |
| `--spacing-md` | 16px | Default gaps |
| `--spacing-lg` | 24px | List item spacing |
| `--spacing-xl` | 48px | Section spacing |
| `--spacing-2xl` | 64px | Major section margins |

### Page Layout

- Max content width: 640px
- Horizontal padding: 32px (24px on mobile)
- Vertical padding: 80px (48px on mobile)

---

## Components

### Header

- Centered alignment
- 64px bottom margin
- Title in italic serif
- Subtitle in muted color

### Section

- 48px bottom margin
- Uppercase h2 with letter spacing
- Border-bottom: 1px solid border-color

### List Items

- 16px bottom margin
- 24px left padding for bullets
- Custom bullet: `·` (middle dot) in accent color
- Links with underline on hover

### Form Elements

- Input/textarea: 100% width, 12px padding
- Border: 1px solid border-color
- Focus state: accent-color border
- Button: dark background, light text, no border

### Footer

- Centered text
- 64px top margin
- 24px top border
- Muted color, italic

---

## Responsive Breakpoints

| Breakpoint | Width | Adjustments |
|------------|-------|-------------|
| Mobile | < 600px | Reduced padding, smaller h1 |

---

## Usage Guidelines

### Links

- Color: accent-color
- Default: no underline
- Hover: border-bottom appears (1px solid)

### Buttons

- Background: text-color
- Text: bg-color
- Padding: 12px 24px
- Hover: 80% opacity

### Form Inputs

- Background: white
- Border: 1px solid border-color
- Focus: border-color changes to accent

---

## Accessibility

- Minimum contrast ratio: 4.5:1 (text to background)
- Focus states visible on all interactive elements
- Semantic HTML structure (header, main, section, footer)

---

## File Structure

```
/
├── style.css          # Main stylesheet (source of truth)
├── index.html         # Website pages
└── docs/
    └── design-system.md  # This document
```

---

*Last updated: March 2025*
