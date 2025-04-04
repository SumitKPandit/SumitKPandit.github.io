<template>
    <div class="container mx-auto px-4 py-12">
      <h1 class="text-4xl font-heading font-bold text-primary mb-8">Blog</h1>
      
      <div class="mb-8">
        <p class="text-lg leading-relaxed">
          Welcome to my blog where I share my thoughts on life, technical insights, and career development.
        </p>
      </div>
      
      <div class="mb-8 flex flex-wrap gap-3">
        <button 
          @click="activeCategory = ''"
          :class="[
            'px-4 py-2 rounded-md transition-colors',
            activeCategory === '' 
              ? 'bg-primary text-white' 
              : 'bg-background hover:bg-primary/10'
          ]"
        >
          All
        </button>
        <button 
          v-for="category in categories" 
          :key="category"
          @click="activeCategory = category"
          :class="[
            'px-4 py-2 rounded-md transition-colors',
            activeCategory === category 
              ? 'bg-primary text-white' 
              : 'bg-background hover:bg-primary/10'
          ]"
        >
          {{ category }}
        </button>
      </div>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BlogCard 
          v-for="post in filteredPosts" 
          :key="post._path" 
          :post="post" 
        />
      </div>
    </div>
  </template>
  
  <script setup>
  const activeCategory = ref('')
  
  const categories = [
    'Life Wisdom',
    'Technical Insights',
    'Career Development',
    'Personal Growth'
  ]
  
  // Fetch all blog posts
  const { data: posts } = await useAsyncData('blogPosts', () => {
    return queryContent('/blog')
      .sort({ date: -1 })
      .find()
  })
  
  // Filter posts by active category
  const filteredPosts = computed(() => {
    if (!activeCategory.value) return posts.value
    return posts.value.filter(post => post.category === activeCategory.value)
  })
  </script>