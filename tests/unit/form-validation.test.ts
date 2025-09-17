import { describe, it, expect, beforeEach } from 'vitest'
import {
  ContactFormValidator,
  EmailValidator,
  TextSanitizer,
  RateLimiter,
  HoneypotValidator,
  FormStateManager
} from '../../utils/validation/form-validation'

describe('Form Validation Utilities', () => {
  describe('EmailValidator', () => {
    it('should validate email format correctly', () => {
      expect(EmailValidator.validateFormat('test@example.com').valid).toBe(true)
      expect(EmailValidator.validateFormat('invalid-email').valid).toBe(false)
      expect(EmailValidator.validateFormat('test@').valid).toBe(false)
      expect(EmailValidator.validateFormat('@example.com').valid).toBe(false)
      expect(EmailValidator.validateFormat('test..test@example.com').valid).toBe(false)
    })

    it('should detect disposable email domains', () => {
      const result = EmailValidator.checkDisposableEmail('test@10minutemail.com')
      expect(result.isDisposable).toBe(true)
      expect(result.domain).toBe('10minutemail.com')

      const legitimateResult = EmailValidator.checkDisposableEmail('test@gmail.com')
      expect(legitimateResult.isDisposable).toBe(false)
    })

    it('should detect suspicious email patterns', () => {
      expect(EmailValidator.checkSuspiciousEmail('test@test.com').isSuspicious).toBe(true)
      expect(EmailValidator.checkSuspiciousEmail('admin@admin.com').isSuspicious).toBe(true)
      expect(EmailValidator.checkSuspiciousEmail('noreply@example.com').isSuspicious).toBe(true)
      expect(EmailValidator.checkSuspiciousEmail('john@example.com').isSuspicious).toBe(false)
    })

    it('should provide comprehensive email validation', () => {
      const validResult = EmailValidator.validateEmailComprehensive('john@gmail.com')
      expect(validResult.valid).toBe(true)
      expect(validResult.errors).toHaveLength(0)

      const invalidResult = EmailValidator.validateEmailComprehensive('invalid-email')
      expect(invalidResult.valid).toBe(false)
      expect(invalidResult.errors.length).toBeGreaterThan(0)

      const disposableResult = EmailValidator.validateEmailComprehensive('test@tempmail.org')
      expect(disposableResult.valid).toBe(true)
      expect(disposableResult.warnings.length).toBeGreaterThan(0)
    })
  })

  describe('TextSanitizer', () => {
    it('should sanitize HTML entities', () => {
      const input = '<script>alert("xss")</script>&amp;test'
      const sanitized = TextSanitizer.sanitizeHtml(input)
      
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;&amp;amp;test')
    })

    it('should remove XSS patterns', () => {
      const input = '<script>alert("xss")</script>Hello World<iframe src="evil"></iframe>'
      const sanitized = TextSanitizer.removeXssPatterns(input)
      
      expect(sanitized).toBe('Hello World')
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('<iframe>')
    })

    it('should sanitize text with options', () => {
      const input = '  <script>alert("xss")</script>Hello World  '
      const sanitized = TextSanitizer.sanitizeText(input, { maxLength: 50 })
      
      expect(sanitized).toBe('Hello World')
      expect(sanitized).not.toContain('<script>')
    })

    it('should validate text length', () => {
      expect(TextSanitizer.validateTextLength('Hello', 3, 10).valid).toBe(true)
      expect(TextSanitizer.validateTextLength('Hi', 3, 10).valid).toBe(false)
      expect(TextSanitizer.validateTextLength('This is too long', 3, 10).valid).toBe(false)
    })
  })

  describe('RateLimiter', () => {
    beforeEach(() => {
      // Clear rate limiter state before each test
      RateLimiter.clearAttempts('test-client')
    })

    it('should allow submissions within rate limits', () => {
      const result1 = RateLimiter.checkRateLimit('test-client', 5, 60000)
      expect(result1.allowed).toBe(true)
      expect(result1.remaining).toBe(4)

      const result2 = RateLimiter.checkRateLimit('test-client', 5, 60000)
      expect(result2.allowed).toBe(true)
      expect(result2.remaining).toBe(3)
    })

    it('should block submissions that exceed rate limits', () => {
      // Use up all attempts
      for (let i = 0; i < 5; i++) {
        RateLimiter.checkRateLimit('aggressive-client', 5, 60000)
      }
      
      const result = RateLimiter.checkRateLimit('aggressive-client', 5, 60000)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('should track different clients separately', () => {
      // Use up client1's attempts
      for (let i = 0; i < 5; i++) {
        RateLimiter.checkRateLimit('client-1', 5, 60000)
      }
      
      const client1Result = RateLimiter.checkRateLimit('client-1', 5, 60000)
      const client2Result = RateLimiter.checkRateLimit('client-2', 5, 60000)
      
      expect(client1Result.allowed).toBe(false)
      expect(client2Result.allowed).toBe(true)
    })

    it('should get attempt count', () => {
      RateLimiter.checkRateLimit('count-client', 5, 60000)
      RateLimiter.checkRateLimit('count-client', 5, 60000)
      
      const count = RateLimiter.getAttemptCount('count-client', 60000)
      expect(count).toBe(2)
    })
  })

  describe('HoneypotValidator', () => {
    it('should pass validation when honeypot field is empty', () => {
      const result = HoneypotValidator.validateHoneypot('')
      expect(result.isBot).toBe(false)
    })

    it('should fail validation when honeypot field is filled', () => {
      const result = HoneypotValidator.validateHoneypot('I am a bot')
      expect(result.isBot).toBe(true)
      expect(result.reason).toBe('Honeypot field filled')
    })

    it('should pass validation when honeypot field is undefined', () => {
      const result = HoneypotValidator.validateHoneypot(undefined)
      expect(result.isBot).toBe(false)
    })

    it('should validate form timestamps', () => {
      const now = new Date().toISOString()
      const tooFast = new Date(Date.now() - 1000).toISOString() // 1 second ago
      const tooOld = new Date(Date.now() - 40 * 60 * 1000).toISOString() // 40 minutes ago
      const validTime = new Date(Date.now() - 10000).toISOString() // 10 seconds ago

      expect(HoneypotValidator.validateTimestamp(tooFast).valid).toBe(false)
      expect(HoneypotValidator.validateTimestamp(tooOld).valid).toBe(false)
      expect(HoneypotValidator.validateTimestamp(validTime).valid).toBe(true)
      expect(HoneypotValidator.validateTimestamp(undefined).valid).toBe(false)
    })
  })

  describe('ContactFormValidator', () => {
    it('should validate a complete contact form submission', () => {
      const validSubmission = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'I would like to discuss a potential project with you.',
        honeypot: '',
        timestamp: new Date(Date.now() - 10000).toISOString()
      }

      const result = ContactFormValidator.validateSubmission(validSubmission)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.data).toBeDefined()
    })

    it('should reject submissions with missing required fields', () => {
      const incompleteSubmission = {
        name: 'John Doe',
        email: 'john@example.com'
        // Missing message
      }

      const result = ContactFormValidator.validateSubmission(incompleteSubmission)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should reject submissions with invalid email format', () => {
      const invalidEmailSubmission = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'This is a test message that is long enough to pass validation.'
      }

      const result = ContactFormValidator.validateSubmission(invalidEmailSubmission)
      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('email'))).toBe(true)
    })

    it('should reject submissions that are too short', () => {
      const shortSubmission = {
        name: 'J',
        email: 'j@example.com',
        message: 'Hi'
      }

      const result = ContactFormValidator.validateSubmission(shortSubmission)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should detect bot submissions via honeypot', () => {
      const botSubmission = {
        name: 'Bot Name',
        email: 'bot@spam.com',
        message: 'This is a spam message that is long enough to pass length validation.',
        honeypot: 'I am a bot' // Bots fill this field
      }

      const result = ContactFormValidator.validateSubmission(botSubmission)
      expect(result.valid).toBe(false)
      expect(result.errors.some(error => error.includes('Bot detection'))).toBe(true)
    })

    it('should validate rate limits', () => {
      const result = ContactFormValidator.validateRateLimit('test@example.com')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBeDefined()
      expect(result.resetTime).toBeDefined()
    })

    it('should detect spam indicators', () => {
      const spamSubmission = {
        name: 'Test',
        email: 'test@tempmail.org',
        message: 'URGENT!!! Make money fast! Click here now! Visit https://spam1.com and https://spam2.com and https://spam3.com for amazing deals!'
      }

      const result = ContactFormValidator.validateSpamIndicators(spamSubmission)
      expect(result.isSpam).toBe(true)
      expect(result.score).toBeGreaterThan(0)
      expect(result.indicators.length).toBeGreaterThan(0)
    })
  })

  describe('FormStateManager', () => {
    let manager: FormStateManager

    beforeEach(() => {
      manager = new FormStateManager({ name: 'Initial Name' })
    })

    it('should initialize with initial values', () => {
      const state = manager.getState()
      expect(state.values.name).toBe('Initial Name')
      expect(state.isSubmitting).toBe(false)
      expect(state.hasSubmitted).toBe(false)
    })

    it('should update individual field values', () => {
      manager.setValue('email', 'test@example.com')
      const state = manager.getState()
      expect(state.values.email).toBe('test@example.com')
    })

    it('should update multiple values at once', () => {
      manager.setValues({ email: 'test@example.com', message: 'Hello World' })
      const state = manager.getState()
      expect(state.values.email).toBe('test@example.com')
      expect(state.values.message).toBe('Hello World')
    })

    it('should manage field errors', () => {
      manager.setFieldError('email', ['Invalid email format'])
      let state = manager.getState()
      expect(state.errors.email).toEqual(['Invalid email format'])
      expect(state.isValid).toBe(false)

      manager.clearFieldErrors('email')
      state = manager.getState()
      expect(state.errors.email).toBeUndefined()
      expect(state.isValid).toBe(true)
    })

    it('should manage field warnings', () => {
      manager.setFieldWarning('email', ['Disposable email detected'])
      const state = manager.getState()
      expect(state.warnings.email).toEqual(['Disposable email detected'])
    })

    it('should manage submission state', () => {
      manager.setSubmitting(true)
      let state = manager.getState()
      expect(state.isSubmitting).toBe(true)

      manager.setSubmitted(true)
      state = manager.getState()
      expect(state.hasSubmitted).toBe(true)
    })

    it('should reset form state', () => {
      manager.setValue('email', 'test@example.com')
      manager.setFieldError('name', ['Required field'])
      manager.setSubmitting(true)
      
      manager.reset()
      const state = manager.getState()
      
      expect(state.values).toEqual({})
      expect(state.errors).toEqual({})
      expect(state.isSubmitting).toBe(false)
      expect(state.hasSubmitted).toBe(false)
    })
  })
})