/**
 * Global Meta Tags Plugin
 * 
 * Automatically injects canonical URLs and essential meta tags
 * across all pages for better SEO and consistency.
 */

export default defineNuxtPlugin(() => {
  // Get runtime config for site settings
  const runtimeConfig = useRuntimeConfig()
  const route = useRoute()
  
  // Default site configuration
  const siteConfig = {
    name: 'Sumit Kumar Pandit',
    description: 'Full-Stack Developer & Philosophy PhD - Portfolio, Blog, and Philosophical Reflections',
    baseUrl: runtimeConfig.public.baseUrl || 'https://sumitkumarpandit.github.io',
    author: 'Sumit Kumar Pandit',
    lang: 'en',
    locale: 'en_US'
  }
  
  // Generate canonical URL for current page
  const canonicalUrl = `${siteConfig.baseUrl}${route.path}`
  
  // Common meta tags for all pages
  useHead({
    // Canonical URL
    link: [
      {
        rel: 'canonical',
        href: canonicalUrl
      }
    ],
    
    // Essential meta tags
    meta: [
      // Basic meta tags
      {
        name: 'author',
        content: siteConfig.author
      },
      {
        name: 'generator',
        content: 'Nuxt 3'
      },
      {
        name: 'language',
        content: siteConfig.lang
      },
      
      // SEO meta tags
      {
        name: 'robots',
        content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      },
      {
        name: 'googlebot',
        content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      },
      
      // Security headers
      {
        'http-equiv': 'X-Content-Type-Options',
        content: 'nosniff'
      },
      {
        'http-equiv': 'X-Frame-Options',
        content: 'DENY'
      },
      {
        'http-equiv': 'X-XSS-Protection',
        content: '1; mode=block'
      },
      
      // Performance hints
      {
        name: 'format-detection',
        content: 'telephone=no'
      },
      
      // Mobile optimization
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, viewport-fit=cover'
      },
      {
        name: 'mobile-web-app-capable',
        content: 'yes'
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes'
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'default'
      },
      
      // Theme color
      {
        name: 'theme-color',
        content: '#1f2937'
      },
      {
        name: 'msapplication-TileColor',
        content: '#1f2937'
      }
    ]
  })
})

/**
 * Utility function to set page-specific meta tags
 * Use this in individual pages or components to override defaults
 */
export function usePageMeta({
  title,
  description,
  keywords,
  image,
  type = 'website',
  publishedTime,
  modifiedTime,
  section,
  tags,
  noIndex = false
}: {
  title: string
  description?: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  noIndex?: boolean
}) {
  const runtimeConfig = useRuntimeConfig()
  const route = useRoute()
  
  const siteConfig = {
    name: 'Sumit Kumar Pandit',
    baseUrl: runtimeConfig.public.baseUrl || 'https://sumitkumarpandit.github.io',
    author: 'Sumit Kumar Pandit',
    locale: 'en_US'
  }
  
  const canonicalUrl = `${siteConfig.baseUrl}${route.path}`
  const fullTitle = `${title} | ${siteConfig.name}`
  const defaultImage = `${siteConfig.baseUrl}/images/og-default.png`
  
  // Set page-specific head data
  useHead({
    title: fullTitle,
    meta: [
      // Basic meta tags
      {
        name: 'description',
        content: description || `${title} - ${siteConfig.name}`
      },
      ...(keywords ? [{
        name: 'keywords',
        content: keywords.join(', ')
      }] : []),
      ...(noIndex ? [{
        name: 'robots',
        content: 'noindex, nofollow'
      }] : []),
      
      // Open Graph meta tags
      {
        property: 'og:title',
        content: fullTitle
      },
      {
        property: 'og:description',
        content: description || `${title} - ${siteConfig.name}`
      },
      {
        property: 'og:url',
        content: canonicalUrl
      },
      {
        property: 'og:type',
        content: type
      },
      {
        property: 'og:image',
        content: image || defaultImage
      },
      {
        property: 'og:image:alt',
        content: `${title} - ${siteConfig.name}`
      },
      {
        property: 'og:locale',
        content: siteConfig.locale
      },
      {
        property: 'og:site_name',
        content: siteConfig.name
      },
      
      // Twitter Card meta tags
      {
        name: 'twitter:card',
        content: 'summary_large_image'
      },
      {
        name: 'twitter:title',
        content: fullTitle
      },
      {
        name: 'twitter:description',
        content: description || `${title} - ${siteConfig.name}`
      },
      {
        name: 'twitter:image',
        content: image || defaultImage
      },
      {
        name: 'twitter:image:alt',
        content: `${title} - ${siteConfig.name}`
      },
      
      // Article-specific meta tags
      ...(type === 'article' ? [
        {
          property: 'article:author',
          content: siteConfig.author
        },
        ...(publishedTime ? [{
          property: 'article:published_time',
          content: publishedTime
        }] : []),
        ...(modifiedTime ? [{
          property: 'article:modified_time',
          content: modifiedTime
        }] : []),
        ...(section ? [{
          property: 'article:section',
          content: section
        }] : []),
        ...(tags ? tags.map(tag => ({
          property: 'article:tag',
          content: tag
        })) : [])
      ] : [])
    ]
  })
}

/**
 * Utility to generate meta tags for blog posts
 */
export function useBlogPostMeta(post: {
  title: string
  description?: string
  slug: string
  publishedAt?: string
  updatedAt?: string
  tags?: string[]
  image?: string
  readingTime?: number
}) {
  const keywords = post.tags || []
  if (post.readingTime) {
    keywords.push(`${post.readingTime} min read`)
  }
  
  usePageMeta({
    title: post.title,
    description: post.description,
    keywords,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    section: 'Blog',
    tags: post.tags,
    image: post.image
  })
}

/**
 * Utility to generate meta tags for portfolio items
 */
export function usePortfolioMeta(item: {
  title: string
  description?: string
  slug: string
  technologies?: string[]
  image?: string
  completedAt?: string
}) {
  const keywords = ['portfolio', 'project']
  if (item.technologies) {
    keywords.push(...item.technologies)
  }
  
  usePageMeta({
    title: item.title,
    description: item.description,
    keywords,
    type: 'website',
    image: item.image
  })
}