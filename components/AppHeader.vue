<template>
  <header class="bg-background shadow-sm">
    <div class="container mx-auto px-4 py-4 flex justify-between items-center">
      <NuxtLink to="/" class="text-2xl font-heading font-bold text-primary">
        SK<span class="text-accent">P</span>
      </NuxtLink>
      <nav>
        <ul class="flex space-x-6">
          <li v-for="item in menuItems" :key="item.path">
            <NuxtLink 
              :to="item.path" 
              class="font-medium hover:text-accent transition-colors"
              :class="{ 'text-accent': $route.path === item.path, 'text-textColor': $route.path !== item.path }"
            >
              {{ item.name }}
            </NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script setup>
const menuItems = [
  { name: 'Home', path: '/' },
  { name: 'Resume', path: '/resume' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/contact' }
]
</script>