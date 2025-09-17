import type {
  NavigationItem,
  NavigationHierarchy,
  NavigationContext,
  BreadcrumbItem
} from './types'

export class NavigationBuilder {
  private context: NavigationContext

  constructor(context: NavigationContext) {
    this.context = context || {
      baseUrl: '',
      currentPath: '/',
      userRole: 'visitor',
      locale: 'en'
    }
  }

  build(items: NavigationItem[]): NavigationHierarchy {
    // Filter out invalid items
    const validItems = this.validateAndFilterItems(items)
    
    // Build hierarchy
    const hierarchy = this.buildHierarchy(validItems)
    
    // Generate breadcrumbs
    const breadcrumbs = this.generateBreadcrumbs(hierarchy, this.context.currentPath)
    
    // Find active item
    const activeItem = this.findActiveItem(hierarchy, this.context.currentPath)
    
    return {
      items: hierarchy,
      breadcrumbs,
      activeItem,
      totalItems: this.countTotalItems(hierarchy)
    }
  }

  private validateAndFilterItems(items: NavigationItem[]): NavigationItem[] {
    if (!Array.isArray(items)) {
      return []
    }

    return items.filter(item => {
      // Check for required fields
      if (!item || typeof item !== 'object') {
        return false
      }

      if (!item.id || !item.title || !item.path || !item.type) {
        return false
      }

      // Validate path format
      if (!item.path.startsWith('/') || item.path === '') {
        return false
      }

      // Validate type
      if (!['page', 'collection', 'content'].includes(item.type)) {
        return false
      }

      return true
    })
  }

  private buildHierarchy(items: NavigationItem[]): NavigationItem[] {
    const itemMap = new Map<string, NavigationItem>()
    const rootItems: NavigationItem[] = []

    // Create map of all items
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] })
    })

    // Build parent-child relationships
    items.forEach(item => {
      const currentItem = itemMap.get(item.id)!
      
      if (item.parent && itemMap.has(item.parent)) {
        const parentItem = itemMap.get(item.parent)!
        if (!parentItem.children) {
          parentItem.children = []
        }
        parentItem.children.push(currentItem)
      } else {
        // Root item (no parent or parent not found)
        rootItems.push(currentItem)
      }
    })

    // Sort items by order
    const sortItems = (items: NavigationItem[]): NavigationItem[] => {
      return items.sort((a, b) => a.order - b.order).map(item => ({
        ...item,
        children: item.children ? sortItems(item.children) : undefined
      }))
    }

    return sortItems(rootItems)
  }

  private generateBreadcrumbs(hierarchy: NavigationItem[], currentPath: string): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = []
    
    // Find the path to current item
    const findPath = (items: NavigationItem[], path: string[]): NavigationItem[] | null => {
      for (const item of items) {
        const newPath = [...path, item.id]
        
        if (item.path === currentPath) {
          return newPath.map(id => hierarchy.find(i => i.id === id) || items.find(i => i.id === id)!).filter(Boolean)
        }
        
        if (item.children) {
          const result = findPath(item.children, newPath)
          if (result) return result
        }
      }
      return null
    }

    const pathItems = findPath(hierarchy, [])
    
    if (pathItems) {
      pathItems.forEach((item, index) => {
        breadcrumbs.push({
          id: item.id,
          title: item.title,
          path: item.path,
          current: index === pathItems.length - 1
        })
      })
    }

    return breadcrumbs
  }

  private findActiveItem(hierarchy: NavigationItem[], currentPath: string): NavigationItem | null {
    const findActive = (items: NavigationItem[]): NavigationItem | null => {
      for (const item of items) {
        if (item.path === currentPath) {
          return item
        }
        
        if (item.children) {
          const found = findActive(item.children)
          if (found) return found
        }
      }
      return null
    }

    return findActive(hierarchy)
  }

  private countTotalItems(hierarchy: NavigationItem[]): number {
    let count = 0
    
    const countItems = (items: NavigationItem[]) => {
      items.forEach(item => {
        count++
        if (item.children) {
          countItems(item.children)
        }
      })
    }
    
    countItems(hierarchy)
    return count
  }
}