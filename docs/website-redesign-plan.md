# Website Redesign Plan: From Software Engineer to Spiritual Teacher

## Executive Summary

Transform the personal website from a software engineer portfolio to a spiritual teacher platform focused on Vedanta, Indian Spiritual Philosophies, Yoga, and Meditation teaching.

---

## 1. Brand Positioning

### Current State
- Role: Senior Software Engineer at Onclusive
- Focus: Full-stack development, technical leadership

### Target State
- Role: Spiritual Teacher, Guide on the path of Self-Realization
- Name: Sumit Kumar Pandit
- Focus: Teaching Vedanta, Yoga, Meditation
- Tagline options:
  - "Guiding seekers on the path of Self-Realization"
  - "Exploring ancient wisdom for modern life"
  - "Discover the truth within"

### Key Messages
1. **Primary**: Guide seekers through Vedanta, Yoga, and Meditation
2. **Secondary**: Bridge ancient Indian wisdom with contemporary life
3. **Credibility**: 11+ years professional journey + Sadhanapada at Isha Foundation (2022)

---

## 2. Social Links (Priority Order)

1. **YouTube**: https://www.youtube.com/@sumitkpandityt
2. **Instagram**: https://www.instagram.com/sumitkpandit/
3. **X (Twitter)**: https://x.com/sumitkpandit

### Integration in Website
- Footer: Social icons in priority order
- About page: Link to YouTube for video content
- Meditation page: Link to YouTube for guided sessions
- Contact page: All social links

---

## 3. Site Structure

### Proposed Pages

#### Homepage (`/`)
- Hero section with name and tagline
- Brief introduction to who you are and what you teach
- Featured areas: Vedanta, Yoga, Meditation
- Weekly meditation reminder (Sunday 6 PM IST)
- Call to action: Begin your journey / Book session

#### About (`/about`)
- Your spiritual journey
- Mention: "By day, I work as a software engineer. By dharma, I teach."
- Link to /resume for professional background
- Teacher's lineage/influences (Isha Foundation, Sadhanapada)
- Why you teach / dharma

#### Resume (`/resume`)
- **Keep existing content** (current page)
- Software engineering background
- Linked from About page bio section

#### Teachings / Vedanta (`/vedanta`)
- What is Vedanta
- Topics you teach (Self-Inquiry, Non-duality, etc.)
- Articles (future)

#### Yoga (`/yoga`)
- What is Yoga
- Types you teach (Raja, Karma, Bhakti, Jnana)
- Classes/workshops offered

#### Meditation (`/meditation`)
- What is Meditation
- Techniques taught
- Weekly Live Group Meditation: Sunday 6 PM IST
- Link to YouTube for recorded sessions
- Guided sessions (future)

#### Blog (`/blog`)
- Articles on spiritual topics
- Personal reflections
- Q&A

#### Book Session (`/book`)
- One-on-one session booking
- Options: Consultation call, Guided meditation, Vedanta discussion
- Calendar integration or contact form

#### Contact (`/contact`)
- General inquiry form
- Workshop/class registration
- Social media links

---

## 4. Content Strategy

### About Page Content
```
By day, I work as a software engineer. By dharma, I teach.

For 11 years I worked in the corporate world as a software engineer...
[Link to /resume for full career details]

My Spiritual Journey
------------------
In June 2022, I started my journey as a #sadhanapada at Isha Yoga Center - 
a 7-month residential program that changed my life completely.

This transformative experience deepened my practice and understanding of 
Yoga, Vedanta, and Meditation. Now I share these timeless teachings 
to help seekers discover the truth within.

What I Teach
------------
- Vedanta (Philosophy of non-duality, Self-Inquiry)
- Raja Yoga (Royal path of meditation)
- Meditation (Techniques for self-realization)

Weekly: Live Group Meditation - Sundays at 6 PM IST
```

### Weekly Meditation Section (site-wide)
- **When**: Every Sunday at 6 PM IST
- **What**: Guided meditation session
- **Platform**: Online (Zoom/Google Meet - specify)
- **CTA**: Join / Learn more

### One-on-One Sessions
| Session Type | Duration | Description |
|--------------|----------|-------------|
| Discovery Call | 30 min | Initial consultation, understand your needs |
| Guided Meditation | 45 min | One-on-one meditation guidance |
| Vedanta Discussion | 60 min | Deep dive into philosophical topics |
| Complete Session | 90 min | Full experience combining meditation + discussion |

---

## 5. Design System

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-color` | #faf8f5 | Warm cream (contemplative) |
| `--text-color` | #2d2d2d | Soft black |
| `--accent-color` | #8b4513 | Saffron/ochre (sacred) |
| `--muted-color` | #5c5c5c | Secondary text |
| `--highlight-color` | #c9a227 | Muted gold (special elements) |
| `--calm-color` | #2f4f4f | Dark slate (depth) |

### Typography
- Headings: Serif (Merriweather or Playfair Display)
- Body: Serif for readability (Merriweather or Georgia)
- Accents: Sanskrit terms in italic

### Visual Elements
- Subtle lotus motifs (optional, minimal)
- Generous whitespace for contemplation
- Slower, deliberate animations
- Nature-inspired imagery (optional)

### Layout
- Single column focus (contemplative)
- More vertical breathing room
- Centered, focused content areas

---

## 6. Technical Architecture

### File Structure
```
/
├── _includes/
│   ├── layouts/
│   │   ├── base.njk
│   │   ├── page.njk
│   │   └── post.njk
│   └── components/
│       ├── header.njk
│       ├── footer.njk
│       └── nav.njk
├── _data/
│   └── navigation.json
├── content/
│   ├── index.md
│   ├── about.md
│   ├── resume.md        (current content)
│   ├── vedanta.md
│   ├── yoga.md
│   ├── meditation.md
│   ├── book.md
│   ├── contact.md
│   └── blog/
│       ├── post-1.md
│       └── post-2.md
├── styles/
│   └── main.css
├── .eleventy.js
└── package.json
```

### Current Files to Preserve
- `index.html` → move to `resume.md` or `/resume` page
- `style.css` → update with new design tokens

---

## 7. Content Format Strategy

### Written Content
- Blog articles on Vedanta, Yoga, Meditation
- Newsletter signup
- Downloadable guides/meditations

### Video Content
- **YouTube**: https://www.youtube.com/@sumitkpandityt
- Embedded guided meditations
- Video blog / satsangs

### Social Media
- **Instagram**: https://www.instagram.com/sumitkpandit/
- **X**: https://x.com/sumitkpandit

### Platform Suggestions
- YouTube for public videos
- Zoom/Google Meet for live sessions

---

## 8. Phased Implementation

### Phase 1: Foundation (Week 1)
- [ ] Create About page with spiritual journey + Sadhanapada + link to resume
- [ ] Create /resume page with current content
- [ ] Update homepage for spiritual focus
- [ ] Add navigation with social links
- [ ] Update design tokens in CSS

### Phase 2: Core Pages (Week 2)
- [ ] Vedanta page
- [ ] Yoga page
- [ ] Meditation page (include Sunday 6 PM IST)

### Phase 3: Booking & Contact (Week 3)
- [ ] Book page with one-on-one session options
- [ ] Contact form update
- [ ] Weekly meditation CTA on all pages

### Phase 4: Blog & Media (Week 4)
- [ ] Blog section
- [ ] YouTube integration
- [ ] Social media links in footer

### Phase 5: Polish (Week 5)
- [ ] Mobile responsiveness
- [ ] SEO optimization
- [ ] Performance
- [ ] Testing

---

## 9. Implementation Notes

### Resume Page Integration
- URL: `/resume`
- Content: Current homepage content (software engineering)
- Link from About: "I work as a software engineer. [View my professional background →](/resume)"

### Sadhanapada Mention
Include in About page prominently:
- "Sadhanapada at Isha Yoga Center (June 2022)"
- This 7-month residential program is a key credential

### Sunday Meditation CTA
Include on all pages:
```
🧘 Weekly Live Group Meditation
Sundays at 6 PM IST
[Join Now]
```

### One-on-One Booking Flow
1. User visits /book
2. Selects session type
3. Picks available time slot
4. Confirms contact details
5. Receives confirmation

Options for booking:
- Simple: Contact form → manual scheduling
- Intermediate: Cal.com or Calendly embed
- Advanced: Custom booking system

---

## 10. Next Steps

1. Review and approve updated plan
2. Begin Phase 1 implementation
   - Create About page with Sadhanapada journey
   - Create Resume page
   - Update homepage
   - Add navigation with social links

---

*Plan updated: March 2025*
