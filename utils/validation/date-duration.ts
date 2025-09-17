import type { ResumeEntry } from './content-schemas'

// Date validation and parsing utilities
export class DateValidator {
  private static readonly ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
  private static readonly SIMPLE_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
  
  static isValidISOString(dateString: string): boolean {
    if (!this.ISO_DATE_REGEX.test(dateString) && !this.SIMPLE_DATE_REGEX.test(dateString)) {
      return false
    }
    
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  }
  
  static parseDate(dateString: string): Date | null {
    if (!this.isValidISOString(dateString)) {
      return null
    }
    
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date
  }
  
  static validateDateRange(startDate: string, endDate?: string): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []
    
    const start = this.parseDate(startDate)
    if (!start) {
      errors.push('Invalid start date format')
      return { valid: false, errors }
    }
    
    if (endDate) {
      const end = this.parseDate(endDate)
      if (!end) {
        errors.push('Invalid end date format')
        return { valid: false, errors }
      }
      
      if (start >= end) {
        errors.push('Start date must be before end date')
        return { valid: false, errors }
      }
      
      // Check for unreasonably long periods (more than 50 years)
      const maxYears = 50
      const yearsDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
      if (yearsDiff > maxYears) {
        errors.push(`Date range exceeds maximum of ${maxYears} years`)
        return { valid: false, errors }
      }
    }
    
    // Check for future dates beyond reasonable limits
    const now = new Date()
    const maxFutureYears = 5
    const maxFutureDate = new Date(now.getFullYear() + maxFutureYears, now.getMonth(), now.getDate())
    
    if (start > maxFutureDate) {
      errors.push(`Start date is too far in the future (max ${maxFutureYears} years)`)
      return { valid: false, errors }
    }
    
    return { valid: true, errors: [] }
  }
  
  static isCurrentPosition(entry: { current: boolean; endDate?: string }): boolean {
    return entry.current === true || (!entry.endDate && entry.current !== false)
  }
}

// Duration calculation utilities
export class DurationCalculator {
  static calculateMonthsBetween(startDate: string, endDate?: string): number {
    const start = DateValidator.parseDate(startDate)
    if (!start) return 0
    
    const end = endDate ? DateValidator.parseDate(endDate) : new Date()
    if (!end) return 0
    
    const yearDiff = end.getFullYear() - start.getFullYear()
    const monthDiff = end.getMonth() - start.getMonth()
    const dayDiff = end.getDate() - start.getDate()
    
    let totalMonths = yearDiff * 12 + monthDiff
    
    // Adjust for partial months
    if (dayDiff < 0) {
      totalMonths -= 1
    }
    
    return Math.max(0, totalMonths)
  }
  
  static calculateYearsAndMonths(startDate: string, endDate?: string): {
    years: number
    months: number
    totalMonths: number
  } {
    const totalMonths = this.calculateMonthsBetween(startDate, endDate)
    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12
    
    return { years, months, totalMonths }
  }
  
  static formatDuration(startDate: string, endDate?: string, format: 'long' | 'short' = 'long'): string {
    const { years, months } = this.calculateYearsAndMonths(startDate, endDate)
    
    if (years === 0 && months === 0) {
      return format === 'long' ? '0 months' : '0mo'
    }
    
    const parts: string[] = []
    
    if (years > 0) {
      if (format === 'long') {
        parts.push(`${years} ${years === 1 ? 'year' : 'years'}`)
      } else {
        parts.push(`${years}y`)
      }
    }
    
    if (months > 0) {
      if (format === 'long') {
        parts.push(`${months} ${months === 1 ? 'month' : 'months'}`)
      } else {
        parts.push(`${months}mo`)
      }
    }
    
    return parts.join(' ')
  }
  
  static calculateTotalExperience(entries: ResumeEntry[]): {
    totalMonths: number
    totalYears: number
    byType: Record<string, number>
    bySkill: Record<string, number>
  } {
    const byType: Record<string, number> = {}
    const bySkill: Record<string, number> = {}
    let totalMonths = 0
    
    for (const entry of entries) {
      if (entry.draft) continue
      
      const months = this.calculateMonthsBetween(entry.startDate, entry.endDate)
      totalMonths += months
      
      // Track by employment type
      const type = entry.type || 'employment'
      byType[type] = (byType[type] || 0) + months
      
      // Track by skills
      const allSkills = [...(entry.skills || []), ...(entry.technologies || [])]
      for (const skill of allSkills) {
        bySkill[skill] = (bySkill[skill] || 0) + months
      }
    }
    
    return {
      totalMonths,
      totalYears: Math.floor(totalMonths / 12),
      byType,
      bySkill
    }
  }
}

// Date formatting utilities
export class DateFormatter {
  static formatForDisplay(dateString: string, format: 'full' | 'month-year' | 'year' = 'month-year'): string {
    const date = DateValidator.parseDate(dateString)
    if (!date) return 'Invalid Date'
    
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'UTC' // Ensure consistent formatting regardless of user timezone
    }
    
    switch (format) {
      case 'full':
        options.year = 'numeric'
        options.month = 'long'
        options.day = 'numeric'
        break
      case 'month-year':
        options.year = 'numeric'
        options.month = 'short'
        break
      case 'year':
        options.year = 'numeric'
        break
    }
    
    return new Intl.DateTimeFormat('en-US', options).format(date)
  }
  
  static formatDateRange(
    startDate: string,
    endDate?: string,
    options: {
      format?: 'full' | 'month-year' | 'year'
      currentLabel?: string
      separator?: string
    } = {}
  ): string {
    const {
      format = 'month-year',
      currentLabel = 'Present',
      separator = ' - '
    } = options
    
    const start = this.formatForDisplay(startDate, format)
    
    if (!endDate) {
      return `${start}${separator}${currentLabel}`
    }
    
    const end = this.formatForDisplay(endDate, format)
    return `${start}${separator}${end}`
  }
  
  static formatRelativeTime(dateString: string): string {
    const date = DateValidator.parseDate(dateString)
    if (!date) return 'Invalid Date'
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)
    
    if (diffDays < 1) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffMonths < 12) return `${diffMonths} months ago`
    if (diffYears === 1) return '1 year ago'
    return `${diffYears} years ago`
  }
  
  static sortByDate<T extends { startDate: string; endDate?: string }>(
    items: T[],
    direction: 'asc' | 'desc' = 'desc'
  ): T[] {
    return [...items].sort((a, b) => {
      const aDate = DateValidator.parseDate(a.startDate)
      const bDate = DateValidator.parseDate(b.startDate)
      
      if (!aDate || !bDate) return 0
      
      const diff = aDate.getTime() - bDate.getTime()
      return direction === 'desc' ? -diff : diff
    })
  }
}

// Resume-specific date utilities
export class ResumeeDateUtils {
  static validateEntry(entry: ResumeEntry): {
    valid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Basic date validation
    const dateValidation = DateValidator.validateDateRange(entry.startDate, entry.endDate)
    errors.push(...dateValidation.errors)
    
    // Current position logic validation
    if (entry.current && entry.endDate) {
      warnings.push('Position marked as current but has end date')
    }
    
    if (!entry.current && !entry.endDate) {
      errors.push('Non-current position must have end date')
    }
    
    // Duration warnings
    const months = DurationCalculator.calculateMonthsBetween(entry.startDate, entry.endDate)
    if (months < 1) {
      warnings.push('Position duration is less than 1 month')
    }
    
    if (months > 12 * 10) { // More than 10 years
      warnings.push('Position duration exceeds 10 years - please verify dates')
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
  
  static detectGaps(entries: ResumeEntry[]): Array<{
    start: string
    end: string
    months: number
    description: string
  }> {
    const gaps: Array<{
      start: string
      end: string
      months: number
      description: string
    }> = []
    
    // Sort by start date
    const sortedEntries = DateFormatter.sortByDate(entries.filter(e => !e.draft), 'asc')
    
    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const current = sortedEntries[i]
      const next = sortedEntries[i + 1]
      
      const currentEnd = current.endDate || new Date().toISOString()
      const nextStart = next.startDate
      
      const currentEndDate = DateValidator.parseDate(currentEnd)
      const nextStartDate = DateValidator.parseDate(nextStart)
      
      if (currentEndDate && nextStartDate && currentEndDate < nextStartDate) {
        const gapMonths = DurationCalculator.calculateMonthsBetween(currentEnd, nextStart)
        
        if (gapMonths > 1) { // Only report gaps longer than 1 month
          gaps.push({
            start: currentEnd,
            end: nextStart,
            months: gapMonths,
            description: `Gap between ${current.position} at ${current.company} and ${next.position} at ${next.company}`
          })
        }
      }
    }
    
    return gaps
  }
  
  static calculateEntryDuration(entry: ResumeEntry): {
    months: number
    formatted: string
    isActive: boolean
  } {
    const months = DurationCalculator.calculateMonthsBetween(entry.startDate, entry.endDate)
    const formatted = DurationCalculator.formatDuration(entry.startDate, entry.endDate)
    const isActive = DateValidator.isCurrentPosition(entry)
    
    return { months, formatted, isActive }
  }
  
  static generateCareerTimeline(entries: ResumeEntry[]): Array<{
    entry: ResumeEntry
    duration: ReturnType<typeof ResumeeDateUtils.calculateEntryDuration>
    overlaps: string[]
  }> {
    const timeline = DateFormatter.sortByDate(entries.filter(e => !e.draft), 'desc')
    
    return timeline.map(entry => {
      const duration = this.calculateEntryDuration(entry)
      const overlaps: string[] = []
      
      // Check for overlaps with other entries
      for (const other of entries) {
        if (other === entry || other.draft) continue
        
        const entryStart = DateValidator.parseDate(entry.startDate)
        const entryEnd = entry.endDate ? DateValidator.parseDate(entry.endDate) : new Date()
        const otherStart = DateValidator.parseDate(other.startDate)
        const otherEnd = other.endDate ? DateValidator.parseDate(other.endDate) : new Date()
        
        if (entryStart && entryEnd && otherStart && otherEnd) {
          // Check for overlap
          if (entryStart < otherEnd && entryEnd > otherStart) {
            overlaps.push(`${other.position} at ${other.company}`)
          }
        }
      }
      
      return { entry, duration, overlaps }
    })
  }
}