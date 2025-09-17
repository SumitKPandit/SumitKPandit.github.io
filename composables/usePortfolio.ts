// Portfolio content integration composable

export interface PortfolioCollection {
  title: string
  slug: string
  description: string
  persona: string
  category: string
  tags: string[]
  featured: boolean
  draft: boolean
  createdAt: string
  updatedAt: string
  ordering: number
  coverImage?: string
  coverImageAlt?: string
  items: string[]
  stats: {
    totalItems: number
    featured: number
    categories: string[]
  }
  settings: {
    displayStyle: string
    itemsPerPage: number
    showDescription: boolean
  }
  url?: string
  _path?: string
  _id?: string
  body?: any
}

export interface PortfolioItem {
  title: string
  slug: string
  description: string
  collection: string
  persona: string
  category: string
  subcategory?: string
  tags: string[]
  featured: boolean
  draft: boolean
  publishDate: string
  updatedDate?: string
  createdAt: string
  ordering: number
  images: Array<{
    url: string
    alt: string
    caption?: string
    primary: boolean
  }>
  thumbnail: string
  dimensions: {
    width: number
    height: number
    aspectRatio: string
  }
  technicalDetails: Record<string, any>
  links: Array<{
    title: string
    url: string
    type: string
  }>
  metadata: Record<string, any>
  url?: string
  _path?: string
  _id?: string
  body?: any
}

export interface PortfolioFilters {
  persona?: string
  category?: string
  collection?: string
  tags?: string[]
  featured?: boolean
  limit?: number
  offset?: number
  sortBy?: 'publishDate' | 'updatedDate' | 'title' | 'ordering'
  sortOrder?: 'asc' | 'desc'
}

export interface PortfolioStats {
  collections: {
    total: number
    featured: number
    personas: string[]
    categories: string[]
    tags: string[]
  }
  items: {
    total: number
    featured: number
    collections: string[]
    personas: string[]
    categories: string[]
    tags: string[]
  }
}

export const usePortfolio = () => {
  
  const getPortfolioCollections = async (filters: PortfolioFilters = {}): Promise<PortfolioCollection[]> => {
    try {
      const response = await fetch('/api/portfolio/collections')
      const data = await response.json()
      
      if (data.success) {
        let collections = data.data as PortfolioCollection[]
        
        // Apply filters
        if (filters.persona) {
          collections = collections.filter(collection => collection.persona === filters.persona)
        }
        
        if (filters.category) {
          collections = collections.filter(collection => collection.category === filters.category)
        }
        
        if (filters.tags && filters.tags.length > 0) {
          collections = collections.filter(collection => 
            filters.tags!.some(tag => collection.tags.includes(tag))
          )
        }
        
        if (filters.featured !== undefined) {
          collections = collections.filter(collection => collection.featured === filters.featured)
        }
        
        // Sort collections
        const sortBy = filters.sortBy || 'ordering'
        const sortOrder = filters.sortOrder || 'asc'
        
        collections.sort((a, b) => {
          let aValue: any = a[sortBy as keyof PortfolioCollection]
          let bValue: any = b[sortBy as keyof PortfolioCollection]
          
          if (sortBy === 'publishDate' || sortBy === 'updatedDate') {
            aValue = new Date(aValue).getTime()
            bValue = new Date(bValue).getTime()
          }
          
          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })
        
        // Apply pagination
        if (filters.offset) {
          collections = collections.slice(filters.offset)
        }
        
        if (filters.limit) {
          collections = collections.slice(0, filters.limit)
        }
        
        return collections
      }
      
      return []
    } catch (error) {
      console.error('Failed to fetch portfolio collections:', error)
      return []
    }
  }

  const getPortfolioCollection = async (slug: string): Promise<PortfolioCollection | null> => {
    try {
      const collections = await getPortfolioCollections()
      return collections.find(collection => collection.slug === slug) || null
    } catch (error) {
      console.error(`Failed to fetch portfolio collection ${slug}:`, error)
      return null
    }
  }

  const getPortfolioItems = async (filters: PortfolioFilters = {}): Promise<PortfolioItem[]> => {
    try {
      const response = await fetch('/api/portfolio/items')
      const data = await response.json()
      
      if (data.success) {
        let items = data.data as PortfolioItem[]
        
        // Apply filters
        if (filters.persona) {
          items = items.filter(item => item.persona === filters.persona)
        }
        
        if (filters.category) {
          items = items.filter(item => item.category === filters.category)
        }
        
        if (filters.collection) {
          items = items.filter(item => item.collection === filters.collection)
        }
        
        if (filters.tags && filters.tags.length > 0) {
          items = items.filter(item => 
            filters.tags!.some(tag => item.tags.includes(tag))
          )
        }
        
        if (filters.featured !== undefined) {
          items = items.filter(item => item.featured === filters.featured)
        }
        
        // Sort items
        const sortBy = filters.sortBy || 'ordering'
        const sortOrder = filters.sortOrder || 'asc'
        
        items.sort((a, b) => {
          let aValue: any = a[sortBy as keyof PortfolioItem]
          let bValue: any = b[sortBy as keyof PortfolioItem]
          
          if (sortBy === 'publishDate' || sortBy === 'updatedDate') {
            aValue = new Date(aValue).getTime()
            bValue = new Date(bValue).getTime()
          }
          
          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })
        
        // Apply pagination
        if (filters.offset) {
          items = items.slice(filters.offset)
        }
        
        if (filters.limit) {
          items = items.slice(0, filters.limit)
        }
        
        return items
      }
      
      return []
    } catch (error) {
      console.error('Failed to fetch portfolio items:', error)
      return []
    }
  }

  const getPortfolioItem = async (collectionSlug: string, itemSlug: string): Promise<PortfolioItem | null> => {
    try {
      const items = await getPortfolioItems({ collection: collectionSlug })
      return items.find(item => item.slug === itemSlug) || null
    } catch (error) {
      console.error(`Failed to fetch portfolio item ${collectionSlug}/${itemSlug}:`, error)
      return null
    }
  }

  const getItemsByCollection = async (collectionSlug: string): Promise<PortfolioItem[]> => {
    return await getPortfolioItems({ 
      collection: collectionSlug,
      sortBy: 'ordering',
      sortOrder: 'asc'
    })
  }

  const getFeaturedItems = async (limit?: number): Promise<PortfolioItem[]> => {
    return await getPortfolioItems({ 
      featured: true, 
      limit: limit || 6,
      sortBy: 'publishDate',
      sortOrder: 'desc'
    })
  }

  const getItemsByPersona = async (persona: string, limit?: number): Promise<PortfolioItem[]> => {
    return await getPortfolioItems({ 
      persona, 
      limit: limit || 12,
      sortBy: 'publishDate',
      sortOrder: 'desc'
    })
  }

  const getItemsByCategory = async (category: string, limit?: number): Promise<PortfolioItem[]> => {
    return await getPortfolioItems({ 
      category, 
      limit: limit || 12,
      sortBy: 'publishDate',
      sortOrder: 'desc'
    })
  }

  const getRelatedItems = async (collectionSlug: string, itemSlug: string, limit: number = 4): Promise<PortfolioItem[]> => {
    try {
      const currentItem = await getPortfolioItem(collectionSlug, itemSlug)
      if (!currentItem) return []
      
      const items = await getPortfolioItems()
      
      const related = items
        .filter(item => item.slug !== itemSlug)
        .map(item => {
          let score = 0
          
          // Same collection gets high score
          if (item.collection === currentItem.collection) {
            score += 10
          }
          
          // Same persona gets high score
          if (item.persona === currentItem.persona) {
            score += 8
          }
          
          // Same category gets medium score
          if (item.category === currentItem.category) {
            score += 5
          }
          
          // Shared tags get score based on number of matches
          const sharedTags = item.tags.filter(tag => currentItem.tags.includes(tag))
          score += sharedTags.length * 2
          
          return { item, score }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.item)
      
      return related
    } catch (error) {
      console.error(`Failed to get related items for ${collectionSlug}/${itemSlug}:`, error)
      return []
    }
  }

  const getPortfolioStats = async (): Promise<PortfolioStats> => {
    try {
      const [collectionsResponse, itemsResponse] = await Promise.all([
        fetch('/api/portfolio/collections'),
        fetch('/api/portfolio/items')
      ])
      
      const collectionsData = await collectionsResponse.json()
      const itemsData = await itemsResponse.json()
      
      if (collectionsData.success && itemsData.success) {
        return {
          collections: collectionsData.stats,
          items: itemsData.stats
        }
      }
      
      return {
        collections: {
          total: 0,
          featured: 0,
          personas: [],
          categories: [],
          tags: []
        },
        items: {
          total: 0,
          featured: 0,
          collections: [],
          personas: [],
          categories: [],
          tags: []
        }
      }
    } catch (error) {
      console.error('Failed to fetch portfolio stats:', error)
      return {
        collections: {
          total: 0,
          featured: 0,
          personas: [],
          categories: [],
          tags: []
        },
        items: {
          total: 0,
          featured: 0,
          collections: [],
          personas: [],
          categories: [],
          tags: []
        }
      }
    }
  }

  const searchPortfolio = async (query: string, limit: number = 10): Promise<{
    collections: PortfolioCollection[]
    items: PortfolioItem[]
  }> => {
    try {
      const [collections, items] = await Promise.all([
        getPortfolioCollections(),
        getPortfolioItems()
      ])
      
      const searchTerm = query.toLowerCase()
      
      const filteredCollections = collections
        .map(collection => {
          let score = 0
          
          if (collection.title.toLowerCase().includes(searchTerm)) score += 10
          if (collection.description.toLowerCase().includes(searchTerm)) score += 5
          if (collection.tags.some(tag => tag.toLowerCase().includes(searchTerm))) score += 3
          if (collection.category.toLowerCase().includes(searchTerm)) score += 3
          
          return { collection, score }
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.ceil(limit / 2))
        .map(item => item.collection)
      
      const filteredItems = items
        .map(item => {
          let score = 0
          
          if (item.title.toLowerCase().includes(searchTerm)) score += 10
          if (item.description.toLowerCase().includes(searchTerm)) score += 5
          if (item.tags.some(tag => tag.toLowerCase().includes(searchTerm))) score += 3
          if (item.category.toLowerCase().includes(searchTerm)) score += 3
          
          return { item, score }
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, Math.floor(limit / 2))
        .map(item => item.item)
      
      return {
        collections: filteredCollections,
        items: filteredItems
      }
    } catch (error) {
      console.error(`Failed to search portfolio for "${query}":`, error)
      return {
        collections: [],
        items: []
      }
    }
  }

  return {
    getPortfolioCollections,
    getPortfolioCollection,
    getPortfolioItems,
    getPortfolioItem,
    getItemsByCollection,
    getFeaturedItems,
    getItemsByPersona,
    getItemsByCategory,
    getRelatedItems,
    getPortfolioStats,
    searchPortfolio,
  }
}