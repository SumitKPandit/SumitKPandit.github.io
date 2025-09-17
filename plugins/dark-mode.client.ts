export default defineNuxtPlugin(() => {
  // Ensure dark mode is set by default
  if (typeof document !== 'undefined') {
    document.documentElement.classList.add('dark')
  }
})