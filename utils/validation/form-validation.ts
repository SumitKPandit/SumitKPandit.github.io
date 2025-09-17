import { ContactSubmissionSchema, type ContactSubmission } from '../validation/content-schemas'
import { z } from 'zod'

// Email validation utilities
export class EmailValidator {
  private static readonly DISPOSABLE_DOMAINS = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'yopmail.com',
    'temp-mail.org'
  ]
  
  private static readonly SUSPICIOUS_PATTERNS = [
    /test@test\.com/i,
    /admin@admin\.com/i,
    /noreply@/i,
    /no-reply@/i,
    /donotreply@/i
  ]
  
  static validateFormat(email: string): { valid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Invalid email format' }
    }
    
    // Check for common invalid patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      return { valid: false, error: 'Invalid email format' }
    }
    
    return { valid: true }
  }
  
  static checkDisposableEmail(email: string): { isDisposable: boolean; domain?: string } {
    const domain = email.split('@')[1]?.toLowerCase()
    
    if (!domain) {
      return { isDisposable: false }
    }
    
    const isDisposable = this.DISPOSABLE_DOMAINS.includes(domain)
    return { isDisposable, domain }
  }
  
  static checkSuspiciousEmail(email: string): { isSuspicious: boolean; reason?: string } {
    const lowerEmail = email.toLowerCase()
    
    for (const pattern of this.SUSPICIOUS_PATTERNS) {
      if (pattern.test(lowerEmail)) {
        return { isSuspicious: true, reason: 'Suspicious email pattern detected' }
      }
    }
    
    return { isSuspicious: false }
  }
  
  static validateEmailComprehensive(email: string): {
    valid: boolean
    warnings: string[]
    errors: string[]
  } {
    const warnings: string[] = []
    const errors: string[] = []
    
    // Basic format validation
    const formatResult = this.validateFormat(email)
    if (!formatResult.valid) {
      errors.push(formatResult.error!)
      return { valid: false, warnings, errors }
    }
    
    // Check for disposable email
    const disposableResult = this.checkDisposableEmail(email)
    if (disposableResult.isDisposable) {
      warnings.push(`Disposable email domain detected: ${disposableResult.domain}`)
    }
    
    // Check for suspicious patterns
    const suspiciousResult = this.checkSuspiciousEmail(email)
    if (suspiciousResult.isSuspicious) {
      warnings.push(suspiciousResult.reason!)
    }
    
    return { valid: true, warnings, errors }
  }
}

// Text sanitization utilities
export class TextSanitizer {
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /<link\b[^<]*>/gi,
    /<meta\b[^<]*>/gi
  ]
  
  private static readonly HTML_ENTITIES: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }
  
  static sanitizeHtml(input: string): string {
    return input.replace(/[&<>"'/]/g, (match) => this.HTML_ENTITIES[match] || match)
  }
  
  static removeXssPatterns(input: string): string {
    let sanitized = input
    
    for (const pattern of this.XSS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '')
    }
    
    return sanitized
  }
  
  static sanitizeText(input: string, options: {
    allowBasicMarkdown?: boolean
    maxLength?: number
    removeXss?: boolean
  } = {}): string {
    const {
      allowBasicMarkdown = false,
      maxLength,
      removeXss = true
    } = options
    
    let sanitized = input.trim()
    
    // Remove XSS patterns
    if (removeXss) {
      sanitized = this.removeXssPatterns(sanitized)
    }
    
    // Escape HTML entities unless basic markdown is allowed
    if (!allowBasicMarkdown) {
      sanitized = this.sanitizeHtml(sanitized)
    }
    
    // Truncate if max length specified
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength)
    }
    
    return sanitized
  }
  
  static validateTextLength(input: string, min: number, max: number): {
    valid: boolean
    error?: string
  } {
    const length = input.trim().length
    
    if (length < min) {
      return { valid: false, error: `Text must be at least ${min} characters long` }
    }
    
    if (length > max) {
      return { valid: false, error: `Text must not exceed ${max} characters` }
    }
    
    return { valid: true }
  }
}

// Rate limiting utilities
export class RateLimiter {
  private static attempts: Map<string, Array<{ timestamp: number; count: number }>> = new Map()
  
  static checkRateLimit(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Get existing attempts for this identifier
    let attempts = this.attempts.get(identifier) || []
    
    // Remove expired attempts
    attempts = attempts.filter(attempt => attempt.timestamp > windowStart)
    
    // Count current attempts
    const currentAttempts = attempts.reduce((sum, attempt) => sum + attempt.count, 0)
    
    if (currentAttempts >= maxAttempts) {
      const oldestAttempt = Math.min(...attempts.map(a => a.timestamp))
      const resetTime = oldestAttempt + windowMs
      
      return {
        allowed: false,
        remaining: 0,
        resetTime
      }
    }
    
    // Add current attempt
    attempts.push({ timestamp: now, count: 1 })
    this.attempts.set(identifier, attempts)
    
    return {
      allowed: true,
      remaining: maxAttempts - currentAttempts - 1,
      resetTime: now + windowMs
    }
  }
  
  static clearAttempts(identifier: string): void {
    this.attempts.delete(identifier)
  }
  
  static getAttemptCount(identifier: string, windowMs: number = 15 * 60 * 1000): number {
    const now = Date.now()
    const windowStart = now - windowMs
    const attempts = this.attempts.get(identifier) || []
    
    return attempts
      .filter(attempt => attempt.timestamp > windowStart)
      .reduce((sum, attempt) => sum + attempt.count, 0)
  }
}

// Honeypot validation (anti-bot)
export class HoneypotValidator {
  static validateHoneypot(honeypotValue: string | undefined): {
    isBot: boolean
    reason?: string
  } {
    // Honeypot should be empty for human users
    if (honeypotValue && honeypotValue.length > 0) {
      return { isBot: true, reason: 'Honeypot field filled' }
    }
    
    return { isBot: false }
  }
  
  static validateTimestamp(
    timestamp: string | undefined,
    minTimeMs: number = 3000, // 3 seconds minimum
    maxTimeMs: number = 30 * 60 * 1000 // 30 minutes maximum
  ): {
    valid: boolean
    reason?: string
  } {
    if (!timestamp) {
      return { valid: false, reason: 'Missing timestamp' }
    }
    
    const submissionTime = new Date(timestamp).getTime()
    const now = Date.now()
    const timeSpent = now - submissionTime
    
    if (timeSpent < minTimeMs) {
      return { valid: false, reason: 'Form submitted too quickly' }
    }
    
    if (timeSpent > maxTimeMs) {
      return { valid: false, reason: 'Form submission expired' }
    }
    
    return { valid: true }
  }
}

// Contact form specific validator
export class ContactFormValidator {
  static validateSubmission(data: unknown): {
    valid: boolean
    data?: ContactSubmission
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Basic schema validation
    const schemaResult = ContactSubmissionSchema.safeParse(data)
    if (!schemaResult.success) {
      const schemaErrors = schemaResult.error.issues.map(
        (err: any) => `${err.path.join('.')}: ${err.message}`
      )
      errors.push(...schemaErrors)
      return { valid: false, errors, warnings }
    }
    
    const submission = schemaResult.data
    
    // Email validation
    const emailValidation = EmailValidator.validateEmailComprehensive(submission.email)
    if (!emailValidation.valid) {
      errors.push(...emailValidation.errors)
    }
    warnings.push(...emailValidation.warnings)
    
    // Text sanitization and validation
    const sanitizedName = TextSanitizer.sanitizeText(submission.name, { maxLength: 100 })
    const sanitizedMessage = TextSanitizer.sanitizeText(submission.message, { 
      maxLength: 5000,
      allowBasicMarkdown: true 
    })
    
    // Name validation
    const nameValidation = TextSanitizer.validateTextLength(sanitizedName, 1, 100)
    if (!nameValidation.valid) {
      errors.push(nameValidation.error!)
    }
    
    // Message validation
    const messageValidation = TextSanitizer.validateTextLength(sanitizedMessage, 10, 5000)
    if (!messageValidation.valid) {
      errors.push(messageValidation.error!)
    }
    
    // Honeypot validation
    const honeypotValidation = HoneypotValidator.validateHoneypot(submission.honeypot)
    if (honeypotValidation.isBot) {
      errors.push('Bot detection triggered')
    }
    
    // Timestamp validation
    if (submission.timestamp) {
      const timestampValidation = HoneypotValidator.validateTimestamp(submission.timestamp)
      if (!timestampValidation.valid) {
        warnings.push(timestampValidation.reason!)
      }
    }
    
    // Create sanitized submission
    const sanitizedSubmission: ContactSubmission = {
      ...submission,
      name: sanitizedName,
      message: sanitizedMessage,
      subject: submission.subject ? TextSanitizer.sanitizeText(submission.subject, { maxLength: 200 }) : undefined
    }
    
    return {
      valid: errors.length === 0,
      data: sanitizedSubmission,
      errors,
      warnings
    }
  }
  
  static validateRateLimit(
    email: string,
    userAgent?: string
  ): {
    allowed: boolean
    remaining: number
    resetTime: number
  } {
    // Use email as primary identifier, fallback to user agent
    const identifier = email || userAgent || 'anonymous'
    
    return RateLimiter.checkRateLimit(identifier, 3, 15 * 60 * 1000) // 3 attempts per 15 minutes
  }
  
  static validateSpamIndicators(submission: ContactSubmission): {
    isSpam: boolean
    score: number
    indicators: string[]
  } {
    let spamScore = 0
    const indicators: string[] = []
    
    // Check for common spam patterns in message
    const spamPatterns = [
      /\b(viagra|cialis|pharmacy|casino|lottery|winner)\b/i,
      /\b(click here|visit now|act now|limited time)\b/i,
      /\$\d+/g, // Money amounts
      /http[s]?:\/\//g, // URLs (multiple)
      /\b[A-Z]{5,}\b/g // Excessive caps
    ]
    
    for (const pattern of spamPatterns) {
      const matches = submission.message.match(pattern)
      if (matches) {
        spamScore += matches.length
        indicators.push(`Spam pattern detected: ${pattern.source}`)
      }
    }
    
    // Check message/name ratio (spam often has very short names, long messages)
    const nameWords = submission.name.split(/\s+/).length
    const messageWords = submission.message.split(/\s+/).length
    
    if (nameWords < 2 && messageWords > 50) {
      spamScore += 2
      indicators.push('Suspicious name/message length ratio')
    }
    
    // Check for excessive punctuation or special characters
    const specialChars = submission.message.match(/[!@#$%^&*()_+={}[\]|\\:";'<>?,./]/g)
    if (specialChars && specialChars.length > submission.message.length * 0.1) {
      spamScore += 1
      indicators.push('Excessive special characters')
    }
    
    // Check email reputation
    const emailCheck = EmailValidator.checkDisposableEmail(submission.email)
    if (emailCheck.isDisposable) {
      spamScore += 2
      indicators.push('Disposable email domain')
    }
    
    return {
      isSpam: spamScore >= 3,
      score: spamScore,
      indicators
    }
  }
}

// Form state management utilities
export interface FormState {
  values: Record<string, any>
  errors: Record<string, string[]>
  warnings: Record<string, string[]>
  isSubmitting: boolean
  hasSubmitted: boolean
  isValid: boolean
}

export class FormStateManager {
  private state: FormState
  
  constructor(initialValues: Record<string, any> = {}) {
    this.state = {
      values: initialValues,
      errors: {},
      warnings: {},
      isSubmitting: false,
      hasSubmitted: false,
      isValid: false
    }
  }
  
  getState(): FormState {
    return { ...this.state }
  }
  
  setValue(field: string, value: any): void {
    this.state.values[field] = value
    this.clearFieldErrors(field)
    this.validateField(field)
  }
  
  setValues(values: Record<string, any>): void {
    this.state.values = { ...this.state.values, ...values }
    this.validateAll()
  }
  
  setFieldError(field: string, errors: string[]): void {
    this.state.errors[field] = errors
    this.updateValidState()
  }
  
  setFieldWarning(field: string, warnings: string[]): void {
    this.state.warnings[field] = warnings
  }
  
  clearFieldErrors(field: string): void {
    delete this.state.errors[field]
    this.updateValidState()
  }
  
  clearAllErrors(): void {
    this.state.errors = {}
    this.updateValidState()
  }
  
  setSubmitting(isSubmitting: boolean): void {
    this.state.isSubmitting = isSubmitting
  }
  
  setSubmitted(hasSubmitted: boolean): void {
    this.state.hasSubmitted = hasSubmitted
  }
  
  private validateField(field: string): void {
    // Field-specific validation logic would go here
    // This is a placeholder for custom validation rules
  }
  
  private validateAll(): void {
    // Validate all fields
    for (const field in this.state.values) {
      this.validateField(field)
    }
  }
  
  private updateValidState(): void {
    this.state.isValid = Object.keys(this.state.errors).length === 0
  }
  
  reset(): void {
    this.state = {
      values: {},
      errors: {},
      warnings: {},
      isSubmitting: false,
      hasSubmitted: false,
      isValid: false
    }
  }
}