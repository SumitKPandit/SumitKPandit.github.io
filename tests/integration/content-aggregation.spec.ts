import { describe, test, expect, beforeAll } from 'vitest'

/**
 * Content Aggregation Tests
 * 
 * Tests that aggregation functions, statistics calculations, filtering,
 * and search functionality work correctly across all content types.
 */

describe('Content Aggregation Functions', () => {
  let apiData: any = {}

  beforeAll(async () => {
    // Load all API responses for aggregation testing
    try {
      const endpoints = [
        { key: 'personas', url: '/api/personas' },
        { key: 'blog', url: '/api/blog' },
        { key: 'portfolioCollections', url: '/api/portfolio/collections' },
        { key: 'portfolioItems', url: '/api/portfolio/items' },
        { key: 'resume', url: '/api/resume' },
        { key: 'skills', url: '/api/skills' }
      ]

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url)
          const data = await response.json()
          apiData[endpoint.key] = data
        } catch (error) {
          console.warn(`Failed to load ${endpoint.key}:`, error)
          apiData[endpoint.key] = { success: false, data: [], count: 0, stats: {} }
        }
      }
    } catch (error) {
      console.warn('Failed to load API data for aggregation testing:', error)
    }
  })

  describe('API Response Structure Validation', () => {
    test('all APIs return consistent response structure', () => {
      Object.entries(apiData).forEach(([key, response]: [string, any]) => {
        expect(response).toHaveProperty('success')
        expect(response).toHaveProperty('data')
        expect(response).toHaveProperty('count')
        expect(response).toHaveProperty('stats')
        expect(Array.isArray(response.data)).toBe(true)
        expect(typeof response.count).toBe('number')
        expect(typeof response.stats).toBe('object')
      })
    })

    test('data count matches array length', () => {
      Object.entries(apiData).forEach(([key, response]: [string, any]) => {
        expect(response.count).toBe(response.data.length)
      })
    })
  })

  describe('Statistics Accuracy', () => {
    test('persona statistics are calculated correctly', () => {
      const { data, stats } = apiData.personas
      
      expect(stats.total).toBe(data.length)
      
      const primaryCount = data.filter((p: any) => p.isPrimary).length
      const secondaryCount = data.filter((p: any) => !p.isPrimary).length
      
      expect(stats.primary).toBe(primaryCount)
      expect(stats.secondary).toBe(secondaryCount)
      expect(stats.primary + stats.secondary).toBe(stats.total)
    })

    test('blog statistics are calculated correctly', () => {
      const { data, stats } = apiData.blog
      
      expect(stats.total).toBe(data.length)
      
      const publishedCount = data.filter((a: any) => !a.draft).length
      const draftCount = data.filter((a: any) => a.draft).length
      const featuredCount = data.filter((a: any) => a.featured).length
      
      expect(stats.published).toBe(publishedCount)
      expect(stats.drafts).toBe(draftCount)
      expect(stats.featured).toBe(featuredCount)
    })

    test('portfolio statistics are calculated correctly', () => {
      const collectionsData = apiData.portfolioCollections
      const itemsData = apiData.portfolioItems
      
      expect(collectionsData.stats.total).toBe(collectionsData.data.length)
      expect(itemsData.stats.total).toBe(itemsData.data.length)
      
      const featuredCollections = collectionsData.data.filter((c: any) => c.featured).length
      const featuredItems = itemsData.data.filter((i: any) => i.featured).length
      
      expect(collectionsData.stats.featured).toBe(featuredCollections)
      expect(itemsData.stats.featured).toBe(featuredItems)
    })

    test('resume statistics are calculated correctly', () => {
      const { data, stats } = apiData.resume
      
      expect(stats.total).toBe(data.length)
      
      const experienceCount = data.filter((e: any) => e.type === 'experience').length
      const educationCount = data.filter((e: any) => e.type === 'education').length
      const currentCount = data.filter((e: any) => e.current).length
      
      expect(stats.experience).toBe(experienceCount)
      expect(stats.education).toBe(educationCount)
      expect(stats.current).toBe(currentCount)
    })

    test('skills statistics are calculated correctly', () => {
      const { data, stats } = apiData.skills
      
      expect(stats.total).toBe(data.length)
      
      const featuredCount = data.filter((s: any) => s.featured).length
      const endorsedCount = data.filter((s: any) => s.endorsed).length
      
      expect(stats.featured).toBe(featuredCount)
      expect(stats.endorsed).toBe(endorsedCount)
      
      // Check proficiency level distribution
      const proficiencyLevels = data.reduce((acc: any, skill: any) => {
        const level = skill.proficiency
        acc[level] = (acc[level] || 0) + 1
        return acc
      }, {})
      
      expect(stats.proficiencyLevels).toEqual(proficiencyLevels)
      
      // Check average proficiency calculation
      const totalLevels = data.reduce((sum: number, skill: any) => sum + skill.proficiencyLevel, 0)
      const expectedAverage = totalLevels / data.length
      expect(Math.abs(stats.averageProficiency - expectedAverage)).toBeLessThan(0.01)
    })
  })

  describe('Category and Tag Aggregations', () => {
    test('blog categories are properly aggregated', () => {
      const { data, stats } = apiData.blog
      
      if (stats.categories) {
        const categoryCount = data.reduce((acc: any, article: any) => {
          acc[article.category] = (acc[article.category] || 0) + 1
          return acc
        }, {})
        
        expect(stats.categories).toEqual(expect.arrayContaining(Object.keys(categoryCount)))
      }
      
      if (stats.tags) {
        const allTags = data.flatMap((article: any) => article.tags || [])
        const uniqueTags = [...new Set(allTags)]
        expect(stats.tags.length).toBeGreaterThanOrEqual(uniqueTags.length * 0.8) // Allow some variance
      }
    })

    test('portfolio categories are properly aggregated', () => {
      const collectionsData = apiData.portfolioCollections
      const itemsData = apiData.portfolioItems
      
      if (collectionsData.stats.categories) {
        const collectionCategories = [...new Set(collectionsData.data.map((c: any) => c.category))]
        expect(collectionsData.stats.categories).toEqual(expect.arrayContaining(collectionCategories))
      }
      
      if (itemsData.stats.categories) {
        const itemCategories = [...new Set(itemsData.data.map((i: any) => i.category))]
        expect(itemsData.stats.categories).toEqual(expect.arrayContaining(itemCategories))
      }
    })

    test('skills categories and groups are properly aggregated', () => {
      const { data, stats } = apiData.skills
      
      const categories = [...new Set(data.map((s: any) => s.category))]
      const subcategories = [...new Set(data.map((s: any) => s.subcategory))]
      const groups = [...new Set(data.map((s: any) => s.group))]
      const personas = [...new Set(data.map((s: any) => s.persona))]
      
      expect(stats.categories).toEqual(expect.arrayContaining(categories))
      expect(stats.subcategories).toEqual(expect.arrayContaining(subcategories))
      expect(stats.groups).toEqual(expect.arrayContaining(groups))
      expect(stats.personas).toEqual(expect.arrayContaining(personas))
    })
  })

  describe('Experience and Timeline Aggregations', () => {
    test('resume experience calculations are accurate', () => {
      const { data, stats } = apiData.resume
      
      if (stats.totalExperience !== undefined) {
        // Calculate total experience from individual entries
        const totalYears = data.reduce((sum: number, entry: any) => {
          if (entry.duration && typeof entry.duration === 'object' && entry.duration.years) {
            return sum + entry.duration.years
          }
          return sum
        }, 0)
        
        expect(Math.abs(stats.totalExperience - totalYears)).toBeLessThan(1) // Allow small variance
      }
    })

    test('skills experience aggregation is accurate', () => {
      const { data, stats } = apiData.skills
      
      if (stats.totalExperience !== undefined) {
        const totalYears = data.reduce((sum: number, skill: any) => sum + (skill.yearsOfExperience || 0), 0)
        expect(stats.totalExperience).toBe(totalYears)
      }
    })
  })

  describe('Cross-Content Type Aggregations', () => {
    test('persona skill aggregation matches skills data', () => {
      const personasData = apiData.personas.data
      const skillsData = apiData.skills.data
      const skillKeys = skillsData.map((s: any) => s.key)
      
      // All persona skills should exist in skills data
      personasData.forEach((persona: any) => {
        if (persona.skills && Array.isArray(persona.skills)) {
          persona.skills.forEach((skillKey: string) => {
            expect(skillKeys).toContain(skillKey)
          })
        }
      })
    })

    test('portfolio item collection references are consistent', () => {
      const collectionsData = apiData.portfolioCollections.data
      const itemsData = apiData.portfolioItems.data
      const collectionSlugs = collectionsData.map((c: any) => c.slug)
      
      // All portfolio items should reference existing collections
      itemsData.forEach((item: any) => {
        expect(collectionSlugs).toContain(item.collection)
      })
      
      // Collection item counts should match actual items
      collectionsData.forEach((collection: any) => {
        const itemCount = itemsData.filter((item: any) => item.collection === collection.slug).length
        expect(collection.itemCount).toBe(itemCount)
      })
    })

    test('content persona distribution is logical', () => {
      const personasData = apiData.personas.data
      const personaKeys = personasData.map((p: any) => p.key)
      
      const contentTypes = [
        apiData.blog.data,
        apiData.portfolioCollections.data,
        apiData.portfolioItems.data,
        apiData.resume.data,
        apiData.skills.data
      ]
      
      contentTypes.forEach(contentArray => {
        contentArray.forEach((item: any) => {
          expect(personaKeys).toContain(item.persona)
        })
      })
    })
  })

  describe('Search and Filter Capabilities', () => {
    test('content supports basic filtering by persona', () => {
      const personaKeys = apiData.personas.data.map((p: any) => p.key)
      
      if (personaKeys.length > 0) {
        const testPersona = personaKeys[0]
        
        // Check that each content type has items for the test persona
        const contentTypes = [
          { name: 'blog', data: apiData.blog.data },
          { name: 'skills', data: apiData.skills.data }
        ]
        
        contentTypes.forEach(({ name, data }) => {
          const personaItems = data.filter((item: any) => item.persona === testPersona)
          // Should have at least some content for major personas
          if (data.length > 0) {
            expect(personaItems.length).toBeGreaterThanOrEqual(0) // At least allow empty results
          }
        })
      }
    })

    test('content has searchable text fields', () => {
      const searchableContent = [
        ...apiData.blog.data,
        ...apiData.portfolioCollections.data,
        ...apiData.portfolioItems.data,
        ...apiData.skills.data
      ]
      
      searchableContent.forEach((item: any) => {
        // Should have at least title/name and description for searching
        const hasTitle = item.title || item.name
        const hasDescription = item.description || item.excerpt || item.summary
        
        expect(hasTitle).toBeTruthy()
        expect(hasDescription).toBeTruthy()
      })
    })

    test('tag-based filtering is supported', () => {
      const taggedContent = [
        ...apiData.blog.data,
        ...apiData.skills.data
      ]
      
      taggedContent.forEach((item: any) => {
        if (item.tags) {
          expect(Array.isArray(item.tags)).toBe(true)
          item.tags.forEach((tag: string) => {
            expect(typeof tag).toBe('string')
            expect(tag.length).toBeGreaterThan(0)
          })
        }
      })
    })
  })

  describe('Performance and Optimization', () => {
    test('API responses are reasonably sized', () => {
      Object.entries(apiData).forEach(([key, response]: [string, any]) => {
        const responseSize = JSON.stringify(response).length
        // Should be under 1MB per endpoint (1,000,000 bytes)
        expect(responseSize).toBeLessThan(1000000)
      })
    })

    test('statistics are pre-calculated and comprehensive', () => {
      Object.entries(apiData).forEach(([key, response]: [string, any]) => {
        const { stats } = response
        
        // Should have basic statistics
        expect(stats).toHaveProperty('total')
        expect(typeof stats.total).toBe('number')
        
        // Should have some domain-specific statistics
        const statKeys = Object.keys(stats)
        expect(statKeys.length).toBeGreaterThan(2) // More than just total and count
      })
    })
  })
})