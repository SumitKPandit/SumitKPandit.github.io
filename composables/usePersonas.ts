// Simple persona content integration composable
// This would work in a proper Node.js 18+ environment

export interface PersonaContent {
  key: string
  name: string
  title: string
  bio: string
  description: string
  primary: boolean
  draft: boolean
  createdAt: string
  updatedAt: string
  tags: string[]
  featured: boolean
  avatar?: string
  social?: {
    github?: string
    linkedin?: string
    twitter?: string
    email?: string
    website?: string
  }
  skills?: string[]
  interests?: string[]
  slug?: string
  url?: string
}

export const usePersonas = () => {
  
  const getPersonas = async (): Promise<PersonaContent[]> => {
    try {
      // In a working environment, this would fetch from /api/personas
      const response = await fetch('/api/personas')
      const data = await response.json()
      
      if (data.success) {
        return data.data as PersonaContent[]
      }
      
      return []
    } catch (error) {
      console.error('Failed to fetch personas:', error)
      return []
    }
  }

  const getPersona = async (key: string): Promise<PersonaContent | null> => {
    try {
      const personas = await getPersonas()
      return personas.find(p => p.key === key || p.slug === key) || null
    } catch (error) {
      console.error(`Failed to fetch persona ${key}:`, error)
      return null
    }
  }

  const getPrimaryPersona = async (): Promise<PersonaContent | null> => {
    try {
      const personas = await getPersonas()
      return personas.find(p => p.primary) || personas[0] || null
    } catch (error) {
      console.error('Failed to get primary persona:', error)
      return null
    }
  }

  const getPersonaNavigation = async () => {
    const personas = await getPersonas()
    
    return personas.map(persona => ({
      title: persona.title,
      description: persona.description,
      to: `/personas/${persona.key}`,
      key: persona.key,
      primary: persona.primary,
      featured: persona.featured,
      tags: persona.tags,
    }))
  }

  const getPersonaStats = async () => {
    const personas = await getPersonas()
    
    return {
      total: personas.length,
      primary: personas.filter(p => p.primary).length,
      featured: personas.filter(p => p.featured).length,
      tags: [...new Set(personas.flatMap(p => p.tags))],
      skills: [...new Set(personas.flatMap(p => p.skills || []))],
      interests: [...new Set(personas.flatMap(p => p.interests || []))],
    }
  }

  return {
    getPersonas,
    getPersona,
    getPrimaryPersona,
    getPersonaNavigation,
    getPersonaStats,
  }
}