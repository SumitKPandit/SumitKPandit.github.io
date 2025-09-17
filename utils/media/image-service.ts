// Advanced image service for handling optimization and responsive images
export interface ImageMetadata {
  width: number
  height: number
  format: string
  size: number
  aspectRatio: number
  colors?: string[]
  dominantColor?: string
}

export interface OptimizationConfig {
  quality: number
  format: 'webp' | 'avif' | 'jpeg' | 'png'
  progressive: boolean
  width?: number
  height?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  background?: string
}

export interface ResponsiveImageSet {
  sources: Array<{
    srcset: string
    type: string
    sizes?: string
  }>
  fallback: {
    src: string
    width: number
    height: number
  }
  placeholder?: string
  aspectRatio: number
}

export class ImageService {
  private cache = new Map<string, ImageMetadata>()
  private processedImages = new Map<string, ResponsiveImageSet>()

  // === METADATA EXTRACTION ===

  async getImageMetadata(src: string): Promise<ImageMetadata> {
    if (this.cache.has(src)) {
      return this.cache.get(src)!
    }

    const metadata = await this.extractMetadata(src)
    this.cache.set(src, metadata)
    return metadata
  }

  private async extractMetadata(src: string): Promise<ImageMetadata> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          
          // Extract dominant colors (simplified implementation)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const colors = this.extractColors(imageData.data)
          
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight,
            format: this.getFormatFromSrc(src),
            size: 0, // Would need server-side info
            aspectRatio: img.naturalWidth / img.naturalHeight,
            colors: colors.slice(0, 5),
            dominantColor: colors[0]
          })
        } else {
          resolve({
            width: img.naturalWidth,
            height: img.naturalHeight,
            format: this.getFormatFromSrc(src),
            size: 0,
            aspectRatio: img.naturalWidth / img.naturalHeight
          })
        }
      }
      
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
      img.crossOrigin = 'anonymous'
      img.src = src
    })
  }

  private extractColors(data: Uint8ClampedArray): string[] {
    const colorCount = new Map<string, number>()
    
    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const alpha = data[i + 3]
      
      if (alpha < 128) continue // Skip transparent pixels
      
      // Quantize colors to reduce variations
      const qr = Math.round(r / 32) * 32
      const qg = Math.round(g / 32) * 32
      const qb = Math.round(b / 32) * 32
      
      const color = `rgb(${qr}, ${qg}, ${qb})`
      colorCount.set(color, (colorCount.get(color) || 0) + 1)
    }
    
    return Array.from(colorCount.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([color]) => color)
  }

  private getFormatFromSrc(src: string): string {
    const extension = src.split('.').pop()?.toLowerCase()
    return extension || 'unknown'
  }

  // === RESPONSIVE IMAGE GENERATION ===

  generateResponsiveSet(
    src: string,
    metadata: ImageMetadata,
    breakpoints: number[] = [320, 640, 768, 1024, 1280, 1920]
  ): ResponsiveImageSet {
    const cacheKey = `${src}-${breakpoints.join(',')}`
    
    if (this.processedImages.has(cacheKey)) {
      return this.processedImages.get(cacheKey)!
    }

    const sources = this.generateSources(src, metadata, breakpoints)
    const fallback = this.generateFallback(src, metadata)
    const placeholder = this.generatePlaceholder(src, metadata)

    const responsiveSet: ResponsiveImageSet = {
      sources,
      fallback,
      placeholder,
      aspectRatio: metadata.aspectRatio
    }

    this.processedImages.set(cacheKey, responsiveSet)
    return responsiveSet
  }

  private generateSources(
    src: string,
    metadata: ImageMetadata,
    breakpoints: number[]
  ): ResponsiveImageSet['sources'] {
    const formats = ['avif', 'webp', 'jpeg']
    const sources: ResponsiveImageSet['sources'] = []

    formats.forEach(format => {
      const srcsetItems: string[] = []

      breakpoints.forEach(width => {
        if (width <= metadata.width) {
          const optimizedSrc = this.generateOptimizedSrc(src, { 
            width, 
            format: format as OptimizationConfig['format'] 
          })
          srcsetItems.push(`${optimizedSrc} ${width}w`)
        }
      })

      if (srcsetItems.length > 0) {
        sources.push({
          srcset: srcsetItems.join(', '),
          type: `image/${format}`,
          sizes: this.generateSizes(breakpoints)
        })
      }
    })

    return sources
  }

  private generateFallback(src: string, metadata: ImageMetadata): ResponsiveImageSet['fallback'] {
    return {
      src: this.generateOptimizedSrc(src, { format: 'jpeg', quality: 85 }),
      width: metadata.width,
      height: metadata.height
    }
  }

  private generatePlaceholder(src: string, metadata: ImageMetadata): string {
    // Generate a tiny, blurred version
    const tinyWidth = 20
    const tinyHeight = Math.round(tinyWidth / metadata.aspectRatio)
    
    // In a real implementation, this would be a server-generated tiny image
    // For now, create a simple colored rectangle based on dominant color
    const color = metadata.dominantColor || '#e5e7eb'
    
    const svg = `
      <svg width="${tinyWidth}" height="${tinyHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color}" opacity="0.3"/>
      </svg>
    `
    
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  private generateOptimizedSrc(src: string, config: Partial<OptimizationConfig>): string {
    // In a real implementation, this would generate URLs for optimized images
    // For now, return a mock URL with optimization parameters
    const baseName = src.replace(/\.[^/.]+$/, '')
    const params = new URLSearchParams()
    
    if (config.width) params.set('w', config.width.toString())
    if (config.height) params.set('h', config.height.toString())
    if (config.quality) params.set('q', config.quality.toString())
    if (config.format) params.set('f', config.format)
    
    return `${baseName}.${config.format || 'jpg'}?${params.toString()}`
  }

  private generateSizes(breakpoints: number[]): string {
    return breakpoints
      .map((bp, index) => {
        if (index === breakpoints.length - 1) {
          return `${bp}px`
        }
        return `(max-width: ${bp}px) ${bp}px`
      })
      .join(', ')
  }

  // === LAZY LOADING ===

  createLazyLoader(options: {
    rootMargin?: string
    threshold?: number
    loadingClass?: string
    loadedClass?: string
    errorClass?: string
  } = {}): IntersectionObserver | null {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return null
    }

    const {
      rootMargin = '50px 0px',
      threshold = 0.01,
      loadingClass = 'loading',
      loadedClass = 'loaded',
      errorClass = 'error'
    } = options

    return new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement
            this.loadImage(element, { loadingClass, loadedClass, errorClass })
          }
        })
      },
      { rootMargin, threshold }
    )
  }

  private async loadImage(
    element: HTMLElement,
    classes: { loadingClass: string; loadedClass: string; errorClass: string }
  ): Promise<void> {
    const img = element.tagName === 'IMG' ? element as HTMLImageElement 
             : element.querySelector('img') as HTMLImageElement

    if (!img) return

    img.classList.add(classes.loadingClass)

    try {
      // Load the actual image
      const dataSrc = img.dataset.src
      const dataSrcset = img.dataset.srcset

      if (dataSrc) {
        await this.preloadImage(dataSrc)
        img.src = dataSrc
        img.removeAttribute('data-src')
      }

      if (dataSrcset) {
        img.srcset = dataSrcset
        img.removeAttribute('data-srcset')
      }

      img.classList.remove(classes.loadingClass)
      img.classList.add(classes.loadedClass)

    } catch (error) {
      img.classList.remove(classes.loadingClass)
      img.classList.add(classes.errorClass)
      console.error('Failed to load image:', error)
    }
  }

  private preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = reject
      img.src = src
    })
  }

  // === PERFORMANCE MONITORING ===

  measureImagePerformance(): {
    totalImages: number
    loadedImages: number
    failedImages: number
    averageLoadTime: number
    cacheHitRatio: number
  } {
    const images = document.querySelectorAll('img')
    let loaded = 0
    let failed = 0
    let totalLoadTime = 0

    images.forEach(img => {
      if (img.complete) {
        if (img.naturalWidth > 0) {
          loaded++
        } else {
          failed++
        }
      }
    })

    return {
      totalImages: images.length,
      loadedImages: loaded,
      failedImages: failed,
      averageLoadTime: loaded > 0 ? totalLoadTime / loaded : 0,
      cacheHitRatio: this.cache.size > 0 ? this.processedImages.size / this.cache.size : 0
    }
  }

  // === UTILITY METHODS ===

  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  calculateAspectRatio(width: number, height: number): string {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
    const divisor = gcd(width, height)
    return `${width / divisor}:${height / divisor}`
  }

  // === CLEANUP ===

  clearCache(): void {
    this.cache.clear()
    this.processedImages.clear()
  }

  preloadCriticalImages(srcs: string[]): Promise<void[]> {
    return Promise.all(srcs.map(src => this.preloadImage(src)))
  }
}

// Singleton instance
export const imageService = new ImageService()

// === UTILITY FUNCTIONS ===

export function generatePictureHTML(
  responsiveSet: ResponsiveImageSet,
  alt: string,
  className?: string,
  loading: 'lazy' | 'eager' = 'lazy'
): string {
  const sources = responsiveSet.sources
    .map(source => 
      `<source type="${source.type}" srcset="${source.srcset}"${source.sizes ? ` sizes="${source.sizes}"` : ''} />`
    )
    .join('\n    ')

  const style = responsiveSet.placeholder 
    ? ` style="background-image: url('${responsiveSet.placeholder}'); background-size: cover; background-position: center;"`
    : ''

  return `<picture${className ? ` class="${className}"` : ''}>
    ${sources}
    <img 
      src="${responsiveSet.fallback.src}" 
      alt="${alt}"
      width="${responsiveSet.fallback.width}"
      height="${responsiveSet.fallback.height}"
      loading="${loading}"${style}
    />
  </picture>`
}

export function createImageObserver(callback: (entries: IntersectionObserverEntry[]) => void) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px',
    threshold: 0.01
  })
}

export default imageService