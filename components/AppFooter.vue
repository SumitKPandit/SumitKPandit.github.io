<template>
    <footer class="bg-primary text-white py-8 mt-auto">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0">
            <p class="font-heading font-bold text-xl">Sumit Kumar Pandit</p>
            <p class="text-sm opacity-80">Full Stack Web Developer</p>
          </div>
          <div class="flex space-x-4">
            <a href="https://github.com/sumitpandit" target="_blank" class="hover:text-accent transition-colors">
              <FeatherIcon name="github" />
            </a>
            <a href="https://linkedin.com/in/sumitpandit" target="_blank" class="hover:text-accent transition-colors">
              <FeatherIcon name="linkedin" />
            </a>
            <a href="mailto:panditsumitkumar@gmail.com" class="hover:text-accent transition-colors">
              <FeatherIcon name="mail" />
            </a>
          </div>
        </div>
        <div class="mt-6 text-center text-sm opacity-80">
          <p>© {{ new Date().getFullYear() }} Sumit Kumar Pandit. All rights reserved.</p>
          <p class="mt-1">Built with Nuxt 3, Tailwind CSS, and ❤️</p>
        </div>
      </div>
    </footer>
  </template>
  
  <script setup>
  // Footer component
  </script>