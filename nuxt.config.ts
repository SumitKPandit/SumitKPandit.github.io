// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // Enhanced modules for performance and SEO
  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxt/image'
  ],
  
  // Runtime configuration
  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || 'https://sumitkumarpandit.github.io',
      siteName: 'Sumit Kumar Pandit',
      siteDescription: 'Full-Stack Developer & Philosophy PhD - Portfolio, Blog, and Philosophical Reflections'
    }
  },
  
  // Content configuration
  content: {
    documentDriven: false,
    highlight: {
      theme: 'github-dark',
      preload: ['typescript', 'javascript', 'vue', 'css', 'markdown', 'json', 'bash']
    },
    markdown: {
      // Enhanced markdown processing
      anchorLinks: false,
      remarkPlugins: [],
      rehypePlugins: []
    }
  },
  
  // Image optimization
  image: {
    // Enable responsive images and lazy loading
    format: ['webp', 'png', 'jpg'],
    quality: 85,
    densities: [1, 2],
    sizes: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  },
  
  // CSS configuration
  css: ['~/assets/css/main.css'],
  
  // App configuration with enhanced meta tags
  app: {
    head: {
      htmlAttrs: { 
        lang: 'en', 
        class: 'dark',
        prefix: 'og: https://ogp.me/ns#'
      },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
      title: 'Sumit Kumar Pandit',
      meta: [
        // Basic meta tags
        { 
          name: 'description', 
          content: 'Full-Stack Developer & Philosophy PhD - Portfolio, Blog, and Philosophical Reflections' 
        },
        { name: 'author', content: 'Sumit Kumar Pandit' },
        { name: 'keywords', content: 'web development, philosophy, TypeScript, Vue.js, accessibility, critical theory, photography' },
        
        // Open Graph defaults
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Sumit Kumar Pandit' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:image', content: '/images/og-default.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/png' },
        
        // Twitter Card defaults
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@SumitKPandit' },
        { name: 'twitter:creator', content: '@SumitKPandit' },
        
        // Performance and security
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#1f2937' },
        { name: 'color-scheme', content: 'dark light' },
        
        // Mobile optimization
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Sumit Kumar Pandit' }
      ],
      
      link: [
        // Favicon and app icons
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
        
        // Preconnect to external domains for performance
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'dns-prefetch', href: 'https://github.com' }
      ]
    }
  },
  
  // Build optimization
  build: {
    transpile: []
  },
  
  // Vite configuration for performance
  vite: {
    build: {
      // Enable CSS code splitting
      cssCodeSplit: true
    },
    // Performance optimizations
    optimizeDeps: {
      include: ['vue', 'vue-router', '@vueuse/core']
    }
  },
  
  // Experimental features for better performance
  experimental: {
    payloadExtraction: false,
    inlineSSRStyles: true,
    viewTransition: true
  },
  
  // Nitro configuration for SSG and performance
  nitro: {
    prerender: {
      crawlLinks: true,
      failOnError: false
    },
    
    // Enable compression
    compressPublicAssets: true,
    
    // Route rules for caching and performance
    routeRules: {
      // Homepage pre-rendered at build time
      '/': { prerender: true },
      
      // Static pages cached indefinitely
      '/portfolio': { prerender: true },
      '/contact': { prerender: true },
      
      // API routes with appropriate caching
      '/api/**': { cors: true, headers: { 'cache-control': 's-maxage=60' } }
    }
  },
  
  // TypeScript configuration (disabled for build)
  typescript: {
    strict: false,
    typeCheck: false
  }
})