import { describe, it, expect } from 'vitest'
import { 
  validateBlogArticle,
  validatePortfolioItem,
  validateSkill,
  validatePersona,
  validateResumeEntry
} from '../../utils/validation/content-schemas'
import {
  ContentCrossReferenceValidator,
  type ValidationResult,
  type CrossReferenceContext
} from '../../utils/validation/cross-reference'
import type {
  BlogArticle,
  PortfolioItem,
  Skill,
  Persona,
  ResumeEntry
} from '../../utils/validation/content-schemas'

describe('Validation Aggregation', () => {
  describe('Individual Schema Validation', () => {
    describe('BlogArticle validation', () => {
      it('should validate complete blog article', () => {
        const validArticle: BlogArticle = {
          title: 'Test Article',
          slug: 'test-article',
          publishedAt: '2023-01-01T00:00:00Z',
          tags: ['javascript', 'tutorial'],
          relatedArticles: [],
          persona: 'developer',
          draft: false,
          createdAt: '2023-01-01T00:00:00Z',
          featured: false,
          excerpt: 'This is a test article',
          readingTime: 5,
          description: 'Test article description'
        }

        const result = validateBlogArticle(validArticle)
        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toBeDefined()
        }
      })

      it('should reject invalid blog article', () => {
        const invalidArticle = {
          title: '', // Invalid: empty title
          slug: 'invalid slug!', // Invalid: contains special characters
          publishedAt: 'invalid-date', // Invalid: not ISO date
          tags: 123, // Invalid: not array
          draft: 'yes' // Invalid: not boolean
        }

        const result = validateBlogArticle(invalidArticle)
        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.errors).toBeDefined()
          expect(result.errors.length).toBeGreaterThan(0)
        }
      })
    })

    describe('PortfolioItem validation', () => {
      it('should validate complete portfolio item', () => {
        const validItem: PortfolioItem = {
          title: 'Test Project',
          slug: 'test-project',
          description: 'A test project description',
          collection: 'web-applications',
          images: [
            {
              src: 'https://example.com/image.jpg',
              alt: 'Test image'
            }
          ],
          featured: true,
          createdAt: '2023-01-01T00:00:00Z',
          persona: 'developer',
          sortOrder: 1,
          draft: false,
          tags: []
        }

        const result = validatePortfolioItem(validItem)
        expect(result.success).toBe(true)
      })

      it('should reject invalid portfolio item', () => {
        const invalidItem = {
          title: '',
          slug: '',
          description: 123, // Invalid: not string
          collection: '', // Invalid: empty collection
          images: [] // Invalid: no images
        }

        const result = validatePortfolioItem(invalidItem)
        expect(result.success).toBe(false)
      })
    })

    describe('Skill validation', () => {
      it('should validate complete skill', () => {
        const validSkill: Skill = {
          key: 'typescript',
          name: 'TypeScript',
          category: 'language',
          proficiency: 'expert',
          yearsExperience: 5,
          featured: true,
          projects: ['portfolio-website'],
          description: 'Strongly typed JavaScript',
          persona: 'developer',
          title: 'TypeScript',
          draft: false,
          createdAt: '2023-01-01T00:00:00Z',
          tags: [],
          certifications: []
        }

        const result = validateSkill(validSkill)
        expect(result.success).toBe(true)
      })

      it('should reject invalid skill', () => {
        const invalidSkill = {
          key: '',
          name: '',
          category: 'invalid-category', // Invalid: not in enum
          proficiency: 'invalid-level', // Invalid: not in enum
          yearsExperience: -1 // Invalid: negative number
        }

        const result = validateSkill(invalidSkill)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Cross-Reference Validation using ContentCrossReferenceValidator', () => {
    it('should validate content with cross-references', () => {
      const mockContext: CrossReferenceContext = {
        personas: [
          {
            key: 'developer',
            name: 'Developer',
            title: 'Software Developer',
            bio: 'Technical content persona',
            primary: true,
            skills: ['typescript'],
            interests: ['programming'],
            draft: false,
            createdAt: '2023-01-01T00:00:00Z',
            tags: [],
            featured: false
          }
        ],
        skills: [
          {
            key: 'typescript',
            name: 'TypeScript',
            category: 'language',
            proficiency: 'expert',
            yearsExperience: 5,
            featured: true,
            projects: ['project-1'],
            persona: 'developer',
            title: 'TypeScript',
            draft: false,
            createdAt: '2023-01-01T00:00:00Z',
            tags: [],
            certifications: []
          }
        ],
        portfolioCollections: [
          {
            key: 'web-applications',
            name: 'Web Applications',
            description: 'Web development projects',
            itemCount: 1,
            sortOrder: 1,
            persona: 'developer',
            title: 'Web Applications',
            draft: false,
            createdAt: '2023-01-01T00:00:00Z',
            tags: [],
            featured: false
          }
        ],
        portfolioItems: [
          {
            slug: 'project-1',
            collection: 'web-applications',
            images: [
              {
                src: 'https://example.com/image.jpg',
                alt: 'Test image'
              }
            ],
            persona: 'developer',
            sortOrder: 1,
            title: 'Project 1',
            description: 'A test project',
            draft: false,
            createdAt: '2023-01-01T00:00:00Z',
            tags: [],
            featured: true
          }
        ],
        blogArticles: [
          {
            slug: 'article-1',
            relatedArticles: [],
            persona: 'developer',
            title: 'Article 1',
            draft: false,
            createdAt: '2023-01-01T00:00:00Z',
            tags: ['javascript'],
            featured: false,
            publishedAt: '2023-01-01T00:00:00Z'
          }
        ],
        resumeEntries: []
      }

      const result = ContentCrossReferenceValidator.validateAll(mockContext)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect missing persona references', () => {
      const mockContext: CrossReferenceContext = {
        personas: [], // Empty - no personas defined
        skills: [
          {
            key: 'typescript',
            name: 'TypeScript',
            category: 'language',
            proficiency: 'expert',
            yearsExperience: 5,
            featured: true,
            projects: [],
            persona: 'nonexistent-persona', // Invalid persona reference
            title: 'TypeScript',
            draft: false,
            createdAt: '2023-01-01T00:00:00Z',
            tags: [],
            certifications: []
          }
        ],
        portfolioCollections: [],
        portfolioItems: [],
        blogArticles: [],
        resumeEntries: []
      }

      const result = ContentCrossReferenceValidator.validateAll(mockContext)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })

  describe('Validation Error Aggregation', () => {
    it('should aggregate multiple validation errors', () => {
      const validationResults: Array<{ success: boolean; errors?: any[] }> = []

      // Simulate validation of multiple invalid items
      const invalidArticle = validateBlogArticle({
        title: '',
        slug: 'invalid slug!',
        publishedAt: 'invalid-date'
      })

      const invalidSkill = validateSkill({
        key: '',
        name: '',
        category: 'invalid-category',
        proficiency: 'invalid-level'
      })

      validationResults.push(invalidArticle)
      validationResults.push(invalidSkill)

      const failedValidations = validationResults.filter(result => !result.success)
      expect(failedValidations).toHaveLength(2)
      
      // Each failed validation should have errors
      failedValidations.forEach(validation => {
        if (!validation.success && 'errors' in validation) {
          expect(validation.errors?.length).toBeGreaterThan(0)
        }
      })
    })

    it('should categorize validation results by success status', () => {
      const validationResults = [
        { success: true, valid: true },
        { success: false, valid: false, errors: ['Error 1'] },
        { success: true, valid: true },
        { success: false, valid: false, errors: ['Error 2', 'Error 3'] }
      ]

      const successCount = validationResults.filter(r => r.success).length
      const failureCount = validationResults.filter(r => !r.success).length
      const totalErrors = validationResults
        .filter(r => !r.success && 'errors' in r)
        .reduce((sum, r) => sum + (r.errors?.length || 0), 0)

      expect(successCount).toBe(2)
      expect(failureCount).toBe(2)
      expect(totalErrors).toBe(3)
    })
  })

  describe('Validation Result Statistics', () => {
    it('should calculate validation statistics', () => {
      const mockResults: ValidationResult[] = [
        { valid: true, errors: [], warnings: [] },
        { valid: true, errors: [], warnings: ['Warning 1'] },
        { valid: false, errors: ['Error 1'], warnings: [] },
        { valid: false, errors: ['Error 2', 'Error 3'], warnings: ['Warning 2'] }
      ]

      const stats = calculateValidationStatistics(mockResults)

      expect(stats.total).toBe(4)
      expect(stats.valid).toBe(2)
      expect(stats.invalid).toBe(2)
      expect(stats.successRate).toBe(0.5)
      expect(stats.totalErrors).toBe(3)
      expect(stats.totalWarnings).toBe(2)
    })

    it('should handle empty validation results', () => {
      const stats = calculateValidationStatistics([])

      expect(stats.total).toBe(0)
      expect(stats.valid).toBe(0)
      expect(stats.invalid).toBe(0)
      expect(stats.successRate).toBe(0)
      expect(stats.totalErrors).toBe(0)
      expect(stats.totalWarnings).toBe(0)
    })
  })
})

// Helper functions for validation aggregation
function calculateValidationStatistics(results: ValidationResult[]) {
  const valid = results.filter(r => r.valid).length
  const invalid = results.filter(r => !r.valid).length
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0)

  return {
    total: results.length,
    valid,
    invalid,
    successRate: results.length > 0 ? valid / results.length : 0,
    totalErrors,
    totalWarnings
  }
}