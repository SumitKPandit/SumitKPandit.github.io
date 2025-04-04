export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/content'
  ],

  app: {
    head: {
      title: 'Sumit Kumar Pandit',
      meta: [
        { name: 'description', content: 'Personal website and blog of Sumit Kumar Pandit, Full Stack Web Developer' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap' }
      ]
    }
  },

  content: {
    highlight: {
      theme: 'github-light'
    }
  },

  compatibilityDate: '2025-04-04'
})