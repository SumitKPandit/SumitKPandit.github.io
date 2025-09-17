<template>
  <form
    @submit.prevent="submitForm"
    class="contact-form max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
    :class="{ 'submitting': isSubmitting }"
  >
    <div class="form-header mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Get in Touch
      </h2>
      <p class="text-gray-600 dark:text-gray-300">
        {{ persona ? `Send a message to ${persona}` : 'I\'d love to hear from you' }}
      </p>
    </div>

    <!-- Form Messages -->
    <div v-if="successMessage" class="form-message success mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        {{ successMessage }}
      </div>
    </div>

    <div v-if="errorMessage" class="form-message error mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>
        {{ errorMessage }}
      </div>
    </div>

    <!-- Form Fields -->
    <div class="form-fields space-y-4">
      <!-- Name Field -->
      <div class="form-group">
        <label for="contact-name" class="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Name <span class="text-red-500">*</span>
        </label>
        <input
          id="contact-name"
          v-model="form.name"
          type="text"
          required
          maxlength="100"
          class="form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          :class="{ 'border-red-500': errors.name }"
          placeholder="Your full name"
          autocomplete="name"
        >
        <div v-if="errors.name" class="field-error text-red-500 text-sm mt-1">
          {{ errors.name }}
        </div>
      </div>

      <!-- Email Field -->
      <div class="form-group">
        <label for="contact-email" class="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Email <span class="text-red-500">*</span>
        </label>
        <input
          id="contact-email"
          v-model="form.email"
          type="email"
          required
          maxlength="255"
          class="form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          :class="{ 'border-red-500': errors.email }"
          placeholder="your.email@example.com"
          autocomplete="email"
        >
        <div v-if="errors.email" class="field-error text-red-500 text-sm mt-1">
          {{ errors.email }}
        </div>
      </div>

      <!-- Subject Field -->
      <div class="form-group">
        <label for="contact-subject" class="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Subject
        </label>
        <input
          id="contact-subject"
          v-model="form.subject"
          type="text"
          maxlength="200"
          class="form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          :class="{ 'border-red-500': errors.subject }"
          placeholder="What's this about?"
          autocomplete="off"
        >
        <div v-if="errors.subject" class="field-error text-red-500 text-sm mt-1">
          {{ errors.subject }}
        </div>
      </div>

      <!-- Message Field -->
      <div class="form-group">
        <label for="contact-message" class="block text-sm font-medium text-gray-900 dark:text-white mb-1">
          Message <span class="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          v-model="form.message"
          required
          rows="6"
          maxlength="5000"
          class="form-input w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-vertical"
          :class="{ 'border-red-500': errors.message }"
          placeholder="Your message here..."
        ></textarea>
        <div class="flex justify-between mt-1">
          <div v-if="errors.message" class="field-error text-red-500 text-sm">
            {{ errors.message }}
          </div>
          <div class="character-count text-sm text-gray-500 dark:text-gray-400">
            {{ form.message.length }}/5000
          </div>
        </div>
      </div>

      <!-- Honeypot Field (hidden from users, bots will fill it) -->
      <div class="honeypot-field" style="position: absolute; left: -9999px; opacity: 0; pointer-events: none;" aria-hidden="true">
        <label for="website">Website (leave blank)</label>
        <input
          id="website"
          v-model="form.honeypot"
          type="text"
          tabindex="-1"
          autocomplete="off"
        >
      </div>
    </div>

    <!-- Form Actions -->
    <div class="form-actions mt-6">
      <button
        type="submit"
        :disabled="isSubmitting || !isFormValid"
        class="submit-button w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <span v-if="!isSubmitting" class="button-text">
          Send Message
        </span>
        <span v-else class="button-loading flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Sending...
        </span>
      </button>
    </div>

    <!-- Rate Limit Info -->
    <div v-if="rateLimitInfo.remaining !== null" class="rate-limit-info mt-4 text-sm text-gray-600 dark:text-gray-400">
      {{ rateLimitInfo.remaining }} message{{ rateLimitInfo.remaining !== 1 ? 's' : '' }} remaining this hour
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'

interface ContactFormProps {
  persona?: string
}

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  honeypot: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

interface RateLimitInfo {
  remaining: number | null
  resetTime: Date | null
}

// Props
const props = withDefaults(defineProps<ContactFormProps>(), {
  persona: undefined
})

// Reactive state
const form = reactive<ContactFormData>({
  name: '',
  email: '',
  subject: '',
  message: '',
  honeypot: ''
})

const errors = reactive<FormErrors>({})
const isSubmitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const submissionStartTime = ref<number>(0)

const rateLimitInfo = reactive<RateLimitInfo>({
  remaining: null,
  resetTime: null
})

// Computed properties
const isFormValid = computed(() => {
  return form.name.trim().length > 0 &&
         form.email.trim().length > 0 &&
         form.message.trim().length >= 10 &&
         isValidEmail(form.email)
})

// Form validation functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function validateForm(): boolean {
  // Clear previous errors
  Object.keys(errors).forEach(key => {
    delete errors[key as keyof FormErrors]
  })

  let isValid = true

  // Name validation
  if (!form.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  } else if (form.name.length > 100) {
    errors.name = 'Name is too long (max 100 characters)'
    isValid = false
  }

  // Email validation
  if (!form.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  } else if (form.email.length > 255) {
    errors.email = 'Email is too long (max 255 characters)'
    isValid = false
  }

  // Subject validation
  if (form.subject.length > 200) {
    errors.subject = 'Subject is too long (max 200 characters)'
    isValid = false
  }

  // Message validation
  if (!form.message.trim()) {
    errors.message = 'Message is required'
    isValid = false
  } else if (form.message.length < 10) {
    errors.message = 'Message must be at least 10 characters long'
    isValid = false
  } else if (form.message.length > 5000) {
    errors.message = 'Message is too long (max 5000 characters)'
    isValid = false
  }

  return isValid
}

// Submit form
async function submitForm() {
  if (!validateForm() || isSubmitting.value) {
    return
  }

  // Check minimum time since form load (anti-bot measure)
  const timeSpent = Date.now() - submissionStartTime.value
  if (timeSpent < 3000) { // Less than 3 seconds
    errorMessage.value = 'Please take a moment to review your message.'
    return
  }

  isSubmitting.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim() || undefined,
        message: form.message.trim(),
        persona: props.persona || undefined,
        honeypot: form.honeypot // Should be empty for legitimate users
      })
    })

    const result = await response.json()

    if (result.success) {
      successMessage.value = result.message
      
      // Update rate limit info
      if (typeof result.rateLimitRemaining === 'number') {
        rateLimitInfo.remaining = result.rateLimitRemaining
      }
      
      // Clear form
      Object.assign(form, {
        name: '',
        email: '',
        subject: '',
        message: '',
        honeypot: ''
      })
      
      // Reset submission time
      submissionStartTime.value = Date.now()
      
    } else {
      errorMessage.value = result.message || 'An error occurred. Please try again.'
    }

  } catch (error: any) {
    console.error('Contact form submission error:', error)
    
    if (error.statusCode === 429) {
      errorMessage.value = 'Too many requests. Please wait before sending another message.'
      if (error.data?.retryAfter) {
        const retryDate = new Date(Date.now() + error.data.retryAfter * 1000)
        rateLimitInfo.resetTime = retryDate
      }
    } else if (error.data?.error) {
      errorMessage.value = error.data.error
      
      // Handle validation errors
      if (error.data.details && Array.isArray(error.data.details)) {
        error.data.details.forEach((detail: any) => {
          if (detail.field && detail.message) {
            errors[detail.field as keyof FormErrors] = detail.message
          }
        })
      }
    } else {
      errorMessage.value = 'Network error. Please check your connection and try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}

// Lifecycle
onMounted(() => {
  submissionStartTime.value = Date.now()
})

// Clear messages when user starts typing
watch([() => form.name, () => form.email, () => form.message], () => {
  if (successMessage.value || errorMessage.value) {
    successMessage.value = ''
    errorMessage.value = ''
  }
})
</script>

<style scoped>
.contact-form {
  transition: opacity 0.2s ease;
}

.contact-form.submitting {
  opacity: 0.8;
  pointer-events: none;
}

.form-input {
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.border-red-500:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.submit-button:disabled {
  cursor: not-allowed;
}

.character-count {
  font-size: 0.75rem;
}

.honeypot-field {
  /* Completely hidden from users but accessible to bots */
  position: absolute !important;
  left: -9999px !important;
  top: -9999px !important;
  opacity: 0 !important;
  pointer-events: none !important;
  /* tabindex handled in HTML */
}

/* Animation for form messages */
.form-message {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .form-input {
    background-color: #374151;
    border-color: #4b5563;
    color: white;
  }
  
  .form-input::placeholder {
    color: #9ca3af;
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .contact-form {
    padding: 1rem;
    margin: 0 1rem;
  }
  
  .submit-button {
    width: 100%;
  }
}
</style>