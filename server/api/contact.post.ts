/**
 * Contact Form Submission API Endpoint
 * 
 * Handles contact form submissions with:
 * - Request validation (name, email, message)
 * - Honeypot spam detection
 * - Basic rate limiting (in-memory for development)
 * - IP address hashing for privacy
 * - Adapter pattern for flexible backend integration
 */

import { z } from 'zod'
import { hashIpAddress, extractClientIp, checkRateLimit as checkLimitUtil, RATE_LIMIT_WINDOWS } from '../../lib/security/ipHash'

// Contact submission validation schema
const ContactSubmissionSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  subject: z.string().max(200, 'Subject too long').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message too long'),
  persona: z.string().optional(), // Which persona they're contacting
  honeypot: z.string().max(0, 'Bot detected').optional(), // Anti-spam honeypot field
  timestamp: z.string().optional(),
  userAgent: z.string().optional()
})

// Rate limiting storage (in-memory for development)
const rateLimitStore = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = RATE_LIMIT_WINDOWS.HOUR
const MAX_SUBMISSIONS_PER_HOUR = 3

/**
 * Check rate limiting for IP address
 */
function checkRateLimit(ipHash: string): { allowed: boolean; remaining: number; resetTime: Date } {
  const submissions = rateLimitStore.get(ipHash) || []
  const result = checkLimitUtil(submissions, MAX_SUBMISSIONS_PER_HOUR, RATE_LIMIT_WINDOW)
  
  // Update store with cleaned submissions
  const recentSubmissions = submissions.filter(timestamp => Date.now() - timestamp < RATE_LIMIT_WINDOW)
  if (recentSubmissions.length > 0) {
    rateLimitStore.set(ipHash, recentSubmissions)
  } else {
    rateLimitStore.delete(ipHash)
  }
  
  return result
}

/**
 * Record submission for rate limiting
 */
function recordSubmission(ipHash: string): void {
  const now = Date.now()
  const submissions = rateLimitStore.get(ipHash) || []
  submissions.push(now)
  rateLimitStore.set(ipHash, submissions)
}

/**
 * Sanitize message content to remove potentially dangerous HTML
 */
function sanitizeMessage(message: string): string {
  return message
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\s*on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\s*on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '')
    .trim()
}

/**
 * Process contact submission through adapter
 */
async function processContactSubmission(submission: any): Promise<{ success: boolean; message: string; submissionId?: string }> {
  try {
    // Import contact adapter dynamically
    const { getContactAdapter } = await import('../../services/contactAdapter')
    const adapter = getContactAdapter()
    
    // Process through adapter
    const result = await adapter.submitContact(submission)
    
    return {
      success: result.success,
      message: result.message,
      submissionId: result.submissionId
    }
  } catch (error) {
    console.error('Contact submission error:', error)
    return {
      success: false,
      message: 'Sorry, there was an error sending your message. Please try again.'
    }
  }
}

export default defineEventHandler(async (event: any) => {
  // Only allow POST requests
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed'
    })
  }
  
  try {
    // Get request body
    const body = await readBody(event)
    
    // Get client IP for rate limiting
    const clientIP = extractClientIp(event.node.req.headers as Record<string, string>) || event.node.req.socket.remoteAddress || 'unknown'
    const ipHash = hashIpAddress(clientIP)
    
    // Check rate limiting
    const rateLimit = checkRateLimit(ipHash)
    if (!rateLimit.allowed) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too Many Requests',
        data: {
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: RATE_LIMIT_WINDOW / 1000 // seconds
        }
      })
    }
    
    // Add metadata to submission
    const submissionWithMeta = {
      ...body,
      timestamp: new Date().toISOString(),
      userAgent: getHeader(event, 'user-agent') || 'Unknown',
      ipHash // Store hashed IP, not raw IP
    }
    
    // Validate submission
    const validation = ContactSubmissionSchema.safeParse(submissionWithMeta)
    if (!validation.success) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Validation Error',
        data: {
          error: 'Invalid form data',
          details: validation.error.issues.map(issue => ({
            field: issue.path.join('.') || 'root',
            message: issue.message
          }))
        }
      })
    }
    
    const validatedSubmission = validation.data
    
    // Check honeypot field (should be empty for legitimate submissions)
    if (validatedSubmission.honeypot && validatedSubmission.honeypot.length > 0) {
      // Silently reject spam - return success to avoid bot feedback
      console.warn('🚫 Honeypot triggered for IP:', ipHash)
      return {
        success: true,
        message: "Thank you for your message!",
        submissionId: `blocked-${Date.now()}`
      }
    }
    
    // Sanitize message content
    validatedSubmission.message = sanitizeMessage(validatedSubmission.message)
    
    // Record submission for rate limiting (only for legitimate requests)
    recordSubmission(ipHash)
    
    // Process submission through adapter
    const result = await processContactSubmission(validatedSubmission)
    
    // Set response headers
    setHeader(event, 'X-RateLimit-Remaining', rateLimit.remaining.toString())
    setHeader(event, 'X-RateLimit-Reset', new Date(Date.now() + RATE_LIMIT_WINDOW).toISOString())
    
    return {
      success: result.success,
      message: result.message,
      submissionId: result.submissionId,
      rateLimitRemaining: rateLimit.remaining - 1
    }
    
  } catch (error: any) {
    // Handle validation and rate limiting errors
    if (error.statusCode) {
      throw error
    }
    
    // Log unexpected errors
    console.error('Contact API error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      data: {
        error: 'An unexpected error occurred. Please try again later.'
      }
    })
  }
})