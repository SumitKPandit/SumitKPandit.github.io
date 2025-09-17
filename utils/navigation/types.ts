// Navigation types for testing and validation
export interface NavigationItem {
  id: string
  title: string
  path: string
  type: 'page' | 'collection' | 'content'
  order: number
  visible: boolean
  parent: string | null
  children?: NavigationItem[]
  metadata?: Record<string, any>
}

export interface NavigationHierarchy {
  items: NavigationItem[]
  breadcrumbs: BreadcrumbItem[]
  activeItem: NavigationItem | null
  totalItems: number
}

export interface BreadcrumbItem {
  id: string
  title: string
  path: string
  current: boolean
}

export interface NavigationContext {
  baseUrl: string
  currentPath: string
  userRole?: string
  locale?: string
}

export interface NavigationValidationError {
  type: 'duplicate_id' | 'duplicate_path' | 'invalid_parent_child' | 'circular_reference' | 'self_reference' | 'missing_parent'
  itemId?: string
  message: string
  items?: string[]
}

export interface NavigationValidationResult {
  valid: boolean
  errors: NavigationValidationError[]
  warnings: NavigationValidationError[]
}

export interface CircularReferenceError {
  type: 'circular_reference' | 'self_reference'
  items: string[]
  message?: string
}