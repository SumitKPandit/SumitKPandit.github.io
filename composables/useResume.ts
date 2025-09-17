// Resume content integration composable

export interface ResumeEntry {
  title: string
  slug: string
  organization: string
  organizationUrl?: string
  position: string
  department?: string
  team?: string
  persona: string
  category: string
  subcategory?: string
  type: string
  startDate: string
  endDate?: string
  current: boolean
  featured: boolean
  draft: boolean
  createdAt: string
  updatedAt: string
  location: string
  locationType: string
  employmentType: string
  description: string
  responsibilities: string[]
  achievements: string[]
  skills: string[]
  technologies: string[]
  tools: string[]
  certifications: string[]
  publications: string[]
  awards: string[]
  references: string[]
  duration?: {
    years: number
    months: number
    total: string
  }
  url?: string
  _path?: string
  _id?: string
  body?: any
}

export interface ResumeFilters {
  persona?: string
  category?: string
  subcategory?: string
  type?: string
  organization?: string
  current?: boolean
  featured?: boolean
  skills?: string[]
  startYear?: number
  endYear?: number
  limit?: number
  offset?: number
  sortBy?: 'startDate' | 'endDate' | 'title' | 'organization'
  sortOrder?: 'asc' | 'desc'
}

export interface ResumeStats {
  total: number
  current: number
  featured: number
  categories: string[]
  subcategories: string[]
  types: string[]
  personas: string[]
  locations: string[]
  organizations: string[]
  skills: string[]
  totalExperience: string
}

export interface ResumeTimeline {
  entries: ResumeEntry[]
  years: number[]
  categories: { [year: number]: ResumeEntry[] }
}

export const useResume = () => {
  
  const getResumeEntries = async (filters: ResumeFilters = {}): Promise<ResumeEntry[]> => {
    try {
      const response = await fetch('/api/resume')
      const data = await response.json()
      
      if (data.success) {
        let entries = data.data as ResumeEntry[]
        
        // Apply filters
        if (filters.persona) {
          entries = entries.filter(entry => entry.persona === filters.persona)
        }
        
        if (filters.category) {
          entries = entries.filter(entry => entry.category === filters.category)
        }
        
        if (filters.subcategory) {
          entries = entries.filter(entry => entry.subcategory === filters.subcategory)
        }
        
        if (filters.type) {
          entries = entries.filter(entry => entry.type === filters.type)
        }
        
        if (filters.organization) {
          entries = entries.filter(entry => 
            entry.organization.toLowerCase().includes(filters.organization!.toLowerCase())
          )
        }
        
        if (filters.current !== undefined) {
          entries = entries.filter(entry => entry.current === filters.current)
        }
        
        if (filters.featured !== undefined) {
          entries = entries.filter(entry => entry.featured === filters.featured)
        }
        
        if (filters.skills && filters.skills.length > 0) {
          entries = entries.filter(entry => 
            filters.skills!.some(skill => entry.skills.includes(skill))
          )
        }
        
        if (filters.startYear) {
          entries = entries.filter(entry => 
            new Date(entry.startDate).getFullYear() >= filters.startYear!
          )
        }
        
        if (filters.endYear) {
          entries = entries.filter(entry => {
            if (entry.current) return true
            return entry.endDate && new Date(entry.endDate).getFullYear() <= filters.endYear!
          })
        }
        
        // Sort entries
        const sortBy = filters.sortBy || 'startDate'
        const sortOrder = filters.sortOrder || 'desc'
        
        entries.sort((a, b) => {
          let aValue: any = a[sortBy]
          let bValue: any = b[sortBy]
          
          if (sortBy === 'startDate' || sortBy === 'endDate') {
            aValue = new Date(aValue || '1900-01-01').getTime()
            bValue = new Date(bValue || '1900-01-01').getTime()
          }
          
          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })
        
        // Apply pagination
        if (filters.offset) {
          entries = entries.slice(filters.offset)
        }
        
        if (filters.limit) {
          entries = entries.slice(0, filters.limit)
        }
        
        return entries
      }
      
      return []
    } catch (error) {
      console.error('Failed to fetch resume entries:', error)
      return []
    }
  }

  const getResumeEntry = async (slug: string): Promise<ResumeEntry | null> => {
    try {
      const entries = await getResumeEntries()
      return entries.find(entry => entry.slug === slug) || null
    } catch (error) {
      console.error(`Failed to fetch resume entry ${slug}:`, error)
      return null
    }
  }

  const getCurrentPositions = async (): Promise<ResumeEntry[]> => {
    return await getResumeEntries({ 
      current: true,
      sortBy: 'startDate',
      sortOrder: 'desc'
    })
  }

  const getExperienceByPersona = async (persona: string): Promise<ResumeEntry[]> => {
    return await getResumeEntries({ 
      persona,
      category: 'work-experience',
      sortBy: 'startDate',
      sortOrder: 'desc'
    })
  }

  const getEducationByPersona = async (persona: string): Promise<ResumeEntry[]> => {
    return await getResumeEntries({ 
      persona,
      category: 'education',
      sortBy: 'startDate',
      sortOrder: 'desc'
    })
  }

  const getExperienceByCategory = async (category: string): Promise<ResumeEntry[]> => {
    return await getResumeEntries({ 
      category,
      sortBy: 'startDate',
      sortOrder: 'desc'
    })
  }

  const getRecentExperience = async (limit: number = 5): Promise<ResumeEntry[]> => {
    return await getResumeEntries({ 
      limit,
      sortBy: 'startDate',
      sortOrder: 'desc'
    })
  }

  const getExperienceBySkill = async (skill: string, limit?: number): Promise<ResumeEntry[]> => {
    return await getResumeEntries({ 
      skills: [skill],
      limit: limit || 10,
      sortBy: 'startDate',
      sortOrder: 'desc'
    })
  }

  const getResumeTimeline = async (persona?: string): Promise<ResumeTimeline> => {
    try {
      const entries = await getResumeEntries({ 
        persona,
        sortBy: 'startDate',
        sortOrder: 'asc'
      })
      
      // Group entries by start year
      const categoriesByYear: { [year: number]: ResumeEntry[] } = {}
      const years: number[] = []
      
      entries.forEach(entry => {
        const year = new Date(entry.startDate).getFullYear()
        
        if (!categoriesByYear[year]) {
          categoriesByYear[year] = []
          years.push(year)
        }
        
        categoriesByYear[year].push(entry)
      })
      
      return {
        entries,
        years: years.sort((a, b) => a - b),
        categories: categoriesByYear
      }
    } catch (error) {
      console.error('Failed to get resume timeline:', error)
      return {
        entries: [],
        years: [],
        categories: {}
      }
    }
  }

  const getSkillsTimeline = async (persona?: string): Promise<{ [skill: string]: ResumeEntry[] }> => {
    try {
      const entries = await getResumeEntries({ persona })
      const skillsMap: { [skill: string]: ResumeEntry[] } = {}
      
      entries.forEach(entry => {
        entry.skills.forEach(skill => {
          if (!skillsMap[skill]) {
            skillsMap[skill] = []
          }
          skillsMap[skill].push(entry)
        })
      })
      
      // Sort entries for each skill by start date
      Object.keys(skillsMap).forEach(skill => {
        skillsMap[skill].sort((a, b) => 
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        )
      })
      
      return skillsMap
    } catch (error) {
      console.error('Failed to get skills timeline:', error)
      return {}
    }
  }

  const getResumeStats = async (): Promise<ResumeStats> => {
    try {
      const response = await fetch('/api/resume')
      const data = await response.json()
      
      if (data.success) {
        return data.stats as ResumeStats
      }
      
      return {
        total: 0,
        current: 0,
        featured: 0,
        categories: [],
        subcategories: [],
        types: [],
        personas: [],
        locations: [],
        organizations: [],
        skills: [],
        totalExperience: '0 years'
      }
    } catch (error) {
      console.error('Failed to fetch resume stats:', error)
      return {
        total: 0,
        current: 0,
        featured: 0,
        categories: [],
        subcategories: [],
        types: [],
        personas: [],
        locations: [],
        organizations: [],
        skills: [],
        totalExperience: '0 years'
      }
    }
  }

  const searchResume = async (query: string, limit: number = 10): Promise<ResumeEntry[]> => {
    try {
      const entries = await getResumeEntries()
      const searchTerm = query.toLowerCase()
      
      const results = entries
        .map(entry => {
          let score = 0
          
          // Title matches get highest score
          if (entry.title.toLowerCase().includes(searchTerm)) {
            score += 10
          }
          
          // Organization matches get high score
          if (entry.organization.toLowerCase().includes(searchTerm)) {
            score += 8
          }
          
          // Position matches get high score
          if (entry.position.toLowerCase().includes(searchTerm)) {
            score += 8
          }
          
          // Description matches get medium score
          if (entry.description.toLowerCase().includes(searchTerm)) {
            score += 5
          }
          
          // Skills matches get medium score
          if (entry.skills.some(skill => skill.toLowerCase().includes(searchTerm))) {
            score += 5
          }
          
          // Technology matches get medium score
          if (entry.technologies.some(tech => tech.toLowerCase().includes(searchTerm))) {
            score += 4
          }
          
          // Responsibilities/achievements matches get low score
          const allText = [...entry.responsibilities, ...entry.achievements].join(' ').toLowerCase()
          if (allText.includes(searchTerm)) {
            score += 2
          }
          
          return { entry, score }
        })
        .filter(item => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(item => item.entry)
      
      return results
    } catch (error) {
      console.error(`Failed to search resume for "${query}":`, error)
      return []
    }
  }

  const generateCV = async (persona?: string, format: 'chronological' | 'functional' | 'hybrid' = 'chronological') => {
    try {
      const entries = await getResumeEntries({ persona })
      const stats = await getResumeStats()
      
      // Organize entries by format preference
      let organizedEntries: { [section: string]: ResumeEntry[] } = {}
      
      switch (format) {
        case 'chronological':
          organizedEntries = {
            'Work Experience': entries.filter(e => e.category === 'work-experience')
              .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
            'Education': entries.filter(e => e.category === 'education')
              .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
            'Certifications': entries.filter(e => e.category === 'certification')
              .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          }
          break
          
        case 'functional':
          organizedEntries = {
            'Technical Skills': entries.filter(e => e.subcategory === 'software-engineering'),
            'Leadership Experience': entries.filter(e => e.skills.includes('mentoring') || e.skills.includes('leadership')),
            'Research & Academia': entries.filter(e => e.category === 'education' || e.subcategory === 'research'),
            'Consulting & Freelance': entries.filter(e => e.subcategory === 'consulting')
          }
          break
          
        case 'hybrid':
          organizedEntries = {
            'Recent Experience': entries.filter(e => {
              const startYear = new Date(e.startDate).getFullYear()
              return startYear >= new Date().getFullYear() - 3
            }).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
            'Core Skills': entries.filter(e => e.featured),
            'Education & Certifications': entries.filter(e => e.category === 'education' || e.category === 'certification'),
            'Additional Experience': entries.filter(e => {
              const startYear = new Date(e.startDate).getFullYear()
              return startYear < new Date().getFullYear() - 3
            }).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          }
          break
      }
      
      return {
        format,
        persona,
        sections: organizedEntries,
        stats,
        generatedAt: new Date().toISOString()
      }
    } catch (error) {
      console.error('Failed to generate CV:', error)
      return null
    }
  }

  return {
    getResumeEntries,
    getResumeEntry,
    getCurrentPositions,
    getExperienceByPersona,
    getEducationByPersona,
    getExperienceByCategory,
    getRecentExperience,
    getExperienceBySkill,
    getResumeTimeline,
    getSkillsTimeline,
    getResumeStats,
    searchResume,
    generateCV,
  }
}