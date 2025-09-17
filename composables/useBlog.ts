// Blog content integration composable

export interface BlogContent {
  title: string
  slug: string
  description: string
  publishDate: string
  updatedDate?: string
  persona: string
  category: string
  series?: string
  seriesOrder?: number
  tags: string[]
  excerpt: string
  featured: boolean
  draft: boolean
  readingTime: number
  author: string
  image?: string
  imageAlt?: string
  relatedArticles: string[]
  externalLinks: Array<{
    title: string
    url: string
    description?: string
  }>
  url?: string
  publishYear?: number
  publishMonth?: string
  _path?: string
  _id?: string
  body?: any
}

export interface BlogFilters {
  persona?: string
  category?: string
  series?: string
  tags?: string[]
  featured?: boolean
  year?: number
  month?: string
  limit?: number
  offset?: number
  sortBy?: 'publishDate' | 'updatedDate' | 'title' | 'readingTime'
  sortOrder?: 'asc' | 'desc'
}

export interface BlogStats {
  total: number
  featured: number
  draft: number
  categories: string[]
  tags: string[]
  series: string[]
  personas: string[]
  years: number[]
  months: string[]
  averageReadingTime: number
}

export const useBlog = () => {
  
  const getBlogArticles = async (filters: BlogFilters = {}): Promise<BlogContent[]> => {
    try {
      const response = await fetch('/api/blog')
      const data = await response.json()
      
      if (data.success) {
        let articles = data.data as BlogContent[]
        
        // Apply filters
        if (filters.persona) {
          articles = articles.filter(article => article.persona === filters.persona)
        }
        
        if (filters.category) {
          articles = articles.filter(article => article.category === filters.category)
        }
        
        if (filters.series) {
          articles = articles.filter(article => article.series === filters.series)
        }
        
        if (filters.tags && filters.tags.length > 0) {
          articles = articles.filter(article => 
            filters.tags!.some(tag => article.tags.includes(tag))
          )
        }
        
        if (filters.featured !== undefined) {
          articles = articles.filter(article => article.featured === filters.featured)
        }
        
        if (filters.year) {
          articles = articles.filter(article => 
            new Date(article.publishDate).getFullYear() === filters.year
          )
        }
        
        if (filters.month) {
          articles = articles.filter(article => 
            new Date(article.publishDate).toLocaleString('default', { month: 'long' }) === filters.month
          )
        }
        
        // Sort articles
        const sortBy = filters.sortBy || 'publishDate'
        const sortOrder = filters.sortOrder || 'desc'
        
        articles.sort((a, b) => {
          let aValue: any = a[sortBy]
          let bValue: any = b[sortBy]
          
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
          articles = articles.slice(filters.offset)
        }
        
        if (filters.limit) {
          articles = articles.slice(0, filters.limit)
        }
        
        return articles
      }
      
      return []
    } catch (error) {
      console.error('Failed to fetch blog articles:', error)
      return []
    }
  }

  const getBlogArticle = async (slug: string): Promise<BlogContent | null> => {
    try {
      const articles = await getBlogArticles()
      return articles.find(article => article.slug === slug) || null
    } catch (error) {
      console.error(`Failed to fetch blog article ${slug}:`, error)
      return null
    }
  }

  const getFeaturedArticles = async (limit?: number): Promise<BlogContent[]> => {
    return await getBlogArticles({ 
      featured: true, 
      limit: limit || 3,
      sortBy: 'publishDate',
      sortOrder: 'desc'
    })
  }

  const getArticlesByPersona = async (persona: string, limit?: number): Promise<BlogContent[]> => {
    return await getBlogArticles({ 
      persona, 
      limit: limit || 10,
      sortBy: 'publishDate',
      sortOrder: 'desc'
    })
  }

  const getArticlesByCategory = async (category: string, limit?: number): Promise<BlogContent[]> => {
    return await getBlogArticles({ 
      category, 
      limit: limit || 10,
      sortBy: 'publishDate',
      sortOrder: 'desc'
    })
  }

  const getArticlesBySeries = async (series: string): Promise<BlogContent[]> => {
    const articles = await getBlogArticles({ 
      series,
      sortBy: 'publishDate',
      sortOrder: 'asc'
    })
    
    // Sort by series order if available
    return articles.sort((a, b) => {
      if (a.seriesOrder && b.seriesOrder) {
        return a.seriesOrder - b.seriesOrder
      }
      return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
    })
  }

  const getRelatedArticles = async (slug: string, limit: number = 3): Promise<BlogContent[]> => {
    try {
      const currentArticle = await getBlogArticle(slug)
      if (!currentArticle) return []
      
      // Get articles with matching tags or same persona
      const articles = await getBlogArticles()
      
      const related = articles
        .filter(article => article.slug !== slug)
        .map(article => {
          let score = 0
          
          // Same persona gets high score
          if (article.persona === currentArticle.persona) {
            score += 10
          }
          
          // Same series gets very high score
          if (article.series && article.series === currentArticle.series) {
            score += 20
          }
          
          // Same category gets medium score
          if (article.category === currentArticle.category) {
            score += 5
          }
          
          // Shared tags get score based on number of matches
          const sharedTags = article.tags.filter(tag => currentArticle.tags.includes(tag))
          score += sharedTags.length * 2
          
          return { article, score }
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.article)
      
      return related
    } catch (error) {
      console.error(`Failed to get related articles for ${slug}:`, error)
      return []
    }
  }

  const getBlogStats = async (): Promise<BlogStats> => {
    try {
      const response = await fetch('/api/blog')
      const data = await response.json()
      
      if (data.success) {
        const articles = data.data as BlogContent[]
        const stats = data.stats as BlogStats
        
        // Calculate average reading time
        const totalReadingTime = articles.reduce((sum, article) => sum + article.readingTime, 0)
        stats.averageReadingTime = Math.round(totalReadingTime / articles.length)
        
        return stats
      }
      
      return {
        total: 0,
        featured: 0,
        draft: 0,
        categories: [],
        tags: [],
        series: [],
        personas: [],
        years: [],
        months: [],
        averageReadingTime: 0
      }
    } catch (error) {
      console.error('Failed to fetch blog stats:', error)
      return {
        total: 0,
        featured: 0,
        draft: 0,
        categories: [],
        tags: [],
        series: [],
        personas: [],
        years: [],
        months: [],
        averageReadingTime: 0
      }
    }
  }

  const searchArticles = async (query: string, limit: number = 10): Promise<BlogContent[]> => {
    try {
      const articles = await getBlogArticles()
      const searchTerm = query.toLowerCase()
      
      const results = articles
        .map(article => {
          let score = 0
          
          // Title matches get highest score
          if (article.title.toLowerCase().includes(searchTerm)) {
            score += 10
          }
          
          // Description matches get high score
          if (article.description.toLowerCase().includes(searchTerm)) {
            score += 5
          }
          
          // Tag matches get medium score
          if (article.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
            score += 3
          }
          
          // Category matches get medium score
          if (article.category.toLowerCase().includes(searchTerm)) {
            score += 3
          }
          
          // Excerpt matches get low score
          if (article.excerpt.toLowerCase().includes(searchTerm)) {
            score += 1
          }
          
          return { article, score }
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.article)
      
      return results
    } catch (error) {
      console.error(`Failed to search articles for "${query}":`, error)
      return []
    }
  }

  return {
    getBlogArticles,
    getBlogArticle,
    getFeaturedArticles,
    getArticlesByPersona,
    getArticlesByCategory,
    getArticlesBySeries,
    getRelatedArticles,
    getBlogStats,
    searchArticles,
  }
}