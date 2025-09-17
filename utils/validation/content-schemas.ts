import { z } from 'zod'

// Base metadata schema used across all content types
const BaseMetadataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  draft: z.boolean().default(false),
  createdAt: z.string().datetime('Invalid created date format'),
  updatedAt: z.string().datetime('Invalid updated date format').optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false)
})

// Persona schema for multi-persona content architecture
export const PersonaSchema = z.object({
  key: z.string().min(1, 'Persona key is required'),
  name: z.string().min(1, 'Persona name is required'),
  title: z.string().min(1, 'Persona title is required'),
  bio: z.string().min(1, 'Persona bio is required'),
  avatar: z.string().url('Invalid avatar URL').optional(),
  primary: z.boolean().default(false),
  social: z.object({
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    website: z.string().url().optional(),
    email: z.string().email().optional()
  }).optional(),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([])
}).merge(BaseMetadataSchema)

// Blog article schema
export const BlogArticleSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().optional(),
  readingTime: z.number().positive('Reading time must be positive').optional(),
  heroImage: z.object({
    src: z.string().url('Invalid hero image URL'),
    alt: z.string().min(1, 'Hero image alt text is required'),
    caption: z.string().optional()
  }).optional(),
  category: z.string().optional(),
  series: z.object({
    name: z.string(),
    part: z.number().positive(),
    total: z.number().positive()
  }).optional(),
  relatedArticles: z.array(z.string()).default([]),
  persona: z.string().min(1, 'Persona assignment required'),
  publishedAt: z.string().datetime('Invalid published date format').optional()
}).merge(BaseMetadataSchema)

// Portfolio collection schema
export const PortfolioCollectionSchema = z.object({
  key: z.string().min(1, 'Collection key is required'),
  name: z.string().min(1, 'Collection name is required'),
  coverImage: z.object({
    src: z.string().url('Invalid cover image URL'),
    alt: z.string().min(1, 'Cover image alt text is required')
  }).optional(),
  itemCount: z.number().nonnegative('Item count must be non-negative').default(0),
  sortOrder: z.number().default(0),
  persona: z.string().min(1, 'Persona assignment required')
}).merge(BaseMetadataSchema)

// Portfolio item schema
export const PortfolioItemSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  collection: z.string().min(1, 'Collection reference required'),
  images: z.array(z.object({
    src: z.string().url('Invalid image URL'),
    alt: z.string().min(1, 'Image alt text is required'),
    caption: z.string().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional()
  })).min(1, 'At least one image is required'),
  equipment: z.object({
    camera: z.string().optional(),
    lens: z.string().optional(),
    settings: z.object({
      aperture: z.string().optional(),
      shutter: z.string().optional(),
      iso: z.string().optional(),
      focal: z.string().optional()
    }).optional()
  }).optional(),
  location: z.object({
    name: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).optional()
  }).optional(),
  persona: z.string().min(1, 'Persona assignment required'),
  sortOrder: z.number().default(0)
}).merge(BaseMetadataSchema)

// Resume entry schema
export const ResumeEntrySchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position title is required'),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format').optional(),
  current: z.boolean().default(false),
  location: z.string().optional(),
  remote: z.boolean().default(false),
  type: z.enum(['employment', 'contract', 'freelance', 'volunteer', 'internship']).default('employment'),
  skills: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  teamSize: z.number().positive().optional(),
  persona: z.string().min(1, 'Persona assignment required')
}).merge(BaseMetadataSchema)
.refine((data: any) => {
  // Validate date logic: if not current, must have end date
  if (!data.current && !data.endDate) {
    return false
  }
  // Validate date range: start date must be before end date
  if (data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
    return false
  }
  return true
}, {
  message: 'Invalid date range: start date must be before end date, and non-current positions must have end date'
})

// Skill definition schema
export const SkillSchema = z.object({
  key: z.string().min(1, 'Skill key is required'),
  name: z.string().min(1, 'Skill name is required'),
  category: z.enum(['language', 'framework', 'tool', 'methodology', 'soft-skill']),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'),
  yearsExperience: z.number().nonnegative('Years experience must be non-negative').optional(),
  certifications: z.array(z.object({
    name: z.string(),
    issuer: z.string(),
    date: z.string().datetime(),
    url: z.string().url().optional()
  })).default([]),
  projects: z.array(z.string()).default([]), // References to portfolio items or resume entries
  icon: z.string().optional(), // Icon name or URL
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  persona: z.string().min(1, 'Persona assignment required')
}).merge(BaseMetadataSchema)

// Contact form submission schema
export const ContactSubmissionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message too long'),
  persona: z.string().optional(), // Which persona they're contacting
  honeypot: z.string().max(0, 'Bot detected').optional(), // Anti-spam honeypot field
  timestamp: z.string().datetime().optional(),
  userAgent: z.string().optional()
})

// Export all schemas as a collection for easy access
// Validation helper functions
export function validatePersona(data: unknown): { success: true; data: Persona } | { success: false; errors: Array<{ field: string; message: string }> } {
  const result = PersonaSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    errors: result.error.issues.map(issue => ({
      field: issue.path.join('.') || 'root',
      message: issue.message
    }))
  }
}

export function validateBlogArticle(data: unknown): { success: true; data: BlogArticle } | { success: false; errors: Array<{ field: string; message: string }> } {
  const result = BlogArticleSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    errors: result.error.issues.map(issue => ({
      field: issue.path.join('.') || 'root',
      message: issue.message
    }))
  }
}

export function validatePortfolioCollection(data: unknown): { success: true; data: PortfolioCollection } | { success: false; errors: Array<{ field: string; message: string }> } {
  const result = PortfolioCollectionSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    errors: result.error.issues.map(issue => ({
      field: issue.path.join('.') || 'root',
      message: issue.message
    }))
  }
}

export function validatePortfolioItem(data: unknown): { success: true; data: PortfolioItem } | { success: false; errors: Array<{ field: string; message: string }> } {
  const result = PortfolioItemSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    errors: result.error.issues.map(issue => ({
      field: issue.path.join('.') || 'root',
      message: issue.message
    }))
  }
}

export function validateResumeEntry(data: unknown): { success: true; data: ResumeEntry } | { success: false; errors: Array<{ field: string; message: string }> } {
  const result = ResumeEntrySchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    errors: result.error.issues.map(issue => ({
      field: issue.path.join('.') || 'root',
      message: issue.message
    }))
  }
}

export function validateSkill(data: unknown): { success: true; data: Skill } | { success: false; errors: Array<{ field: string; message: string }> } {
  const result = SkillSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    errors: result.error.issues.map(issue => ({
      field: issue.path.join('.') || 'root',
      message: issue.message
    }))
  }
}

export function validateContactSubmission(data: unknown): { success: true; data: ContactSubmission } | { success: false; errors: Array<{ field: string; message: string }> } {
  const result = ContactSubmissionSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    errors: result.error.issues.map(issue => ({
      field: issue.path.join('.') || 'root',
      message: issue.message
    }))
  }
}

// Utility functions
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function normalizeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - remove script tags and dangerous attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\s*on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
}



// Type exports for TypeScript usage
export type Persona = z.infer<typeof PersonaSchema>
export type BlogArticle = z.infer<typeof BlogArticleSchema>
export type PortfolioCollection = z.infer<typeof PortfolioCollectionSchema>
export type PortfolioItem = z.infer<typeof PortfolioItemSchema>
export type ResumeEntry = z.infer<typeof ResumeEntrySchema>
export type Skill = z.infer<typeof SkillSchema>
export type ContactSubmission = z.infer<typeof ContactSubmissionSchema>

