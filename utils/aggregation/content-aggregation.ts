import type { 
  BlogArticle, 
  PortfolioItem, 
  PortfolioCollection, 
  ResumeEntry, 
  Skill, 
  Persona 
} from '../validation/content-schemas'

// Generic content collection interface
export interface ContentCollection<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  filters: Record<string, any>
  sort: SortConfig
}

// Sorting configuration
export interface SortConfig {
  field: string
  direction: 'asc' | 'desc'
}

// Filtering configuration
export interface FilterConfig {
  [key: string]: any
}

// Pagination configuration
export interface PaginationConfig {
  page: number
  limit: number
  offset?: number
}

// Content aggregation base class
export abstract class ContentAggregator<T> {
  public items: T[]
  
  constructor(items: T[]) {
    this.items = items.filter((item: any) => !('draft' in item) || !item.draft)
  }
  
  // Abstract methods to be implemented by subclasses
  abstract getDefaultSort(): SortConfig
  abstract applyFilters(items: T[], filters: FilterConfig): T[]
  abstract getSortableFields(): string[]
  
  // Generic sorting method
  protected sortItems(items: T[], sort: SortConfig): T[] {
    const { field, direction } = sort
    
    return [...items].sort((a, b) => {
      const aValue = this.getNestedValue(a as any, field)
      const bValue = this.getNestedValue(b as any, field)
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1
      
      // Handle different data types
      let comparison = 0
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue)
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime()
      } else {
        // Fallback to string comparison
        comparison = String(aValue).localeCompare(String(bValue))
      }
      
      return direction === 'desc' ? -comparison : comparison
    })
  }
  
  // Helper to get nested object values
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }
  
  // Generic pagination method
  protected paginateItems(items: T[], pagination: PaginationConfig): {
    items: T[]
    hasMore: boolean
    total: number
  } {
    const { page, limit } = pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    const paginatedItems = items.slice(startIndex, endIndex)
    const hasMore = endIndex < items.length
    
    return {
      items: paginatedItems,
      hasMore,
      total: items.length
    }
  }
  
  // Main aggregation method
  aggregate(
    filters: FilterConfig = {},
    sort?: SortConfig,
    pagination: PaginationConfig = { page: 1, limit: 10 }
  ): ContentCollection<T> {
    // Apply filters
    let filteredItems = this.applyFilters(this.items, filters)
    
    // Apply sorting
    const sortConfig = sort || this.getDefaultSort()
    const sortedItems = this.sortItems(filteredItems, sortConfig)
    
    // Apply pagination
    const { items, hasMore, total } = this.paginateItems(sortedItems, pagination)
    
    return {
      items,
      total,
      page: pagination.page,
      limit: pagination.limit,
      hasMore,
      filters,
      sort: sortConfig
    }
  }
}

// Blog content aggregator
export class BlogAggregator extends ContentAggregator<BlogArticle> {
  getDefaultSort(): SortConfig {
    return { field: 'publishedAt', direction: 'desc' }
  }
  
  getSortableFields(): string[] {
    return ['publishedAt', 'createdAt', 'title', 'readingTime']
  }
  
  applyFilters(items: BlogArticle[], filters: FilterConfig): BlogArticle[] {
    let filtered = [...items]
    
    // Filter by persona
    if (filters.persona) {
      filtered = filtered.filter(item => item.persona === filters.persona)
    }
    
    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category)
    }
    
    // Filter by tags
    if (filters.tags && Array.isArray(filters.tags)) {
      filtered = filtered.filter(item => 
        filters.tags.some((tag: string) => item.tags?.includes(tag))
      )
    }
    
    // Filter by series
    if (filters.series) {
      filtered = filtered.filter(item => item.series?.name === filters.series)
    }
    
    // Filter by featured status
    if (filters.featured !== undefined) {
      filtered = filtered.filter(item => item.featured === filters.featured)
    }
    
    // Filter by date range
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.publishedAt || item.createdAt)
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null
        
        if (fromDate && itemDate < fromDate) return false
        if (toDate && itemDate > toDate) return false
        return true
      })
    }
    
    // Text search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.excerpt?.toLowerCase().includes(searchTerm)
      )
    }
    
    return filtered
  }
  
  // Get unique categories
  getCategories(): string[] {
    const categories = this.items
      .map(item => item.category)
      .filter((category): category is string => !!category)
    
    return [...new Set(categories)].sort()
  }
  
  // Get unique tags
  getTags(): string[] {
    const tags = this.items
      .flatMap(item => item.tags || [])
    
    return [...new Set(tags)].sort()
  }
  
  // Get article series
  getSeries(): Array<{ name: string; count: number; articles: BlogArticle[] }> {
    const seriesMap = new Map<string, BlogArticle[]>()
    
    this.items
      .filter(item => item.series)
      .forEach(item => {
        const seriesName = item.series!.name
        if (!seriesMap.has(seriesName)) {
          seriesMap.set(seriesName, [])
        }
        seriesMap.get(seriesName)!.push(item)
      })
    
    return Array.from(seriesMap.entries()).map(([name, articles]) => ({
      name,
      count: articles.length,
      articles: articles.sort((a, b) => a.series!.part - b.series!.part)
    }))
  }
  
  // Get related articles
  getRelatedArticles(article: BlogArticle, limit: number = 3): BlogArticle[] {
    const related = this.items
      .filter(item => item.slug !== article.slug)
      .map(item => ({
        article: item,
        score: this.calculateRelatednessScore(article, item)
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ article }) => article)
    
    return related
  }
  
  private calculateRelatednessScore(article1: BlogArticle, article2: BlogArticle): number {
    let score = 0
    
    // Same category
    if (article1.category && article1.category === article2.category) {
      score += 3
    }
    
    // Same persona
    if (article1.persona === article2.persona) {
      score += 2
    }
    
    // Common tags
    const commonTags = (article1.tags || []).filter((tag: string) => 
      (article2.tags || []).includes(tag)
    )
    score += commonTags.length
    
    // Same series
    if (article1.series && article2.series && article1.series.name === article2.series.name) {
      score += 5 // High weight for series articles
    }
    
    return score
  }
}

// Portfolio content aggregator
export class PortfolioAggregator extends ContentAggregator<PortfolioItem> {
  private collections: PortfolioCollection[]
  
  constructor(items: PortfolioItem[], collections: PortfolioCollection[]) {
    super(items)
    this.collections = collections.filter(c => !c.draft)
  }
  
  getDefaultSort(): SortConfig {
    return { field: 'sortOrder', direction: 'asc' }
  }
  
  getSortableFields(): string[] {
    return ['sortOrder', 'createdAt', 'title']
  }
  
  applyFilters(items: PortfolioItem[], filters: FilterConfig): PortfolioItem[] {
    let filtered = [...items]
    
    // Filter by collection
    if (filters.collection) {
      filtered = filtered.filter(item => item.collection === filters.collection)
    }
    
    // Filter by persona
    if (filters.persona) {
      filtered = filtered.filter(item => item.persona === filters.persona)
    }
    
    // Filter by tags
    if (filters.tags && Array.isArray(filters.tags)) {
      filtered = filtered.filter(item => 
        filters.tags.some((tag: string) => item.tags?.includes(tag))
      )
    }
    
    // Filter by featured status
    if (filters.featured !== undefined) {
      filtered = filtered.filter(item => item.featured === filters.featured)
    }
    
    // Text search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
      )
    }
    
    return filtered
  }
  
  // Get collections with item counts
  getCollectionsWithCounts(): Array<PortfolioCollection & { actualItemCount: number }> {
    return this.collections.map(collection => ({
      ...collection,
      actualItemCount: this.items.filter(item => item.collection === collection.key).length
    }))
  }
  
  // Get items by collection
  getItemsByCollection(collectionKey: string): PortfolioItem[] {
    return this.items
      .filter(item => item.collection === collectionKey)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }
}

// Resume content aggregator
export class ResumeAggregator extends ContentAggregator<ResumeEntry> {
  getDefaultSort(): SortConfig {
    return { field: 'startDate', direction: 'desc' }
  }
  
  getSortableFields(): string[] {
    return ['startDate', 'endDate', 'company', 'position']
  }
  
  applyFilters(items: ResumeEntry[], filters: FilterConfig): ResumeEntry[] {
    let filtered = [...items]
    
    // Filter by persona
    if (filters.persona) {
      filtered = filtered.filter(item => item.persona === filters.persona)
    }
    
    // Filter by employment type
    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type)
    }
    
    // Filter by skills
    if (filters.skills && Array.isArray(filters.skills)) {
      filtered = filtered.filter(item => 
        filters.skills.some((skill: string) => 
          item.skills?.includes(skill) || item.technologies?.includes(skill)
        )
      )
    }
    
    // Filter by current positions
    if (filters.current !== undefined) {
      filtered = filtered.filter(item => item.current === filters.current)
    }
    
    // Filter by remote work
    if (filters.remote !== undefined) {
      filtered = filtered.filter(item => item.remote === filters.remote)
    }
    
    // Text search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(item =>
        item.position.toLowerCase().includes(searchTerm) ||
        item.company.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.achievements?.some((a: string) => a.toLowerCase().includes(searchTerm)) ||
        item.responsibilities?.some((r: string) => r.toLowerCase().includes(searchTerm))
      )
    }
    
    return filtered
  }
  
  // Get unique employment types
  getEmploymentTypes(): string[] {
    const types = this.items.map(item => item.type)
    return [...new Set(types)].sort()
  }
  
  // Get unique companies
  getCompanies(): string[] {
    const companies = this.items.map(item => item.company)
    return [...new Set(companies)].sort()
  }
  
  // Group entries by type
  groupByType(): Record<string, ResumeEntry[]> {
    const grouped: Record<string, ResumeEntry[]> = {}
    
    for (const item of this.items) {
      const type = item.type
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(item)
    }
    
    // Sort each group by start date descending
    for (const type in grouped) {
      grouped[type].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    }
    
    return grouped
  }
}

// Skill content aggregator
export class SkillAggregator extends ContentAggregator<Skill> {
  getDefaultSort(): SortConfig {
    return { field: 'category', direction: 'asc' }
  }
  
  getSortableFields(): string[] {
    return ['category', 'name', 'proficiency', 'yearsExperience']
  }
  
  applyFilters(items: Skill[], filters: FilterConfig): Skill[] {
    let filtered = [...items]
    
    // Filter by persona
    if (filters.persona) {
      filtered = filtered.filter(item => item.persona === filters.persona)
    }
    
    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category)
    }
    
    // Filter by proficiency
    if (filters.proficiency) {
      filtered = filtered.filter(item => item.proficiency === filters.proficiency)
    }
    
    // Filter by minimum years of experience
    if (filters.minYears !== undefined) {
      filtered = filtered.filter(item => 
        (item.yearsExperience || 0) >= filters.minYears
      )
    }
    
    // Text search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm)
      )
    }
    
    return filtered
  }
  
  // Get skills grouped by category
  groupByCategory(): Record<string, Skill[]> {
    const grouped: Record<string, Skill[]> = {}
    
    for (const skill of this.items) {
      const category = skill.category
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(skill)
    }
    
    // Sort each group by name
    for (const category in grouped) {
      grouped[category].sort((a, b) => a.name.localeCompare(b.name))
    }
    
    return grouped
  }
  
  // Get proficiency distribution
  getProficiencyDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {}
    
    for (const skill of this.items) {
      const proficiency = skill.proficiency
      distribution[proficiency] = (distribution[proficiency] || 0) + 1
    }
    
    return distribution
  }
}

// Master content aggregator that combines all content types
export class MasterContentAggregator {
  private blogAggregator: BlogAggregator
  private portfolioAggregator: PortfolioAggregator
  private resumeAggregator: ResumeAggregator
  private skillAggregator: SkillAggregator
  private personas: Persona[]
  
  constructor(
    blog: BlogArticle[],
    portfolioItems: PortfolioItem[],
    portfolioCollections: PortfolioCollection[],
    resume: ResumeEntry[],
    skills: Skill[],
    personas: Persona[]
  ) {
    this.blogAggregator = new BlogAggregator(blog)
    this.portfolioAggregator = new PortfolioAggregator(portfolioItems, portfolioCollections)
    this.resumeAggregator = new ResumeAggregator(resume)
    this.skillAggregator = new SkillAggregator(skills)
    this.personas = personas.filter(p => !p.draft)
  }
  
  // Get primary persona
  getPrimaryPersona(): Persona | null {
    return this.personas.find(p => p.primary) || null
  }
  
  // Get all personas
  getPersonas(): Persona[] {
    return this.personas
  }
  
  // Get aggregators
  get blog() { return this.blogAggregator }
  get portfolio() { return this.portfolioAggregator }  
  get resume() { return this.resumeAggregator }
  get skills() { return this.skillAggregator }
  
  // Get content summary for a persona
  getPersonaContentSummary(personaKey: string): {
    blogCount: number
    portfolioCount: number
    resumeCount: number
    skillCount: number
  } {
    return {
      blogCount: this.blogAggregator.items.filter(item => item.persona === personaKey).length,
      portfolioCount: this.portfolioAggregator.items.filter(item => item.persona === personaKey).length,
      resumeCount: this.resumeAggregator.items.filter(item => item.persona === personaKey).length,
      skillCount: this.skillAggregator.items.filter(item => item.persona === personaKey).length
    }
  }
}