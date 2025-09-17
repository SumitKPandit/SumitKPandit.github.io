// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxtjs/tailwindcss', '@nuxt/eslint'],
  content: {
    documentDriven: false,
    highlight: {
      theme: 'github-dark',
      preload: ['typescript', 'javascript', 'vue', 'css', 'markdown']
    }
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'en', class: 'dark' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Sumit Kumar Pandit',
      meta: [
        { name: 'description', content: 'Philosopher, Developer, Photographer - Exploring intersections of technology, thought, and visual expression.' }
      ]
    }
  },
  nitro: {
    prerender: {
      routes: ['/sitemap.xml']
    }
  }
})