import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  ContentValidationError,
  FormSubmissionError,
  ContentNotFoundError,
  ExternalServiceError,
  ErrorHandler,
  Logger,
  ErrorFormatter,
  DevelopmentUtils,
  type ErrorContext,
  type ValidationErrorDetail
} from '../../utils/error/error-handling'

describe('Error Handling Utilities', () => {
  let mockContext: ErrorContext

  beforeEach(() => {
    mockContext = {
      operation: 'test-operation',
      timestamp: new Date().toISOString(),
      userAgent: 'test-agent',
      path: '/test',
      userId: 'test-user'
    }
    
    // Clear static state
    ErrorHandler.clearErrors()
    Logger.clearLogs()
  })

  describe('Custom Error Classes', () => {
    it('should create ContentValidationError with proper properties', () => {
      const details: ValidationErrorDetail[] = [
        { field: 'name', message: 'Name is required', code: 'REQUIRED' }
      ]
      const error = new ContentValidationError('Invalid content', details, mockContext)
      
      expect(error.name).toBe('ContentValidationError')
      expect(error.message).toBe('Invalid content')
      expect(error.type).toBe('validation')
      expect(error.details).toEqual(details)
      expect(error.context).toEqual(mockContext)
      expect(error.severity).toBe('medium')
      expect(error.retryable).toBe(false)
      expect(error instanceof Error).toBe(true)
    })

    it('should create FormSubmissionError with proper properties', () => {
      const error = new FormSubmissionError('Form validation failed', mockContext, 'high', false)
      
      expect(error.name).toBe('FormSubmissionError')
      expect(error.message).toBe('Form validation failed')
      expect(error.type).toBe('form')
      expect(error.context).toEqual(mockContext)
      expect(error.severity).toBe('high')
      expect(error.retryable).toBe(false)
    })

    it('should create ContentNotFoundError with proper properties', () => {
      const error = new ContentNotFoundError('Content not found', mockContext)
      
      expect(error.name).toBe('ContentNotFoundError')
      expect(error.message).toBe('Content not found')
      expect(error.type).toBe('content')
      expect(error.context).toEqual(mockContext)
      expect(error.severity).toBe('low')
      expect(error.retryable).toBe(false)
    })

    it('should create ExternalServiceError with proper properties', () => {
      const error = new ExternalServiceError('API call failed', mockContext, 404, 'high')
      
      expect(error.name).toBe('ExternalServiceError')
      expect(error.message).toBe('API call failed')
      expect(error.type).toBe('external')
      expect(error.context).toEqual(mockContext)
      expect(error.statusCode).toBe(404)
      expect(error.severity).toBe('high')
      expect(error.retryable).toBe(true)
    })
  })

  describe('ErrorHandler', () => {
    it('should create and record errors', () => {
      const appError = ErrorHandler.createError('validation', 'Test error', mockContext)
      
      expect(appError.id).toBeDefined()
      expect(appError.type).toBe('validation')
      expect(appError.message).toBe('Test error')
      expect(appError.context).toMatchObject(mockContext)
      
      const errors = ErrorHandler.getErrors()
      expect(errors).toHaveLength(1)
      expect(errors[0]).toEqual(appError)
    })

    it('should handle different error types', () => {
      const validationError = new ContentValidationError(
        'Validation failed',
        [{ field: 'name', message: 'Required', code: 'REQUIRED' }],
        mockContext
      )
      const formError = new FormSubmissionError('Form failed', mockContext)
      const contentError = new ContentNotFoundError('Not found', mockContext)
      const serviceError = new ExternalServiceError('Service failed', mockContext, 500)

      ErrorHandler.handleValidationError(validationError)
      ErrorHandler.handleFormError(formError)
      ErrorHandler.handleContentError(contentError)
      ErrorHandler.handleExternalError(serviceError)

      const errors = ErrorHandler.getErrors()
      expect(errors).toHaveLength(4)
      
      expect(errors.some(e => e.type === 'validation')).toBe(true)
      expect(errors.some(e => e.type === 'form')).toBe(true)
      expect(errors.some(e => e.type === 'content')).toBe(true)
      expect(errors.some(e => e.type === 'external')).toBe(true)
    })

    it('should filter errors', () => {
      ErrorHandler.createError('validation', 'Error 1', mockContext, { severity: 'high' })
      ErrorHandler.createError('form', 'Error 2', mockContext, { severity: 'low' })
      ErrorHandler.createError('validation', 'Error 3', mockContext, { severity: 'high' })

      const validationErrors = ErrorHandler.getErrors({ type: 'validation' })
      expect(validationErrors).toHaveLength(2)

      const highSeverityErrors = ErrorHandler.getErrors({ severity: 'high' })
      expect(highSeverityErrors).toHaveLength(2)

      const limitedErrors = ErrorHandler.getErrors({ limit: 2 })
      expect(limitedErrors).toHaveLength(2)
    })

    it('should provide error statistics', () => {
      ErrorHandler.createError('validation', 'Error 1', mockContext, { severity: 'high' })
      ErrorHandler.createError('form', 'Error 2', mockContext, { severity: 'low' })
      ErrorHandler.createError('validation', 'Error 3', mockContext, { severity: 'medium' })

      const stats = ErrorHandler.getErrorStats()
      
      expect(stats.total).toBe(3)
      expect(stats.byType.validation).toBe(2)
      expect(stats.byType.form).toBe(1)
      expect(stats.bySeverity.high).toBe(1)
      expect(stats.bySeverity.low).toBe(1)
      expect(stats.bySeverity.medium).toBe(1)
      expect(stats.recentErrors).toHaveLength(3)
    })

    it('should manage error listeners', () => {
      let capturedError: any = null

      const listener = (error: any) => {
        capturedError = error
      }

      ErrorHandler.addErrorListener(listener)
      
      const testError = ErrorHandler.createError('validation', 'Test error', mockContext)
      expect(capturedError).toEqual(testError)

      ErrorHandler.removeErrorListener(listener)
      
      capturedError = null
      ErrorHandler.createError('form', 'Another error', mockContext)
      expect(capturedError).toBeNull()
    })
  })

  describe('Logger', () => {
    it('should log messages at different levels', () => {
      Logger.debug('Debug message', { detail: 'debug' })
      Logger.info('Info message', { detail: 'info' })
      Logger.warn('Warning message', { detail: 'warn' })
      Logger.error('Error message', { detail: 'error' })

      const logs = Logger.getLogs()
      expect(logs).toHaveLength(4)
      
      expect(logs.some(log => log.level === 'debug')).toBe(true)
      expect(logs.some(log => log.level === 'info')).toBe(true)
      expect(logs.some(log => log.level === 'warn')).toBe(true)
      expect(logs.some(log => log.level === 'error')).toBe(true)
    })

    it('should filter logs by level', () => {
      Logger.debug('Debug message')
      Logger.info('Info message')
      Logger.warn('Warning message')
      Logger.error('Error message')

      expect(Logger.getLogs({ level: 'debug' })).toHaveLength(1)
      expect(Logger.getLogs({ level: 'info' })).toHaveLength(1)
      expect(Logger.getLogs({ level: 'warn' })).toHaveLength(1)
      expect(Logger.getLogs({ level: 'error' })).toHaveLength(1)
    })

    it('should limit and search logs', () => {
      for (let i = 0; i < 15; i++) {
        Logger.info(`Message ${i}`)
      }

      const limitedLogs = Logger.getLogs({ limit: 10 })
      expect(limitedLogs).toHaveLength(10)

      const searchLogs = Logger.getLogs({ search: 'Message 5' })
      expect(searchLogs).toHaveLength(1)
      expect(searchLogs[0].message).toBe('Message 5')
    })

    it('should provide log statistics', () => {
      Logger.debug('Debug message')
      Logger.info('Info message 1')
      Logger.info('Info message 2')
      Logger.error('Error message')

      const stats = Logger.getLogStats()
      
      expect(stats.total).toBe(4)
      expect(stats.byLevel.debug).toBe(1)
      expect(stats.byLevel.info).toBe(2)
      expect(stats.byLevel.error).toBe(1)
      expect(stats.recentLogs).toHaveLength(4)
    })
  })

  describe('ErrorFormatter', () => {
    it('should format validation errors', () => {
      const details: ValidationErrorDetail[] = [
        { field: 'name', message: 'Name is required', code: 'REQUIRED' },
        { field: 'email', message: 'Invalid email format', code: 'FORMAT' }
      ]
      
      const formatted = ErrorFormatter.formatValidationErrors(details)
      
      expect(formatted.summary).toBe('Validation failed for 2 field(s)')
      expect(formatted.details).toHaveLength(2)
      expect(formatted.details[0].field).toBe('name')
      expect(formatted.details[0].message).toBe('Name is required')
    })

    it('should format errors for API responses', () => {
      const appError = ErrorHandler.createError('validation', 'Test error', mockContext, {
        details: [{ field: 'name', message: 'Required', code: 'REQUIRED' }]
      })
      
      const formatted = ErrorFormatter.formatApiError(appError)
      
      expect(formatted.error.id).toBe(appError.id)
      expect(formatted.error.type).toBe('validation')
      expect(formatted.error.message).toBe('Test error')
      expect(formatted.error.retryable).toBe(false)
    })

    it('should format errors for user display', () => {
      const validationError = ErrorHandler.createError('validation', 'Invalid input', mockContext)
      const formatted = ErrorFormatter.formatUserError(validationError)
      
      expect(formatted.title).toBe('Invalid Input')
      expect(formatted.message).toBe('Please check your input and try again.')
      expect(formatted.actionable).toBe(true)
    })

    it('should format errors for development', () => {
      const appError = ErrorHandler.createError('content', 'Content not found', mockContext, {
        stackTrace: 'Stack trace here'
      })
      
      const formatted = ErrorFormatter.formatDevelopmentError(appError)
      
      expect(formatted.error).toEqual(appError)
      expect(formatted.formatted.header).toContain('MEDIUM')
      expect(formatted.formatted.header).toContain('content')
      expect(formatted.formatted.details).toContain(`ID: ${appError.id}`)
      expect(formatted.formatted.stackTrace).toBe('Stack trace here')
    })
  })

  describe('DevelopmentUtils', () => {
    it('should create development context', () => {
      const context = DevelopmentUtils.createDevContext('test-operation', { custom: 'data' })
      
      expect(context.operation).toBe('test-operation')
      expect(context.timestamp).toBeDefined()
      expect(context.userAgent).toBe('development')
      expect(context.additional?.environment).toBe('development')
      expect(context.additional?.custom).toBe('data')
    })

    it('should test error handling system', () => {
      const initialErrorCount = ErrorHandler.getErrors().length
      
      DevelopmentUtils.testErrorHandling()
      
      const finalErrors = ErrorHandler.getErrors()
      expect(finalErrors.length).toBeGreaterThan(initialErrorCount)
      
      // Should have created validation, form, and content errors
      expect(finalErrors.some(e => e.type === 'validation')).toBe(true)
      expect(finalErrors.some(e => e.type === 'form')).toBe(true)
      expect(finalErrors.some(e => e.type === 'content')).toBe(true)
    })
  })
})