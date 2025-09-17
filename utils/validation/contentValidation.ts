import { z } from 'zod'
import type { ContactSubmission } from './content-schemas'
import { ContactSubmissionSchema } from './content-schemas'

// Core validation result types
export interface ValidationResult<T = unknown> {
  success: boolean
  data?: T
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  code: string
  message: string
  value?: unknown
}

export interface ValidationWarning {
  field: string
  code: string
  message: string
  value?: unknown
}

// Rate limiting state
interface RateLimitState {
  attempts: Array<{ timestamp: number; count: number }>
}

// Consolidated validation class
export class ContentValidator {
  private static rateLimitStore = new Map<string, RateLimitState>()
  
  // Email validation patterns
  private static readonly DISPOSABLE_DOMAINS = [
    '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 
    'mailinator.com', 'yopmail.com', 'temp-mail.org'
  ]
  
  private static readonly SUSPICIOUS_EMAIL_PATTERNS = [
    /test@test\.com/i, /admin@admin\.com/i, /noreply@/i, /no-reply@/i, /donotreply@/i
  ]
  
  // Text security patterns
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi, /on\w+\s*=/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*>/gi, /<meta\b[^<]*>/gi
  ]
  
  private static readonly HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;'
  }
  
  // Spam detection patterns
  private static readonly SPAM_PATTERNS = [
    /\b(viagra|cialis|pharmacy|casino|lottery|winner)\b/i,
    /\b(click here|visit now|act now|limited time)\b/i,
    /\$\d+/g, /http[s]?:\/\//g, /\b[A-Z]{5,}\b/g
  ]

  // === EMAIL VALIDATION ===
  static validateEmail(email: string): ValidationResult<string> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push({
        field: 'email',
        code: 'invalid_format',
        message: 'Invalid email format',
        value: email
      })
      return { success: false, errors, warnings }
    }
    
    // Check for invalid patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      errors.push({
        field: 'email',
        code: 'invalid_format',
        message: 'Invalid email format (consecutive dots or leading/trailing dots)',
        value: email
      })
      return { success: false, errors, warnings }
    }
    
    // Check for disposable email
    const domain = email.split('@')[1]?.toLowerCase()
    if (domain && this.DISPOSABLE_DOMAINS.includes(domain)) {
      warnings.push({
        field: 'email',
        code: 'disposable_domain',
        message: `Disposable email domain detected: ${domain}`,
        value: email
      })
    }
    
    // Check for suspicious patterns
    const lowerEmail = email.toLowerCase()
    for (const pattern of this.SUSPICIOUS_EMAIL_PATTERNS) {
      if (pattern.test(lowerEmail)) {
        warnings.push({
          field: 'email',
          code: 'suspicious_pattern',
          message: 'Suspicious email pattern detected',
          value: email
        })
        break
      }
    }
    
    return { success: true, data: email, errors, warnings }
  }

  // === TEXT VALIDATION AND SANITIZATION ===
  static validateText(
    text: string, 
    field: string,
    options: {
      minLength?: number
      maxLength?: number
      allowMarkdown?: boolean
      removeXss?: boolean
    } = {}
  ): ValidationResult<string> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const { minLength = 0, maxLength = Infinity, allowMarkdown = false, removeXss = true } = options
    
    let sanitized = text.trim()
    
    // Length validation
    if (sanitized.length < minLength) {
      errors.push({
        field,
        code: 'too_short',
        message: `Text must be at least ${minLength} characters long`,
        value: sanitized.length
      })
    }
    
    if (sanitized.length > maxLength) {
      errors.push({
        field,
        code: 'too_long',
        message: `Text must not exceed ${maxLength} characters`,
        value: sanitized.length
      })
      // Truncate if too long
      sanitized = sanitized.substring(0, maxLength)
    }
    
    // XSS pattern detection and removal
    if (removeXss) {
      let hadXss = false
      for (const pattern of this.XSS_PATTERNS) {
        if (pattern.test(sanitized)) {
          hadXss = true
          sanitized = sanitized.replace(pattern, '')
        }
      }
      
      if (hadXss) {
        warnings.push({
          field,
          code: 'xss_removed',
          message: 'Potentially dangerous content was removed',
          value: text
        })
      }
    }
    
    // HTML entity escaping (unless markdown is allowed)
    if (!allowMarkdown) {
      sanitized = sanitized.replace(/[&<>"'/]/g, (match) => this.HTML_ENTITIES[match] || match)
    }
    
    return { 
      success: errors.length === 0, 
      data: sanitized, 
      errors, 
      warnings 
    }
  }

  // === RATE LIMITING ===
  static checkRateLimit(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000
  ): ValidationResult<{ remaining: number; resetTime: number }> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Get or create rate limit state
    let state = this.rateLimitStore.get(identifier)
    if (!state) {
      state = { attempts: [] }
      this.rateLimitStore.set(identifier, state)
    }
    
    // Remove expired attempts
    state.attempts = state.attempts.filter(attempt => attempt.timestamp > windowStart)
    
    // Count current attempts
    const currentAttempts = state.attempts.reduce((sum, attempt) => sum + attempt.count, 0)
    
    if (currentAttempts >= maxAttempts) {
      const oldestAttempt = Math.min(...state.attempts.map(a => a.timestamp))
      const resetTime = oldestAttempt + windowMs
      
      errors.push({
        field: 'rate_limit',
        code: 'too_many_attempts',
        message: `Too many attempts. Try again later.`,
        value: currentAttempts
      })
      
      return {
        success: false,
        data: { remaining: 0, resetTime },
        errors,
        warnings
      }
    }
    
    // Add current attempt
    state.attempts.push({ timestamp: now, count: 1 })
    
    return {
      success: true,
      data: {
        remaining: maxAttempts - currentAttempts - 1,
        resetTime: now + windowMs
      },
      errors,
      warnings
    }
  }

  // === HONEYPOT AND BOT DETECTION ===
  static validateHoneypot(honeypotValue: string | undefined): ValidationResult<boolean> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    
    if (honeypotValue && honeypotValue.length > 0) {
      errors.push({
        field: 'honeypot',
        code: 'bot_detected',
        message: 'Bot activity detected',
        value: honeypotValue
      })
      return { success: false, data: false, errors, warnings }
    }
    
    return { success: true, data: true, errors, warnings }
  }
  
  static validateTimestamp(
    timestamp: string | undefined,
    minTimeMs: number = 3000,
    maxTimeMs: number = 30 * 60 * 1000
  ): ValidationResult<number> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    
    if (!timestamp) {
      errors.push({
        field: 'timestamp',
        code: 'missing',
        message: 'Missing timestamp',
        value: timestamp
      })
      return { success: false, errors, warnings }
    }
    
    const submissionTime = new Date(timestamp).getTime()
    const now = Date.now()
    const timeSpent = now - submissionTime
    
    if (isNaN(submissionTime)) {
      errors.push({
        field: 'timestamp',
        code: 'invalid_format',
        message: 'Invalid timestamp format',
        value: timestamp
      })
      return { success: false, errors, warnings }
    }
    
    if (timeSpent < minTimeMs) {
      warnings.push({
        field: 'timestamp',
        code: 'too_fast',
        message: 'Form submitted very quickly',
        value: timeSpent
      })
    }
    
    if (timeSpent > maxTimeMs) {
      warnings.push({
        field: 'timestamp',
        code: 'expired',
        message: 'Form submission may have expired',
        value: timeSpent
      })
    }
    
    return { success: true, data: timeSpent, errors, warnings }
  }

  // === SPAM DETECTION ===
  static detectSpam(text: string, email?: string): ValidationResult<{ score: number; indicators: string[] }> {
    const warnings: ValidationWarning[] = []
    const errors: ValidationError[] = []
    let spamScore = 0
    const indicators: string[] = []
    
    // Check for spam patterns
    for (const pattern of this.SPAM_PATTERNS) {
      const matches = text.match(pattern)
      if (matches) {
        spamScore += matches.length
        indicators.push(`Spam pattern: ${pattern.source}`)
      }
    }
    
    // Check for excessive special characters
    const specialChars = text.match(/[!@#$%^&*()_+={}[\]|\\:";'<>?,./]/g)
    if (specialChars && specialChars.length > text.length * 0.1) {
      spamScore += 1
      indicators.push('Excessive special characters')
    }
    
    // Check email if provided
    if (email) {
      const domain = email.split('@')[1]?.toLowerCase()
      if (domain && this.DISPOSABLE_DOMAINS.includes(domain)) {
        spamScore += 2
        indicators.push('Disposable email domain')
      }
    }
    
    const isSpam = spamScore >= 3
    
    if (isSpam) {
      warnings.push({
        field: 'content',
        code: 'spam_detected',
        message: 'Content flagged as potential spam',
        value: spamScore
      })
    }
    
    return {
      success: !isSpam,
      data: { score: spamScore, indicators },
      errors,
      warnings
    }
  }

  // === CONTACT FORM VALIDATION ===
  static validateContactSubmission(data: unknown): ValidationResult<ContactSubmission> {
    const allErrors: ValidationError[] = []
    const allWarnings: ValidationWarning[] = []
    
    // Basic schema validation
    const schemaResult = ContactSubmissionSchema.safeParse(data)
    if (!schemaResult.success) {
      schemaResult.error.issues.forEach(issue => {
        allErrors.push({
          field: issue.path.join('.') || 'root',
          code: issue.code,
          message: issue.message,
          value: issue.input
        })
      })
      return { success: false, errors: allErrors, warnings: allWarnings }
    }
    
    const submission = schemaResult.data
    
    // Email validation
    const emailValidation = this.validateEmail(submission.email)
    allErrors.push(...emailValidation.errors)
    allWarnings.push(...emailValidation.warnings)
    
    // Name validation
    const nameValidation = this.validateText(submission.name, 'name', {
      minLength: 1,
      maxLength: 100,
      removeXss: true
    })
    allErrors.push(...nameValidation.errors)
    allWarnings.push(...nameValidation.warnings)
    
    // Message validation
    const messageValidation = this.validateText(submission.message, 'message', {
      minLength: 10,
      maxLength: 5000,
      allowMarkdown: true,
      removeXss: true
    })
    allErrors.push(...messageValidation.errors)
    allWarnings.push(...messageValidation.warnings)
    
    // Subject validation (optional)
    let sanitizedSubject = submission.subject
    if (submission.subject) {
      const subjectValidation = this.validateText(submission.subject, 'subject', {
        maxLength: 200,
        removeXss: true
      })
      allErrors.push(...subjectValidation.errors)
      allWarnings.push(...subjectValidation.warnings)
      sanitizedSubject = subjectValidation.data
    }
    
    // Honeypot validation
    const honeypotValidation = this.validateHoneypot(submission.honeypot)
    allErrors.push(...honeypotValidation.errors)
    allWarnings.push(...honeypotValidation.warnings)
    
    // Timestamp validation
    if (submission.timestamp) {
      const timestampValidation = this.validateTimestamp(submission.timestamp)
      allErrors.push(...timestampValidation.errors)
      allWarnings.push(...timestampValidation.warnings)
    }
    
    // Spam detection
    const spamValidation = this.detectSpam(submission.message, submission.email)
    allErrors.push(...spamValidation.errors)
    allWarnings.push(...spamValidation.warnings)
    
    // Create sanitized submission
    const sanitizedSubmission: ContactSubmission = {
      ...submission,
      name: nameValidation.data || submission.name,
      message: messageValidation.data || submission.message,
      subject: sanitizedSubject
    }
    
    return {
      success: allErrors.length === 0,
      data: sanitizedSubmission,
      errors: allErrors,
      warnings: allWarnings
    }
  }

  // === UTILITY METHODS ===
  static clearRateLimit(identifier: string): void {
    this.rateLimitStore.delete(identifier)
  }
  
  static getRateLimitAttempts(identifier: string, windowMs: number = 15 * 60 * 1000): number {
    const state = this.rateLimitStore.get(identifier)
    if (!state) return 0
    
    const now = Date.now()
    const windowStart = now - windowMs
    
    return state.attempts
      .filter(attempt => attempt.timestamp > windowStart)
      .reduce((sum, attempt) => sum + attempt.count, 0)
  }
  
  static aggregateValidationResults<T>(results: ValidationResult<T>[]): ValidationResult<T[]> {
    const allErrors: ValidationError[] = []
    const allWarnings: ValidationWarning[] = []
    const successfulData: T[] = []
    
    for (const result of results) {
      allErrors.push(...result.errors)
      allWarnings.push(...result.warnings)
      
      if (result.success && result.data !== undefined) {
        successfulData.push(result.data)
      }
    }
    
    return {
      success: allErrors.length === 0,
      data: successfulData,
      errors: allErrors,
      warnings: allWarnings
    }
  }
  
  static formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
    const formatted: Record<string, string[]> = {}
    
    for (const error of errors) {
      if (!formatted[error.field]) {
        formatted[error.field] = []
      }
      formatted[error.field].push(error.message)
    }
    
    return formatted
  }
  
  static formatValidationWarnings(warnings: ValidationWarning[]): Record<string, string[]> {
    const formatted: Record<string, string[]> = {}
    
    for (const warning of warnings) {
      if (!formatted[warning.field]) {
        formatted[warning.field] = []
      }
      formatted[warning.field].push(warning.message)
    }
    
    return formatted
  }
}

// Form state management utilities (simplified)
export interface FormState<T = Record<string, unknown>> {
  values: T
  errors: Record<string, string[]>
  warnings: Record<string, string[]>
  isSubmitting: boolean
  hasSubmitted: boolean
  isValid: boolean
}

export class FormStateManager<T = Record<string, unknown>> {
  private state: FormState<T>
  
  constructor(initialValues: T) {
    this.state = {
      values: initialValues,
      errors: {},
      warnings: {},
      isSubmitting: false,
      hasSubmitted: false,
      isValid: false
    }
  }
  
  getState(): FormState<T> {
    return { ...this.state }
  }
  
  updateField(field: keyof T, value: T[keyof T]): void {
    this.state.values = { ...this.state.values, [field]: value }
    this.clearFieldErrors(field as string)
    this.updateValidState()
  }
  
  setErrors(errors: Record<string, string[]>): void {
    this.state.errors = errors
    this.updateValidState()
  }
  
  setWarnings(warnings: Record<string, string[]>): void {
    this.state.warnings = warnings
  }
  
  clearFieldErrors(field: string): void {
    const { [field]: removed, ...rest } = this.state.errors
    this.state.errors = rest
    this.updateValidState()
  }
  
  setSubmitting(isSubmitting: boolean): void {
    this.state.isSubmitting = isSubmitting
  }
  
  setSubmitted(hasSubmitted: boolean): void {
    this.state.hasSubmitted = hasSubmitted
  }
  
  private updateValidState(): void {
    this.state.isValid = Object.keys(this.state.errors).length === 0
  }
  
  reset(initialValues?: T): void {
    this.state = {
      values: initialValues || ({} as T),
      errors: {},
      warnings: {},
      isSubmitting: false,
      hasSubmitted: false,
      isValid: false
    }
  }
}