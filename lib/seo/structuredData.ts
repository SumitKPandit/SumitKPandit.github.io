/**
 * Structured Data Injection Utility
 * 
 * Generates JSON-LD structured data markup for better SEO and rich snippets.
 * Supports Schema.org types commonly used for personal websites and portfolios.
 */

interface PersonSchema {
  '@context': 'https://schema.org'
  '@type': 'Person'
  name: string
  jobTitle?: string
  description?: string
  url?: string
  sameAs?: string[]
  image?: string
  email?: string
  knowsAbout?: string[]
  alumniOf?: OrganizationSchema[]
  worksFor?: OrganizationSchema[]
}

interface OrganizationSchema {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  name: string
  url?: string
  logo?: string
  description?: string
  sameAs?: string[]
}

interface WebSiteSchema {
  '@context': 'https://schema.org'
  '@type': 'WebSite'
  name: string
  url: string
  description?: string
  author?: PersonSchema
  potentialAction?: {
    '@type': 'SearchAction'
    target: string
    'query-input': string
  }
}

interface BlogPostSchema {
  '@context': 'https://schema.org'
  '@type': 'BlogPosting'
  headline: string
  description?: string
  author?: PersonSchema
  datePublished?: string
  dateModified?: string
  url?: string
  image?: string
  mainEntityOfPage?: string
  keywords?: string[]
  articleSection?: string
}

interface WorksSchema {
  '@context': 'https://schema.org'
  '@type': 'CreativeWork'
  name: string
  description?: string
  author?: PersonSchema
  dateCreated?: string
  url?: string
  image?: string
  keywords?: string[]
  genre?: string
  about?: string[]
}

/**
 * Generate Person structured data
 */
export function createPersonSchema({
  name,
  jobTitle,
  description,
  url,
  sameAs = [],
  image,
  email,
  knowsAbout = [],
  alumniOf = [],
  worksFor = []
}: Omit<PersonSchema, '@context' | '@type'>): PersonSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    ...(jobTitle && { jobTitle }),
    ...(description && { description }),
    ...(url && { url }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(image && { image }),
    ...(email && { email }),
    ...(knowsAbout.length > 0 && { knowsAbout }),
    ...(alumniOf.length > 0 && { alumniOf }),
    ...(worksFor.length > 0 && { worksFor })
  }
}

/**
 * Generate Organization structured data
 */
export function createOrganizationSchema({
  name,
  url,
  logo,
  description,
  sameAs = []
}: Omit<OrganizationSchema, '@context' | '@type'>): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    ...(url && { url }),
    ...(logo && { logo }),
    ...(description && { description }),
    ...(sameAs.length > 0 && { sameAs })
  }
}

/**
 * Generate WebSite structured data
 */
export function createWebSiteSchema({
  name,
  url,
  description,
  author,
  potentialAction
}: Omit<WebSiteSchema, '@context' | '@type'>): WebSiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    ...(description && { description }),
    ...(author && { author }),
    ...(potentialAction && { potentialAction })
  }
}

/**
 * Generate BlogPosting structured data
 */
export function createBlogPostSchema({
  headline,
  description,
  author,
  datePublished,
  dateModified,
  url,
  image,
  mainEntityOfPage,
  keywords = [],
  articleSection
}: Omit<BlogPostSchema, '@context' | '@type'>): BlogPostSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline,
    ...(description && { description }),
    ...(author && { author }),
    ...(datePublished && { datePublished }),
    ...(dateModified && { dateModified }),
    ...(url && { url }),
    ...(image && { image }),
    ...(mainEntityOfPage && { mainEntityOfPage }),
    ...(keywords.length > 0 && { keywords }),
    ...(articleSection && { articleSection })
  }
}

/**
 * Generate CreativeWork structured data for portfolio items
 */
export function createWorksSchema({
  name,
  description,
  author,
  dateCreated,
  url,
  image,
  keywords = [],
  genre,
  about = []
}: Omit<WorksSchema, '@context' | '@type'>): WorksSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name,
    ...(description && { description }),
    ...(author && { author }),
    ...(dateCreated && { dateCreated }),
    ...(url && { url }),
    ...(image && { image }),
    ...(keywords.length > 0 && { keywords }),
    ...(genre && { genre }),
    ...(about.length > 0 && { about })
  }
}

/**
 * Generate structured data script tags as strings
 * Use in components with v-html or in server-side rendering
 */
export function generateStructuredDataScript(schema: object | object[]): string[] {
  const schemas = Array.isArray(schema) ? schema : [schema]
  
  return schemas.map(schemaItem => 
    `<script type="application/ld+json">${JSON.stringify(schemaItem, null, 0)}</script>`
  )
}

/**
 * Generate structured data for useHead composable
 * Returns the script objects that can be used with Nuxt's useHead
 */
export function generateStructuredDataHead(schema: object | object[]): Array<{ key: string; type: string; innerHTML: string }> {
  const schemas = Array.isArray(schema) ? schema : [schema]
  
  return schemas.map((schemaItem, index) => ({
    key: `structured-data-${index}`,
    type: 'application/ld+json',
    innerHTML: JSON.stringify(schemaItem, null, 0)
  }))
}

/**
 * Composable for injecting structured data
 * Use this in Vue components or pages where useHead is available
 */
export function useStructuredData(schema: object | object[]) {
  // This function should be called within a component where useHead is available
  // The actual useHead call should be done in the component itself
  return generateStructuredDataHead(schema)
}

/**
 * Common structured data configurations for the site
 */
export const siteStructuredData = {
  /**
   * Main person schema for Sumit Kumar Pandit
   */
  createMainPersonSchema: (): PersonSchema => createPersonSchema({
    name: 'Sumit Kumar Pandit',
    jobTitle: 'Full-Stack Developer & Philosophy PhD',
    description: 'Technology innovator with expertise in accessible web development, critical theory, and human-centered design. PhD in Philosophy with focus on ethics of technology.',
    url: 'https://sumitkumarpandit.github.io',
    sameAs: [
      'https://github.com/SumitKPandit',
      'https://linkedin.com/in/sumitkumarpandit'
    ],
    knowsAbout: [
      'Web Development',
      'TypeScript',
      'Vue.js',
      'Accessibility',
      'Philosophy of Technology',
      'Critical Theory',
      'Ethics',
      'Photography'
    ],
    email: 'contact@sumitkumarpandit.dev'
  }),

  /**
   * Main website schema
   */
  createMainWebSiteSchema: (): WebSiteSchema => createWebSiteSchema({
    name: 'Sumit Kumar Pandit - Portfolio & Blog',
    url: 'https://sumitkumarpandit.github.io',
    description: 'Personal portfolio and blog of Sumit Kumar Pandit, featuring web development projects, philosophical writings, and photography.',
    author: siteStructuredData.createMainPersonSchema(),
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://sumitkumarpandit.github.io/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  })
}

/**
 * Utility to generate breadcrumb structured data
 */
export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }
}

/**
 * Utility to generate FAQ structured data
 */
export function createFAQSchema(faqs: Array<{ question: string; answer: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

// Export types for use in components
export type {
  PersonSchema,
  OrganizationSchema,
  WebSiteSchema,
  BlogPostSchema,
  WorksSchema
}