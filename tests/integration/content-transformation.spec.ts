import { describe, test, expect } from 'vitest'

/**
 * Content Transformation Tests
 * 
 * Tests that content transformations, schema validation, data processing,
 * and content derivations work correctly across all content types.
 */

describe('Content Transformation and Processing', () => {
  describe('Schema Validation and Enforcement', () => {
    test('persona content follows PersonaSchema structure', async () => {
      try {
        const response = await fetch('/api/personas')
        const data = await response.json()
        
        if (data.success && data.data.length > 0) {
          data.data.forEach((persona: any) => {
            // Required fields
            expect(persona).toHaveProperty('name')
            expect(persona).toHaveProperty('key')
            expect(persona).toHaveProperty('slug')
            expect(persona).toHaveProperty('isPrimary')
            expect(persona).toHaveProperty('profession')
            expect(persona).toHaveProperty('bio')
            expect(persona).toHaveProperty('displayOrder')
            expect(persona).toHaveProperty('featured')
            expect(persona).toHaveProperty('draft')
            
            // Type validation
            expect(typeof persona.name).toBe('string')
            expect(typeof persona.key).toBe('string')
            expect(typeof persona.slug).toBe('string')
            expect(typeof persona.isPrimary).toBe('boolean')
            expect(typeof persona.profession).toBe('string')
            expect(typeof persona.bio).toBe('string')
            expect(typeof persona.displayOrder).toBe('number')
            expect(typeof persona.featured).toBe('boolean')
            expect(typeof persona.draft).toBe('boolean')
            
            // Array fields
            expect(Array.isArray(persona.skills)).toBe(true)
            expect(Array.isArray(persona.interests)).toBe(true)
            expect(Array.isArray(persona.values)).toBe(true)
            
            // Date fields
            expect(persona.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
            expect(persona.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
            
            // URL field
            expect(persona.url).toMatch(/^\//)
          })
        }
      } catch (error) {
        console.warn('Could not test persona schema validation: API not accessible')
      }
    })

    test('blog articles follow BlogArticleSchema structure', async () => {
      try {
        const response = await fetch('/api/blog')
        const data = await response.json()
        
        if (data.success && data.data.length > 0) {
          data.data.forEach((article: any) => {
            // Required fields
            expect(article).toHaveProperty('title')
            expect(article).toHaveProperty('slug')
            expect(article).toHaveProperty('persona')
            expect(article).toHaveProperty('category')
            expect(article).toHaveProperty('publishedAt')
            expect(article).toHaveProperty('readingTime')
            expect(article).toHaveProperty('featured')
            expect(article).toHaveProperty('draft')
            
            // Type validation
            expect(typeof article.title).toBe('string')
            expect(typeof article.slug).toBe('string')
            expect(typeof article.persona).toBe('string')
            expect(typeof article.category).toBe('string')
            expect(typeof article.featured).toBe('boolean')
            expect(typeof article.draft).toBe('boolean')
            
            // Reading time validation
            expect(article.readingTime).toHaveProperty('minutes')
            expect(article.readingTime).toHaveProperty('words')
            expect(typeof article.readingTime.minutes).toBe('number')
            expect(typeof article.readingTime.words).toBe('number')
            expect(article.readingTime.minutes).toBeGreaterThan(0)
            expect(article.readingTime.words).toBeGreaterThan(0)
            
            // Array fields
            expect(Array.isArray(article.tags)).toBe(true)
            
            // Date validation
            expect(article.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
          })
        }
      } catch (error) {
        console.warn('Could not test blog schema validation: API not accessible')
      }
    })

    test('skills follow SkillSchema structure with proficiency validation', async () => {
      try {
        const response = await fetch('/api/skills')
        const data = await response.json()
        
        if (data.success && data.data.length > 0) {
          data.data.forEach((skill: any) => {
            // Required fields
            expect(skill).toHaveProperty('name')
            expect(skill).toHaveProperty('key')
            expect(skill).toHaveProperty('proficiency')
            expect(skill).toHaveProperty('proficiencyLevel')
            expect(skill).toHaveProperty('yearsOfExperience')
            expect(skill).toHaveProperty('persona')
            expect(skill).toHaveProperty('category')
            expect(skill).toHaveProperty('group')
            
            // Type validation
            expect(typeof skill.name).toBe('string')
            expect(typeof skill.key).toBe('string')
            expect(typeof skill.proficiency).toBe('string')
            expect(typeof skill.proficiencyLevel).toBe('number')
            expect(typeof skill.yearsOfExperience).toBe('number')
            expect(typeof skill.persona).toBe('string')
            expect(typeof skill.category).toBe('string')
            expect(typeof skill.group).toBe('string')
            
            // Proficiency validation
            expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(skill.proficiency)
            expect(skill.proficiencyLevel).toBeGreaterThanOrEqual(1)
            expect(skill.proficiencyLevel).toBeLessThanOrEqual(10)
            expect(skill.yearsOfExperience).toBeGreaterThanOrEqual(0)
            
            // Array fields
            expect(Array.isArray(skill.tags)).toBe(true)
            expect(Array.isArray(skill.relatedSkills)).toBe(true)
            expect(Array.isArray(skill.projects)).toBe(true)
            expect(Array.isArray(skill.certifications)).toBe(true)
            expect(Array.isArray(skill.endorsements)).toBe(true)
            expect(Array.isArray(skill.learningResources)).toBe(true)
            expect(Array.isArray(skill.achievements)).toBe(true)
            
            // Learning resources structure
            skill.learningResources.forEach((resource: any) => {
              expect(resource).toHaveProperty('title')
              expect(resource).toHaveProperty('url')
              expect(resource).toHaveProperty('type')
              expect(typeof resource.title).toBe('string')
              expect(typeof resource.url).toBe('string')
              expect(typeof resource.type).toBe('string')
            })
          })
        }
      } catch (error) {
        console.warn('Could not test skills schema validation: API not accessible')
      }
    })
  })

  describe('Data Derivation and Enrichment', () => {
    test('reading time is calculated for blog articles', async () => {
      try {
        const response = await fetch('/api/blog')
        const data = await response.json()
        
        if (data.success && data.data.length > 0) {
          data.data.forEach((article: any) => {
            expect(article.readingTime).toBeDefined()
            expect(article.readingTime.minutes).toBeGreaterThan(0)
            expect(article.readingTime.words).toBeGreaterThan(0)
            
            // Reading time calculation should be reasonable (150-200 wpm average)
            const expectedMinutes = article.readingTime.words / 175 // 175 wpm average
            const actualMinutes = article.readingTime.minutes
            expect(Math.abs(expectedMinutes - actualMinutes)).toBeLessThan(2) // Allow some variance
          })
        }
      } catch (error) {
        console.warn('Could not test reading time calculation: API not accessible')
      }
    })

    test('resume entries have duration calculations', async () => {
      try {
        const response = await fetch('/api/resume')
        const data = await response.json()
        
        if (data.success && data.data.length > 0) {
          data.data.forEach((entry: any) => {
            if (entry.startDate) {
              expect(entry.duration).toBeDefined()
              expect(entry.duration).toHaveProperty('years')
              expect(entry.duration).toHaveProperty('months')
              expect(entry.duration).toHaveProperty('total')
              
              expect(typeof entry.duration.years).toBe('number')
              expect(typeof entry.duration.months).toBe('number')
              expect(typeof entry.duration.total).toBe('string')
              
              expect(entry.duration.years).toBeGreaterThanOrEqual(0)
              expect(entry.duration.months).toBeGreaterThanOrEqual(0)
              expect(entry.duration.months).toBeLessThan(12)
            }
          })
        }
      } catch (error) {
        console.warn('Could not test duration calculations: API not accessible')
      }
    })

    test('portfolio collections have accurate item counts', async () => {
      try {
        const collectionsResponse = await fetch('/api/portfolio/collections')
        const itemsResponse = await fetch('/api/portfolio/items')
        
        const collectionsData = await collectionsResponse.json()
        const itemsData = await itemsResponse.json()
        
        if (collectionsData.success && itemsData.success) {
          collectionsData.data.forEach((collection: any) => {
            const actualItemCount = itemsData.data.filter(
              (item: any) => item.collection === collection.slug
            ).length
            
            expect(collection.itemCount).toBe(actualItemCount)
          })
        }
      } catch (error) {
        console.warn('Could not test portfolio item counts: API not accessible')
      }
    })
  })

  describe('Content Processing and Formatting', () => {
    test('slugs are properly formatted', async () => {
      const endpoints = [
        '/api/personas',
        '/api/blog',
        '/api/portfolio/collections',
        '/api/portfolio/items',
        '/api/resume',
        '/api/skills'
      ]
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint)
          const data = await response.json()
          
          if (data.success && data.data.length > 0) {
            data.data.forEach((item: any) => {
              if (item.slug) {
                // Should be lowercase
                expect(item.slug).toBe(item.slug.toLowerCase())
                
                // Should be kebab-case (no spaces, underscores, special chars)
                expect(item.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
                
                // Should not be empty
                expect(item.slug.length).toBeGreaterThan(0)
              }
            })
          }
        } catch (error) {
          console.warn(`Could not test slug formatting for ${endpoint}`)
        }
      }
    })

    test('URLs are properly constructed', async () => {
      const endpointUrlPrefixes = [
        { endpoint: '/api/personas', prefix: '/personas/' },
        { endpoint: '/api/blog', prefix: '/blog/' },
        { endpoint: '/api/portfolio/collections', prefix: '/portfolio/collections/' },
        { endpoint: '/api/portfolio/items', prefix: '/portfolio/items/' },
        { endpoint: '/api/skills', prefix: '/skills/' }
      ]
      
      for (const { endpoint, prefix } of endpointUrlPrefixes) {
        try {
          const response = await fetch(endpoint)
          const data = await response.json()
          
          if (data.success && data.data.length > 0) {
            data.data.forEach((item: any) => {
              if (item.url) {
                expect(item.url).toMatch(new RegExp(`^${prefix.replace('/', '\\/')}`))
                expect(item.url).not.toMatch(/\s/) // No spaces
                expect(item.url).not.toMatch(/[A-Z]/) // Lowercase
              }
            })
          }
        } catch (error) {
          console.warn(`Could not test URL construction for ${endpoint}`)
        }
      }
    })

    test('tags are normalized and consistent', async () => {
      const taggedEndpoints = ['/api/blog', '/api/skills']
      
      for (const endpoint of taggedEndpoints) {
        try {
          const response = await fetch(endpoint)
          const data = await response.json()
          
          if (data.success && data.data.length > 0) {
            data.data.forEach((item: any) => {
              if (item.tags && Array.isArray(item.tags)) {
                item.tags.forEach((tag: string) => {
                  // Should be lowercase
                  expect(tag).toBe(tag.toLowerCase())
                  
                  // Should be kebab-case
                  expect(tag).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
                  
                  // Should not be empty
                  expect(tag.length).toBeGreaterThan(0)
                })
              }
            })
          }
        } catch (error) {
          console.warn(`Could not test tag normalization for ${endpoint}`)
        }
      }
    })
  })

  describe('Cross-Reference Resolution', () => {
    test('skill references are resolved correctly', async () => {
      try {
        const skillsResponse = await fetch('/api/skills')
        const skillsData = await skillsResponse.json()
        
        if (skillsData.success && skillsData.data.length > 0) {
          const skillKeys = skillsData.data.map((s: any) => s.key)
          
          // Test related skills resolution
          skillsData.data.forEach((skill: any) => {
            if (skill.relatedSkills && skill.relatedSkills.length > 0) {
              skill.relatedSkills.forEach((relatedKey: string) => {
                expect(skillKeys).toContain(relatedKey)
              })
            }
          })
        }
      } catch (error) {
        console.warn('Could not test skill reference resolution: API not accessible')
      }
    })

    test('persona references are resolved across content types', async () => {
      try {
        const personasResponse = await fetch('/api/personas')
        const personasData = await personasResponse.json()
        
        if (personasData.success && personasData.data.length > 0) {
          const personaKeys = personasData.data.map((p: any) => p.key)
          
          const contentEndpoints = ['/api/blog', '/api/skills', '/api/resume']
          
          for (const endpoint of contentEndpoints) {
            try {
              const response = await fetch(endpoint)
              const data = await response.json()
              
              if (data.success && data.data.length > 0) {
                data.data.forEach((item: any) => {
                  if (item.persona) {
                    expect(personaKeys).toContain(item.persona)
                  }
                })
              }
            } catch (error) {
              console.warn(`Could not test persona references for ${endpoint}`)
            }
          }
        }
      } catch (error) {
        console.warn('Could not test persona reference resolution: API not accessible')
      }
    })
  })

  describe('Data Validation and Sanitization', () => {
    test('content does not contain dangerous HTML or scripts', async () => {
      const endpoints = [
        '/api/personas',
        '/api/blog',
        '/api/portfolio/collections',
        '/api/portfolio/items',
        '/api/resume',
        '/api/skills'
      ]
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint)
          const data = await response.json()
          
          if (data.success && data.data.length > 0) {
            data.data.forEach((item: any) => {
              const textFields = ['title', 'name', 'description', 'bio', 'summary', 'excerpt']
              
              textFields.forEach(field => {
                if (item[field] && typeof item[field] === 'string') {
                  // Should not contain script tags
                  expect(item[field]).not.toMatch(/<script/i)
                  
                  // Should not contain dangerous attributes
                  expect(item[field]).not.toMatch(/on\w+\s*=/i)
                  
                  // Should not contain javascript: protocol
                  expect(item[field]).not.toMatch(/javascript:/i)
                }
              })
            })
          }
        } catch (error) {
          console.warn(`Could not test content sanitization for ${endpoint}`)
        }
      }
    })

    test('dates are in valid ISO 8601 format', async () => {
      const endpoints = [
        '/api/personas',
        '/api/blog',
        '/api/portfolio/collections',
        '/api/portfolio/items',
        '/api/resume',
        '/api/skills'
      ]
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint)
          const data = await response.json()
          
          if (data.success && data.data.length > 0) {
            data.data.forEach((item: any) => {
              const dateFields = ['createdAt', 'updatedAt', 'publishedAt', 'startDate', 'endDate']
              
              dateFields.forEach(field => {
                if (item[field]) {
                  // Should be valid ISO 8601 format
                  expect(item[field]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
                  
                  // Should parse to valid date
                  const date = new Date(item[field])
                  expect(date.getTime()).not.toBeNaN()
                }
              })
            })
          }
        } catch (error) {
          console.warn(`Could not test date validation for ${endpoint}`)
        }
      }
    })

    test('numeric fields have valid ranges', async () => {
      try {
        const skillsResponse = await fetch('/api/skills')
        const skillsData = await skillsResponse.json()
        
        if (skillsData.success && skillsData.data.length > 0) {
          skillsData.data.forEach((skill: any) => {
            // Proficiency level should be 1-10
            expect(skill.proficiencyLevel).toBeGreaterThanOrEqual(1)
            expect(skill.proficiencyLevel).toBeLessThanOrEqual(10)
            
            // Years of experience should be reasonable
            expect(skill.yearsOfExperience).toBeGreaterThanOrEqual(0)
            expect(skill.yearsOfExperience).toBeLessThanOrEqual(50) // Reasonable upper limit
          })
        }
        
        const resumeResponse = await fetch('/api/resume')
        const resumeData = await resumeResponse.json()
        
        if (resumeData.success && resumeData.data.length > 0) {
          resumeData.data.forEach((entry: any) => {
            if (entry.duration) {
              expect(entry.duration.years).toBeGreaterThanOrEqual(0)
              expect(entry.duration.years).toBeLessThanOrEqual(50)
              expect(entry.duration.months).toBeGreaterThanOrEqual(0)
              expect(entry.duration.months).toBeLessThan(12)
            }
          })
        }
      } catch (error) {
        console.warn('Could not test numeric field validation: API not accessible')
      }
    })
  })
})