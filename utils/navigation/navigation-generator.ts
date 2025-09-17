import type { Persona, BlogArticle, PortfolioCollection } from '../validation/content-schemas'

// Navigation item structure
export interface NavigationItem {
  label: string
  href: string
  icon?: string
  external?: boolean
  current?: boolean
  children?: NavigationItem[]
  ariaLabel?: string
  description?: string
  badge?: string | number
}

// Breadcrumb item structure
export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
  ariaLabel?: string
}

// Navigation tree structure
export interface NavigationTree {
  main: NavigationItem[]
  footer: NavigationItem[]
  social: NavigationItem[]
  persona: NavigationItem[]
}

// Site structure configuration
export interface SiteStructure {
  personas: Persona[]
  blogCategories: string[]
  portfolioCollections: PortfolioCollection[]
  customPages: Array<{
    title: string
    path: string
    icon?: string
    description?: string
  }>
}

// Navigation generator class
export class NavigationGenerator {
  private structure: SiteStructure
  private currentPath: string
  
  constructor(structure: SiteStructure, currentPath: string = '/') {
    this.structure = structure
    this.currentPath = currentPath
  }
  
  // Generate complete navigation tree
  generateNavigationTree(): NavigationTree {
    return {
      main: this.generateMainNavigation(),
      footer: this.generateFooterNavigation(),
      social: this.generateSocialNavigation(),
      persona: this.generatePersonaNavigation()
    }
  }
  
  // Generate main navigation
  private generateMainNavigation(): NavigationItem[] {
    const nav: NavigationItem[] = []
    
    // Home
    nav.push({
      label: 'Home',
      href: '/',
      icon: 'home',
      current: this.isCurrentPath('/'),
      ariaLabel: 'Go to homepage'
    })
    
    // Blog section
    const blogNav: NavigationItem = {
      label: 'Blog',
      href: '/blog',
      icon: 'edit-3',
      current: this.isCurrentPath('/blog'),
      ariaLabel: 'View blog articles',
      children: []
    }
    
    // Add blog categories as children
    if (this.structure.blogCategories.length > 0) {
      blogNav.children = this.structure.blogCategories.map(category => ({
        label: this.capitalizeWords(category),
        href: `/blog/category/${this.slugify(category)}`,
        current: this.isCurrentPath(`/blog/category/${this.slugify(category)}`),
        ariaLabel: `View ${category} articles`
      }))
    }
    
    nav.push(blogNav)
    
    // Portfolio section
    const portfolioNav: NavigationItem = {
      label: 'Portfolio',
      href: '/portfolio',
      icon: 'image',
      current: this.isCurrentPath('/portfolio'),
      ariaLabel: 'View portfolio',
      children: []
    }
    
    // Add portfolio collections as children
    if (this.structure.portfolioCollections.length > 0) {
      portfolioNav.children = this.structure.portfolioCollections
        .filter(collection => !collection.draft)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(collection => ({
          label: collection.name,
          href: `/portfolio/${collection.key}`,
          current: this.isCurrentPath(`/portfolio/${collection.key}`),
          ariaLabel: `View ${collection.name} collection`,
          badge: collection.itemCount > 0 ? collection.itemCount : undefined
        }))
    }
    
    nav.push(portfolioNav)
    
    // Resume
    nav.push({
      label: 'Resume',
      href: '/resume',
      icon: 'file-text',
      current: this.isCurrentPath('/resume'),
      ariaLabel: 'View resume and experience'
    })
    
    // Contact
    nav.push({
      label: 'Contact',
      href: '/contact',
      icon: 'mail',
      current: this.isCurrentPath('/contact'),
      ariaLabel: 'Get in touch'
    })
    
    // Add custom pages
    this.structure.customPages.forEach(page => {
      nav.push({
        label: page.title,
        href: page.path,
        icon: page.icon,
        current: this.isCurrentPath(page.path),
        ariaLabel: page.description || `Go to ${page.title}`,
        description: page.description
      })
    })
    
    return nav
  }
  
  // Generate footer navigation
  private generateFooterNavigation(): NavigationItem[] {
    const footer: NavigationItem[] = []
    
    // Quick links
    footer.push(
      {
        label: 'Home',
        href: '/',
        ariaLabel: 'Go to homepage'
      },
      {
        label: 'About',
        href: '/about',
        ariaLabel: 'Learn more about me'
      },
      {
        label: 'Blog',
        href: '/blog',
        ariaLabel: 'Read blog articles'
      },
      {
        label: 'Portfolio',
        href: '/portfolio',
        ariaLabel: 'View my work'
      },
      {
        label: 'Contact',
        href: '/contact',
        ariaLabel: 'Get in touch'
      }
    )
    
    // Add legal/policy pages if they exist
    const legalPages = [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Use', href: '/terms' },
      { label: 'Accessibility', href: '/accessibility' }
    ]
    
    footer.push(...legalPages)
    
    return footer
  }
  
  // Generate social navigation
  private generateSocialNavigation(): NavigationItem[] {
    const social: NavigationItem[] = []
    const primaryPersona = this.structure.personas.find(p => p.primary)
    
    if (primaryPersona?.social) {
      const socialLinks = primaryPersona.social
      
      if (socialLinks.github) {
        social.push({
          label: 'GitHub',
          href: socialLinks.github,
          icon: 'github',
          external: true,
          ariaLabel: 'View my GitHub profile'
        })
      }
      
      if (socialLinks.linkedin) {
        social.push({
          label: 'LinkedIn',
          href: socialLinks.linkedin,
          icon: 'linkedin',
          external: true,
          ariaLabel: 'Connect on LinkedIn'
        })
      }
      
      if (socialLinks.twitter) {
        social.push({
          label: 'Twitter',
          href: socialLinks.twitter,
          icon: 'twitter',
          external: true,
          ariaLabel: 'Follow on Twitter'
        })
      }
      
      if (socialLinks.website) {
        social.push({
          label: 'Website',
          href: socialLinks.website,
          icon: 'external-link',
          external: true,
          ariaLabel: 'Visit my website'
        })
      }
      
      if (socialLinks.email) {
        social.push({
          label: 'Email',
          href: `mailto:${socialLinks.email}`,
          icon: 'mail',
          external: true,
          ariaLabel: 'Send me an email'
        })
      }
    }
    
    return social
  }
  
  // Generate persona-specific navigation
  private generatePersonaNavigation(): NavigationItem[] {
    const personaNav: NavigationItem[] = []
    
    this.structure.personas
      .filter(persona => !persona.draft)
      .forEach(persona => {
        personaNav.push({
          label: persona.name,
          href: `/persona/${persona.key}`,
          current: this.isCurrentPath(`/persona/${persona.key}`),
          ariaLabel: `View ${persona.name}'s content`,
          description: persona.title,
          badge: persona.primary ? 'Primary' : undefined
        })
      })
    
    return personaNav
  }
  
  // Helper methods
  private isCurrentPath(path: string): boolean {
    // Exact match for home page
    if (path === '/' && this.currentPath === '/') {
      return true
    }
    
    // For other paths, check if current path starts with the nav path
    if (path !== '/' && this.currentPath.startsWith(path)) {
      return true
    }
    
    return false
  }
  
  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase())
  }
  
  private slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
  }
}

// Breadcrumb generator
export class BreadcrumbGenerator {
  private structure: SiteStructure
  
  constructor(structure: SiteStructure) {
    this.structure = structure
  }
  
  // Generate breadcrumbs for a given path
  generateBreadcrumbs(path: string, pageTitle?: string): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = []
    
    // Always start with home
    breadcrumbs.push({
      label: 'Home',
      href: '/',
      ariaLabel: 'Go to homepage'
    })
    
    // Parse path segments
    const segments = path.split('/').filter(segment => segment.length > 0)
    
    if (segments.length === 0) {
      // We're on the home page
      breadcrumbs[0].current = true
      return breadcrumbs
    }
    
    // Build breadcrumbs based on path segments
    let currentPath = ''
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      currentPath += `/${segment}`
      const isLast = i === segments.length - 1
      
      if (segment === 'blog') {
        breadcrumbs.push({
          label: 'Blog',
          href: isLast ? undefined : '/blog',
          current: isLast,
          ariaLabel: isLast ? 'Current page: Blog' : 'Go to blog'
        })
      } else if (segment === 'portfolio') {
        breadcrumbs.push({
          label: 'Portfolio',
          href: isLast ? undefined : '/portfolio',
          current: isLast,
          ariaLabel: isLast ? 'Current page: Portfolio' : 'Go to portfolio'
        })
      } else if (segment === 'resume') {
        breadcrumbs.push({
          label: 'Resume',
          href: isLast ? undefined : '/resume',
          current: isLast,
          ariaLabel: isLast ? 'Current page: Resume' : 'Go to resume'
        })
      } else if (segment === 'contact') {
        breadcrumbs.push({
          label: 'Contact',
          href: isLast ? undefined : '/contact',
          current: isLast,
          ariaLabel: isLast ? 'Current page: Contact' : 'Go to contact'
        })
      } else if (segment === 'category' && segments[i - 1] === 'blog') {
        // Blog category
        const categorySlug = segments[i + 1]
        if (categorySlug) {
          breadcrumbs.push({
            label: this.capitalizeWords(categorySlug.replace('-', ' ')),
            href: isLast ? undefined : `/blog/category/${categorySlug}`,
            current: isLast,
            ariaLabel: isLast ? `Current page: ${categorySlug} category` : `Go to ${categorySlug} category`
          })
        }
      } else if (segments[i - 1] === 'portfolio') {
        // Portfolio collection
        const collection = this.structure.portfolioCollections.find(c => c.key === segment)
        if (collection) {
          breadcrumbs.push({
            label: collection.name,
            href: isLast ? undefined : `/portfolio/${segment}`,
            current: isLast,
            ariaLabel: isLast ? `Current page: ${collection.name}` : `Go to ${collection.name}`
          })
        }
      } else if (segments[i - 1] === 'persona') {
        // Persona page
        const persona = this.structure.personas.find(p => p.key === segment)
        if (persona) {
          breadcrumbs.push({
            label: persona.name,
            href: isLast ? undefined : `/persona/${segment}`,
            current: isLast,
            ariaLabel: isLast ? `Current page: ${persona.name}` : `Go to ${persona.name}`
          })
        }
      } else if (isLast && pageTitle) {
        // Final segment with custom page title
        breadcrumbs.push({
          label: pageTitle,
          current: true,
          ariaLabel: `Current page: ${pageTitle}`
        })
      } else {
        // Generic segment
        breadcrumbs.push({
          label: this.capitalizeWords(segment.replace('-', ' ')),
          href: isLast ? undefined : currentPath,
          current: isLast,
          ariaLabel: isLast ? `Current page: ${segment}` : `Go to ${segment}`
        })
      }
    }
    
    return breadcrumbs
  }
  
  private capitalizeWords(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase())
  }
}

// Accessibility helpers
export class AccessibilityNavigationHelper {
  // Generate skip links
  static generateSkipLinks(): NavigationItem[] {
    return [
      {
        label: 'Skip to main content',
        href: '#main',
        ariaLabel: 'Skip to main content'
      },
      {
        label: 'Skip to navigation',
        href: '#navigation',
        ariaLabel: 'Skip to navigation'
      },
      {
        label: 'Skip to footer',
        href: '#footer',
        ariaLabel: 'Skip to footer'
      }
    ]
  }
  
  // Generate ARIA navigation attributes
  static generateAriaAttributes(
    navigationRole: 'main' | 'breadcrumb' | 'secondary' | 'social',
    label?: string
  ): Record<string, string> {
    const attributes: Record<string, string> = {}
    
    switch (navigationRole) {
      case 'main':
        attributes.role = 'navigation'
        attributes['aria-label'] = label || 'Main navigation'
        break
      case 'breadcrumb':
        attributes.role = 'navigation'
        attributes['aria-label'] = label || 'Breadcrumb navigation'
        break
      case 'secondary':
        attributes.role = 'navigation'
        attributes['aria-label'] = label || 'Secondary navigation'
        break
      case 'social':
        attributes.role = 'navigation'
        attributes['aria-label'] = label || 'Social media links'
        break
    }
    
    return attributes
  }
  
  // Generate structured data for breadcrumbs
  static generateBreadcrumbStructuredData(breadcrumbs: BreadcrumbItem[]): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.label,
        ...(crumb.href && { item: crumb.href })
      }))
    }
  }
  
  // Validate navigation accessibility
  static validateNavigationAccessibility(navigation: NavigationItem[]): {
    valid: boolean
    issues: string[]
    warnings: string[]
  } {
    const issues: string[] = []
    const warnings: string[] = []
    
    const validateNavItem = (item: NavigationItem, depth: number = 0) => {
      // Check for aria-label or descriptive label
      if (!item.ariaLabel && item.label.length < 2) {
        issues.push(`Navigation item "${item.label}" should have an aria-label or more descriptive label`)
      }
      
      // Check for external link indicators
      if (item.external && !item.ariaLabel?.includes('external')) {
        warnings.push(`External link "${item.label}" should indicate it opens in a new window`)
      }
      
      // Check navigation depth (accessibility guideline: max 3 levels)
      if (depth > 2) {
        warnings.push(`Navigation item "${item.label}" is nested too deeply (max 3 levels recommended)`)
      }
      
      // Recursively check children
      if (item.children) {
        item.children.forEach(child => validateNavItem(child, depth + 1))
      }
    }
    
    navigation.forEach(item => validateNavItem(item))
    
    return {
      valid: issues.length === 0,
      issues,
      warnings
    }
  }
}

// Navigation utility functions
export class NavigationUtils {
  // Find navigation item by href
  static findNavigationItem(navigation: NavigationItem[], href: string): NavigationItem | null {
    for (const item of navigation) {
      if (item.href === href) {
        return item
      }
      
      if (item.children) {
        const found = this.findNavigationItem(item.children, href)
        if (found) return found
      }
    }
    
    return null
  }
  
  // Get navigation path (ancestors) for a given href
  static getNavigationPath(navigation: NavigationItem[], href: string): NavigationItem[] {
    const path: NavigationItem[] = []
    
    const findPath = (items: NavigationItem[], target: string): boolean => {
      for (const item of items) {
        path.push(item)
        
        if (item.href === target) {
          return true
        }
        
        if (item.children && findPath(item.children, target)) {
          return true
        }
        
        path.pop()
      }
      
      return false
    }
    
    findPath(navigation, href)
    return path
  }
  
  // Flatten navigation tree
  static flattenNavigation(navigation: NavigationItem[]): NavigationItem[] {
    const flattened: NavigationItem[] = []
    
    const flatten = (items: NavigationItem[]) => {
      for (const item of items) {
        flattened.push(item)
        if (item.children) {
          flatten(item.children)
        }
      }
    }
    
    flatten(navigation)
    return flattened
  }
  
  // Update current state in navigation
  static updateCurrentState(navigation: NavigationItem[], currentPath: string): NavigationItem[] {
    return navigation.map(item => ({
      ...item,
      current: item.href === currentPath || (item.href !== '/' && currentPath.startsWith(item.href || '')),
      children: item.children ? this.updateCurrentState(item.children, currentPath) : undefined
    }))
  }
}