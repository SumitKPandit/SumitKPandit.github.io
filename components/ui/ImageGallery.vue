<template>
  <div class="image-gallery" :class="{ 'grid-layout': layout === 'grid', 'masonry-layout': layout === 'masonry' }">
    <!-- Gallery header -->
    <div v-if="title || $slots.header" class="gallery-header">
      <slot name="header">
        <h3 v-if="title" class="gallery-title">{{ title }}</h3>
      </slot>
    </div>
    
    <!-- Image grid -->
    <div 
      :class="[
        'gallery-grid',
        `columns-${columns}`,
        `gap-${gap}`
      ]"
      :style="gridStyle"
    >
      <div
        v-for="(image, index) in processedImages"
        :key="image.id || index"
        class="gallery-item"
        :class="{
          'featured': image.featured,
          'portrait': image.aspectRatio < 1,
          'landscape': image.aspectRatio > 1.3,
          'square': image.aspectRatio >= 1 && image.aspectRatio <= 1.3
        }"
        :style="getItemStyle(image, index)"
        @click="openLightbox(index)"
      >
        <ResponsiveImage
          :src="image.src"
          :alt="image.alt"
          :className="`gallery-image ${image.className || ''}`"
          :breakpoints="imageBreakpoints"
          :lazy-loading="lazyLoading"
          :priority="index < priorityCount"
          :object-fit="objectFit"
          @load="handleImageLoad(index)"
          @error="handleImageError(index)"
        />
        
        <!-- Image overlay -->
        <div v-if="showOverlay" class="image-overlay">
          <div class="overlay-content">
            <slot name="overlay" :image="image" :index="index">
              <div v-if="image.title" class="overlay-title">{{ image.title }}</div>
              <div v-if="image.description" class="overlay-description">{{ image.description }}</div>
            </slot>
          </div>
        </div>
        
        <!-- Image actions -->
        <div v-if="showActions" class="image-actions">
          <button
            v-if="enableZoom"
            class="action-button zoom-button"
            @click.stop="openLightbox(index)"
            :aria-label="`View ${image.alt} in full size`"
          >
            <Icon name="zoom-in" />
          </button>
          
          <button
            v-if="enableDownload"
            class="action-button download-button"
            @click.stop="downloadImage(image)"
            :aria-label="`Download ${image.alt}`"
          >
            <Icon name="download" />
          </button>
          
          <slot name="actions" :image="image" :index="index" />
        </div>
      </div>
    </div>
    
    <!-- Load more button -->
    <div v-if="showLoadMore && hasMoreImages" class="load-more-container">
      <button
        class="load-more-button"
        :disabled="loadingMore"
        @click="loadMoreImages"
      >
        <Icon v-if="loadingMore" name="loader" class="animate-spin" />
        <span>{{ loadingMore ? 'Loading...' : 'Load More' }}</span>
      </button>
    </div>
    
    <!-- Lightbox modal -->
    <Teleport to="body">
      <div
        v-if="lightboxOpen"
        class="lightbox-overlay"
        @click="closeLightbox"
        @keydown.esc="closeLightbox"
      >
        <div class="lightbox-container" @click.stop>
          <!-- Navigation -->
          <button
            v-if="processedImages.length > 1"
            class="lightbox-nav prev"
            @click="navigateLightbox(-1)"
            :disabled="currentLightboxIndex === 0"
          >
            <Icon name="chevron-left" />
          </button>
          
          <button
            v-if="processedImages.length > 1"
            class="lightbox-nav next"
            @click="navigateLightbox(1)"
            :disabled="currentLightboxIndex === processedImages.length - 1"
          >
            <Icon name="chevron-right" />
          </button>
          
          <!-- Close button -->
          <button class="lightbox-close" @click="closeLightbox">
            <Icon name="x" />
          </button>
          
          <!-- Main image -->
          <div class="lightbox-image-container">
            <ResponsiveImage
              v-if="currentLightboxImage"
              :src="currentLightboxImage.src"
              :alt="currentLightboxImage.alt"
              className="lightbox-image"
              :lazy-loading="false"
              object-fit="contain"
            />
          </div>
          
          <!-- Image info -->
          <div v-if="showImageInfo && currentLightboxImage" class="lightbox-info">
            <h4 v-if="currentLightboxImage.title" class="lightbox-title">
              {{ currentLightboxImage.title }}
            </h4>
            <p v-if="currentLightboxImage.description" class="lightbox-description">
              {{ currentLightboxImage.description }}
            </p>
            <div class="lightbox-meta">
              <span class="image-counter">
                {{ currentLightboxIndex + 1 }} of {{ processedImages.length }}
              </span>
              <span v-if="currentLightboxImage.dimensions" class="image-dimensions">
                {{ currentLightboxImage.dimensions }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import ResponsiveImage from './ResponsiveImage.vue'

interface GalleryImage {
  id?: string | number
  src: string
  alt: string
  title?: string
  description?: string
  featured?: boolean
  className?: string
  aspectRatio?: number
  dimensions?: string
  tags?: string[]
}

interface Props {
  images: GalleryImage[]
  title?: string
  layout?: 'grid' | 'masonry'
  columns?: number
  gap?: number
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none'
  showOverlay?: boolean
  showActions?: boolean
  showImageInfo?: boolean
  showLoadMore?: boolean
  enableZoom?: boolean
  enableDownload?: boolean
  lazyLoading?: boolean
  priorityCount?: number
  pageSize?: number
  imageBreakpoints?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'grid',
  columns: 3,
  gap: 4,
  objectFit: 'cover',
  showOverlay: true,
  showActions: true,
  showImageInfo: true,
  showLoadMore: false,
  enableZoom: true,
  enableDownload: false,
  lazyLoading: true,
  priorityCount: 6,
  pageSize: 12,
  imageBreakpoints: () => [320, 640, 768, 1024, 1280, 1920]
})

const emit = defineEmits<{
  imageLoad: [index: number, image: GalleryImage]
  imageError: [index: number, image: GalleryImage]
  loadMore: []
  imageClick: [index: number, image: GalleryImage]
}>()

// Reactive state
const currentPage = ref(1)
const loadingMore = ref(false)
const lightboxOpen = ref(false)
const currentLightboxIndex = ref(0)
const loadedImages = ref(new Set<number>())
const errorImages = ref(new Set<number>())

// Computed properties
const processedImages = computed(() => {
  const endIndex = props.showLoadMore ? currentPage.value * props.pageSize : props.images.length
  return props.images.slice(0, endIndex).map((image, index) => ({
    ...image,
    aspectRatio: image.aspectRatio || 1,
    dimensions: image.dimensions || 'Unknown'
  }))
})

const hasMoreImages = computed(() => {
  return props.showLoadMore && processedImages.value.length < props.images.length
})

const currentLightboxImage = computed(() => {
  return processedImages.value[currentLightboxIndex.value]
})

const gridStyle = computed(() => {
  if (props.layout === 'masonry') {
    return {
      columnCount: props.columns,
      columnGap: `${props.gap * 0.25}rem`
    }
  }
  
  return {
    gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
    gap: `${props.gap * 0.25}rem`
  }
})

// Methods
const getItemStyle = (image: GalleryImage, index: number) => {
  const styles: Record<string, string> = {}
  
  if (props.layout === 'masonry') {
    styles.breakInside = 'avoid'
    styles.marginBottom = `${props.gap * 0.25}rem`
  }
  
  if (image.featured) {
    if (props.layout === 'grid') {
      styles.gridColumn = 'span 2'
      styles.gridRow = 'span 2'
    }
  }
  
  return styles
}

const handleImageLoad = (index: number) => {
  loadedImages.value.add(index)
  emit('imageLoad', index, processedImages.value[index])
}

const handleImageError = (index: number) => {
  errorImages.value.add(index)
  emit('imageError', index, processedImages.value[index])
}

const loadMoreImages = async () => {
  if (loadingMore.value || !hasMoreImages.value) return
  
  loadingMore.value = true
  currentPage.value++
  
  // Simulate loading delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  loadingMore.value = false
  emit('loadMore')
}

const openLightbox = (index: number) => {
  currentLightboxIndex.value = index
  lightboxOpen.value = true
  document.body.style.overflow = 'hidden'
  emit('imageClick', index, processedImages.value[index])
}

const closeLightbox = () => {
  lightboxOpen.value = false
  document.body.style.overflow = ''
}

const navigateLightbox = (direction: number) => {
  const newIndex = currentLightboxIndex.value + direction
  if (newIndex >= 0 && newIndex < processedImages.value.length) {
    currentLightboxIndex.value = newIndex
  }
}

const downloadImage = async (image: GalleryImage) => {
  try {
    const response = await fetch(image.src)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = image.title || `image-${Date.now()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to download image:', error)
  }
}

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!lightboxOpen.value) return
  
  switch (event.key) {
    case 'ArrowLeft':
      navigateLightbox(-1)
      break
    case 'ArrowRight':
      navigateLightbox(1)
      break
    case 'Escape':
      closeLightbox()
      break
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

// Watch for image changes
watch(() => props.images, () => {
  currentPage.value = 1
  loadedImages.value.clear()
  errorImages.value.clear()
})
</script>

<style scoped>
.image-gallery {
  width: 100%;
}

.gallery-header {
  margin-bottom: 2rem;
}

.gallery-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Grid layout */
.gallery-grid.grid-layout {
  display: grid;
  align-items: start;
}

/* Masonry layout */
.gallery-grid.masonry-layout {
  column-fill: balance;
}

.gallery-item {
  position: relative;
  cursor: pointer;
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.gallery-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.gallery-item.featured {
  transform: scale(1.02);
}

/* Image overlay */
.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 1rem;
  transform: translateY(100%);
  transition: transform 0.3s ease-in-out;
}

.gallery-item:hover .image-overlay {
  transform: translateY(0);
}

.overlay-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.overlay-description {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Image actions */
.image-actions {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.gallery-item:hover .image-actions {
  opacity: 1;
}

.action-button {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.action-button:hover {
  background: white;
}

/* Load more */
.load-more-container {
  text-align: center;
  margin-top: 2rem;
}

.load-more-button {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;
  transition: background-color 0.2s ease-in-out;
}

.load-more-button:hover:not(:disabled) {
  background: #2563eb;
}

.load-more-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Lightbox */
.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.lightbox-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.lightbox-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  z-index: 1001;
}

.lightbox-nav:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-nav:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.lightbox-nav.prev {
  left: -4rem;
}

.lightbox-nav.next {
  right: -4rem;
}

.lightbox-close {
  position: absolute;
  top: -2rem;
  right: -2rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-info {
  color: white;
  text-align: center;
  max-width: 600px;
}

.lightbox-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.lightbox-description {
  margin-bottom: 1rem;
  opacity: 0.9;
}

.lightbox-meta {
  display: flex;
  justify-content: center;
  gap: 1rem;
  font-size: 0.875rem;
  opacity: 0.8;
}

/* Responsive design */
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr) !important;
    column-count: 2 !important;
  }
  
  .lightbox-nav.prev {
    left: 1rem;
  }
  
  .lightbox-nav.next {
    right: 1rem;
  }
  
  .lightbox-close {
    top: 1rem;
    right: 1rem;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr !important;
    column-count: 1 !important;
  }
  
  .gallery-item.featured {
    grid-column: span 1;
    grid-row: span 1;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .gallery-item,
  .image-overlay,
  .action-button,
  .load-more-button {
    transition: none;
  }
}
</style>