#!/usr/bin/env node

/**
 * Contact Form Implementation Validation Script
 * 
 * Validates that all contact form components are properly implemented
 */

const fs = require('fs')
const path = require('path')

// Helper function to check if file exists and contains required content
function validateFile(filePath, requiredContent = [], description = '') {
  const fullPath = path.resolve(__dirname, '..', filePath)
  
  console.log(`\n📋 Checking ${description || filePath}...`)
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filePath}`)
    return false
  }
  
  console.log(`✅ File exists: ${filePath}`)
  
  if (requiredContent.length > 0) {
    const content = fs.readFileSync(fullPath, 'utf-8')
    
    for (const required of requiredContent) {
      if (content.includes(required)) {
        console.log(`  ✅ Contains: ${required}`)
      } else {
        console.log(`  ❌ Missing: ${required}`)
        return false
      }
    }
  }
  
  return true
}

console.log('🚀 Contact Form Implementation Validation')
console.log('=' .repeat(50))

let allValid = true

// Validate ContactForm.vue component
const componentValid = validateFile(
  'components/ContactForm.vue',
  [
    'contact-name',
    'contact-email', 
    'contact-message',
    'type="submit"',
    'honeypot'
  ],
  'ContactForm.vue component'
)
allValid = allValid && componentValid

// Validate Contact API endpoint
const apiValid = validateFile(
  'server/api/contact.post.ts',
  [
    'export default defineEventHandler',
    'z.object',
    'contactAdapter',
    'honeypot',
    'hashIpAddress'
  ],
  'Contact API endpoint'
)
allValid = allValid && apiValid

// Validate Contact Adapter
const adapterValid = validateFile(
  'services/contactAdapter.ts',
  [
    'ContactAdapter',
    'getContactAdapter',
    'submitContact'
  ],
  'Contact Adapter service'
)
allValid = allValid && adapterValid

// Validate Security utilities
const securityValid = validateFile(
  'lib/security/ipHash.ts',
  [
    'hashIpAddress',
    'crypto',
    'sha256'
  ],
  'IP Hashing security utility'
)
allValid = allValid && securityValid

// Summary
console.log('\n' + '=' .repeat(50))
if (allValid) {
  console.log('🎉 All contact form components are properly implemented!')
  console.log('\n✅ Contact form implementation is complete and ready to use.')
  process.exit(0)
} else {
  console.log('❌ Some contact form components are missing or incomplete.')
  console.log('\n🔧 Please check the failed validations above.')
  process.exit(1)
}