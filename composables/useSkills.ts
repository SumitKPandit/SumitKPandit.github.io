export interface Skill {
  name: string
  key: string
  slug: string
  description: string
  persona: string
  category: string
  subcategory: string
  group: string
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  proficiencyLevel: number
  yearsOfExperience: number
  featured: boolean
  endorsed: boolean
  draft: boolean
  createdAt: string
  updatedAt: string
  tags: string[]
  relatedSkills: string[]
  projects: string[]
  certifications: string[]
  endorsements: string[]
  learningResources: {
    title: string
    url: string
    type: string
  }[]
  achievements: string[]
  url: string
}

export interface SkillsResponse {
  success: boolean
  data: Skill[]
  count: number
  stats: {
    total: number
    featured: number
    endorsed: number
    categories: string[]
    subcategories: string[]
    groups: string[]
    personas: string[]
    proficiencyLevels: Record<string, number>
    averageProficiency: number
    totalExperience: number
    tags: string[]
  }
}

export interface SkillsStats {
  total: number
  featured: number
  endorsed: number
  certified: number
  averageProficiency: number
  totalExperience: number
  proficiencyDistribution: Record<string, number>
  categoryDistribution: Record<string, number>
  personaDistribution: Record<string, number>
  groupDistribution: Record<string, number>
  tagCounts: Record<string, number>
  recentSkills: Skill[]
  topSkills: Skill[]
  expertiseAreas: string[]
}

export interface ProficiencyAnalytics {
  skillsByLevel: Record<number, Skill[]>
  proficiencyTrend: {
    level: number
    count: number
    percentage: number
  }[]
  expertiseGaps: string[]
  learningPath: Skill[]
  strengthAreas: string[]
  developmentAreas: string[]
}

export interface SkillEndorsements {
  skill: string
  endorsements: string[]
  endorsementCount: number
  averageRating: number
  endorsementsByPersona: Record<string, string[]>
  endorsementTrends: {
    month: string
    count: number
  }[]
}

export interface SkillProgression {
  skill: string
  timeline: {
    year: number
    proficiencyLevel: number
    milestones: string[]
    projects: string[]
    certifications: string[]
  }[]
  growthRate: number
  projectedLevel: number
  learningVelocity: number
}

export interface LearningRecommendations {
  prioritySkills: Skill[]
  suggestedResources: {
    skill: string
    resources: {
      title: string
      url: string
      type: string
      difficulty: string
      timeInvestment: string
    }[]
  }[]
  careerPathAlignment: {
    persona: string
    requiredSkills: string[]
    currentProgress: number
    recommendedNext: string[]
  }[]
  skillGaps: {
    category: string
    missing: string[]
    priority: 'high' | 'medium' | 'low'
  }[]
}

/**
 * Skills management composable providing comprehensive skill tracking,
 * proficiency analysis, endorsement management, and learning recommendations
 */
export const useSkills = () => {
  /**
   * Get all skills with optional filtering
   */
  const getSkills = async (options?: {
    persona?: string
    category?: string
    subcategory?: string
    group?: string
    proficiency?: string
    proficiencyLevel?: number
    minProficiency?: number
    maxProficiency?: number
    featured?: boolean
    endorsed?: boolean
    certified?: boolean
    draft?: boolean
    tags?: string[]
    relatedTo?: string
    limit?: number
    offset?: number
    sortBy?: 'name' | 'proficiency' | 'experience' | 'updated' | 'created'
    sortOrder?: 'asc' | 'desc'
  }): Promise<Skill[]> => {
    try {
      const response = await $fetch<SkillsResponse>('/api/skills')
      if (!response.success) return []
      
      let skills = response.data
      
      // Apply filters
      if (options?.persona) {
        skills = skills.filter(skill => skill.persona === options.persona)
      }
      
      if (options?.category) {
        skills = skills.filter(skill => skill.category === options.category)
      }
      
      if (options?.subcategory) {
        skills = skills.filter(skill => skill.subcategory === options.subcategory)
      }
      
      if (options?.group) {
        skills = skills.filter(skill => skill.group === options.group)
      }
      
      if (options?.proficiency) {
        skills = skills.filter(skill => skill.proficiency === options.proficiency)
      }
      
      if (options?.proficiencyLevel !== undefined) {
        skills = skills.filter(skill => skill.proficiencyLevel === options.proficiencyLevel)
      }
      
      if (options?.minProficiency !== undefined) {
        skills = skills.filter(skill => skill.proficiencyLevel >= options.minProficiency!)
      }
      
      if (options?.maxProficiency !== undefined) {
        skills = skills.filter(skill => skill.proficiencyLevel <= options.maxProficiency!)
      }
      
      if (options?.featured !== undefined) {
        skills = skills.filter(skill => skill.featured === options.featured)
      }
      
      if (options?.endorsed !== undefined) {
        skills = skills.filter(skill => skill.endorsed === options.endorsed)
      }
      
      if (options?.certified !== undefined) {
        skills = skills.filter(skill => 
          options.certified ? skill.certifications.length > 0 : skill.certifications.length === 0
        )
      }
      
      if (options?.draft !== undefined) {
        skills = skills.filter(skill => skill.draft === options.draft)
      }
      
      if (options?.tags && options.tags.length > 0) {
        skills = skills.filter(skill => 
          options.tags!.some(tag => skill.tags.includes(tag))
        )
      }
      
      if (options?.relatedTo) {
        skills = skills.filter(skill => 
          skill.relatedSkills.includes(options.relatedTo!)
        )
      }
      
      // Apply sorting
      if (options?.sortBy) {
        skills.sort((a, b) => {
          let aValue: any, bValue: any
          
          switch (options.sortBy) {
            case 'name':
              aValue = a.name.toLowerCase()
              bValue = b.name.toLowerCase()
              break
            case 'proficiency':
              aValue = a.proficiencyLevel
              bValue = b.proficiencyLevel
              break
            case 'experience':
              aValue = a.yearsOfExperience
              bValue = b.yearsOfExperience
              break
            case 'updated':
              aValue = new Date(a.updatedAt)
              bValue = new Date(b.updatedAt)
              break
            case 'created':
              aValue = new Date(a.createdAt)
              bValue = new Date(b.createdAt)
              break
            default:
              return 0
          }
          
          const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
          return options.sortOrder === 'desc' ? -comparison : comparison
        })
      }
      
      // Apply pagination
      if (options?.offset || options?.limit) {
        const start = options.offset || 0
        const end = options.limit ? start + options.limit : undefined
        skills = skills.slice(start, end)
      }
      
      return skills
    } catch (error) {
      console.error('Error fetching skills:', error)
      return []
    }
  }
  
  /**
   * Get a single skill by key or slug
   */
  const getSkill = async (keyOrSlug: string): Promise<Skill | null> => {
    try {
      const skills = await getSkills()
      return skills.find(skill => 
        skill.key === keyOrSlug || skill.slug === keyOrSlug
      ) || null
    } catch (error) {
      console.error('Error fetching skill:', error)
      return null
    }
  }
  
  /**
   * Get featured skills
   */
  const getFeaturedSkills = async (limit?: number): Promise<Skill[]> => {
    return getSkills({
      featured: true,
      draft: false,
      sortBy: 'proficiency',
      sortOrder: 'desc',
      limit
    })
  }
  
  /**
   * Get skills by persona
   */
  const getSkillsByPersona = async (persona: string, options?: {
    featured?: boolean
    minProficiency?: number
    limit?: number
  }): Promise<Skill[]> => {
    return getSkills({
      persona,
      featured: options?.featured,
      minProficiency: options?.minProficiency,
      draft: false,
      sortBy: 'proficiency',
      sortOrder: 'desc',
      limit: options?.limit
    })
  }
  
  /**
   * Get skills by category
   */
  const getSkillsByCategory = async (category: string, options?: {
    subcategory?: string
    minProficiency?: number
    limit?: number
  }): Promise<Skill[]> => {
    return getSkills({
      category,
      subcategory: options?.subcategory,
      minProficiency: options?.minProficiency,
      draft: false,
      sortBy: 'proficiency',
      sortOrder: 'desc',
      limit: options?.limit
    })
  }
  
  /**
   * Get skills by proficiency level
   */
  const getSkillsByProficiency = async (proficiency: string | number, options?: {
    persona?: string
    category?: string
    limit?: number
  }): Promise<Skill[]> => {
    const searchOptions: any = {
      draft: false,
      sortBy: 'experience',
      sortOrder: 'desc',
      limit: options?.limit
    }
    
    if (typeof proficiency === 'string') {
      searchOptions.proficiency = proficiency
    } else {
      searchOptions.proficiencyLevel = proficiency
    }
    
    if (options?.persona) searchOptions.persona = options.persona
    if (options?.category) searchOptions.category = options.category
    
    return getSkills(searchOptions)
  }
  
  /**
   * Get related skills for a given skill
   */
  const getRelatedSkills = async (skillKey: string, limit = 5): Promise<Skill[]> => {
    try {
      const skill = await getSkill(skillKey)
      if (!skill || !skill.relatedSkills.length) return []
      
      const skills = await getSkills({
        draft: false,
        sortBy: 'proficiency',
        sortOrder: 'desc'
      })
      
      return skills
        .filter(s => skill.relatedSkills.includes(s.key) && s.key !== skillKey)
        .slice(0, limit)
    } catch (error) {
      console.error('Error fetching related skills:', error)
      return []
    }
  }
  
  /**
   * Get top skills by proficiency and experience
   */
  const getTopSkills = async (limit = 10): Promise<Skill[]> => {
    return getSkills({
      draft: false,
      minProficiency: 7,
      sortBy: 'proficiency',
      sortOrder: 'desc',
      limit
    })
  }
  
  /**
   * Get recently updated skills
   */
  const getRecentSkills = async (limit = 5): Promise<Skill[]> => {
    return getSkills({
      draft: false,
      sortBy: 'updated',
      sortOrder: 'desc',
      limit
    })
  }
  
  /**
   * Get skills with certifications
   */
  const getCertifiedSkills = async (): Promise<Skill[]> => {
    return getSkills({
      certified: true,
      draft: false,
      sortBy: 'proficiency',
      sortOrder: 'desc'
    })
  }
  
  /**
   * Get skills statistics
   */
  const getSkillsStats = async (): Promise<SkillsStats> => {
    try {
      const response = await $fetch<SkillsResponse>('/api/skills')
      if (!response.success) {
        return {
          total: 0,
          featured: 0,
          endorsed: 0,
          certified: 0,
          averageProficiency: 0,
          totalExperience: 0,
          proficiencyDistribution: {},
          categoryDistribution: {},
          personaDistribution: {},
          groupDistribution: {},
          tagCounts: {},
          recentSkills: [],
          topSkills: [],
          expertiseAreas: []
        }
      }
      
      const skills = response.data
      const certified = skills.filter(skill => skill.certifications.length > 0).length
      
      // Calculate distributions
      const proficiencyDistribution: Record<string, number> = {}
      const categoryDistribution: Record<string, number> = {}
      const personaDistribution: Record<string, number> = {}
      const groupDistribution: Record<string, number> = {}
      const tagCounts: Record<string, number> = {}
      
      skills.forEach(skill => {
        // Proficiency distribution
        proficiencyDistribution[skill.proficiency] = (proficiencyDistribution[skill.proficiency] || 0) + 1
        
        // Category distribution
        categoryDistribution[skill.category] = (categoryDistribution[skill.category] || 0) + 1
        
        // Persona distribution
        personaDistribution[skill.persona] = (personaDistribution[skill.persona] || 0) + 1
        
        // Group distribution
        groupDistribution[skill.group] = (groupDistribution[skill.group] || 0) + 1
        
        // Tag counts
        skill.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })
      
      const recentSkills = await getRecentSkills(3)
      const topSkills = await getTopSkills(5)
      const expertiseAreas = Object.keys(categoryDistribution)
      
      return {
        total: response.stats.total,
        featured: response.stats.featured,
        endorsed: response.stats.endorsed,
        certified,
        averageProficiency: response.stats.averageProficiency,
        totalExperience: response.stats.totalExperience,
        proficiencyDistribution,
        categoryDistribution,
        personaDistribution,
        groupDistribution,
        tagCounts,
        recentSkills,
        topSkills,
        expertiseAreas
      }
    } catch (error) {
      console.error('Error fetching skills stats:', error)
      return {
        total: 0,
        featured: 0,
        endorsed: 0,
        certified: 0,
        averageProficiency: 0,
        totalExperience: 0,
        proficiencyDistribution: {},
        categoryDistribution: {},
        personaDistribution: {},
        groupDistribution: {},
        tagCounts: {},
        recentSkills: [],
        topSkills: [],
        expertiseAreas: []
      }
    }
  }
  
  /**
   * Search skills by name, description, or tags
   */
  const searchSkills = async (query: string, options?: {
    persona?: string
    category?: string
    minProficiency?: number
    limit?: number
  }): Promise<Skill[]> => {
    try {
      const skills = await getSkills({
        persona: options?.persona,
        category: options?.category,
        minProficiency: options?.minProficiency,
        draft: false
      })
      
      const searchTerm = query.toLowerCase()
      const results = skills.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm) ||
        skill.description.toLowerCase().includes(searchTerm) ||
        skill.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        skill.category.toLowerCase().includes(searchTerm) ||
        skill.subcategory.toLowerCase().includes(searchTerm)
      )
      
      // Sort by relevance (exact matches first, then partial matches)
      results.sort((a, b) => {
        const aExact = a.name.toLowerCase() === searchTerm ? 1 : 0
        const bExact = b.name.toLowerCase() === searchTerm ? 1 : 0
        if (aExact !== bExact) return bExact - aExact
        
        const aStarts = a.name.toLowerCase().startsWith(searchTerm) ? 1 : 0
        const bStarts = b.name.toLowerCase().startsWith(searchTerm) ? 1 : 0
        if (aStarts !== bStarts) return bStarts - aStarts
        
        return b.proficiencyLevel - a.proficiencyLevel
      })
      
      return options?.limit ? results.slice(0, options.limit) : results
    } catch (error) {
      console.error('Error searching skills:', error)
      return []
    }
  }
  
  /**
   * Get proficiency analytics
   */
  const getProficiencyAnalytics = async (): Promise<ProficiencyAnalytics> => {
    try {
      const skills = await getSkills({ draft: false })
      
      // Group skills by proficiency level
      const skillsByLevel: Record<number, Skill[]> = {}
      skills.forEach(skill => {
        if (!skillsByLevel[skill.proficiencyLevel]) {
          skillsByLevel[skill.proficiencyLevel] = []
        }
        skillsByLevel[skill.proficiencyLevel].push(skill)
      })
      
      // Calculate proficiency trend
      const levelCounts: Record<number, number> = {}
      skills.forEach(skill => {
        levelCounts[skill.proficiencyLevel] = (levelCounts[skill.proficiencyLevel] || 0) + 1
      })
      
      const proficiencyTrend = Object.entries(levelCounts).map(([level, count]) => ({
        level: parseInt(level),
        count,
        percentage: (count / skills.length) * 100
      })).sort((a, b) => a.level - b.level)
      
      // Identify expertise gaps (levels with few or no skills)
      const expertiseGaps: string[] = []
      for (let level = 1; level <= 10; level++) {
        if (!levelCounts[level] || levelCounts[level] < 2) {
          expertiseGaps.push(`Level ${level}`)
        }
      }
      
      // Suggest learning path (skills to develop)
      const learningPath = skills
        .filter(skill => skill.proficiencyLevel < 8)
        .sort((a, b) => b.proficiencyLevel - a.proficiencyLevel)
        .slice(0, 5)
      
      // Identify strength and development areas
      const strengthAreas = skills
        .filter(skill => skill.proficiencyLevel >= 8)
        .map(skill => skill.category)
        .filter((category, index, arr) => arr.indexOf(category) === index)
      
      const developmentAreas = skills
        .filter(skill => skill.proficiencyLevel < 6)
        .map(skill => skill.category)
        .filter((category, index, arr) => arr.indexOf(category) === index)
      
      return {
        skillsByLevel,
        proficiencyTrend,
        expertiseGaps,
        learningPath,
        strengthAreas,
        developmentAreas
      }
    } catch (error) {
      console.error('Error getting proficiency analytics:', error)
      return {
        skillsByLevel: {},
        proficiencyTrend: [],
        expertiseGaps: [],
        learningPath: [],
        strengthAreas: [],
        developmentAreas: []
      }
    }
  }
  
  /**
   * Get skill endorsements analysis
   */
  const getSkillEndorsements = async (skillKey?: string): Promise<SkillEndorsements[]> => {
    try {
      const skills = skillKey ? [await getSkill(skillKey)].filter(Boolean) as Skill[] : await getSkills({ draft: false })
      
      return skills.map(skill => ({
        skill: skill.key,
        endorsements: skill.endorsements,
        endorsementCount: skill.endorsements.length,
        averageRating: skill.proficiencyLevel, // Simplified - could be more complex
        endorsementsByPersona: { [skill.persona]: skill.endorsements },
        endorsementTrends: [
          { month: '2024-01', count: Math.floor(skill.endorsements.length * 0.6) },
          { month: '2024-02', count: skill.endorsements.length }
        ]
      }))
    } catch (error) {
      console.error('Error getting skill endorsements:', error)
      return []
    }
  }
  
  /**
   * Get learning recommendations
   */
  const getLearningRecommendations = async (persona?: string): Promise<LearningRecommendations> => {
    try {
      const skills = await getSkills({ 
        persona, 
        draft: false,
        sortBy: 'proficiency',
        sortOrder: 'asc'
      })
      
      // Priority skills to develop (lower proficiency)
      const prioritySkills = skills.filter(skill => skill.proficiencyLevel < 7).slice(0, 5)
      
      // Suggested resources for each skill
      const suggestedResources = prioritySkills.map(skill => ({
        skill: skill.key,
        resources: skill.learningResources.map(resource => ({
          ...resource,
          difficulty: skill.proficiencyLevel < 5 ? 'beginner' : 'intermediate',
          timeInvestment: skill.proficiencyLevel < 5 ? '2-4 weeks' : '1-2 weeks'
        }))
      }))
      
      // Career path alignment
      const personas = ['developer', 'philosopher']
      const careerPathAlignment = personas.map(p => {
        const personaSkills = skills.filter(s => s.persona === p)
        const totalSkills = personaSkills.length
        const proficientSkills = personaSkills.filter(s => s.proficiencyLevel >= 7).length
        
        return {
          persona: p,
          requiredSkills: personaSkills.map(s => s.key),
          currentProgress: totalSkills > 0 ? (proficientSkills / totalSkills) * 100 : 0,
          recommendedNext: personaSkills
            .filter(s => s.proficiencyLevel < 7)
            .sort((a, b) => b.proficiencyLevel - a.proficiencyLevel)
            .slice(0, 3)
            .map(s => s.key)
        }
      })
      
      // Skill gaps by category
      const categories = [...new Set(skills.map(s => s.category))]
      const skillGaps = categories.map(category => {
        const categorySkills = skills.filter(s => s.category === category)
        const lowProficiency = categorySkills.filter(s => s.proficiencyLevel < 6)
        
        return {
          category,
          missing: lowProficiency.map(s => s.key),
          priority: lowProficiency.length > 2 ? 'high' as const : 
                   lowProficiency.length > 0 ? 'medium' as const : 'low' as const
        }
      })
      
      return {
        prioritySkills,
        suggestedResources,
        careerPathAlignment,
        skillGaps
      }
    } catch (error) {
      console.error('Error getting learning recommendations:', error)
      return {
        prioritySkills: [],
        suggestedResources: [],
        careerPathAlignment: [],
        skillGaps: []
      }
    }
  }
  
  return {
    // Core functions
    getSkills,
    getSkill,
    getFeaturedSkills,
    getSkillsByPersona,
    getSkillsByCategory,
    getSkillsByProficiency,
    getRelatedSkills,
    getTopSkills,
    getRecentSkills,
    getCertifiedSkills,
    
    // Analytics and insights
    getSkillsStats,
    searchSkills,
    getProficiencyAnalytics,
    getSkillEndorsements,
    getLearningRecommendations
  }
}