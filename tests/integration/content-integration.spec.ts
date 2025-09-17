import { describe, test, expect, beforeAll } from 'vitest'
import type { Persona } from '~/composables/usePersonas'
import type { BlogArticle } from '~/composables/useBlog'
import type { PortfolioCollection, PortfolioItem } from '~/composables/usePortfolio'
import type { ResumeEntry } from '~/composables/useResume'
import type { Skill } from '~/composables/useSkills'

/**
 * Content Integration Testing Framework
 * 
 * Tests the integration between all content types, composables, and API endpoints
 * to ensure proper cross-referencing, data consistency, and schema compliance.
 */

describe('Content Integration Framework', () => {
  let personas: Persona[]
  let blogArticles: BlogArticle[]
  let portfolioCollections: PortfolioCollection[]
  let portfolioItems: PortfolioItem[]
  let resumeEntries: ResumeEntry[]
  let skills: Skill[]

  beforeAll(async () => {
    // Initialize all content types for testing
    const { getPersonas } = usePersonas()
    const { getBlogArticles } = useBlog()
    const { getPortfolioCollections, getPortfolioItems } = usePortfolio()
    const { getResumeEntries } = useResume()
    const { getSkills } = useSkills()

    personas = await getPersonas()
    blogArticles = await getBlogArticles()
    portfolioCollections = await getPortfolioCollections()
    portfolioItems = await getPortfolioItems()
    resumeEntries = await getResumeEntries()
    skills = await getSkills()
  })

  describe('Content Type Availability', () => {
    test('should have personas data', () => {
      expect(personas).toBeDefined()
      expect(Array.isArray(personas)).toBe(true)
      expect(personas.length).toBeGreaterThan(0)
    })

    test('should have blog articles data', () => {
      expect(blogArticles).toBeDefined()
      expect(Array.isArray(blogArticles)).toBe(true)
      expect(blogArticles.length).toBeGreaterThan(0)
    })

    test('should have portfolio collections data', () => {
      expect(portfolioCollections).toBeDefined()
      expect(Array.isArray(portfolioCollections)).toBe(true)
      expect(portfolioCollections.length).toBeGreaterThan(0)
    })

    test('should have portfolio items data', () => {
      expect(portfolioItems).toBeDefined()
      expect(Array.isArray(portfolioItems)).toBe(true)
      expect(portfolioItems.length).toBeGreaterThan(0)
    })

    test('should have resume entries data', () => {
      expect(resumeEntries).toBeDefined()
      expect(Array.isArray(resumeEntries)).toBe(true)
      expect(resumeEntries.length).toBeGreaterThan(0)
    })

    test('should have skills data', () => {
      expect(skills).toBeDefined()
      expect(Array.isArray(skills)).toBe(true)
      expect(skills.length).toBeGreaterThan(0)
    })
  })

  describe('Schema Compliance', () => {
    test('personas should have required fields', () => {
      personas.forEach(persona => {
        expect(persona).toHaveProperty('name')
        expect(persona).toHaveProperty('key')
        expect(persona).toHaveProperty('slug')
        expect(persona).toHaveProperty('isPrimary')
        expect(persona).toHaveProperty('profession')
        expect(persona).toHaveProperty('bio')
        expect(persona).toHaveProperty('skills')
        expect(Array.isArray(persona.skills)).toBe(true)
      })
    })

    test('blog articles should have required fields', () => {
      blogArticles.forEach(article => {
        expect(article).toHaveProperty('title')
        expect(article).toHaveProperty('slug')
        expect(article).toHaveProperty('persona')
        expect(article).toHaveProperty('category')
        expect(article).toHaveProperty('tags')
        expect(Array.isArray(article.tags)).toBe(true)
        expect(article).toHaveProperty('publishedAt')
        expect(article).toHaveProperty('readingTime')
      })
    })

    test('portfolio collections should have required fields', () => {
      portfolioCollections.forEach(collection => {
        expect(collection).toHaveProperty('name')
        expect(collection).toHaveProperty('slug')
        expect(collection).toHaveProperty('description')
        expect(collection).toHaveProperty('persona')
        expect(collection).toHaveProperty('category')
        expect(collection).toHaveProperty('itemCount')
        expect(typeof collection.itemCount).toBe('number')
      })
    })

    test('portfolio items should have required fields', () => {
      portfolioItems.forEach(item => {
        expect(item).toHaveProperty('title')
        expect(item).toHaveProperty('slug')
        expect(item).toHaveProperty('collection')
        expect(item).toHaveProperty('persona')
        expect(item).toHaveProperty('category')
        expect(item).toHaveProperty('skills')
        expect(Array.isArray(item.skills)).toBe(true)
      })
    })

    test('resume entries should have required fields', () => {
      resumeEntries.forEach(entry => {
        expect(entry).toHaveProperty('title')
        expect(entry).toHaveProperty('slug')
        expect(entry).toHaveProperty('persona')
        expect(entry).toHaveProperty('type')
        expect(entry).toHaveProperty('startDate')
        expect(entry).toHaveProperty('skills')
        expect(Array.isArray(entry.skills)).toBe(true)
      })
    })

    test('skills should have required fields', () => {
      skills.forEach(skill => {
        expect(skill).toHaveProperty('name')
        expect(skill).toHaveProperty('key')
        expect(skill).toHaveProperty('persona')
        expect(skill).toHaveProperty('proficiency')
        expect(skill).toHaveProperty('proficiencyLevel')
        expect(typeof skill.proficiencyLevel).toBe('number')
        expect(skill.proficiencyLevel).toBeGreaterThanOrEqual(1)
        expect(skill.proficiencyLevel).toBeLessThanOrEqual(10)
      })
    })
  })

  describe('Content Consistency', () => {
    test('should have at least one primary persona', () => {
      const primaryPersonas = personas.filter(p => p.isPrimary)
      expect(primaryPersonas.length).toBeGreaterThanOrEqual(1)
    })

    test('all content should reference valid personas', () => {
      const personaKeys = personas.map(p => p.key)
      
      blogArticles.forEach(article => {
        expect(personaKeys).toContain(article.persona)
      })
      
      portfolioCollections.forEach(collection => {
        expect(personaKeys).toContain(collection.persona)
      })
      
      portfolioItems.forEach(item => {
        expect(personaKeys).toContain(item.persona)
      })
      
      resumeEntries.forEach(entry => {
        expect(personaKeys).toContain(entry.persona)
      })
      
      skills.forEach(skill => {
        expect(personaKeys).toContain(skill.persona)
      })
    })

    test('portfolio items should reference valid collections', () => {
      const collectionSlugs = portfolioCollections.map(c => c.slug)
      
      portfolioItems.forEach(item => {
        expect(collectionSlugs).toContain(item.collection)
      })
    })

    test('content should reference valid skills', () => {
      const skillKeys = skills.map(s => s.key)
      
      // Check persona skills
      personas.forEach(persona => {
        persona.skills.forEach(skillKey => {
          expect(skillKeys).toContain(skillKey)
        })
      })
      
      // Check portfolio item skills
      portfolioItems.forEach(item => {
        item.skills.forEach(skillKey => {
          expect(skillKeys).toContain(skillKey)
        })
      })
      
      // Check resume entry skills
      resumeEntries.forEach(entry => {
        entry.skills.forEach(skillKey => {
          expect(skillKeys).toContain(skillKey)
        })
      })
    })
  })

  describe('API Response Format', () => {
    test('API endpoints should return consistent response structure', async () => {
      // Test all API endpoints return expected structure
      const endpoints = [
        '/api/personas',
        '/api/blog',
        '/api/portfolio/collections',
        '/api/portfolio/items',
        '/api/resume',
        '/api/skills'
      ]
      
      for (const endpoint of endpoints) {
        const response = await $fetch(endpoint)
        
        expect(response).toHaveProperty('success')
        expect(response.success).toBe(true)
        expect(response).toHaveProperty('data')
        expect(Array.isArray(response.data)).toBe(true)
        expect(response).toHaveProperty('count')
        expect(typeof response.count).toBe('number')
        expect(response).toHaveProperty('stats')
        expect(typeof response.stats).toBe('object')
      }
    })
  })

  describe('Content Statistics Accuracy', () => {
    test('persona statistics should be accurate', () => {
      const { getPersonasStats } = usePersonas()
      return getPersonasStats().then(stats => {
        expect(stats.total).toBe(personas.length)
        expect(stats.primary).toBe(personas.filter(p => p.isPrimary).length)
        expect(stats.secondary).toBe(personas.filter(p => !p.isPrimary).length)
      })
    })

    test('blog statistics should be accurate', () => {
      const { getBlogStats } = useBlog()
      return getBlogStats().then(stats => {
        expect(stats.total).toBe(blogArticles.length)
        expect(stats.published).toBe(blogArticles.filter(a => !a.draft).length)
        expect(stats.featured).toBe(blogArticles.filter(a => a.featured).length)
      })
    })

    test('portfolio statistics should be accurate', () => {
      const { getPortfolioStats } = usePortfolio()
      return getPortfolioStats().then(stats => {
        expect(stats.totalCollections).toBe(portfolioCollections.length)
        expect(stats.totalItems).toBe(portfolioItems.length)
        expect(stats.featuredCollections).toBe(portfolioCollections.filter(c => c.featured).length)
      })
    })

    test('resume statistics should be accurate', () => {
      const { getResumeStats } = useResume()
      return getResumeStats().then(stats => {
        expect(stats.total).toBe(resumeEntries.length)
        expect(stats.experience).toBe(resumeEntries.filter(e => e.type === 'experience').length)
        expect(stats.education).toBe(resumeEntries.filter(e => e.type === 'education').length)
      })
    })

    test('skills statistics should be accurate', () => {
      const { getSkillsStats } = useSkills()
      return getSkillsStats().then(stats => {
        expect(stats.total).toBe(skills.length)
        expect(stats.featured).toBe(skills.filter(s => s.featured).length)
        expect(stats.endorsed).toBe(skills.filter(s => s.endorsed).length)
      })
    })
  })
})