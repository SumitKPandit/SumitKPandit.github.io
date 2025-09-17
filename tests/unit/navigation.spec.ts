import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NavigationBuilder } from '../../utils/navigation/builder'
import { 
  validateNavigationHierarchy,
  detectCircularReferences,
  resolveNavigationPaths
} from '../../utils/navigation/validation'
import type {
  NavigationItem,
  NavigationHierarchy,
  NavigationContext
} from '../../utils/navigation/types'

// Mock navigation data for testing
const mockNavigationItems: NavigationItem[] = [
  {
    id: 'home',
    title: 'Home',
    path: '/',
    type: 'page',
    order: 0,
    visible: true,
    parent: null
  },
  {
    id: 'about',
    title: 'About',
    path: '/about',
    type: 'page',
    order: 1,
    visible: true,
    parent: null
  },
  {
    id: 'blog',
    title: 'Blog',
    path: '/blog',
    type: 'collection',
    order: 2,
    visible: true,
    parent: null
  },
  {
    id: 'blog-article-1',
    title: 'First Article',
    path: '/blog/first-article',
    type: 'content',
    order: 0,
    visible: true,
    parent: 'blog'
  },
  {
    id: 'portfolio',
    title: 'Portfolio',
    path: '/portfolio',
    type: 'collection',
    order: 3,
    visible: true,
    parent: null
  },
  {
    id: 'contact',
    title: 'Contact',
    path: '/contact',
    type: 'page',
    order: 4,
    visible: true,
    parent: null
  }
]

describe('Navigation Edge Cases', () => {
  let navigationBuilder: NavigationBuilder
  let mockContext: NavigationContext

  beforeEach(() => {
    mockContext = {
      baseUrl: 'https://example.com',
      currentPath: '/',
      userRole: 'visitor',
      locale: 'en'
    }
    navigationBuilder = new NavigationBuilder(mockContext)
  })

  describe('NavigationBuilder Edge Cases', () => {
    it('should handle empty navigation items gracefully', () => {
      const result = navigationBuilder.build([])
      
      expect(result).toEqual({
        items: [],
        breadcrumbs: [],
        activeItem: null,
        totalItems: 0
      })
    })

    it('should handle navigation items with missing required fields', () => {
      const invalidItems = [
        {
          id: 'invalid-1',
          // Missing title
          path: '/invalid',
          type: 'page',
          order: 0,
          visible: true,
          parent: null
        },
        {
          // Missing id
          title: 'Invalid Item',
          path: '/invalid-2',
          type: 'page',
          order: 1,
          visible: true,
          parent: null
        }
      ] as NavigationItem[]

      const result = navigationBuilder.build(invalidItems)
      
      // Should filter out invalid items
      expect(result.items).toHaveLength(0)
      expect(result.totalItems).toBe(0)
    })

    it('should handle navigation items with invalid paths', () => {
      const itemsWithInvalidPaths: NavigationItem[] = [
        {
          id: 'valid',
          title: 'Valid Item',
          path: '/valid',
          type: 'page',
          order: 0,
          visible: true,
          parent: null
        },
        {
          id: 'invalid-path-1',
          title: 'Invalid Path 1',
          path: 'invalid-path', // Missing leading slash
          type: 'page',
          order: 1,
          visible: true,
          parent: null
        },
        {
          id: 'invalid-path-2',
          title: 'Invalid Path 2',
          path: '', // Empty path
          type: 'page',
          order: 2,
          visible: true,
          parent: null
        }
      ]

      const result = navigationBuilder.build(itemsWithInvalidPaths)
      
      // Should only include valid items
      expect(result.items).toHaveLength(1)
      expect(result.items[0].id).toBe('valid')
    })

    it('should handle orphaned navigation items (parent not found)', () => {
      const itemsWithOrphans: NavigationItem[] = [
        {
          id: 'parent',
          title: 'Parent',
          path: '/parent',
          type: 'collection',
          order: 0,
          visible: true,
          parent: null
        },
        {
          id: 'orphan',
          title: 'Orphaned Item',
          path: '/orphan',
          type: 'content',
          order: 0,
          visible: true,
          parent: 'nonexistent-parent' // Parent doesn't exist
        }
      ]

      const result = navigationBuilder.build(itemsWithOrphans)
      
      // Orphaned items should be treated as root items or filtered out
      expect(result.items).toHaveLength(1)
      expect(result.items[0].id).toBe('parent')
    })

    it('should handle deeply nested navigation structures', () => {
      const deeplyNestedItems: NavigationItem[] = [
        {
          id: 'level-0',
          title: 'Level 0',
          path: '/level-0',
          type: 'collection',
          order: 0,
          visible: true,
          parent: null
        },
        {
          id: 'level-1',
          title: 'Level 1',
          path: '/level-0/level-1',
          type: 'collection',
          order: 0,
          visible: true,
          parent: 'level-0'
        },
        {
          id: 'level-2',
          title: 'Level 2',
          path: '/level-0/level-1/level-2',
          type: 'collection',
          order: 0,
          visible: true,
          parent: 'level-1'
        },
        {
          id: 'level-3',
          title: 'Level 3',
          path: '/level-0/level-1/level-2/level-3',
          type: 'content',
          order: 0,
          visible: true,
          parent: 'level-2'
        }
      ]

      const result = navigationBuilder.build(deeplyNestedItems)
      
      expect(result.items).toHaveLength(1) // Only root level
      expect(result.items[0].children).toHaveLength(1)
      expect(result.items[0].children![0].children).toHaveLength(1)
      expect(result.items[0].children![0].children![0].children).toHaveLength(1)
    })

    it('should handle maximum nesting depth limits', () => {
      const maxDepth = 5
      const veryDeepItems: NavigationItem[] = []
      
      // Create items with excessive nesting
      for (let i = 0; i <= maxDepth + 2; i++) {
        veryDeepItems.push({
          id: `level-${i}`,
          title: `Level ${i}`,
          path: `/level-${i}`,
          type: i === maxDepth + 2 ? 'content' : 'collection',
          order: 0,
          visible: true,
          parent: i === 0 ? null : `level-${i - 1}`
        })
      }

      const result = navigationBuilder.build(veryDeepItems)
      
      // Should respect maximum depth limits
      const countDepth = (item: NavigationItem, depth = 0): number => {
        if (!item.children || item.children.length === 0) return depth
        return Math.max(...item.children.map((child: NavigationItem) => countDepth(child, depth + 1)))
      }

      const actualMaxDepth = Math.max(...result.items.map((item: NavigationItem) => countDepth(item)))
      expect(actualMaxDepth).toBeLessThanOrEqual(maxDepth)
    })
  })

  describe('Circular Reference Detection', () => {
    it('should detect simple circular references', () => {
      const itemsWithCircularRef: NavigationItem[] = [
        {
          id: 'item-a',
          title: 'Item A',
          path: '/item-a',
          type: 'collection',
          order: 0,
          visible: true,
          parent: 'item-b' // Points to B
        },
        {
          id: 'item-b',
          title: 'Item B',
          path: '/item-b',
          type: 'collection',
          order: 1,
          visible: true,
          parent: 'item-a' // Points to A - circular!
        }
      ]

      const circularRefs = detectCircularReferences(itemsWithCircularRef)
      
      expect(circularRefs).toHaveLength(1)
      expect(circularRefs[0]).toMatchObject({
        type: 'circular_reference',
        items: expect.arrayContaining(['item-a', 'item-b'])
      })
    })

    it('should detect complex circular references', () => {
      const itemsWithComplexCircular: NavigationItem[] = [
        {
          id: 'item-a',
          title: 'Item A',
          path: '/item-a',
          type: 'collection',
          order: 0,
          visible: true,
          parent: null
        },
        {
          id: 'item-b',
          title: 'Item B',
          path: '/item-b',
          type: 'collection',
          order: 1,
          visible: true,
          parent: 'item-a'
        },
        {
          id: 'item-c',
          title: 'Item C',
          path: '/item-c',
          type: 'collection',
          order: 2,
          visible: true,
          parent: 'item-b'
        },
        {
          id: 'item-d',
          title: 'Item D',
          path: '/item-d',
          type: 'content',
          order: 0,
          visible: true,
          parent: 'item-c'
        },
        {
          id: 'item-e',
          title: 'Item E',
          path: '/item-e',
          type: 'content',
          order: 1,
          visible: true,
          parent: 'item-a' // This creates A -> B -> C -> D, and A -> E (no circular)
        },
        {
          id: 'item-f',
          title: 'Item F',
          path: '/item-f',
          type: 'collection',
          order: 2,
          visible: true,
          parent: 'item-d'
        }
      ]

      // Make item-a point to item-f to create A -> B -> C -> D -> F -> A
      itemsWithComplexCircular[0].parent = 'item-f'

      const circularRefs = detectCircularReferences(itemsWithComplexCircular)
      
      expect(circularRefs).toHaveLength(1)
      expect(circularRefs[0].items).toContain('item-a')
      expect(circularRefs[0].items).toContain('item-f')
    })

    it('should handle self-referencing items', () => {
      const selfReferencingItems: NavigationItem[] = [
        {
          id: 'self-ref',
          title: 'Self Reference',
          path: '/self-ref',
          type: 'page',
          order: 0,
          visible: true,
          parent: 'self-ref' // Points to itself
        }
      ]

      const circularRefs = detectCircularReferences(selfReferencingItems)
      
      expect(circularRefs).toHaveLength(1)
      expect(circularRefs[0]).toMatchObject({
        type: 'self_reference',
        items: ['self-ref']
      })
    })
  })

  describe('Navigation Hierarchy Validation', () => {
    it('should validate correct hierarchy structure', () => {
      const validationResult = validateNavigationHierarchy(mockNavigationItems)
      
      expect(validationResult.valid).toBe(true)
      expect(validationResult.errors).toHaveLength(0)
    })

    it('should detect invalid parent-child relationships', () => {
      const invalidHierarchy: NavigationItem[] = [
        {
          id: 'content-item',
          title: 'Content Item',
          path: '/content',
          type: 'content',
          order: 0,
          visible: true,
          parent: null
        },
        {
          id: 'child-of-content',
          title: 'Child of Content',
          path: '/content/child',
          type: 'page',
          order: 0,
          visible: true,
          parent: 'content-item' // Content items shouldn't have children
        }
      ]

      const validationResult = validateNavigationHierarchy(invalidHierarchy)
      
      expect(validationResult.valid).toBe(false)
      expect(validationResult.errors).toContainEqual(
        expect.objectContaining({
          type: 'invalid_parent_child',
          message: expect.stringContaining('Content items cannot have children')
        })
      )
    })

    it('should detect duplicate navigation IDs', () => {
      const itemsWithDuplicateIds: NavigationItem[] = [
        {
          id: 'duplicate',
          title: 'First Item',
          path: '/first',
          type: 'page',
          order: 0,
          visible: true,
          parent: null
        },
        {
          id: 'duplicate', // Same ID
          title: 'Second Item',
          path: '/second',
          type: 'page',
          order: 1,
          visible: true,
          parent: null
        }
      ]

      const validationResult = validateNavigationHierarchy(itemsWithDuplicateIds)
      
      expect(validationResult.valid).toBe(false)
      expect(validationResult.errors).toContainEqual(
        expect.objectContaining({
          type: 'duplicate_id',
          message: expect.stringContaining('duplicate')
        })
      )
    })

    it('should detect duplicate navigation paths', () => {
      const itemsWithDuplicatePaths: NavigationItem[] = [
        {
          id: 'item-1',
          title: 'First Item',
          path: '/same-path',
          type: 'page',
          order: 0,
          visible: true,
          parent: null
        },
        {
          id: 'item-2',
          title: 'Second Item',
          path: '/same-path', // Same path
          type: 'page',
          order: 1,
          visible: true,
          parent: null
        }
      ]

      const validationResult = validateNavigationHierarchy(itemsWithDuplicatePaths)
      
      expect(validationResult.valid).toBe(false)
      expect(validationResult.errors).toContainEqual(
        expect.objectContaining({
          type: 'duplicate_path',
          message: expect.stringContaining('/same-path')
        })
      )
    })
  })

  describe('Dynamic Navigation Updates', () => {
    it('should handle adding new navigation items', () => {
      const initialResult = navigationBuilder.build(mockNavigationItems)
      
      const newItem: NavigationItem = {
        id: 'new-item',
        title: 'New Item',
        path: '/new-item',
        type: 'page',
        order: 5,
        visible: true,
        parent: null
      }

      const updatedItems = [...mockNavigationItems, newItem]
      const updatedResult = navigationBuilder.build(updatedItems)
      
      expect(updatedResult.totalItems).toBe(initialResult.totalItems + 1)
      expect(updatedResult.items.find((item: NavigationItem) => item.id === 'new-item')).toBeDefined()
    })

    it('should handle removing navigation items', () => {
      const itemsWithoutBlog = mockNavigationItems.filter(item => 
        item.id !== 'blog' && item.parent !== 'blog'
      )
      
      const result = navigationBuilder.build(itemsWithoutBlog)
      
      expect(result.items.find((item: NavigationItem) => item.id === 'blog')).toBeUndefined()
      expect(result.items.find((item: NavigationItem) => item.id === 'blog-article-1')).toBeUndefined()
    })

    it('should handle updating navigation item properties', () => {
      const updatedItems = mockNavigationItems.map(item => 
        item.id === 'about' 
          ? { ...item, title: 'About Us', path: '/about-us' }
          : item
      )
      
      const result = navigationBuilder.build(updatedItems)
      const aboutItem = result.items.find((item: NavigationItem) => item.id === 'about')
      
      expect(aboutItem?.title).toBe('About Us')
      expect(aboutItem?.path).toBe('/about-us')
    })

    it('should handle reordering navigation items', () => {
      const reorderedItems = mockNavigationItems.map(item => ({
        ...item,
        order: item.id === 'contact' ? -1 : 
               item.id === 'home' ? 10 : 
               item.order
      }))
      
      const result = navigationBuilder.build(reorderedItems)
      
      // Contact should be first, home should be last
      expect(result.items[0].id).toBe('contact')
      expect(result.items[result.items.length - 1].id).toBe('home')
    })
  })

  describe('Navigation Path Resolution', () => {
    it('should resolve simple navigation paths', () => {
      const paths = resolveNavigationPaths(mockNavigationItems)
      
      expect(paths).toEqual(
        expect.objectContaining({
          '/': 'home',
          '/about': 'about',
          '/blog': 'blog',
          '/blog/first-article': 'blog-article-1',
          '/portfolio': 'portfolio',
          '/contact': 'contact'
        })
      )
    })

    it('should handle path conflicts', () => {
      const itemsWithConflicts: NavigationItem[] = [
        {
          id: 'item-1',
          title: 'Item 1',
          path: '/conflict',
          type: 'page',
          order: 0,
          visible: true,
          parent: null
        },
        {
          id: 'item-2',
          title: 'Item 2',
          path: '/conflict', // Same path
          type: 'page',
          order: 1,
          visible: true,
          parent: null
        }
      ]

      const paths = resolveNavigationPaths(itemsWithConflicts)
      
      // Should only resolve to the first item (by order)
      expect(paths['/conflict']).toBe('item-1')
    })

    it('should handle normalized path resolution', () => {
      const itemsWithVariedPaths: NavigationItem[] = [
        {
          id: 'normal',
          title: 'Normal',
          path: '/normal',
          type: 'page',
          order: 0,
          visible: true,
          parent: null
        },
        {
          id: 'trailing-slash',
          title: 'Trailing Slash',
          path: '/trailing-slash/',
          type: 'page',
          order: 1,
          visible: true,
          parent: null
        },
        {
          id: 'query-params',
          title: 'Query Params',
          path: '/query?param=value',
          type: 'page',
          order: 2,
          visible: true,
          parent: null
        }
      ]

      const paths = resolveNavigationPaths(itemsWithVariedPaths)
      
      expect(paths['/normal']).toBe('normal')
      expect(paths['/trailing-slash']).toBe('trailing-slash') // Normalized
      expect(paths['/query']).toBe('query-params') // Query stripped
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle malformed navigation data gracefully', () => {
      const malformedData = [
        null,
        undefined,
        { id: 'incomplete' }, // Missing required fields
        'invalid-string',
        123,
        { id: 'valid', title: 'Valid', path: '/valid', type: 'page', order: 0, visible: true, parent: null }
      ] as any[]

      const result = navigationBuilder.build(malformedData)
      
      // Should only process valid items
      expect(result.items).toHaveLength(1)
      expect(result.items[0].id).toBe('valid')
    })

    it('should provide detailed error information', () => {
      const itemsWithErrors: NavigationItem[] = [
        {
          id: 'error-item',
          title: 'Error Item',
          path: '/error',
          type: 'invalid-type' as any, // Invalid type
          order: -1, // Invalid order
          visible: true,
          parent: 'nonexistent'
        }
      ]

      const validationResult = validateNavigationHierarchy(itemsWithErrors)
      
      expect(validationResult.valid).toBe(false)
      expect(validationResult.errors.length).toBeGreaterThan(0)
      expect(validationResult.errors[0]).toHaveProperty('itemId', 'error-item')
      expect(validationResult.errors[0]).toHaveProperty('message')
    })

    it('should handle missing navigation context gracefully', () => {
      const builderWithoutContext = new NavigationBuilder(null as any)
      const result = builderWithoutContext.build(mockNavigationItems)
      
      // Should still work with default values
      expect(result.items).toBeDefined()
      expect(result.breadcrumbs).toBeDefined()
    })
  })

  describe('Performance with Large Navigation Structures', () => {
    it('should handle large navigation structures efficiently', () => {
      const largeNavigationSet: NavigationItem[] = []
      
      // Generate 1000 navigation items
      for (let i = 0; i < 1000; i++) {
        largeNavigationSet.push({
          id: `item-${i}`,
          title: `Item ${i}`,
          path: `/item-${i}`,
          type: i % 10 === 0 ? 'collection' : 'content',
          order: i,
          visible: true,
          parent: i % 10 === 0 ? null : `item-${Math.floor(i / 10) * 10}`
        })
      }

      const startTime = performance.now()
      const result = navigationBuilder.build(largeNavigationSet)
      const endTime = performance.now()

      // Should complete within reasonable time (< 100ms)
      expect(endTime - startTime).toBeLessThan(100)
      expect(result.totalItems).toBe(1000)
    })

    it('should handle memory efficiently with large datasets', () => {
      const initialMemory = process.memoryUsage().heapUsed

      // Create very large navigation structure
      const veryLargeNavigationSet: NavigationItem[] = []
      for (let i = 0; i < 5000; i++) {
        veryLargeNavigationSet.push({
          id: `large-item-${i}`,
          title: `Large Item ${i}`,
          path: `/large-item-${i}`,
          type: 'content',
          order: i,
          visible: true,
          parent: null,
          metadata: {
            description: `Description for item ${i}`.repeat(10),
            tags: Array(5).fill(`tag-${i}`)
          }
        })
      }

      const result = navigationBuilder.build(veryLargeNavigationSet)
      const finalMemory = process.memoryUsage().heapUsed

      // Memory increase should be reasonable (< 50MB)
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024
      expect(memoryIncrease).toBeLessThan(50)
      expect(result.totalItems).toBe(5000)
    })
  })
})