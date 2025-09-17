/**
 * Focus Management Utilities
 * 
 * Provides utilities for managing focus in accessible web applications,
 * including focus trapping, restoration, and keyboard navigation.
 */

/**
 * Focus trap class for modal dialogs and other overlay components
 */
export class FocusTrap {
  private focusableElements: HTMLElement[] = []
  private firstFocusableElement: HTMLElement | null = null
  private lastFocusableElement: HTMLElement | null = null
  private previousActiveElement: HTMLElement | null = null
  private isActive = false

  constructor(private container: HTMLElement) {
    this.updateFocusableElements()
  }

  /**
   * Get all focusable elements within the container
   */
  private updateFocusableElements(): void {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    this.focusableElements = Array.from(
      this.container.querySelectorAll(focusableSelectors)
    ).filter((element) => {
      return element instanceof HTMLElement && this.isVisible(element)
    }) as HTMLElement[]

    this.firstFocusableElement = this.focusableElements[0] || null
    this.lastFocusableElement = this.focusableElements[this.focusableElements.length - 1] || null
  }

  /**
   * Check if an element is visible and can receive focus
   */
  private isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element)
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    )
  }

  /**
   * Handle keydown events for focus trapping
   */
  private handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.isActive || event.key !== 'Tab') return

    // Update focusable elements in case DOM changed
    this.updateFocusableElements()

    if (!this.firstFocusableElement) return

    if (event.shiftKey) {
      // Shift + Tab (backwards)
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault()
        this.lastFocusableElement?.focus()
      }
    } else {
      // Tab (forwards)
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault()
        this.firstFocusableElement?.focus()
      }
    }
  }

  /**
   * Activate the focus trap
   */
  activate(): void {
    if (this.isActive) return

    this.previousActiveElement = document.activeElement as HTMLElement
    this.isActive = true
    
    document.addEventListener('keydown', this.handleKeyDown)
    
    // Focus first focusable element
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus()
    }
  }

  /**
   * Deactivate the focus trap and restore previous focus
   */
  deactivate(): void {
    if (!this.isActive) return

    this.isActive = false
    document.removeEventListener('keydown', this.handleKeyDown)
    
    // Restore previous focus
    if (this.previousActiveElement) {
      this.previousActiveElement.focus()
    }
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    this.deactivate()
  }
}

/**
 * Composable for focus management in Vue components
 */
export function useFocusManagement() {
  const focusTraps = new Map<string, FocusTrap>()

  /**
   * Create and activate a focus trap
   */
  const trapFocus = (element: HTMLElement, id: string = 'default'): FocusTrap => {
    // Clean up existing trap with same ID
    if (focusTraps.has(id)) {
      focusTraps.get(id)?.destroy()
    }

    const trap = new FocusTrap(element)
    focusTraps.set(id, trap)
    trap.activate()
    
    return trap
  }

  /**
   * Release a focus trap
   */
  const releaseFocus = (id: string = 'default'): void => {
    const trap = focusTraps.get(id)
    if (trap) {
      trap.deactivate()
      focusTraps.delete(id)
    }
  }

  /**
   * Focus first element in container
   */
  const focusFirst = (container: HTMLElement): void => {
    const firstFocusable = container.querySelector(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement
    
    if (firstFocusable) {
      firstFocusable.focus()
    }
  }

  /**
   * Move focus to element with optional scroll behavior
   */
  const moveFocus = (
    element: HTMLElement,
    options: { scroll?: boolean; behavior?: ScrollBehavior } = {}
  ): void => {
    element.focus()
    
    if (options.scroll !== false) {
      element.scrollIntoView({
        behavior: options.behavior || 'smooth',
        block: 'center'
      })
    }
  }

  /**
   * Clean up all focus traps
   */
  const cleanup = (): void => {
    focusTraps.forEach(trap => trap.destroy())
    focusTraps.clear()
  }

  return {
    trapFocus,
    releaseFocus,
    focusFirst,
    moveFocus,
    cleanup
  }
}

/**
 * Restore focus to a previously focused element
 */
export function useFocusRestore() {
  let previousElement: HTMLElement | null = null

  const save = (): void => {
    previousElement = document.activeElement as HTMLElement
  }

  const restore = (): void => {
    if (previousElement) {
      previousElement.focus()
      previousElement = null
    }
  }

  return { save, restore }
}

/**
 * Skip link functionality for keyboard navigation
 */
export function useSkipLink() {
  const createSkipLink = (targetId: string, text: string = 'Skip to main content'): HTMLElement => {
    const skipLink = document.createElement('a')
    skipLink.href = `#${targetId}`
    skipLink.textContent = text
    skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded'
    
    skipLink.addEventListener('click', (event) => {
      event.preventDefault()
      const target = document.getElementById(targetId)
      if (target) {
        target.focus()
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })

    return skipLink
  }

  const addSkipLinks = (links: Array<{ targetId: string; text: string }>): void => {
    const container = document.createElement('div')
    container.className = 'skip-links'
    
    links.forEach(({ targetId, text }) => {
      container.appendChild(createSkipLink(targetId, text))
    })
    
    document.body.insertBefore(container, document.body.firstChild)
  }

  return { createSkipLink, addSkipLinks }
}