import type { Persona, BlogArticle, PortfolioItem, PortfolioCollection, ResumeEntry, Skill } from './content-schemas'

// Cross-reference context for validation
export interface CrossReferenceContext {
  personas: Persona[]
  skills: Skill[]
  portfolioCollections: PortfolioCollection[]
  portfolioItems: PortfolioItem[]
  blogArticles: BlogArticle[]
  resumeEntries: ResumeEntry[]
}

// Validation result structure
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// Persona validation utilities
export class PersonaValidator {
  static validatePersonaReference(personaKey: string, context: CrossReferenceContext): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] }
    
    const persona = context.personas.find(p => p.key === personaKey)
    if (!persona) {
      result.valid = false
      result.errors.push(`Persona '${personaKey}' not found`)
      return result
    }
    
    if (persona.draft) {
      result.warnings.push(`Referenced persona '${personaKey}' is in draft mode`)
    }
    
    return result
  }
  
  static validatePrimaryPersona(context: CrossReferenceContext): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] }
    
    const primaryPersonas = context.personas.filter(p => p.primary && !p.draft)
    
    if (primaryPersonas.length === 0) {
      result.valid = false
      result.errors.push('No primary persona found (required for site navigation)')
    } else if (primaryPersonas.length > 1) {
      result.valid = false
      result.errors.push(`Multiple primary personas found: ${primaryPersonas.map(p => p.key).join(', ')}`)
    }
    
    return result
  }
}

// Skill reference validation
export class SkillValidator {
  static validateSkillReferences(skillKeys: string[], context: CrossReferenceContext): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] }
    
    for (const skillKey of skillKeys) {
      const skill = context.skills.find(s => s.key === skillKey)
      if (!skill) {
        result.warnings.push(`Skill '${skillKey}' not found in skill definitions`)
      } else if (skill.draft) {
        result.warnings.push(`Referenced skill '${skillKey}' is in draft mode`)
      }
    }
    
    return result
  }
  
  static validateSkillUsage(skillKey: string, context: CrossReferenceContext): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] }
    
    // Check if skill is referenced in any content
    const usageCount = [
      ...context.personas.filter(p => p.skills?.includes(skillKey)),
      ...context.resumeEntries.filter(r => r.skills?.includes(skillKey) || r.technologies?.includes(skillKey)),
      ...context.portfolioItems.filter(p => p.tags?.includes(skillKey))
    ].length
    
    if (usageCount === 0) {
      result.warnings.push(`Skill '${skillKey}' is defined but not referenced in any content`)
    }
    
    return result
  }
}

// Portfolio cross-reference validation
export class PortfolioValidator {
  static validateCollectionReference(collectionKey: string, context: CrossReferenceContext): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] }
    
    const collection = context.portfolioCollections.find(c => c.key === collectionKey)
    if (!collection) {
      result.valid = false
      result.errors.push(`Portfolio collection '${collectionKey}' not found`)
      return result
    }
    
    if (collection.draft) {
      result.warnings.push(`Referenced collection '${collectionKey}' is in draft mode`)
    }
    
    return result
  }
  
  static validateCollectionItemCounts(context: CrossReferenceContext): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] }
    
    for (const collection of context.portfolioCollections) {
      const actualItemCount = context.portfolioItems.filter(
        item => item.collection === collection.key && !item.draft
      ).length
      
      if (collection.itemCount !== actualItemCount) {
        result.warnings.push(
          `Collection '${collection.key}' claims ${collection.itemCount} items but has ${actualItemCount}`
        )
      }
    }
    
    return result
  }
  
  static validateItemCollectionAssignment(item: PortfolioItem, context: CrossReferenceContext): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] }
    
    const collection = context.portfolioCollections.find(c => c.key === item.collection)
    if (!collection) {
      result.valid = false
      result.errors.push(`Item '${item.slug}' references non-existent collection '${item.collection}'`)
      return result
    }
    
    // Validate persona consistency
    if (item.persona !== collection.persona) {
      result.warnings.push(
        `Item '${item.slug}' persona (${item.persona}) differs from collection persona (${collection.persona})`
      )
    }
    
    return result
  }
}

// Blog cross-reference validation
export class BlogValidator {
  static validateRelatedArticles(article: BlogArticle, context: CrossReferenceContext): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] }
    
    for (const relatedSlug of article.relatedArticles || []) {
      const relatedArticle = context.blogArticles.find(a => a.slug === relatedSlug)
      if (!relatedArticle) {
        result.warnings.push(`Related article '${relatedSlug}' not found`)
      } else if (relatedArticle.draft) {
        result.warnings.push(`Related article '${relatedSlug}' is in draft mode`)
      }
    }
    
    return result
  }
  
  static validateSeriesReferences(context: CrossReferenceContext): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] }
    
    // Group articles by series
    const seriesMap = new Map<string, BlogArticle[]>()
    
    for (const article of context.blogArticles.filter(a => a.series && !a.draft)) {
      const seriesName = article.series!.name
      if (!seriesMap.has(seriesName)) {
        seriesMap.set(seriesName, [])
      }
      seriesMap.get(seriesName)!.push(article)
    }
    
    // Validate each series
    for (const [seriesName, articles] of seriesMap) {
      const maxPart = Math.max(...articles.map(a => a.series!.part))
      const expectedTotal = articles[0].series!.total
      
      if (maxPart !== expectedTotal) {
        result.warnings.push(
          `Series '${seriesName}' has parts up to ${maxPart} but declares total of ${expectedTotal}`
        )
      }
      
      // Check for missing parts
      for (let i = 1; i <= expectedTotal; i++) {
        if (!articles.find(a => a.series!.part === i)) {
          result.warnings.push(`Series '${seriesName}' is missing part ${i}`)
        }
      }
      
      // Check for duplicate parts
      const partCounts = new Map<number, number>()
      for (const article of articles) {
        const part = article.series!.part
        partCounts.set(part, (partCounts.get(part) || 0) + 1)
      }
      
      for (const [part, count] of partCounts) {
        if (count > 1) {
          result.errors.push(`Series '${seriesName}' has ${count} articles for part ${part}`)
          result.valid = false
        }
      }
    }
    
    return result
  }
}

// Resume cross-reference validation
export class ResumeValidator {
  static validateSkillConsistency(entry: ResumeEntry, context: CrossReferenceContext): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] }
    
    // Validate skills exist
    const skillValidation = SkillValidator.validateSkillReferences(entry.skills || [], context)
    result.errors.push(...skillValidation.errors)
    result.warnings.push(...skillValidation.warnings)
    
    // Validate technologies exist (they should be in skills)
    const techValidation = SkillValidator.validateSkillReferences(entry.technologies || [], context)
    result.warnings.push(...techValidation.warnings.map(w => w.replace('Skill', 'Technology')))
    
    return result
  }
  
  static validateDateConsistency(entries: ResumeEntry[]): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] }
    
    // Sort entries by start date
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    )
    
    // Check for overlapping employment
    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const current = sortedEntries[i]
      const next = sortedEntries[i + 1]
      
      if (!current.endDate && !current.current) continue
      
      const currentEnd = current.current ? new Date() : new Date(current.endDate!)
      const nextStart = new Date(next.startDate)
      
      if (currentEnd > nextStart && current.type === 'employment' && next.type === 'employment') {
        result.warnings.push(
          `Overlapping employment: '${current.position}' at ${current.company} ` +
          `overlaps with '${next.position}' at ${next.company}`
        )
      }
    }
    
    return result
  }
}

// Master cross-reference validator
export class ContentCrossReferenceValidator {
  static validateAll(context: CrossReferenceContext): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] }
    
    // Validate primary persona
    const primaryPersonaResult = PersonaValidator.validatePrimaryPersona(context)
    result.errors.push(...primaryPersonaResult.errors)
    result.warnings.push(...primaryPersonaResult.warnings)
    if (!primaryPersonaResult.valid) result.valid = false
    
    // Validate persona references in all content
    const allPersonaReferences = [
      ...context.blogArticles.map(a => a.persona),
      ...context.portfolioItems.map(i => i.persona),
      ...context.portfolioCollections.map(c => c.persona),
      ...context.resumeEntries.map(r => r.persona),
      ...context.skills.map(s => s.persona)
    ]
    
    for (const personaKey of new Set(allPersonaReferences)) {
      const personaResult = PersonaValidator.validatePersonaReference(personaKey, context)
      result.errors.push(...personaResult.errors)
      result.warnings.push(...personaResult.warnings)
      if (!personaResult.valid) result.valid = false
    }
    
    // Validate portfolio structure
    const collectionCountResult = PortfolioValidator.validateCollectionItemCounts(context)
    result.warnings.push(...collectionCountResult.warnings)
    
    for (const item of context.portfolioItems) {
      const itemResult = PortfolioValidator.validateItemCollectionAssignment(item, context)
      result.errors.push(...itemResult.errors)
      result.warnings.push(...itemResult.warnings)
      if (!itemResult.valid) result.valid = false
    }
    
    // Validate blog series
    const seriesResult = BlogValidator.validateSeriesReferences(context)
    result.errors.push(...seriesResult.errors)
    result.warnings.push(...seriesResult.warnings)
    if (!seriesResult.valid) result.valid = false
    
    // Validate blog article relationships
    for (const article of context.blogArticles) {
      const relatedResult = BlogValidator.validateRelatedArticles(article, context)
      result.warnings.push(...relatedResult.warnings)
    }
    
    // Validate resume entries
    const resumeDateResult = ResumeValidator.validateDateConsistency(context.resumeEntries)
    result.warnings.push(...resumeDateResult.warnings)
    
    for (const entry of context.resumeEntries) {
      const skillResult = ResumeValidator.validateSkillConsistency(entry, context)
      result.errors.push(...skillResult.errors)
      result.warnings.push(...skillResult.warnings)
      if (!skillResult.valid) result.valid = false
    }
    
    // Validate skill usage
    for (const skill of context.skills) {
      const usageResult = SkillValidator.validateSkillUsage(skill.key, context)
      result.warnings.push(...usageResult.warnings)
    }
    
    return result
  }
  
  static validateContentItem<T extends { persona: string }>(
    item: T,
    type: 'blog' | 'portfolio' | 'resume' | 'skill',
    context: CrossReferenceContext
  ): ValidationResult {
    const result: ValidationResult = { valid: true, errors: [], warnings: [] }
    
    // Validate persona reference
    const personaResult = PersonaValidator.validatePersonaReference(item.persona, context)
    result.errors.push(...personaResult.errors)
    result.warnings.push(...personaResult.warnings)
    if (!personaResult.valid) result.valid = false
    
    // Type-specific validation
    if (type === 'portfolio' && 'collection' in item) {
      const collectionResult = PortfolioValidator.validateCollectionReference(
        (item as any).collection,
        context
      )
      result.errors.push(...collectionResult.errors)
      result.warnings.push(...collectionResult.warnings)
      if (!collectionResult.valid) result.valid = false
    }
    
    if (type === 'resume' && 'skills' in item) {
      const skillResult = ResumeValidator.validateSkillConsistency(item as any, context)
      result.errors.push(...skillResult.errors)
      result.warnings.push(...skillResult.warnings)
      if (!skillResult.valid) result.valid = false
    }
    
    return result
  }
}