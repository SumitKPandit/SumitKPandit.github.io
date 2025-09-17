import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  PersonaSchema,
  BlogArticleSchema,
  PortfolioCollectionSchema,
  PortfolioItemSchema,
  ResumeEntrySchema,
  SkillSchema,
  ContactSubmissionSchema,
  validatePersona,
  validateBlogArticle,
  validatePortfolioCollection,
  validatePortfolioItem,
  validateResumeEntry,
  validateSkill,
  validateContactSubmission,
  isValidSlug,
  isValidEmail,
  isValidUrl,
  normalizeSlug,
  sanitizeHtml
} from '../../utils/validation/content-schemas'

describe('Content Schemas Validation', () => {
  describe('PersonaSchema', () => {
    it('should validate a complete persona', () => {
      const validPersona = {
        id: 'sumit-developer',
        name: 'Sumit Kumar Pandit',
        tagline: 'Full Stack Developer',
        bio: 'Experienced developer passionate about web technologies.',
        email: 'sumit@example.com',
        avatar: '/images/sumit-avatar.jpg',
        socialLinks: {
          github: 'https://github.com/sumitkp',
          linkedin: 'https://linkedin.com/in/sumitkp',
          twitter: 'https://twitter.com/sumitkp'
        },
        skills: ['JavaScript', 'TypeScript', 'Vue.js'],
        theme: {
          primaryColor: '#3b82f6',
          accentColor: '#06b6d4'
        },
        settings: {
          showResume: true,
          showPortfolio: true,
          showBlog: true,
          contactFormEnabled: true
        }
      }

      const result = PersonaSchema.safeParse(validPersona)
      expect(result.success).toBe(true)
    })

    it('should require essential fields', () => {
      const invalidPersona = {
        name: 'Test Person'
        // Missing required fields
      }

      const result = PersonaSchema.safeParse(invalidPersona)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toHaveLength(6) // id, tagline, bio, email, avatar, socialLinks
      }
    })

    it('should validate email format', () => {
      const invalidPersona = {
        id: 'test',
        name: 'Test Person',
        tagline: 'Developer',
        bio: 'Bio text',
        email: 'invalid-email',
        avatar: '/avatar.jpg',
        socialLinks: {}
      }

      const result = PersonaSchema.safeParse(invalidPersona)
      expect(result.success).toBe(false)
    })
  })

  describe('BlogArticleSchema', () => {
    it('should validate a complete blog article', () => {
      const validArticle = {
        title: 'Getting Started with TypeScript',
        slug: 'getting-started-typescript',
        excerpt: 'Learn the basics of TypeScript...',
        content: '# Introduction\n\nTypeScript is amazing...',
        author: 'sumit-developer',
        publishedAt: '2023-12-01T10:00:00Z',
        tags: ['TypeScript', 'JavaScript', 'Programming'],
        series: 'typescript-fundamentals',
        readingTime: 5,
        featured: true,
        draft: false
      }

      const result = BlogArticleSchema.safeParse(validArticle)
      expect(result.success).toBe(true)
    })

    it('should require essential fields', () => {
      const invalidArticle = {
        title: 'Test Article'
        // Missing required fields
      }

      const result = BlogArticleSchema.safeParse(invalidArticle)
      expect(result.success).toBe(false)
    })

    it('should validate slug format', () => {
      const invalidArticle = {
        title: 'Test Article',
        slug: 'Invalid Slug!',
        excerpt: 'Test excerpt',
        content: 'Test content',
        author: 'test-author',
        publishedAt: '2023-12-01T10:00:00Z'
      }

      const result = BlogArticleSchema.safeParse(invalidArticle)
      expect(result.success).toBe(false)
    })
  })

  describe('PortfolioCollectionSchema', () => {
    it('should validate a portfolio collection', () => {
      const validCollection = {
        id: 'web-development',
        title: 'Web Development Projects',
        description: 'Full-stack web applications I have built',
        slug: 'web-development',
        coverImage: '/images/web-dev-cover.jpg',
        items: ['project-1', 'project-2'],
        tags: ['Web Development', 'Full Stack'],
        featured: true,
        sortOrder: 1
      }

      const result = PortfolioCollectionSchema.safeParse(validCollection)
      expect(result.success).toBe(true)
    })
  })

  describe('PortfolioItemSchema', () => {
    it('should validate a portfolio item', () => {
      const validItem = {
        id: 'ecommerce-app',
        title: 'E-commerce Application',
        description: 'A full-featured online store',
        slug: 'ecommerce-app',
        images: ['/images/ecommerce-1.jpg', '/images/ecommerce-2.jpg'],
        technologies: ['Vue.js', 'Node.js', 'MongoDB'],
        links: {
          live: 'https://ecommerce-demo.example.com',
          github: 'https://github.com/user/ecommerce-app'
        },
        completedAt: '2023-11-15T00:00:00Z',
        featured: true,
        collection: 'web-development'
      }

      const result = PortfolioItemSchema.safeParse(validItem)
      expect(result.success).toBe(true)
    })
  })

  describe('ResumeEntrySchema', () => {
    it('should validate a resume entry', () => {
      const validEntry = {
        id: 'senior-developer-acme',
        type: 'experience' as const,
        title: 'Senior Developer',
        organization: 'Acme Corporation',
        description: 'Led development of web applications',
        startDate: '2022-01-01T00:00:00Z',
        endDate: '2023-12-01T00:00:00Z',
        skills: ['JavaScript', 'Vue.js', 'Node.js'],
        achievements: ['Improved performance by 40%', 'Led team of 5 developers'],
        location: 'San Francisco, CA',
        featured: true
      }

      const result = ResumeEntrySchema.safeParse(validEntry)
      expect(result.success).toBe(true)
    })

    it('should validate different entry types', () => {
      const educationEntry = {
        id: 'cs-degree',
        type: 'education' as const,
        title: 'Bachelor of Computer Science',
        organization: 'University of Technology',
        startDate: '2018-09-01T00:00:00Z',
        endDate: '2022-05-15T00:00:00Z'
      }

      const result = ResumeEntrySchema.safeParse(educationEntry)
      expect(result.success).toBe(true)
    })
  })

  describe('SkillSchema', () => {
    it('should validate a skill', () => {
      const validSkill = {
        id: 'typescript',
        name: 'TypeScript',
        category: 'Programming Languages',
        level: 'expert' as const,
        years: 3,
        description: 'Strongly typed JavaScript superset',
        certifications: ['TypeScript Professional Certification'],
        projects: ['ecommerce-app', 'blog-platform'],
        featured: true
      }

      const result = SkillSchema.safeParse(validSkill)
      expect(result.success).toBe(true)
    })

    it('should validate skill levels', () => {
      const skillLevels = ['beginner', 'intermediate', 'advanced', 'expert']
      
      skillLevels.forEach(level => {
        const skill = {
          id: `test-${level}`,
          name: `Test ${level}`,
          category: 'Test Category',
          level: level as any
        }

        const result = SkillSchema.safeParse(skill)
        expect(result.success).toBe(true)
      })
    })
  })

  describe('ContactSubmissionSchema', () => {
    it('should validate a contact submission', () => {
      const validSubmission = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Project Inquiry',
        message: 'I would like to discuss a potential project.',
        honeypot: '',
        timestamp: Date.now(),
        userAgent: 'Mozilla/5.0...'
      }

      const result = ContactSubmissionSchema.safeParse(validSubmission)
      expect(result.success).toBe(true)
    })

    it('should reject spam (honeypot field)', () => {
      const spamSubmission = {
        name: 'Spam Bot',
        email: 'spam@example.com',
        subject: 'Spam',
        message: 'This is spam',
        honeypot: 'bot-filled-this',
        timestamp: Date.now()
      }

      const result = ContactSubmissionSchema.safeParse(spamSubmission)
      expect(result.success).toBe(false)
    })
  })

  describe('Validation Helper Functions', () => {
    describe('validatePersona', () => {
      it('should return validation result for persona', () => {
        const validPersona = {
          id: 'test',
          name: 'Test Person',
          tagline: 'Developer',
          bio: 'Bio text',
          email: 'test@example.com',
          avatar: '/avatar.jpg',
          socialLinks: {}
        }

        const result = validatePersona(validPersona)
        expect(result.success).toBe(true)
        expect(result.data).toEqual(expect.objectContaining(validPersona))
      })

      it('should return errors for invalid persona', () => {
        const invalidPersona = { name: 'Test' }

        const result = validatePersona(invalidPersona)
        expect(result.success).toBe(false)
        expect(result.errors).toBeDefined()
        expect(result.errors!.length).toBeGreaterThan(0)
      })
    })

    describe('validateBlogArticle', () => {
      it('should validate blog article', () => {
        const validArticle = {
          title: 'Test Article',
          slug: 'test-article',
          excerpt: 'Test excerpt',
          content: 'Test content',
          author: 'test-author',
          publishedAt: '2023-12-01T10:00:00Z'
        }

        const result = validateBlogArticle(validArticle)
        expect(result.success).toBe(true)
      })
    })

    describe('isValidSlug', () => {
      it('should validate correct slug formats', () => {
        expect(isValidSlug('valid-slug')).toBe(true)
        expect(isValidSlug('valid-slug-123')).toBe(true)
        expect(isValidSlug('123-valid-slug')).toBe(true)
      })

      it('should reject invalid slug formats', () => {
        expect(isValidSlug('Invalid Slug')).toBe(false)
        expect(isValidSlug('invalid_slug')).toBe(false)
        expect(isValidSlug('invalid-slug!')).toBe(false)
        expect(isValidSlug('')).toBe(false)
      })
    })

    describe('isValidEmail', () => {
      it('should validate correct email formats', () => {
        expect(isValidEmail('test@example.com')).toBe(true)
        expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
        expect(isValidEmail('user+tag@example.org')).toBe(true)
      })

      it('should reject invalid email formats', () => {
        expect(isValidEmail('invalid-email')).toBe(false)
        expect(isValidEmail('@example.com')).toBe(false)
        expect(isValidEmail('test@')).toBe(false)
        expect(isValidEmail('')).toBe(false)
      })
    })

    describe('isValidUrl', () => {
      it('should validate correct URL formats', () => {
        expect(isValidUrl('https://example.com')).toBe(true)
        expect(isValidUrl('http://example.com/path')).toBe(true)
        expect(isValidUrl('https://subdomain.example.com/path?query=value')).toBe(true)
      })

      it('should reject invalid URL formats', () => {
        expect(isValidUrl('not-a-url')).toBe(false)
        expect(isValidUrl('example.com')).toBe(false)
        expect(isValidUrl('')).toBe(false)
      })
    })

    describe('normalizeSlug', () => {
      it('should normalize strings to valid slugs', () => {
        expect(normalizeSlug('Hello World')).toBe('hello-world')
        expect(normalizeSlug('Getting Started with TypeScript!')).toBe('getting-started-with-typescript')
        expect(normalizeSlug('Multiple   Spaces')).toBe('multiple-spaces')
        expect(normalizeSlug('Special@Characters#Here')).toBe('specialcharactershere')
      })

      it('should handle edge cases', () => {
        expect(normalizeSlug('')).toBe('')
        expect(normalizeSlug('   ')).toBe('')
        expect(normalizeSlug('123')).toBe('123')
        expect(normalizeSlug('Already-Valid-Slug')).toBe('already-valid-slug')
      })
    })

    describe('sanitizeHtml', () => {
      it('should remove script tags', () => {
        const maliciousHtml = '<p>Safe content</p><script>alert("xss")</script>'
        const sanitized = sanitizeHtml(maliciousHtml)
        expect(sanitized).toBe('<p>Safe content</p>')
      })

      it('should allow safe HTML tags', () => {
        const safeHtml = '<p><strong>Bold</strong> and <em>italic</em> text</p>'
        const sanitized = sanitizeHtml(safeHtml)
        expect(sanitized).toBe(safeHtml)
      })

      it('should remove dangerous attributes', () => {
        const dangerousHtml = '<p onclick="alert(\'xss\')">Click me</p>'
        const sanitized = sanitizeHtml(dangerousHtml)
        expect(sanitized).toBe('<p>Click me</p>')
      })
    })
  })
})