/**
 * ARIA Utilities
 * 
 * Helper functions for managing ARIA attributes and creating
 * accessible component interactions.
 */

/**
 * ARIA attribute types
 */
export interface AriaAttributes {
  'aria-label'?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  'aria-expanded'?: boolean
  'aria-pressed'?: boolean
  'aria-checked'?: boolean | 'mixed'
  'aria-selected'?: boolean
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time'
  'aria-hidden'?: boolean
  'aria-live'?: 'off' | 'polite' | 'assertive'
  'aria-atomic'?: boolean
  'aria-relevant'?: string
  'aria-busy'?: boolean
  'aria-controls'?: string
  'aria-owns'?: string
  'aria-flowto'?: string
  'aria-activedescendant'?: string
  'aria-invalid'?: boolean | 'grammar' | 'spelling'
  'aria-required'?: boolean
  'aria-readonly'?: boolean
  'aria-disabled'?: boolean
  'aria-multiselectable'?: boolean
  'aria-orientation'?: 'horizontal' | 'vertical'
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other'
  'aria-valuemin'?: number
  'aria-valuemax'?: number
  'aria-valuenow'?: number
  'aria-valuetext'?: string
  'aria-setsize'?: number
  'aria-posinset'?: number
  'aria-level'?: number
  'aria-modal'?: boolean
  role?: string
  tabindex?: number
}

/**
 * Set ARIA attributes on an element
 */
export function setAriaAttributes(element: HTMLElement, attributes: AriaAttributes): void {
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, String(value))
    } else {
      element.removeAttribute(key)
    }
  })
}

/**
 * Generate unique IDs for ARIA relationships
 */
export function generateAriaId(prefix: string = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Live region utilities for dynamic content announcements
 */
export class LiveRegion {
  private element: HTMLElement
  private timeout: NodeJS.Timeout | null = null

  constructor(
    level: 'polite' | 'assertive' = 'polite',
    atomic: boolean = true
  ) {
    this.element = document.createElement('div')
    this.element.setAttribute('aria-live', level)
    this.element.setAttribute('aria-atomic', String(atomic))
    this.element.className = 'sr-only'
    this.element.id = generateAriaId('live-region')
    
    document.body.appendChild(this.element)
  }

  /**
   * Announce a message to screen readers
   */
  announce(message: string, clearAfter: number = 5000): void {
    // Clear any existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    // Set the message
    this.element.textContent = message

    // Clear the message after specified time
    if (clearAfter > 0) {
      this.timeout = setTimeout(() => {
        this.element.textContent = ''
      }, clearAfter)
    }
  }

  /**
   * Clear the live region
   */
  clear(): void {
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
    this.element.textContent = ''
  }

  /**
   * Remove the live region from DOM
   */
  destroy(): void {
    this.clear()
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
  }
}

/**
 * Composable for live region management
 */
export function useLiveRegion(level: 'polite' | 'assertive' = 'polite') {
  let liveRegion: LiveRegion | null = null

  const announce = (message: string, clearAfter: number = 5000): void => {
    if (!liveRegion) {
      liveRegion = new LiveRegion(level)
    }
    liveRegion.announce(message, clearAfter)
  }

  const clear = (): void => {
    liveRegion?.clear()
  }

  const cleanup = (): void => {
    liveRegion?.destroy()
    liveRegion = null
  }

  return { announce, clear, cleanup }
}

/**
 * Progress indicator utilities
 */
export function createProgressIndicator(
  element: HTMLElement,
  options: {
    min?: number
    max?: number
    value?: number
    label?: string
  } = {}
): void {
  const { min = 0, max = 100, value = 0, label } = options

  setAriaAttributes(element, {
    role: 'progressbar',
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-valuenow': value,
    'aria-label': label
  })
}

/**
 * Update progress indicator value
 */
export function updateProgress(
  element: HTMLElement,
  value: number,
  text?: string
): void {
  element.setAttribute('aria-valuenow', String(value))
  if (text) {
    element.setAttribute('aria-valuetext', text)
  }
}

/**
 * Toggle button utilities
 */
export function createToggleButton(
  element: HTMLElement,
  pressed: boolean = false,
  label?: string
): void {
  setAriaAttributes(element, {
    role: 'button',
    'aria-pressed': pressed,
    'aria-label': label
  })
}

/**
 * Expandable content utilities
 */
export function createExpandableContent(
  trigger: HTMLElement,
  content: HTMLElement,
  expanded: boolean = false
): void {
  const contentId = generateAriaId('expandable-content')
  content.id = contentId

  setAriaAttributes(trigger, {
    'aria-expanded': expanded,
    'aria-controls': contentId
  })

  setAriaAttributes(content, {
    'aria-hidden': !expanded
  })
}

/**
 * Tab panel utilities
 */
export function createTabPanels(
  tabList: HTMLElement,
  tabs: HTMLElement[],
  panels: HTMLElement[],
  activeIndex: number = 0
): void {
  // Set up tab list
  setAriaAttributes(tabList, {
    role: 'tablist'
  })

  // Set up tabs and panels
  tabs.forEach((tab, index) => {
    const tabId = generateAriaId('tab')
    const panelId = generateAriaId('panel')
    const isActive = index === activeIndex

    tab.id = tabId
    panels[index].id = panelId

    setAriaAttributes(tab, {
      role: 'tab',
      'aria-selected': isActive,
      'aria-controls': panelId,
      tabindex: isActive ? 0 : -1
    })

    setAriaAttributes(panels[index], {
      role: 'tabpanel',
      'aria-labelledby': tabId,
      'aria-hidden': !isActive
    })
  })
}

/**
 * Form validation ARIA utilities
 */
export function setFormFieldError(
  field: HTMLElement,
  errorMessage?: string,
  errorContainer?: HTMLElement
): void {
  if (errorMessage && errorContainer) {
    const errorId = generateAriaId('error')
    errorContainer.id = errorId
    errorContainer.textContent = errorMessage

    setAriaAttributes(field, {
      'aria-invalid': true,
      'aria-describedby': errorId
    })
  } else {
    setAriaAttributes(field, {
      'aria-invalid': false,
      'aria-describedby': undefined
    })
  }
}

/**
 * Modal dialog utilities
 */
export function createModalDialog(
  modal: HTMLElement,
  title?: HTMLElement,
  description?: HTMLElement
): void {
  const titleId = title ? generateAriaId('modal-title') : undefined
  const descId = description ? generateAriaId('modal-desc') : undefined

  if (title && titleId) {
    title.id = titleId
  }

  if (description && descId) {
    description.id = descId
  }

  setAriaAttributes(modal, {
    role: 'dialog',
    'aria-modal': true,
    'aria-labelledby': titleId,
    'aria-describedby': descId
  })
}

/**
 * Breadcrumb navigation utilities
 */
export function createBreadcrumbs(
  container: HTMLElement,
  items: Array<{ text: string; href?: string; current?: boolean }>
): void {
  setAriaAttributes(container, {
    'aria-label': 'Breadcrumb navigation'
  })

  const list = document.createElement('ol')
  setAriaAttributes(list, { role: 'list' })

  items.forEach((item, index) => {
    const listItem = document.createElement('li')
    setAriaAttributes(listItem, { role: 'listitem' })

    if (item.href && !item.current) {
      const link = document.createElement('a')
      link.href = item.href
      link.textContent = item.text
      listItem.appendChild(link)
    } else {
      const text = document.createElement('span')
      text.textContent = item.text
      if (item.current) {
        setAriaAttributes(text, { 'aria-current': 'page' })
      }
      listItem.appendChild(text)
    }

    list.appendChild(listItem)
  })

  container.appendChild(list)
}

/**
 * Screen reader only text utilities
 */
export function addScreenReaderText(element: HTMLElement, text: string): HTMLElement {
  const srText = document.createElement('span')
  srText.className = 'sr-only'
  srText.textContent = text
  element.appendChild(srText)
  return srText
}

/**
 * Announce page changes for SPA navigation
 */
export function announcePageChange(title: string, liveRegion?: LiveRegion): void {
  const message = `Navigated to ${title}`
  
  if (liveRegion) {
    liveRegion.announce(message)
  } else {
    // Create temporary live region
    const tempRegion = new LiveRegion('polite')
    tempRegion.announce(message)
    setTimeout(() => tempRegion.destroy(), 6000)
  }
}