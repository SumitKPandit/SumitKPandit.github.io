// Error types and interfaces
export interface ErrorContext {
  operation: string
  timestamp: string
  userAgent?: string
  path?: string
  userId?: string
  sessionId?: string
  additional?: Record<string, any>
}

export interface ValidationErrorDetail {
  field: string
  message: string
  code: string
  value?: any
}

export interface ApplicationError {
  id: string
  type: 'validation' | 'content' | 'form' | 'navigation' | 'system' | 'external'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details?: ValidationErrorDetail[]
  context: ErrorContext
  stackTrace?: string
  retryable: boolean
}

// Custom error classes
export class ContentValidationError extends Error {
  public readonly type = 'validation'
  public readonly severity: ApplicationError['severity']
  public readonly details: ValidationErrorDetail[]
  public readonly context: ErrorContext
  public readonly retryable = false

  constructor(
    message: string,
    details: ValidationErrorDetail[],
    context: ErrorContext,
    severity: ApplicationError['severity'] = 'medium'
  ) {
    super(message)
    this.name = 'ContentValidationError'
    this.details = details
    this.context = context
    this.severity = severity
  }
}

export class FormSubmissionError extends Error {
  public readonly type = 'form'
  public readonly severity: ApplicationError['severity']
  public readonly context: ErrorContext
  public readonly retryable: boolean

  constructor(
    message: string,
    context: ErrorContext,
    severity: ApplicationError['severity'] = 'medium',
    retryable = true
  ) {
    super(message)
    this.name = 'FormSubmissionError'
    this.context = context
    this.severity = severity
    this.retryable = retryable
  }
}

export class ContentNotFoundError extends Error {
  public readonly type = 'content'
  public readonly severity: ApplicationError['severity'] = 'low'
  public readonly context: ErrorContext
  public readonly retryable = false

  constructor(message: string, context: ErrorContext) {
    super(message)
    this.name = 'ContentNotFoundError'
    this.context = context
  }
}

export class ExternalServiceError extends Error {
  public readonly type = 'external'
  public readonly severity: ApplicationError['severity']
  public readonly context: ErrorContext
  public readonly retryable = true
  public readonly statusCode?: number

  constructor(
    message: string,
    context: ErrorContext,
    statusCode?: number,
    severity: ApplicationError['severity'] = 'high'
  ) {
    super(message)
    this.name = 'ExternalServiceError'
    this.context = context
    this.statusCode = statusCode
    this.severity = severity
  }
}

// Error handler class
export class ErrorHandler {
  private static errors: ApplicationError[] = []
  private static maxErrors = 1000
  private static listeners: Array<(error: ApplicationError) => void> = []

  // Create standardized error
  static createError(
    type: ApplicationError['type'],
    message: string,
    context: ErrorContext,
    options: {
      severity?: ApplicationError['severity']
      details?: ValidationErrorDetail[]
      stackTrace?: string
      retryable?: boolean
    } = {}
  ): ApplicationError {
    const {
      severity = 'medium',
      details,
      stackTrace,
      retryable = false
    } = options

    const error: ApplicationError = {
      id: this.generateErrorId(),
      type,
      severity,
      message,
      details,
      context: {
        ...context,
        timestamp: new Date().toISOString()
      },
      stackTrace,
      retryable
    }

    this.recordError(error)
    return error
  }

  // Record error in memory store
  private static recordError(error: ApplicationError): void {
    this.errors.unshift(error)
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(error)
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError)
      }
    })
  }

  // Handle different error types
  static handleValidationError(
    error: ContentValidationError,
    context?: Partial<ErrorContext>
  ): ApplicationError {
    return this.createError(
      'validation',
      error.message,
      { ...error.context, ...context },
      {
        severity: error.severity,
        details: error.details,
        stackTrace: error.stack,
        retryable: error.retryable
      }
    )
  }

  static handleFormError(
    error: FormSubmissionError,
    context?: Partial<ErrorContext>
  ): ApplicationError {
    return this.createError(
      'form',
      error.message,
      { ...error.context, ...context },
      {
        severity: error.severity,
        stackTrace: error.stack,
        retryable: error.retryable
      }
    )
  }

  static handleContentError(
    error: ContentNotFoundError,
    context?: Partial<ErrorContext>
  ): ApplicationError {
    return this.createError(
      'content',
      error.message,
      { ...error.context, ...context },
      {
        severity: error.severity,
        stackTrace: error.stack,
        retryable: error.retryable
      }
    )
  }

  static handleExternalError(
    error: ExternalServiceError,
    context?: Partial<ErrorContext>
  ): ApplicationError {
    return this.createError(
      'external',
      error.message,
      { ...error.context, ...context },
      {
        severity: error.severity,
        stackTrace: error.stack,
        retryable: error.retryable,
        details: error.statusCode ? [{
          field: 'statusCode',
          message: `HTTP ${error.statusCode}`,
          code: 'HTTP_ERROR',
          value: error.statusCode
        }] : undefined
      }
    )
  }

  // Generic error handler
  static handleGenericError(
    error: Error,
    context: ErrorContext,
    type: ApplicationError['type'] = 'system'
  ): ApplicationError {
    return this.createError(
      type,
      error.message,
      context,
      {
        severity: 'high',
        stackTrace: error.stack,
        retryable: false
      }
    )
  }

  // Get errors with filtering
  static getErrors(filters: {
    type?: ApplicationError['type']
    severity?: ApplicationError['severity']
    since?: string
    limit?: number
  } = {}): ApplicationError[] {
    let filtered = [...this.errors]

    if (filters.type) {
      filtered = filtered.filter(error => error.type === filters.type)
    }

    if (filters.severity) {
      filtered = filtered.filter(error => error.severity === filters.severity)
    }

    if (filters.since) {
      const sinceDate = new Date(filters.since)
      filtered = filtered.filter(error => 
        new Date(error.context.timestamp) >= sinceDate
      )
    }

    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    return filtered
  }

  // Get error statistics
  static getErrorStats(since?: string): {
    total: number
    byType: Record<string, number>
    bySeverity: Record<string, number>
    recentErrors: ApplicationError[]
  } {
    let errors = this.errors

    if (since) {
      const sinceDate = new Date(since)
      errors = errors.filter(error => 
        new Date(error.context.timestamp) >= sinceDate
      )
    }

    const byType: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}

    errors.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1
    })

    return {
      total: errors.length,
      byType,
      bySeverity,
      recentErrors: errors.slice(0, 10)
    }
  }

  // Add error listener
  static addErrorListener(listener: (error: ApplicationError) => void): void {
    this.listeners.push(listener)
  }

  // Remove error listener
  static removeErrorListener(listener: (error: ApplicationError) => void): void {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  // Clear errors
  static clearErrors(): void {
    this.errors = []
  }

  // Generate unique error ID
  private static generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

// Logger class
export class Logger {
  private static logs: Array<{
    id: string
    level: 'debug' | 'info' | 'warn' | 'error'
    message: string
    data?: any
    timestamp: string
    context?: Record<string, any>
  }> = []
  
  private static maxLogs = 5000
  private static isDevelopment = process.env.NODE_ENV === 'development'
  
  // Log levels
  static debug(message: string, data?: any, context?: Record<string, any>): void {
    this.log('debug', message, data, context)
  }
  
  static info(message: string, data?: any, context?: Record<string, any>): void {
    this.log('info', message, data, context)
  }
  
  static warn(message: string, data?: any, context?: Record<string, any>): void {
    this.log('warn', message, data, context)
  }
  
  static error(message: string, data?: any, context?: Record<string, any>): void {
    this.log('error', message, data, context)
  }
  
  // Main logging method
  private static log(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: any,
    context?: Record<string, any>
  ): void {
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      context
    }
    
    // Store in memory
    this.logs.unshift(logEntry)
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs)
    }
    
    // Console output in development
    if (this.isDevelopment) {
      const consoleMethod = level === 'debug' ? 'log' : level
      const prefix = `[${level.toUpperCase()}] ${new Date().toLocaleTimeString()}`
      
      if (data || context) {
        console[consoleMethod](prefix, message, { data, context })
      } else {
        console[consoleMethod](prefix, message)
      }
    }
  }
  
  // Get logs with filtering
  static getLogs(filters: {
    level?: 'debug' | 'info' | 'warn' | 'error'
    since?: string
    limit?: number
    search?: string
  } = {}): typeof Logger.logs {
    let filtered = [...this.logs]
    
    if (filters.level) {
      filtered = filtered.filter(log => log.level === filters.level)
    }
    
    if (filters.since) {
      const sinceDate = new Date(filters.since)
      filtered = filtered.filter(log => new Date(log.timestamp) >= sinceDate)
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(searchTerm))
      )
    }
    
    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit)
    }
    
    return filtered
  }
  
  // Clear logs
  static clearLogs(): void {
    this.logs = []
  }
  
  // Get log statistics
  static getLogStats(since?: string): {
    total: number
    byLevel: Record<string, number>
    recentLogs: typeof Logger.logs
  } {
    let logs = this.logs
    
    if (since) {
      const sinceDate = new Date(since)
      logs = logs.filter(log => new Date(log.timestamp) >= sinceDate)
    }
    
    const byLevel: Record<string, number> = {}
    logs.forEach(log => {
      byLevel[log.level] = (byLevel[log.level] || 0) + 1
    })
    
    return {
      total: logs.length,
      byLevel,
      recentLogs: logs.slice(0, 20)
    }
  }
}

// Error formatter utilities
export class ErrorFormatter {
  // Format validation errors for user display
  static formatValidationErrors(errors: ValidationErrorDetail[]): {
    summary: string
    details: Array<{ field: string; message: string }>
  } {
    const fieldErrors = errors.reduce((acc, error) => {
      if (!acc[error.field]) {
        acc[error.field] = []
      }
      acc[error.field].push(error.message)
      return acc
    }, {} as Record<string, string[]>)

    const details = Object.entries(fieldErrors).map(([field, messages]) => ({
      field,
      message: messages.join(', ')
    }))

    const summary = `Validation failed for ${Object.keys(fieldErrors).length} field(s)`

    return { summary, details }
  }

  // Format error for API response
  static formatApiError(error: ApplicationError): {
    error: {
      id: string
      type: string
      message: string
      details?: any
      retryable: boolean
    }
  } {
    return {
      error: {
        id: error.id,
        type: error.type,
        message: error.message,
        details: error.details,
        retryable: error.retryable
      }
    }
  }

  // Format error for user display
  static formatUserError(error: ApplicationError): {
    title: string
    message: string
    actionable: boolean
    suggestions?: string[]
  } {
    let title: string
    let message: string
    let actionable = false
    let suggestions: string[] = []

    switch (error.type) {
      case 'validation':
        title = 'Invalid Input'
        message = 'Please check your input and try again.'
        actionable = true
        if (error.details) {
          suggestions = error.details.map(detail => 
            `${detail.field}: ${detail.message}`
          )
        }
        break

      case 'form':
        title = 'Form Submission Error'
        message = error.retryable 
          ? 'There was a problem submitting your form. Please try again.'
          : 'Unable to submit form. Please check your input.'
        actionable = error.retryable
        suggestions = ['Please check your internet connection', 'Verify all required fields are filled']
        break

      case 'content':
        title = 'Content Not Found'
        message = 'The requested content could not be found.'
        actionable = false
        suggestions = ['Check the URL for typos', 'Try navigating from the home page']
        break

      case 'external':
        title = 'Service Unavailable'
        message = 'An external service is currently unavailable. Please try again later.'
        actionable = true
        suggestions = ['Try again in a few minutes', 'Check your internet connection']
        break

      default:
        title = 'Unexpected Error'
        message = 'An unexpected error occurred. Please try again.'
        actionable = true
        suggestions = ['Refresh the page', 'Try again later']
        break
    }

    return { title, message, actionable, suggestions }
  }

  // Format error for development display
  static formatDevelopmentError(error: ApplicationError): {
    error: ApplicationError
    formatted: {
      header: string
      details: string[]
      context: string
      stackTrace?: string
    }
  } {
    const header = `[${error.severity.toUpperCase()}] ${error.type}: ${error.message}`
    
    const details = [
      `ID: ${error.id}`,
      `Timestamp: ${error.context.timestamp}`,
      `Operation: ${error.context.operation}`,
      `Retryable: ${error.retryable}`
    ]

    if (error.details) {
      details.push('Validation Details:')
      error.details.forEach(detail => {
        details.push(`  - ${detail.field}: ${detail.message}`)
      })
    }

    const context = JSON.stringify(error.context, null, 2)

    return {
      error,
      formatted: {
        header,
        details,
        context,
        stackTrace: error.stackTrace
      }
    }
  }
}

// Development utilities
export class DevelopmentUtils {
  // Create error context for development
  static createDevContext(operation: string, additional?: Record<string, any>): ErrorContext {
    return {
      operation,
      timestamp: new Date().toISOString(),
      userAgent: 'development',
      path: typeof window !== 'undefined' ? window.location.pathname : '/dev',
      additional: {
        environment: 'development',
        nodeEnv: process.env.NODE_ENV,
        ...additional
      }
    }
  }

  // Test error handling
  static testErrorHandling(): void {
    Logger.info('Testing error handling system')

    // Test validation error
    const validationError = new ContentValidationError(
      'Invalid blog article data',
      [
        { field: 'title', message: 'Title is required', code: 'REQUIRED' },
        { field: 'slug', message: 'Invalid slug format', code: 'FORMAT' }
      ],
      this.createDevContext('test-validation')
    )
    ErrorHandler.handleValidationError(validationError)

    // Test form error
    const formError = new FormSubmissionError(
      'Failed to submit contact form',
      this.createDevContext('test-form-submission'),
      'high',
      true
    )
    ErrorHandler.handleFormError(formError)

    // Test content error
    const contentError = new ContentNotFoundError(
      'Blog article not found',
      this.createDevContext('test-content-lookup')
    )
    ErrorHandler.handleContentError(contentError)

    Logger.info('Error handling test completed', {
      totalErrors: ErrorHandler.getErrors().length,
      stats: ErrorHandler.getErrorStats()
    })
  }
}