/**
 * Contact Adapter Interface
 * 
 * Provides an abstraction layer for contact form submissions,
 * allowing different backend integrations (email services, databases, APIs)
 * without changing the core contact handling logic.
 */

export interface ContactSubmission {
  name: string
  email: string
  subject?: string
  message: string
  persona?: string
  timestamp: string
  userAgent?: string
  ipHash?: string
}

export interface ContactResponse {
  success: boolean
  message: string
  submissionId?: string
  error?: string
}

export interface ContactAdapter {
  /**
   * Submit a contact form entry
   */
  submitContact(submission: ContactSubmission): Promise<ContactResponse>
  
  /**
   * Get adapter metadata (for debugging/monitoring)
   */
  getAdapterInfo(): {
    name: string
    version: string
    description: string
  }
}

/**
 * Contact adapter factory function
 * 
 * Returns the appropriate adapter based on environment configuration.
 * In development, uses a log-only adapter. In production, would use
 * email service, database, or API integration.
 */
export function getContactAdapter(): ContactAdapter {
  const adapterType = process.env.CONTACT_ADAPTER || 'log'
  
  switch (adapterType) {
    case 'log':
    default:
      // Import the log adapter (development/testing)
      return new LogContactAdapter()
  }
}

/**
 * Log-only Contact Adapter
 * 
 * Development adapter that logs submissions to console.
 * Useful for testing and development without external dependencies.
 */
class LogContactAdapter implements ContactAdapter {
  async submitContact(submission: ContactSubmission): Promise<ContactResponse> {
    try {
      // Log the submission details
      console.log('📧 Contact Form Submission Received:')
      console.log('─'.repeat(50))
      console.log(`👤 Name: ${submission.name}`)
      console.log(`📧 Email: ${submission.email}`)
      console.log(`📋 Subject: ${submission.subject || '(No subject)'}`)
      console.log(`👤 Persona: ${submission.persona || 'general'}`)
      console.log(`⏰ Timestamp: ${submission.timestamp}`)
      console.log(`🖥️  User Agent: ${submission.userAgent?.substring(0, 50) || 'Unknown'}...`)
      console.log(`🔒 IP Hash: ${submission.ipHash || 'Not provided'}`)
      console.log('💬 Message:')
      console.log(submission.message)
      console.log('─'.repeat(50))
      console.log('✅ Contact submission logged successfully')
      
      // Simulate async processing delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return {
        success: true,
        message: "Thank you for your message! I'll get back to you soon.",
        submissionId: `log-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
      }
    } catch (error) {
      console.error('❌ Error in LogContactAdapter:', error)
      return {
        success: false,
        message: 'An error occurred while processing your message.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  getAdapterInfo() {
    return {
      name: 'LogContactAdapter',
      version: '1.0.0',
      description: 'Development adapter that logs contact submissions to console'
    }
  }
}

// Export the adapter class for testing
export { LogContactAdapter }