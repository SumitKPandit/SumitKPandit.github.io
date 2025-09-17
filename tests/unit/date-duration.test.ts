import { describe, it, expect, beforeEach } from 'vitest'
import {
  DateValidator,
  DurationCalculator,
  ResumeTimelineValidator
} from '../../utils/validation/date-duration'

describe('Date and Duration Utilities', () => {
  describe('DateValidator', () => {
    let validator: DateValidator

    beforeEach(() => {
      validator = new DateValidator()
    })

    it('should validate ISO date strings', () => {
      const validDates = [
        '2023-12-01T10:00:00Z',
        '2023-01-15T14:30:00.000Z',
        '2022-06-30T23:59:59Z'
      ]

      validDates.forEach(date => {
        expect(DateValidator.isValidISODate(date)).toBe(true)
      })
    })

    it('should reject invalid date strings', () => {
      const invalidDates = [
        'invalid-date',
        '2023-13-01T10:00:00Z', // Invalid month
        '2023-12-32T10:00:00Z', // Invalid day
        '2023-12-01T25:00:00Z', // Invalid hour
        '2023-12-01T10:60:00Z', // Invalid minute
        '2023-12-01',            // Missing time
        ''
      ]

      invalidDates.forEach(date => {
        expect(DateValidator.isValidISODate(date)).toBe(false)
      })
    })

    it('should validate chronological order', () => {
      const startDate = '2023-01-01T00:00:00Z'
      const endDate = '2023-12-31T23:59:59Z'

      expect(DateValidator.isChronologicalOrder(startDate, endDate)).toBe(true)
      expect(DateValidator.isChronologicalOrder(endDate, startDate)).toBe(false)
      expect(DateValidator.isChronologicalOrder(startDate, startDate)).toBe(true) // Same date should be valid
    })

    it('should validate date ranges', () => {
      const validRange = {
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-12-31T23:59:59Z'
      }

      const invalidRange = {
        startDate: '2023-12-31T23:59:59Z',
        endDate: '2023-01-01T00:00:00Z'
      }

      const openRange = {
        startDate: '2023-01-01T00:00:00Z',
        endDate: undefined
      }

      expect(DateValidator.validateDateRange(validRange)).toBe(true)
      expect(DateValidator.validateDateRange(invalidRange)).toBe(false)
      expect(DateValidator.validateDateRange(openRange)).toBe(true)
    })

    it('should check if date is in the past', () => {
      const pastDate = '2020-01-01T00:00:00Z'
      const futureDate = new Date(Date.now() + 86400000).toISOString() // Tomorrow

      expect(DateValidator.isInPast(pastDate)).toBe(true)
      expect(DateValidator.isInPast(futureDate)).toBe(false)
    })

    it('should check if date is in the future', () => {
      const pastDate = '2020-01-01T00:00:00Z'
      const futureDate = new Date(Date.now() + 86400000).toISOString() // Tomorrow

      expect(DateValidator.isInFuture(pastDate)).toBe(false)
      expect(DateValidator.isInFuture(futureDate)).toBe(true)
    })

    it('should format dates for display', () => {
      const isoDate = '2023-12-01T10:30:00Z'
      
      expect(DateValidator.formatDateForDisplay(isoDate)).toBe('December 1, 2023')
      expect(DateValidator.formatDateForDisplay(isoDate, { includeTime: true })).toContain('10:30')
      expect(DateValidator.formatDateForDisplay(isoDate, { format: 'short' })).toBe('Dec 1, 2023')
    })
  })

  describe('DurationCalculator', () => {
    let calculator: DurationCalculator

    beforeEach(() => {
      calculator = new DurationCalculator()
    })

    it('should calculate duration between dates', () => {
      const startDate = '2023-01-01T00:00:00Z'
      const endDate = '2023-12-31T23:59:59Z'

      const duration = DurationCalculator.calculateDuration(startDate, endDate)
      
      expect(duration.years).toBe(0)
      expect(duration.months).toBe(11)
      expect(duration.days).toBeGreaterThan(360)
      expect(duration.totalDays).toBeGreaterThan(360)
    })

    it('should calculate duration with open end date (current)', () => {
      const startDate = '2023-01-01T00:00:00Z'
      
      const duration = DurationCalculator.calculateDuration(startDate)
      
      expect(duration.years).toBeGreaterThanOrEqual(0)
      expect(duration.months).toBeGreaterThanOrEqual(0)
      expect(duration.totalDays).toBeGreaterThan(0)
    })

    it('should format duration as human readable string', () => {
      const oneYearDuration = {
        years: 1,
        months: 0,
        days: 0,
        totalDays: 365
      }

      const multiPeriodDuration = {
        years: 2,
        months: 3,
        days: 15,
        totalDays: 835
      }

      expect(DurationCalculator.formatDuration(oneYearDuration)).toBe('1 year')
      expect(DurationCalculator.formatDuration(multiPeriodDuration)).toBe('2 years, 3 months')
      expect(DurationCalculator.formatDuration(multiPeriodDuration, { includeDays: true })).toContain('15 days')
    })

    it('should format duration as short string', () => {
      const duration = {
        years: 2,
        months: 3,
        days: 15,
        totalDays: 835
      }

      expect(DurationCalculator.formatDurationShort(duration)).toBe('2y 3m')
    })

    it('should calculate total working days', () => {
      const startDate = '2023-01-02T00:00:00Z' // Monday
      const endDate = '2023-01-08T00:00:00Z'   // Sunday (1 week)

      const workingDays = DurationCalculator.calculateWorkingDays(startDate, endDate)
      
      expect(workingDays).toBe(5) // Monday to Friday
    })

    it('should calculate duration in different units', () => {
      const startDate = '2023-01-01T00:00:00Z'
      const endDate = '2023-01-08T00:00:00Z' // 1 week

      const durationInWeeks = DurationCalculator.calculateDurationInUnit(startDate, endDate, 'weeks')
      const durationInMonths = DurationCalculator.calculateDurationInUnit(startDate, endDate, 'months')
      
      expect(durationInWeeks).toBe(1)
      expect(durationInMonths).toBeCloseTo(0.25, 1)
    })
  })

  describe('ResumeTimelineValidator', () => {
    let validator: ResumeTimelineValidator

    beforeEach(() => {
      validator = new ResumeTimelineValidator()
    })

    it('should validate resume entry dates', () => {
      const validEntry = {
        id: 'job1',
        type: 'employment' as const,
        title: 'Developer',
        organization: 'Company',
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-12-31T23:59:59Z'
      }

      const result = ResumeTimelineValidator.validateResumeEntry(validEntry)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid date ranges', () => {
      const invalidEntry = {
        id: 'job1',
        type: 'employment' as const,
        title: 'Developer',
        organization: 'Company',
        startDate: '2023-12-31T23:59:59Z', // End before start
        endDate: '2023-01-01T00:00:00Z'
      }

      const result = ResumeTimelineValidator.validateResumeEntry(invalidEntry)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some(error => error.includes('chronological'))).toBe(true)
    })

    it('should validate current positions (no end date)', () => {
      const currentEntry = {
        id: 'current-job',
        type: 'employment' as const,
        title: 'Senior Developer',
        organization: 'Current Company',
        startDate: '2023-01-01T00:00:00Z'
        // No endDate = current position
      }

      const result = ResumeTimelineValidator.validateResumeEntry(currentEntry)
      expect(result.valid).toBe(true)
    })

    it('should detect overlapping employment periods', () => {
      const entries = [
        {
          id: 'job1',
          type: 'employment' as const,
          title: 'Developer',
          organization: 'Company A',
          startDate: '2023-01-01T00:00:00Z',
          endDate: '2023-06-30T23:59:59Z'
        },
        {
          id: 'job2',
          type: 'employment' as const,
          title: 'Senior Developer',
          organization: 'Company B',
          startDate: '2023-05-01T00:00:00Z', // Overlaps with job1
          endDate: '2023-12-31T23:59:59Z'
        }
      ]

      const result = ResumeTimelineValidator.validateTimeline(entries)
      expect(result.valid).toBe(false)
      expect(result.overlaps.length).toBeGreaterThan(0)
      expect(result.overlaps[0]).toEqual({
        entry1: 'job1',
        entry2: 'job2',
        type: 'employment_overlap'
      })
    })

    it('should allow overlapping education and employment', () => {
      const entries = [
        {
          id: 'job1',
          type: 'employment' as const,
          title: 'Part-time Developer',
          organization: 'Company',
          startDate: '2022-06-01T00:00:00Z',
          endDate: '2022-12-31T23:59:59Z'
        },
        {
          id: 'education1',
          type: 'education' as const,
          title: 'Computer Science Degree',
          organization: 'University',
          startDate: '2020-09-01T00:00:00Z',
          endDate: '2024-05-15T00:00:00Z'
        }
      ]

      const result = ResumeTimelineValidator.validateTimeline(entries)
      expect(result.valid).toBe(true) // Education and employment can overlap
    })

    it('should generate timeline statistics', () => {
      const entries = [
        {
          id: 'job1',
          type: 'employment' as const,
          title: 'Junior Developer',
          organization: 'Company A',
          startDate: '2021-01-01T00:00:00Z',
          endDate: '2022-12-31T23:59:59Z'
        },
        {
          id: 'job2',
          type: 'employment' as const,
          title: 'Senior Developer',
          organization: 'Company B',
          startDate: '2023-01-01T00:00:00Z'
          // Current position - no end date
        },
        {
          id: 'education1',
          type: 'education' as const,
          title: 'CS Degree',
          organization: 'University',
          startDate: '2018-09-01T00:00:00Z',
          endDate: '2022-05-15T00:00:00Z'
        }
      ]

      const stats = ResumeTimelineValidator.generateTimelineStatistics(entries)
      
      expect(stats.totalEmploymentPeriods).toBe(2)
      expect(stats.totalEducationPeriods).toBe(1)
      expect(stats.currentPositions).toBe(1)
      expect(stats.totalExperienceYears).toBeGreaterThan(1)
      expect(stats.averagePositionDuration).toBeDefined()
      expect(stats.longestPosition).toBeDefined()
      expect(stats.careerProgression).toBeDefined()
    })

    it('should identify career gaps', () => {
      const entriesWithGap = [
        {
          id: 'job1',
          type: 'employment' as const,
          title: 'Developer',
          organization: 'Company A',
          startDate: '2021-01-01T00:00:00Z',
          endDate: '2021-12-31T23:59:59Z'
        },
        {
          id: 'job2',
          type: 'employment' as const,
          title: 'Senior Developer',
          organization: 'Company B',
          startDate: '2023-06-01T00:00:00Z' // 5-month gap
        }
      ]

      const gaps = ResumeTimelineValidator.identifyCareerGaps(entriesWithGap)
      
      expect(gaps.length).toBe(1)
      expect(gaps[0].durationMonths).toBeGreaterThan(4)
      expect(gaps[0].type).toBe('employment_gap')
    })

    it('should calculate career progression metrics', () => {
      const entries = [
        {
          id: 'job1',
          type: 'employment' as const,
          title: 'Junior Developer',
          organization: 'Company A',
          startDate: '2021-01-01T00:00:00Z',
          endDate: '2022-12-31T23:59:59Z',
          seniority: 1
        },
        {
          id: 'job2',
          type: 'employment' as const,
          title: 'Senior Developer',
          organization: 'Company B',
          startDate: '2023-01-01T00:00:00Z',
          seniority: 3
        }
      ]

      const progression = ResumeTimelineValidator.calculateCareerProgression(entries)
      
      expect(progression.seniorityGrowth).toBeGreaterThan(0)
      expect(progression.averagePromotionTime).toBeDefined()
      expect(progression.careerVelocity).toBeDefined()
      expect(progression.progressionRate).toBeGreaterThan(0)
    })
  })
})