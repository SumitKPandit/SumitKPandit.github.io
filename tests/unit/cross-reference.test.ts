import { describe, it, expect } from 'vitest'
import {
  ContentCrossReferenceValidator
} from '../../utils/validation/cross-reference'

describe('Cross-Reference Validation', () => {
  // Mock content data for testing
  const mockContext = {
    personas: [
      { id: 'developer', name: 'Developer' },
      { id: 'designer', name: 'Designer' }
    ],
    skills: [
      { id: 'typescript', name: 'TypeScript' },
      { id: 'vue-js', name: 'Vue.js' },
      { id: 'figma', name: 'Figma' }
    ],
    portfolioCollections: [
      { id: 'web-dev', title: 'Web Development' },
      { id: 'design', title: 'Design' }
    ],
    portfolioItems: [
      { id: 'app1', title: 'App 1', collection: 'web-dev', technologies: ['typescript'] },
      { id: 'app2', title: 'App 2', collection: 'design', technologies: ['figma'] }
    ],
    blogArticles: [
      { slug: 'article1', persona: 'developer', relatedSkills: ['typescript'], relatedProjects: ['app1'] },
      { slug: 'article2', persona: 'designer', relatedSkills: ['figma'], relatedProjects: ['app2'] }
    ],
    resumeEntries: [
      { id: 'job1', type: 'employment', skills: ['typescript'], projects: ['app1'] },
      { id: 'job2', type: 'employment', skills: ['figma'], projects: ['app2'] }
    ]
  }

  describe('ContentCrossReferenceValidator', () => {
    it('should validate all content when references are valid', () => {
      const validator = new ContentCrossReferenceValidator(mockContext)
      const result = validator.validateAllContent()
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid references', () => {
      const invalidContext = {
        ...mockContext,
        blogArticles: [
          {
            slug: 'invalid-article',
            persona: 'non-existent-persona',
            relatedSkills: ['non-existent-skill'],
            relatedProjects: ['non-existent-project']
          }
        ]
      }

      const validator = new ContentCrossReferenceValidator(invalidContext)
      const result = validator.validateAllContent()
      
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should provide content statistics', () => {
      const validator = new ContentCrossReferenceValidator(mockContext)
      const stats = validator.getContentStatistics()

      expect(stats.totalPersonas).toBe(2)
      expect(stats.totalSkills).toBe(3)
      expect(stats.totalPortfolioItems).toBe(2)
      expect(stats.totalPortfolioCollections).toBe(2)
      expect(stats.totalBlogArticles).toBe(2)
      expect(stats.totalResumeEntries).toBe(2)
    })

    it('should find orphaned content', () => {
      const contextWithOrphans = {
        ...mockContext,
        skills: [
          ...mockContext.skills,
          { id: 'orphaned-skill', name: 'Orphaned Skill' }
        ]
      }

      const validator = new ContentCrossReferenceValidator(contextWithOrphans)
      const orphans = validator.findOrphanedContent()
      
      expect(orphans.skills).toContain('orphaned-skill')
    })

    it('should generate content dependencies', () => {
      const validator = new ContentCrossReferenceValidator(mockContext)
      const dependencies = validator.generateContentDependencies()

      expect(dependencies).toBeDefined()
      expect(dependencies.personas).toBeDefined()
      expect(dependencies.skills).toBeDefined()
      expect(dependencies.portfolioItems).toBeDefined()
      expect(dependencies.blogArticles).toBeDefined()
      expect(dependencies.resumeEntries).toBeDefined()
    })
  })
})