/**
 * Keyboard Navigation Utilities
 * 
 * Provides utilities for implementing accessible keyboard navigation
 * patterns for complex UI components.
 */

/**
 * Common keyboard keys
 */
export const Keys = {
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown'
} as const

/**
 * Navigation direction
 */
export enum NavigationDirection {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  BOTH = 'both'
}

/**
 * Keyboard navigation for lists and menus
 */
export class KeyboardNavigator {
  private items: HTMLElement[] = []
  private currentIndex = -1
  private direction: NavigationDirection
  private loop: boolean
  private container: HTMLElement

  constructor(
    container: HTMLElement,
    direction: NavigationDirection = NavigationDirection.VERTICAL,
    loop: boolean = true
  ) {
    this.container = container
    this.direction = direction
    this.loop = loop
    this.updateItems()
  }

  /**
   * Update the list of navigable items
   */
  updateItems(): void {
    this.items = Array.from(
      this.container.querySelectorAll('[tabindex="0"], button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])')
    ).filter(item => {
      return item instanceof HTMLElement && this.isVisible(item)
    }) as HTMLElement[]

    // Find currently focused item
    const activeElement = document.activeElement
    this.currentIndex = activeElement ? this.items.indexOf(activeElement as HTMLElement) : -1
  }

  /**
   * Check if element is visible
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
   * Move to next item
   */
  next(): HTMLElement | null {
    if (this.items.length === 0) return null

    this.currentIndex++
    
    if (this.currentIndex >= this.items.length) {
      this.currentIndex = this.loop ? 0 : this.items.length - 1
    }

    const item = this.items[this.currentIndex]
    if (item) {
      item.focus()
    }
    return item
  }

  /**
   * Move to previous item
   */
  previous(): HTMLElement | null {
    if (this.items.length === 0) return null

    this.currentIndex--
    
    if (this.currentIndex < 0) {
      this.currentIndex = this.loop ? this.items.length - 1 : 0
    }

    const item = this.items[this.currentIndex]
    if (item) {
      item.focus()
    }
    return item
  }

  /**
   * Move to first item
   */
  first(): HTMLElement | null {
    if (this.items.length === 0) return null

    this.currentIndex = 0
    const item = this.items[this.currentIndex]
    if (item) {
      item.focus()
    }
    return item
  }

  /**
   * Move to last item
   */
  last(): HTMLElement | null {
    if (this.items.length === 0) return null

    this.currentIndex = this.items.length - 1
    const item = this.items[this.currentIndex]
    if (item) {
      item.focus()
    }
    return item
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyDown(event: KeyboardEvent): boolean {
    let handled = false

    switch (this.direction) {
      case NavigationDirection.VERTICAL:
        if (event.key === Keys.ARROW_DOWN) {
          event.preventDefault()
          this.next()
          handled = true
        } else if (event.key === Keys.ARROW_UP) {
          event.preventDefault()
          this.previous()
          handled = true
        }
        break

      case NavigationDirection.HORIZONTAL:
        if (event.key === Keys.ARROW_RIGHT) {
          event.preventDefault()
          this.next()
          handled = true
        } else if (event.key === Keys.ARROW_LEFT) {
          event.preventDefault()
          this.previous()
          handled = true
        }
        break

      case NavigationDirection.BOTH:
        if (event.key === Keys.ARROW_DOWN || event.key === Keys.ARROW_RIGHT) {
          event.preventDefault()
          this.next()
          handled = true
        } else if (event.key === Keys.ARROW_UP || event.key === Keys.ARROW_LEFT) {
          event.preventDefault()
          this.previous()
          handled = true
        }
        break
    }

    // Common navigation keys
    if (event.key === Keys.HOME) {
      event.preventDefault()
      this.first()
      handled = true
    } else if (event.key === Keys.END) {
      event.preventDefault()
      this.last()
      handled = true
    }

    return handled
  }
}

/**
 * Composable for keyboard navigation
 */
export function useKeyboardNavigation(
  container: Ref<HTMLElement | null>,
  direction: NavigationDirection = NavigationDirection.VERTICAL,
  loop: boolean = true
) {
  let navigator: KeyboardNavigator | null = null

  const initialize = (): void => {
    if (container.value && !navigator) {
      navigator = new KeyboardNavigator(container.value, direction, loop)
      container.value.addEventListener('keydown', handleKeyDown)
    }
  }

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (navigator) {
      navigator.updateItems()
      navigator.handleKeyDown(event)
    }
  }

  const cleanup = (): void => {
    if (container.value && navigator) {
      container.value.removeEventListener('keydown', handleKeyDown)
      navigator = null
    }
  }

  const refresh = (): void => {
    navigator?.updateItems()
  }

  // Auto-initialize when container is available
  watchEffect(() => {
    if (container.value) {
      initialize()
    }
  })

  onUnmounted(() => {
    cleanup()
  })

  return {
    initialize,
    cleanup,
    refresh,
    get navigator() { return navigator }
  }
}

/**
 * Tab management for tabbed interfaces
 */
export function useTabNavigation(
  tabList: Ref<HTMLElement | null>,
  tabs: Ref<HTMLElement[]>,
  panels: Ref<HTMLElement[]>,
  activeIndex: Ref<number>
) {
  const handleTabKeyDown = (event: KeyboardEvent, index: number): void => {
    let newIndex = index

    switch (event.key) {
      case Keys.ARROW_RIGHT:
        event.preventDefault()
        newIndex = (index + 1) % tabs.value.length
        break

      case Keys.ARROW_LEFT:
        event.preventDefault()
        newIndex = index === 0 ? tabs.value.length - 1 : index - 1
        break

      case Keys.HOME:
        event.preventDefault()
        newIndex = 0
        break

      case Keys.END:
        event.preventDefault()
        newIndex = tabs.value.length - 1
        break

      case Keys.ENTER:
      case Keys.SPACE:
        event.preventDefault()
        activeIndex.value = index
        return

      default:
        return
    }

    // Focus new tab but don't activate it
    if (tabs.value[newIndex]) {
      tabs.value[newIndex].focus()
    }
  }

  const activateTab = (index: number): void => {
    if (index >= 0 && index < tabs.value.length) {
      activeIndex.value = index
      tabs.value[index]?.focus()
    }
  }

  return {
    handleTabKeyDown,
    activateTab
  }
}

/**
 * Menu keyboard navigation
 */
export function useMenuNavigation(
  menu: Ref<HTMLElement | null>,
  trigger?: Ref<HTMLElement | null>
) {
  const navigator = useKeyboardNavigation(menu, NavigationDirection.VERTICAL, true)
  const isOpen = ref(false)

  const open = (): void => {
    isOpen.value = true
    nextTick(() => {
      navigator.navigator?.first()
    })
  }

  const close = (): void => {
    isOpen.value = false
    trigger?.value?.focus()
  }

  const handleMenuKeyDown = (event: KeyboardEvent): void => {
    if (!isOpen.value) return

    if (event.key === Keys.ESCAPE) {
      event.preventDefault()
      close()
      return
    }

    if (event.key === Keys.TAB) {
      close()
      return
    }

    navigator.navigator?.handleKeyDown(event)
  }

  const handleTriggerKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case Keys.ENTER:
      case Keys.SPACE:
      case Keys.ARROW_DOWN:
        event.preventDefault()
        open()
        break

      case Keys.ARROW_UP:
        event.preventDefault()
        open()
        // Focus last item when opening with up arrow
        nextTick(() => {
          navigator.navigator?.last()
        })
        break
    }
  }

  return {
    isOpen: readonly(isOpen),
    open,
    close,
    handleMenuKeyDown,
    handleTriggerKeyDown
  }
}

/**
 * Roving tabindex pattern for component groups
 */
export function useRovingTabindex(
  container: Ref<HTMLElement | null>,
  items: Ref<HTMLElement[]>,
  activeIndex: Ref<number>
) {
  const updateTabindex = (): void => {
    items.value.forEach((item, index) => {
      item.tabIndex = index === activeIndex.value ? 0 : -1
    })
  }

  const setActiveIndex = (index: number): void => {
    if (index >= 0 && index < items.value.length) {
      activeIndex.value = index
      updateTabindex()
      items.value[index]?.focus()
    }
  }

  const handleKeyDown = (event: KeyboardEvent): void => {
    const navigator = new KeyboardNavigator(
      container.value!,
      NavigationDirection.BOTH,
      true
    )

    if (navigator.handleKeyDown(event)) {
      // Update active index based on focused element
      const focusedIndex = items.value.indexOf(document.activeElement as HTMLElement)
      if (focusedIndex !== -1) {
        activeIndex.value = focusedIndex
        updateTabindex()
      }
    }
  }

  watch(activeIndex, updateTabindex, { immediate: true })
  watch(items, updateTabindex, { flush: 'post' })

  return {
    setActiveIndex,
    handleKeyDown,
    updateTabindex
  }
}