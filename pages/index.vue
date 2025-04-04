<template>
    <div class="container mx-auto px-4 py-12">
      <section class="flex flex-col md:flex-row items-center mb-16">
        <div class="md:w-1/2 mb-8 md:mb-0 md:pr-8">
          <h1 class="text-4xl md:text-5xl font-heading font-bold text-primary mb-4">
            Hi, I'm Sumit Kumar Pandit
          </h1>
          <h2 class="text-2xl md:text-3xl font-heading text-secondary mb-6">
            Full Stack Web Developer
          </h2>
          <p class="text-lg leading-relaxed mb-8">
            I build accessible and performant web applications using modern technologies.
            Currently working at Cerner Healthcare Solutions as a Software Engineer III.
          </p>
          <div class="flex flex-wrap gap-3">
            <NuxtLink 
              to="/resume" 
              class="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium flex items-center"
            >
              <FeatherIcon name="file-text" class="mr-2" /> View Resume
            </NuxtLink>
            <NuxtLink 
              to="/blog" 
              class="bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-md font-medium flex items-center"
            >
              <FeatherIcon name="book-open" class="mr-2" /> Read Blog
            </NuxtLink>
          </div>
        </div>
        <div class="md:w-1/2 flex justify-center">
          <img 
            src="https://placehold.co/600x400" 
            alt="Sumit Kumar Pandit" 
            class="rounded-full w-64 h-64 object-cover border-4 border-accent shadow-lg"
          />
        </div>
      </section>
  
      <section class="mb-16">
        <h2 class="text-3xl font-heading font-bold text-primary mb-8 border-b-2 border-primary/20 pb-2">
          Featured Skills
        </h2>
        <div class="flex flex-wrap gap-3">
          <SkillBadge v-for="skill in featuredSkills" :key="skill" :name="skill" />
        </div>
      </section>
  
      <section>
        <h2 class="text-3xl font-heading font-bold text-primary mb-8 border-b-2 border-primary/20 pb-2">
          Recent Blog Posts
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BlogCard 
            v-for="post in recentPosts" 
            :key="post._path" 
            :post="post" 
          />
        </div>
        <div class="text-center mt-8">
          <NuxtLink 
            to="/blog" 
            class="text-accent hover:text-accent/80 font-medium flex items-center justify-center"
          >
            View all posts <FeatherIcon name="arrow-right" class="ml-2" />
          </NuxtLink>
        </div>
      </section>
    </div>
  </template>
  
  <script setup>
  const featuredSkills = [
    'HTML', 'CSS', 'JavaScript', 'React', 'Redux', 
    'Accessibility', 'RWD', 'Git', 'Webpack'
  ]
  
  // Fetch recent blog posts
  const { data: recentPosts } = await useAsyncData('recentPosts', () => {
    return queryContent('/blog')
      .sort({ date: -1 })
      .limit(3)
      .find()
  })
  </script>