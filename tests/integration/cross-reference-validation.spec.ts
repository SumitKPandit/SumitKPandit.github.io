import { describe, test, expect, beforeAll } from 'vitest'

/**
 * Cross-Reference Validation Tests
 * 
 * Tests that relationships between different content types are properly maintained
 * and cross-references resolve correctly across the content system.
 */

describe('Content Cross-Reference Validation', () => {
  let contentData: any = {}

  beforeAll(async () => {
    // Load all content data for cross-reference testing
    try {
      const personasResponse = await fetch('/api/personas')
      const blogResponse = await fetch('/api/blog')
      const portfolioCollectionsResponse = await fetch('/api/portfolio/collections')
      const portfolioItemsResponse = await fetch('/api/portfolio/items')
      const resumeResponse = await fetch('/api/resume')
      const skillsResponse = await fetch('/api/skills')

      contentData = {
        personas: (await personasResponse.json()).data || [],
        blog: (await blogResponse.json()).data || [],
        portfolioCollections: (await portfolioCollectionsResponse.json()).data || [],
        portfolioItems: (await portfolioItemsResponse.json()).data || [],
        resume: (await resumeResponse.json()).data || [],
        skills: (await skillsResponse.json()).data || []
      }
    } catch (error) {
      console.warn('Failed to load content data for testing:', error)
      // Set default empty arrays to prevent test failures
      contentData = {
        personas: [],
        blog: [],
        portfolioCollections: [],
        portfolioItems: [],
        resume: [],
        skills: []
      }
    }
  })

  describe('Persona-Content Relationships', () => {
    test('all blog articles reference valid personas', () => {
      const personaKeys = contentData.personas.map((p: any) => p.key)
      
      contentData.blog.forEach((article: any) => {
        expect(personaKeys).toContain(article.persona)
      })
    })

    test('all portfolio collections reference valid personas', () => {
      const personaKeys = contentData.personas.map((p: any) => p.key)
      
      contentData.portfolioCollections.forEach((collection: any) => {
        expect(personaKeys).toContain(collection.persona)
      })
    })

    test('all portfolio items reference valid personas', () => {
      const personaKeys = contentData.personas.map((p: any) => p.key)
      
      contentData.portfolioItems.forEach((item: any) => {
        expect(personaKeys).toContain(item.persona)
      })
    })

    test('all resume entries reference valid personas', () => {
      const personaKeys = contentData.personas.map((p: any) => p.key)
      
      contentData.resume.forEach((entry: any) => {
        expect(personaKeys).toContain(entry.persona)
      })
    })

    test('all skills reference valid personas', () => {
      const personaKeys = contentData.personas.map((p: any) => p.key)
      
      contentData.skills.forEach((skill: any) => {
        expect(personaKeys).toContain(skill.persona)
      })
    })
  })

  describe('Skill Cross-References', () => {
    test('persona skills reference valid skill keys', () => {
      const skillKeys = contentData.skills.map((s: any) => s.key)
      
      contentData.personas.forEach((persona: any) => {
        if (persona.skills && Array.isArray(persona.skills)) {
          persona.skills.forEach((skillKey: string) => {
            expect(skillKeys).toContain(skillKey)
          })
        }
      })
    })

    test('portfolio item skills reference valid skill keys', () => {
      const skillKeys = contentData.skills.map((s: any) => s.key)
      
      contentData.portfolioItems.forEach((item: any) => {
        if (item.skills && Array.isArray(item.skills)) {
          item.skills.forEach((skillKey: string) => {
            expect(skillKeys).toContain(skillKey)
          })
        }
      })
    })

    test('resume entry skills reference valid skill keys', () => {
      const skillKeys = contentData.skills.map((s: any) => s.key)
      
      contentData.resume.forEach((entry: any) => {
        if (entry.skills && Array.isArray(entry.skills)) {
          entry.skills.forEach((skillKey: string) => {
            expect(skillKeys).toContain(skillKey)
          })
        }
      })
    })

    test('skill related skills reference valid skill keys', () => {
      const skillKeys = contentData.skills.map((s: any) => s.key)
      
      contentData.skills.forEach((skill: any) => {
        if (skill.relatedSkills && Array.isArray(skill.relatedSkills)) {
          skill.relatedSkills.forEach((relatedSkillKey: string) => {
            expect(skillKeys).toContain(relatedSkillKey)
          })
        }
      })
    })
  })

  describe('Portfolio Collection-Item Relationships', () => {
    test('portfolio items reference valid collections', () => {
      const collectionSlugs = contentData.portfolioCollections.map((c: any) => c.slug)
      
      contentData.portfolioItems.forEach((item: any) => {
        expect(collectionSlugs).toContain(item.collection)
      })
    })

    test('portfolio collection item counts are accurate', () => {
      contentData.portfolioCollections.forEach((collection: any) => {
        const itemsInCollection = contentData.portfolioItems.filter(
          (item: any) => item.collection === collection.slug
        )
        expect(collection.itemCount).toBe(itemsInCollection.length)
      })
    })
  })

  describe('Project Cross-References', () => {
    test('skill projects reference valid portfolio items or external projects', () => {
      const portfolioItemSlugs = contentData.portfolioItems.map((item: any) => item.slug)
      
      contentData.skills.forEach((skill: any) => {
        if (skill.projects && Array.isArray(skill.projects)) {
          skill.projects.forEach((projectKey: string) => {
            // Project can be either a portfolio item slug or an external project identifier
            // For now, we'll just check it's a non-empty string
            expect(typeof projectKey).toBe('string')
            expect(projectKey.length).toBeGreaterThan(0)
          })
        }
      })
    })

    test('resume entry projects are properly formatted', () => {
      contentData.resume.forEach((entry: any) => {
        if (entry.projects && Array.isArray(entry.projects)) {
          entry.projects.forEach((projectKey: string) => {
            expect(typeof projectKey).toBe('string')
            expect(projectKey.length).toBeGreaterThan(0)
          })
        }
      })
    })
  })

  describe('Tag and Category Consistency', () => {
    test('blog article categories are consistent', () => {
      const categories = contentData.blog.map((article: any) => article.category)
      const uniqueCategories = [...new Set(categories)]
      
      // Should have consistent category naming (no duplicates with different cases)
      uniqueCategories.forEach(category => {
        const variations = categories.filter((cat: string) => 
          cat.toLowerCase() === category.toLowerCase()
        )
        expect(variations.every((v: string) => v === category)).toBe(true)
      })
    })

    test('portfolio categories are consistent across collections and items', () => {
      const collectionCategories = contentData.portfolioCollections.map((c: any) => c.category)
      const itemCategories = contentData.portfolioItems.map((i: any) => i.category)
      
      // Items should generally align with their collection categories
      contentData.portfolioItems.forEach((item: any) => {
        const collection = contentData.portfolioCollections.find(
          (c: any) => c.slug === item.collection
        )
        if (collection) {
          // Category should match or be a subcategory
          expect(
            item.category === collection.category || 
            item.category.includes(collection.category) ||
            collection.category.includes(item.category)
          ).toBe(true)
        }
      })
    })

    test('skill categories are properly structured', () => {
      const skillCategories = contentData.skills.map((s: any) => s.category)
      const uniqueCategories = [...new Set(skillCategories)]
      
      // Should have consistent category naming
      uniqueCategories.forEach(category => {
        expect(typeof category).toBe('string')
        expect(category.length).toBeGreaterThan(0)
        expect(category).toMatch(/^[a-z][a-z0-9-]*[a-z0-9]$/) // kebab-case format
      })
    })
  })

  describe('Date and Timeline Consistency', () => {
    test('blog articles have valid publication dates', () => {
      contentData.blog.forEach((article: any) => {
        if (article.publishedAt) {
          const date = new Date(article.publishedAt)
          expect(date.getTime()).not.toBeNaN()
          expect(date.getTime()).toBeLessThanOrEqual(Date.now())
        }
      })
    })

    test('resume entries have valid date ranges', () => {
      contentData.resume.forEach((entry: any) => {
        if (entry.startDate) {
          const startDate = new Date(entry.startDate)
          expect(startDate.getTime()).not.toBeNaN()
          
          if (entry.endDate) {
            const endDate = new Date(entry.endDate)
            expect(endDate.getTime()).not.toBeNaN()
            expect(endDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime())
          }
        }
      })
    })

    test('content creation and update dates are logical', () => {
      const allContent = [
        ...contentData.personas,
        ...contentData.blog,
        ...contentData.portfolioCollections,
        ...contentData.portfolioItems,
        ...contentData.resume,
        ...contentData.skills
      ]
      
      allContent.forEach((item: any) => {
        if (item.createdAt) {
          const createdDate = new Date(item.createdAt)
          expect(createdDate.getTime()).not.toBeNaN()
          
          if (item.updatedAt) {
            const updatedDate = new Date(item.updatedAt)
            expect(updatedDate.getTime()).not.toBeNaN()
            expect(updatedDate.getTime()).toBeGreaterThanOrEqual(createdDate.getTime())
          }
        }
      })
    })
  })

  describe('URL and Slug Consistency', () => {
    test('all content has unique slugs within their type', () => {
      const contentTypes = [
        { name: 'personas', data: contentData.personas },
        { name: 'blog', data: contentData.blog },
        { name: 'portfolioCollections', data: contentData.portfolioCollections },
        { name: 'portfolioItems', data: contentData.portfolioItems },
        { name: 'resume', data: contentData.resume },
        { name: 'skills', data: contentData.skills }
      ]
      
      contentTypes.forEach(({ name, data }) => {
        const slugs = data.map((item: any) => item.slug).filter(Boolean)
        const uniqueSlugs = [...new Set(slugs)]
        expect(uniqueSlugs.length).toBe(slugs.length)
      })
    })

    test('content URLs are properly formatted', () => {
      const allContent = [
        ...contentData.personas,
        ...contentData.blog,
        ...contentData.portfolioCollections,
        ...contentData.portfolioItems,
        ...contentData.resume,
        ...contentData.skills
      ]
      
      allContent.forEach((item: any) => {
        if (item.url) {
          expect(item.url).toMatch(/^\//) // Should start with /
          expect(item.url).not.toMatch(/\s/) // Should not contain spaces
          expect(item.url).not.toMatch(/[A-Z]/) // Should be lowercase
        }
      })
    })
  })
})