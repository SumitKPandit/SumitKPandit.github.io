// Image optimization composable for Nuxt 3
import { ref, computed, readonly } from 'vue'

// Types for image optimization
export interface ImageFormat {
  extension: string
  mimeType: string
  quality?: number
  progressive?: boolean
}

export interface ResponsiveBreakpoint {
  name: string
  width: number
  quality?: number
  suffix?: string
}

export interface OptimizedImage {
  src: string
  srcSet: string
  width: number
  height: number
  format: string
  size?: number
  placeholder?: string
}

export interface ImageOptimizationConfig {
  formats: string[]
  quality: number
  progressive: boolean
  breakpoints: ResponsiveBreakpoint[]
  generatePlaceholder: boolean
  lazyLoading: boolean
}

// Default configuration
export const DEFAULT_IMAGE_CONFIG: ImageOptimizationConfig = {
  formats: ['webp', 'jpeg'],
  quality: 85,
  progressive: true,
  breakpoints: [
    { name: 'xs', width: 320, quality: 75, suffix: '-xs' },
    { name: 'sm', width: 640, quality: 80, suffix: '-sm' },
    { name: 'md', width: 768, quality: 85, suffix: '-md' },
    { name: 'lg', width: 1024, quality: 85, suffix: '-lg' },
    { name: 'xl', width: 1280, quality: 90, suffix: '-xl' },
    { name: '2xl', width: 1920, quality: 90, suffix: '-2xl' }
  ],
  generatePlaceholder: true,
  lazyLoading: true
}

export const IMAGE_FORMATS: Record<string, ImageFormat> = {
  webp: {
    extension: 'webp',
    mimeType: 'image/webp',
    quality: 85,
    progressive: true
  },
  avif: {
    extension: 'avif',
    mimeType: 'image/avif',
    quality: 65,
    progressive: true
  },
  jpeg: {
    extension: 'jpg',
    mimeType: 'image/jpeg',
    quality: 85,
    progressive: true
  },
  png: {
    extension: 'png',
    mimeType: 'image/png'
  }
}

// Image optimization composable
export function useImageOptimization(config: Partial<ImageOptimizationConfig> = {}) {
  const finalConfig = { ...DEFAULT_IMAGE_CONFIG, ...config }
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Generate responsive image sources
  const generateResponsiveSources = (
    basePath: string,
    originalWidth: number,
    originalHeight: number
  ): { srcSet: string; sizes: string; sources: Array<{ type: string; srcset: string }> } => {
    const sources: Array<{ type: string; srcset: string }> = []
    
    finalConfig.formats.forEach(format => {
      const imageFormat = IMAGE_FORMATS[format]
      if (!imageFormat) return
      
      const srcSetItems: string[] = []
      
      finalConfig.breakpoints.forEach(breakpoint => {
        if (originalWidth <= breakpoint.width) return
        
        const fileName = basePath.replace(/\.[^/.]+$/, `${breakpoint.suffix || ''}.${imageFormat.extension}`)
        srcSetItems.push(`${fileName} ${breakpoint.width}w`)
      })
      
      if (srcSetItems.length > 0) {
        sources.push({
          type: imageFormat.mimeType,
          srcset: srcSetItems.join(', ')
        })
      }
    })
    
    // Generate fallback srcSet (usually JPEG)
    const fallbackFormat = finalConfig.formats.includes('jpeg') ? 'jpeg' : finalConfig.formats[0]
    const fallbackItems = finalConfig.breakpoints
      .filter(bp => originalWidth > bp.width)
      .map(bp => {
        const format = IMAGE_FORMATS[fallbackFormat]
        const fileName = basePath.replace(/\.[^/.]+$/, `${bp.suffix || ''}.${format.extension}`)
        return `${fileName} ${bp.width}w`
      })
    
    const srcSet = fallbackItems.join(', ')
    const sizes = generateSizesAttribute(finalConfig.breakpoints)
    
    return { srcSet, sizes, sources }
  }
  
  // Generate sizes attribute
  const generateSizesAttribute = (breakpoints: ResponsiveBreakpoint[]): string => {
    return breakpoints
      .map(bp => `(max-width: ${bp.width}px) ${bp.width}px`)
      .join(', ') + ', 100vw'
  }
  
  // Generate low-quality placeholder
  const generatePlaceholder = (basePath: string): string => {
    // In a real implementation, this would generate a tiny, blurred version
    // For now, return a data URL placeholder
    return basePath.replace(/\.[^/.]+$/, '-placeholder.jpg')
  }
  
  // Create optimized image object
  const createOptimizedImage = (
    src: string,
    width: number,
    height: number,
    alt: string = ''
  ): OptimizedImage => {
    const { srcSet, sizes, sources } = generateResponsiveSources(src, width, height)
    
    return {
      src,
      srcSet,
      width,
      height,
      format: 'responsive',
      placeholder: finalConfig.generatePlaceholder ? generatePlaceholder(src) : undefined
    }
  }
  
  // Calculate aspect ratio
  const calculateAspectRatio = (width: number, height: number): number => {
    return width / height
  }
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }
  
  // Get image metadata (mock implementation for client-side)
  const getImageMetadata = async (src: string): Promise<{
    width: number
    height: number
    format: string
    aspectRatio: number
  }> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          format: src.split('.').pop()?.toLowerCase() || 'unknown',
          aspectRatio: img.naturalWidth / img.naturalHeight
        })
      }
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`))
      }
      
      img.src = src
    })
  }
  
  // Lazy loading intersection observer
  const createLazyLoader = () => {
    if (typeof window === 'undefined') return null
    
    return new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            const dataSrc = img.dataset.src
            
            if (dataSrc) {
              img.src = dataSrc
              img.removeAttribute('data-src')
            }
            
            const dataSrcSet = img.dataset.srcset
            if (dataSrcSet) {
              img.srcset = dataSrcSet
              img.removeAttribute('data-srcset')
            }
            
            img.classList.remove('lazy')
            img.classList.add('loaded')
          }
        })
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    )
  }
  
  return {
    config: readonly(ref(finalConfig)),
    isLoading: readonly(isLoading),
    error: readonly(error),
    generateResponsiveSources,
    generateSizesAttribute,
    generatePlaceholder,
    createOptimizedImage,
    calculateAspectRatio,
    formatFileSize,
    getImageMetadata,
    createLazyLoader
  }
}

// Server-side image processing utilities (would integrate with Sharp)
export class ImageProcessor {
  private static instance: ImageProcessor
  
  private constructor() {}
  
  static getInstance(): ImageProcessor {
    if (!ImageProcessor.instance) {
      ImageProcessor.instance = new ImageProcessor()
    }
    return ImageProcessor.instance
  }
  
  // Mock implementation - in production would use Sharp
  async processImage(
    inputPath: string,
    outputPath: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: string
      progressive?: boolean
    }
  ): Promise<{
    outputPath: string
    size: number
    width: number
    height: number
  }> {
    // This would integrate with Sharp for actual image processing
    // For now, return mock data
    return {
      outputPath,
      size: 150000, // Mock file size
      width: options.width || 1920,
      height: options.height || 1080
    }
  }
  
  async generateResponsiveVersions(
    inputPath: string,
    outputDir: string,
    breakpoints: ResponsiveBreakpoint[],
    formats: string[] = ['webp', 'jpeg']
  ): Promise<Array<{
    path: string
    width: number
    format: string
    size: number
  }>> {
    const results: Array<{
      path: string
      width: number
      format: string
      size: number
    }> = []
    
    // Mock implementation - would process actual images with Sharp
    for (const breakpoint of breakpoints) {
      for (const format of formats) {
        const imageFormat = IMAGE_FORMATS[format]
        if (!imageFormat) continue
        
        const outputPath = `${outputDir}/${breakpoint.name}.${imageFormat.extension}`
        
        results.push({
          path: outputPath,
          width: breakpoint.width,
          format,
          size: Math.floor(Math.random() * 200000) + 50000 // Mock size
        })
      }
    }
    
    return results
  }
  
  async generatePlaceholder(
    inputPath: string,
    width = 20,
    quality = 20
  ): Promise<string> {
    // Mock implementation - would generate actual blur placeholder
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAUABQDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAABgAHA//EAC4QAAIBAwMCBAUFAAAAAAAAAAECAwAEEQUSITEGE0FRImFxgZEUMqGx8P/EABUBAQEAAAAAAAAAAAAAAAAAAAAB/8QAFREBAQAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A'
  }
}

// Nuxt plugin for image optimization  
export function createImageOptimizationPlugin() {
  const imageProcessor = ImageProcessor.getInstance()
  
  return {
    imageOptimization: useImageOptimization(),
    imageProcessor
  }
}

// Helper functions for templates
export function generatePictureElement(
  srcSet: Record<string, string[]>,
  alt: string,
  className?: string,
  placeholder?: string
): string {
  const sources = Object.entries(srcSet)
    .map(([format, sources]) => {
      const mimeType = IMAGE_FORMATS[format]?.mimeType || `image/${format}`
      return `<source type="${mimeType}" srcset="${sources.join(', ')}" />`
    })
    .join('\n    ')
  
  const fallbackSrc = srcSet.jpeg?.[0]?.split(' ')[0] || srcSet.webp?.[0]?.split(' ')[0] || ''
  
  return `<picture${className ? ` class="${className}"` : ''}>
    ${sources}
    <img src="${fallbackSrc}" alt="${alt}"${placeholder ? ` style="background-image: url(${placeholder})"` : ''} loading="lazy" />
  </picture>`
}

export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  return ((originalSize - compressedSize) / originalSize) * 100
}