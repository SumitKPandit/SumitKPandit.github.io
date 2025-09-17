/**
 * Accessibility Utilities Index
 * 
 * Exports all accessibility utilities for easy importing.
 */

export * from './focus'
export * from './aria'
export * from './keyboard'

/**
 * Common accessibility utility functions
 */

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches
}

/**
 * Check if user prefers dark color scheme
 */
export function prefersDarkScheme(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Add CSS class for screen reader only content
 */
export const srOnlyStyles = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0'
} as const

/**
 * Common ARIA landmarks for page structure
 */
export const landmarks = {
  banner: 'banner',
  navigation: 'navigation',
  main: 'main',
  complementary: 'complementary',
  contentinfo: 'contentinfo',
  search: 'search',
  form: 'form',
  region: 'region'
} as const

/**
 * Accessibility testing utilities
 */
export const a11yTest = {
  /**
   * Check if element has accessible name
   */
  hasAccessibleName(element: HTMLElement): boolean {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      (element as HTMLInputElement).labels?.length
    )
  },

  /**
   * Check if interactive element has proper role
   */
  hasProperRole(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase()
    const role = element.getAttribute('role')

    // Interactive elements that don't need explicit roles
    const interactiveElements = ['button', 'a', 'input', 'select', 'textarea']
    
    if (interactiveElements.includes(tagName)) {
      return true
    }

    // Elements with tabindex should have appropriate roles
    if (element.hasAttribute('tabindex')) {
      return !!(role && ['button', 'link', 'menuitem', 'option', 'tab'].includes(role))
    }

    return true
  },

  /**
   * Check color contrast ratio (simplified)
   */
  hasGoodContrast(foreground: string, background: string): boolean {
    // This is a simplified check - in practice, use a proper color contrast library
    const fgLuminance = this.getLuminance(foreground)
    const bgLuminance = this.getLuminance(background)
    
    const contrast = fgLuminance > bgLuminance 
      ? (fgLuminance + 0.05) / (bgLuminance + 0.05)
      : (bgLuminance + 0.05) / (fgLuminance + 0.05)
    
    return contrast >= 4.5 // WCAG AA standard
  },

  /**
   * Simple luminance calculation
   */
  getLuminance(color: string): number {
    // Very simplified - in practice, use a proper color library
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
}