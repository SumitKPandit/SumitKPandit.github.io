<template>
  <picture 
    :class="[
      'responsive-image',
      className,
      {
        'loading': isLoading,
        'loaded': isLoaded,
        'error': hasError,
        'lazy': lazyLoading
      }
    ]"
    :style="containerStyle"
  >
    <!-- Progressive loading sources -->
    <source
      v-for="source in responsiveSet?.sources || []"
      :key="source.type"
      :type="source.type"
      :srcset="lazyLoading ? undefined : source.srcset"
      :data-srcset="lazyLoading ? source.srcset : undefined"
      :sizes="source.sizes"
    />
    
    <!-- Fallback image -->
    <img
      ref="imageRef"
      :src="lazyLoading ? placeholder : responsiveSet?.fallback.src"
      :data-src="lazyLoading ? responsiveSet?.fallback.src : undefined"
      :alt="alt"
      :width="responsiveSet?.fallback.width"
      :height="responsiveSet?.fallback.height"
      :loading="lazyLoading ? 'lazy' : 'eager'"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
    />
    
    <!-- Loading state -->
    <div 
      v-if="showLoadingState && isLoading" 
      class="image-loading-overlay"
    >
      <div class="loading-spinner" />
      <slot name="loading">
        <span class="loading-text">Loading...</span>
      </slot>
    </div>
    
    <!-- Error state -->
    <div 
      v-if="hasError" 
      class="image-error-overlay"
    >
      <slot name="error">
        <div class="error-content">
          <Icon name="image-off" />
          <span class="error-text">Failed to load image</span>
        </div>
      </slot>
    </div>
  </picture>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { imageService, type ResponsiveImageSet } from '../../utils/media/image-service'

interface Props {
  src: string
  alt: string
  className?: string
  breakpoints?: number[]
  quality?: number
  lazyLoading?: boolean
  showLoadingState?: boolean
  placeholder?: string
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none'
  aspectRatio?: number
  maxWidth?: string
  priority?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  lazyLoading: true,
  showLoadingState: true,
  objectFit: 'cover',
  breakpoints: () => [320, 640, 768, 1024, 1280, 1920],
  quality: 85
})

const emit = defineEmits<{
  load: [event: Event]
  error: [event: Event]
  intersect: [isIntersecting: boolean]
}>()

// Reactive state
const imageRef = ref<HTMLImageElement>()
const isLoading = ref(true)
const isLoaded = ref(false)
const hasError = ref(false)
const metadata = ref<any>(null)
const responsiveSet = ref<ResponsiveImageSet | null>(null)
const observer = ref<IntersectionObserver | null>(null)

// Computed properties
const placeholder = computed(() => {
  if (props.placeholder) return props.placeholder
  return responsiveSet.value?.placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjZTVlN2ViIi8+Cjwvc3ZnPgo='
})

const containerStyle = computed(() => {
  const styles: Record<string, string> = {}
  
  if (props.maxWidth) {
    styles.maxWidth = props.maxWidth
  }
  
  if (props.aspectRatio || responsiveSet.value?.aspectRatio) {
    const ratio = props.aspectRatio || responsiveSet.value?.aspectRatio || 1
    styles.aspectRatio = ratio.toString()
  }
  
  return styles
})

const imageStyle = computed(() => {
  const styles: Record<string, string> = {
    objectFit: props.objectFit,
    width: '100%',
    height: '100%'
  }
  
  if (responsiveSet.value?.placeholder && isLoading.value) {
    styles.backgroundImage = `url('${responsiveSet.value.placeholder}')`
    styles.backgroundSize = 'cover'
    styles.backgroundPosition = 'center'
  }
  
  return styles
})

// Methods
const loadImageMetadata = async () => {
  try {
    metadata.value = await imageService.getImageMetadata(props.src)
    responsiveSet.value = imageService.generateResponsiveSet(
      props.src,
      metadata.value,
      props.breakpoints
    )
  } catch (error) {
    console.error('Failed to load image metadata:', error)
    hasError.value = true
  }
}

const handleLoad = (event: Event) => {
  isLoading.value = false
  isLoaded.value = true
  emit('load', event)
}

const handleError = (event: Event) => {
  isLoading.value = false
  hasError.value = true
  emit('error', event)
}

const setupLazyLoading = () => {
  if (!props.lazyLoading || !imageRef.value) return
  
  observer.value = imageService.createLazyLoader({
    rootMargin: '50px 0px',
    threshold: 0.01
  })
  
  if (observer.value) {
    observer.value.observe(imageRef.value.parentElement!)
  }
}

const cleanupObserver = () => {
  if (observer.value && imageRef.value?.parentElement) {
    observer.value.unobserve(imageRef.value.parentElement)
  }
}

// Lifecycle
onMounted(async () => {
  await loadImageMetadata()
  
  if (props.priority) {
    // Preload critical images immediately
    imageService.preloadCriticalImages([props.src])
  } else {
    setupLazyLoading()
  }
})

onUnmounted(() => {
  cleanupObserver()
})

// Watch for src changes
watch(() => props.src, async () => {
  isLoading.value = true
  isLoaded.value = false
  hasError.value = false
  await loadImageMetadata()
})
</script>

<style scoped>
.responsive-image {
  position: relative;
  display: block;
  overflow: hidden;
  background-color: #f3f4f6;
}

.responsive-image.loading {
  background-color: #e5e7eb;
}

.responsive-image img {
  transition: opacity 0.3s ease-in-out;
}

.responsive-image.loading img {
  opacity: 0.7;
}

.responsive-image.loaded img {
  opacity: 1;
}

.responsive-image.error img {
  opacity: 0.3;
}

.image-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

.loading-text {
  font-size: 14px;
  color: #6b7280;
}

.image-error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(239, 68, 68, 0.1);
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #dc2626;
}

.error-text {
  margin-top: 8px;
  font-size: 14px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive behavior */
@media (max-width: 640px) {
  .responsive-image {
    max-width: 100%;
    height: auto;
  }
}

/* Lazy loading animation */
.responsive-image.lazy img {
  transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
  transform: scale(1.05);
}

.responsive-image.lazy.loaded img {
  transform: scale(1);
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .responsive-image img,
  .responsive-image.lazy img {
    transition: none;
    transform: none;
  }
  
  .loading-spinner {
    animation: none;
  }
}
</style>