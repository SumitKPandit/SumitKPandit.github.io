/**
 * IP Address Hashing Utility
 * 
 * Provides privacy-compliant IP address hashing for rate limiting and security.
 * Uses cryptographic hashing with salt to prevent rainbow table attacks.
 */

import { createHash } from 'crypto'

/**
 * Hash an IP address with salt for privacy-compliant storage
 * 
 * @param ip - The IP address to hash
 * @param salt - Salt for hashing (from environment variable)
 * @returns Hashed IP address as hex string
 */
export function hashIpAddress(ip: string, salt?: string): string {
  // Get salt from environment or use development default
  const hashSalt = salt || process.env.CONTACT_SALT || 'dev-salt-change-in-production'
  
  // Create SHA-256 hash with salt
  const hash = createHash('sha256')
  hash.update(ip + hashSalt)
  
  // Return first 16 characters of hex digest for storage efficiency
  return hash.digest('hex').substring(0, 16)
}

/**
 * Validate IP address format (IPv4 or IPv6)
 * 
 * @param ip - IP address to validate
 * @returns true if valid IP address format
 */
export function isValidIpAddress(ip: string): boolean {
  // IPv4 pattern
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  
  // IPv6 pattern (simplified)
  const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
  
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip)
}

/**
 * Get client IP from various headers (for proxy/CDN support)
 * 
 * @param headers - Request headers object
 * @returns Client IP address or null if not found
 */
export function extractClientIp(headers: Record<string, string | string[] | undefined>): string | null {
  // Check common IP headers in order of precedence
  const ipHeaders = [
    'x-forwarded-for',
    'x-real-ip', 
    'x-client-ip',
    'cf-connecting-ip', // Cloudflare
    'x-cluster-client-ip',
    'true-client-ip'
  ]
  
  for (const header of ipHeaders) {
    const value = headers[header]
    if (value) {
      // Handle comma-separated IPs (x-forwarded-for can have multiple)
      const ip = Array.isArray(value) ? value[0] : value.split(',')[0]
      const trimmedIp = ip.trim()
      
      if (isValidIpAddress(trimmedIp)) {
        return trimmedIp
      }
    }
  }
  
  return null
}

/**
 * Rate limiting time window utilities
 */
export const RATE_LIMIT_WINDOWS = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000
} as const

/**
 * Clean expired entries from a timestamp array
 * 
 * @param timestamps - Array of timestamps
 * @param windowMs - Time window in milliseconds
 * @returns Filtered array with only recent timestamps
 */
export function cleanExpiredTimestamps(timestamps: number[], windowMs: number): number[] {
  const now = Date.now()
  return timestamps.filter(timestamp => now - timestamp < windowMs)
}

/**
 * Check if action is within rate limit
 * 
 * @param timestamps - Array of previous action timestamps
 * @param maxActions - Maximum allowed actions
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed status and remaining count
 */
export function checkRateLimit(
  timestamps: number[], 
  maxActions: number, 
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: Date } {
  const recentTimestamps = cleanExpiredTimestamps(timestamps, windowMs)
  const remaining = Math.max(0, maxActions - recentTimestamps.length)
  const allowed = recentTimestamps.length < maxActions
  const resetTime = new Date(Date.now() + windowMs)
  
  return { allowed, remaining, resetTime }
}

/**
 * Security headers utility
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  }
}

/**
 * Content Security Policy for contact form
 */
export function getContactFormCSP(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'"
  ].join('; ')
}