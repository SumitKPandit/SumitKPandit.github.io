import type {
  NavigationItem,
  NavigationValidationResult,
  NavigationValidationError,
  CircularReferenceError
} from './types'

export function validateNavigationHierarchy(items: NavigationItem[]): NavigationValidationResult {
  const errors: NavigationValidationError[] = []
  const warnings: NavigationValidationError[] = []

  // Check for duplicate IDs
  const ids = new Set<string>()
  const duplicateIds = new Set<string>()
  
  items.forEach(item => {
    if (ids.has(item.id)) {
      duplicateIds.add(item.id)
    }
    ids.add(item.id)
  })

  duplicateIds.forEach(id => {
    errors.push({
      type: 'duplicate_id',
      itemId: id,
      message: `Duplicate navigation ID found: ${id}`
    })
  })

  // Check for duplicate paths
  const paths = new Set<string>()
  const duplicatePaths = new Set<string>()
  
  items.forEach(item => {
    if (paths.has(item.path)) {
      duplicatePaths.add(item.path)
    }
    paths.add(item.path)
  })

  duplicatePaths.forEach(path => {
    errors.push({
      type: 'duplicate_path',
      itemId: items.find(item => item.path === path)?.id,
      message: `Duplicate navigation path found: ${path}`
    })
  })

  // Check for invalid parent-child relationships
  items.forEach(item => {
    if (item.type === 'content' && items.some(child => child.parent === item.id)) {
      errors.push({
        type: 'invalid_parent_child',
        itemId: item.id,
        message: `Content items cannot have children: ${item.id}`
      })
    }
  })

  // Check for missing parents
  items.forEach(item => {
    if (item.parent && !items.find(parent => parent.id === item.parent)) {
      warnings.push({
        type: 'missing_parent',
        itemId: item.id,
        message: `Parent not found for item: ${item.id} (parent: ${item.parent})`
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

export function detectCircularReferences(items: NavigationItem[]): CircularReferenceError[] {
  const errors: CircularReferenceError[] = []
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  const detectCircular = (itemId: string, path: string[] = []): void => {
    if (recursionStack.has(itemId)) {
      // Found circular reference
      const circleStart = path.indexOf(itemId)
      const circularItems = path.slice(circleStart)
      circularItems.push(itemId)

      errors.push({
        type: itemId === path[path.length - 1] ? 'self_reference' : 'circular_reference',
        items: circularItems,
        message: `Circular reference detected: ${circularItems.join(' -> ')}`
      })
      return
    }

    if (visited.has(itemId)) {
      return
    }

    visited.add(itemId)
    recursionStack.add(itemId)

    const item = items.find(i => i.id === itemId)
    if (item?.parent) {
      detectCircular(item.parent, [...path, itemId])
    }

    recursionStack.delete(itemId)
  }

  // Check each item for circular references
  items.forEach(item => {
    if (!visited.has(item.id)) {
      detectCircular(item.id)
    }
  })

  return errors
}

export function resolveNavigationPaths(items: NavigationItem[]): Record<string, string> {
  const pathMap: Record<string, string> = {}

  items
    .sort((a, b) => a.order - b.order) // Resolve conflicts by order
    .forEach(item => {
      // Normalize path (remove trailing slash, query params)
      let normalizedPath = item.path.replace(/\/$/, '') || '/'
      if (normalizedPath.includes('?')) {
        normalizedPath = normalizedPath.split('?')[0]
      }

      // Only map if not already mapped (first one wins)
      if (!pathMap[normalizedPath]) {
        pathMap[normalizedPath] = item.id
      }
    })

  return pathMap
}