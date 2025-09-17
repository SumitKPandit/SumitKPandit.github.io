import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'
import { createHash } from 'crypto'

// Image format configurations
export interface ImageFormat {
  extension: string
  mimeType: string
  quality?: number
  progressive?: boolean
  compressionLevel?: number
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
    mimeType: 'image/png',
    compressionLevel: 9
  }
}

// Responsive image breakpoints
export interface ResponsiveBreakpoint {
  name: string
  width: number
  quality?: number
  suffix?: string
}

export const DEFAULT_BREAKPOINTS: ResponsiveBreakpoint[] = [
  { name: 'xs', width: 320, quality: 75, suffix: '-xs' },
  { name: 'sm', width: 640, quality: 80, suffix: '-sm' },
  { name: 'md', width: 768, quality: 85, suffix: '-md' },
  { name: 'lg', width: 1024, quality: 85, suffix: '-lg' },
  { name: 'xl', width: 1280, quality: 90, suffix: '-xl' },
  { name: '2xl', width: 1920, quality: 90, suffix: '-2xl' }
]

// Image metadata
export interface ImageMetadata {
  width: number
  height: number
  format: string
  size: number
  aspectRatio: number
  colorSpace?: string
  hasAlpha: boolean
  density?: number
}

// Optimization options
export interface OptimizationOptions {
  formats?: string[]
  quality?: number
  progressive?: boolean
  breakpoints?: ResponsiveBreakpoint[]
  outputDir?: string
  preserveOriginal?: boolean
  generateWebP?: boolean
  generateAVIF?: boolean
  blur?: {
    sigma: number
    outputPath?: string
  }
  watermark?: {
    path: string
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'
    opacity?: number
  }
}

// Optimization result
export interface OptimizationResult {
  original: {
    path: string
    size: number
    metadata: ImageMetadata
  }
  optimized: Array<{
    format: string
    path: string
    size: number
    width: number
    quality: number
    compressionRatio: number
  }>
  totalSizeReduction: number
  processingTime: number
}

export class ImageOptimizer {
  private cacheDir: string
  private tempDir: string

  constructor(cacheDir = './.image-cache', tempDir = './.temp') {
    this.cacheDir = cacheDir
    this.tempDir = tempDir
  }

  // === CORE OPTIMIZATION METHODS ===

  async optimizeImage(
    inputPath: string,
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult> {
    const startTime = Date.now()
    
    // Ensure directories exist
    await this.ensureDirectories()
    
    // Get original image metadata
    const originalMetadata = await this.getImageMetadata(inputPath)
    const originalSize = (await fs.stat(inputPath)).size
    
    const {
      formats = ['webp', 'jpeg'],
      quality = 85,
      progressive = true,
      breakpoints = DEFAULT_BREAKPOINTS,
      outputDir = path.dirname(inputPath),
      preserveOriginal = true,
      generateWebP = true,
      generateAVIF = false,
      blur,
      watermark
    } = options

    const optimized: OptimizationResult['optimized'] = []
    const baseName = path.parse(inputPath).name
    
    // Process each format
    for (const formatName of formats) {
      const format = IMAGE_FORMATS[formatName]
      if (!format) continue

      // Process each responsive breakpoint
      for (const breakpoint of breakpoints) {
        // Skip if original is smaller than breakpoint
        if (originalMetadata.width <= breakpoint.width) continue

        const outputFileName = `${baseName}${breakpoint.suffix || ''}.${format.extension}`
        const outputPath = path.join(outputDir, outputFileName)

        // Check cache first
        const cacheKey = this.generateCacheKey(inputPath, breakpoint, format, quality)
        const cachedPath = await this.getCachedImage(cacheKey)
        
        if (cachedPath && await this.fileExists(cachedPath)) {
          const cachedSize = (await fs.stat(cachedPath)).size
          optimized.push({
            format: formatName,
            path: cachedPath,
            size: cachedSize,
            width: breakpoint.width,
            quality: breakpoint.quality || quality,
            compressionRatio: ((originalSize - cachedSize) / originalSize) * 100
          })
          continue
        }

        // Process image
        let pipeline = sharp(inputPath)
          .resize(breakpoint.width, undefined, {
            withoutEnlargement: true,
            fit: 'inside'
          })

        // Apply blur if specified
        if (blur) {
          pipeline = pipeline.blur(blur.sigma)
        }

        // Apply watermark if specified
        if (watermark) {
          const watermarkBuffer = await this.prepareWatermark(
            watermark.path,
            watermark.position,
            watermark.opacity
          )
          pipeline = pipeline.composite([{
            input: watermarkBuffer,
            gravity: this.getGravityFromPosition(watermark.position)
          }])
        }

        // Apply format-specific settings
        if (formatName === 'webp') {
          pipeline = pipeline.webp({
            quality: breakpoint.quality || quality,
            progressive
          })
        } else if (formatName === 'avif') {
          pipeline = pipeline.avif({
            quality: breakpoint.quality || quality
          })
        } else if (formatName === 'jpeg') {
          pipeline = pipeline.jpeg({
            quality: breakpoint.quality || quality,
            progressive
          })
        } else if (formatName === 'png') {
          pipeline = pipeline.png({
            compressionLevel: format.compressionLevel || 9,
            progressive
          })
        }

        // Output the processed image
        await pipeline.toFile(outputPath)
        
        // Cache the result
        await this.cacheImage(cacheKey, outputPath)
        
        const optimizedSize = (await fs.stat(outputPath)).size
        optimized.push({
          format: formatName,
          path: outputPath,
          size: optimizedSize,
          width: breakpoint.width,
          quality: breakpoint.quality || quality,
          compressionRatio: ((originalSize - optimizedSize) / originalSize) * 100
        })
      }
    }

    // Generate additional formats if requested
    if (generateWebP && !formats.includes('webp')) {
      const webpResult = await this.generateFormat(inputPath, 'webp', outputDir, quality)
      optimized.push(...webpResult)
    }

    if (generateAVIF && !formats.includes('avif')) {
      const avifResult = await this.generateFormat(inputPath, 'avif', outputDir, quality)
      optimized.push(...avifResult)
    }

    const totalOriginalSize = originalSize * optimized.length
    const totalOptimizedSize = optimized.reduce((sum, opt) => sum + opt.size, 0)
    const totalSizeReduction = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100

    return {
      original: {
        path: inputPath,
        size: originalSize,
        metadata: originalMetadata
      },
      optimized,
      totalSizeReduction,
      processingTime: Date.now() - startTime
    }
  }

  // === RESPONSIVE IMAGE GENERATION ===

  async generateResponsiveImages(
    inputPath: string,
    breakpoints: ResponsiveBreakpoint[] = DEFAULT_BREAKPOINTS,
    formats: string[] = ['webp', 'jpeg']
  ): Promise<{
    srcSet: Record<string, string[]>
    sizes: string
    placeholder: string
  }> {
    const originalMetadata = await this.getImageMetadata(inputPath)
    const baseName = path.parse(inputPath).name
    const outputDir = path.dirname(inputPath)
    
    const srcSet: Record<string, string[]> = {}
    
    for (const format of formats) {
      srcSet[format] = []
    }

    // Generate images for each breakpoint and format
    for (const breakpoint of breakpoints) {
      if (originalMetadata.width <= breakpoint.width) continue

      for (const format of formats) {
        const imageFormat = IMAGE_FORMATS[format]
        if (!imageFormat) continue

        const outputFileName = `${baseName}${breakpoint.suffix || ''}.${imageFormat.extension}`
        const outputPath = path.join(outputDir, outputFileName)

        // Generate the image
        await sharp(inputPath)
          .resize(breakpoint.width, undefined, {
            withoutEnlargement: true,
            fit: 'inside'
          })
          .toFormat(imageFormat.extension as keyof sharp.FormatEnum, {
            quality: breakpoint.quality || imageFormat.quality
          })
          .toFile(outputPath)

        srcSet[format].push(`${outputFileName} ${breakpoint.width}w`)
      }
    }

    // Generate sizes attribute
    const sizes = this.generateSizesAttribute(breakpoints)
    
    // Generate low-quality placeholder
    const placeholder = await this.generatePlaceholder(inputPath)

    return { srcSet, sizes, placeholder }
  }

  // === PLACEHOLDER GENERATION ===

  async generatePlaceholder(
    inputPath: string,
    width = 20,
    quality = 20
  ): Promise<string> {
    const placeholderBuffer = await sharp(inputPath)
      .resize(width, undefined, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .blur(1)
      .jpeg({ quality })
      .toBuffer()

    return `data:image/jpeg;base64,${placeholderBuffer.toString('base64')}`
  }

  async generateBlurHash(inputPath: string): Promise<string> {
    // Note: This would require the 'blurhash' package
    // For now, return a simple placeholder
    const buffer = await sharp(inputPath)
      .resize(32, 32, { fit: 'inside' })
      .raw()
      .toBuffer()
    
    // Simple hash generation (would use blurhash in production)
    return createHash('md5').update(buffer).digest('hex').substring(0, 16)
  }

  // === METADATA AND ANALYSIS ===

  async getImageMetadata(inputPath: string): Promise<ImageMetadata> {
    const metadata = await sharp(inputPath).metadata()
    
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: (await fs.stat(inputPath)).size,
      aspectRatio: metadata.width && metadata.height ? metadata.width / metadata.height : 0,
      colorSpace: metadata.space,
      hasAlpha: metadata.hasAlpha || false,
      density: metadata.density
    }
  }

  async analyzeImageQuality(inputPath: string): Promise<{
    sharpness: number
    noise: number
    contrast: number
    brightness: number
    recommendations: string[]
  }> {
    const { data, info } = await sharp(inputPath)
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const pixels = new Uint8Array(data)
    const total = pixels.length
    
    // Calculate basic metrics
    let sum = 0
    let sumSquares = 0
    
    for (let i = 0; i < total; i++) {
      sum += pixels[i]
      sumSquares += pixels[i] * pixels[i]
    }
    
    const mean = sum / total
    const variance = (sumSquares / total) - (mean * mean)
    const brightness = mean / 255
    const contrast = Math.sqrt(variance) / 255
    
    // Estimate sharpness using gradient magnitude
    let gradientSum = 0
    for (let y = 1; y < info.height - 1; y++) {
      for (let x = 1; x < info.width - 1; x++) {
        const idx = y * info.width + x
        const gx = pixels[idx + 1] - pixels[idx - 1]
        const gy = pixels[idx + info.width] - pixels[idx - info.width]
        gradientSum += Math.sqrt(gx * gx + gy * gy)
      }
    }
    const sharpness = gradientSum / (info.width * info.height) / 255
    
    // Estimate noise (simplified)
    const noise = variance > 1000 ? Math.min(variance / 10000, 1) : 0
    
    // Generate recommendations
    const recommendations: string[] = []
    if (brightness < 0.2) recommendations.push('Image appears very dark - consider brightening')
    if (brightness > 0.8) recommendations.push('Image appears very bright - consider darkening')
    if (contrast < 0.1) recommendations.push('Low contrast detected - consider increasing contrast')
    if (sharpness < 0.1) recommendations.push('Image appears blurry - consider sharpening')
    if (noise > 0.3) recommendations.push('High noise detected - consider noise reduction')
    
    return {
      sharpness,
      noise,
      contrast,
      brightness,
      recommendations
    }
  }

  // === BATCH PROCESSING ===

  async batchOptimize(
    inputPaths: string[],
    options: OptimizationOptions = {},
    onProgress?: (current: number, total: number, currentFile: string) => void
  ): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = []
    
    for (let i = 0; i < inputPaths.length; i++) {
      const inputPath = inputPaths[i]
      
      if (onProgress) {
        onProgress(i + 1, inputPaths.length, inputPath)
      }
      
      try {
        const result = await this.optimizeImage(inputPath, options)
        results.push(result)
      } catch (error) {
        console.error(`Failed to optimize ${inputPath}:`, error)
        // Continue with other images
      }
    }
    
    return results
  }

  async processDirectory(
    inputDir: string,
    outputDir: string,
    options: OptimizationOptions = {}
  ): Promise<OptimizationResult[]> {
    const supportedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.gif']
    const files = await fs.readdir(inputDir)
    
    const imageFiles = files.filter(file => 
      supportedExtensions.includes(path.extname(file).toLowerCase())
    ).map(file => path.join(inputDir, file))
    
    return this.batchOptimize(imageFiles, { ...options, outputDir })
  }

  // === UTILITY METHODS ===

  private async generateFormat(
    inputPath: string,
    format: string,
    outputDir: string,
    quality: number
  ): Promise<OptimizationResult['optimized']> {
    const imageFormat = IMAGE_FORMATS[format]
    if (!imageFormat) return []

    const baseName = path.parse(inputPath).name
    const outputPath = path.join(outputDir, `${baseName}.${imageFormat.extension}`)
    
    let pipeline = sharp(inputPath)
    
    if (format === 'webp') {
      pipeline = pipeline.webp({ quality })
    } else if (format === 'avif') {
      pipeline = pipeline.avif({ quality })
    }
    
    await pipeline.toFile(outputPath)
    
    const originalSize = (await fs.stat(inputPath)).size
    const optimizedSize = (await fs.stat(outputPath)).size
    
    return [{
      format,
      path: outputPath,
      size: optimizedSize,
      width: (await this.getImageMetadata(inputPath)).width,
      quality,
      compressionRatio: ((originalSize - optimizedSize) / originalSize) * 100
    }]
  }

  private generateSizesAttribute(breakpoints: ResponsiveBreakpoint[]): string {
    return breakpoints
      .map(bp => `(max-width: ${bp.width}px) ${bp.width}px`)
      .join(', ') + ', 100vw'
  }

  private generateCacheKey(
    inputPath: string,
    breakpoint: ResponsiveBreakpoint,
    format: ImageFormat,
    quality: number
  ): string {
    const hash = createHash('md5')
      .update(inputPath)
      .update(JSON.stringify(breakpoint))
      .update(JSON.stringify(format))
      .update(quality.toString())
      .digest('hex')
    
    return hash.substring(0, 16)
  }

  private async getCachedImage(cacheKey: string): Promise<string | null> {
    const cachePath = path.join(this.cacheDir, `${cacheKey}.cache`)
    
    try {
      const cacheData = await fs.readFile(cachePath, 'utf8')
      const { filePath, timestamp } = JSON.parse(cacheData)
      
      // Check if cached file still exists and is recent (24 hours)
      if (await this.fileExists(filePath) && 
          Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        return filePath
      }
    } catch {
      // Cache miss or error
    }
    
    return null
  }

  private async cacheImage(cacheKey: string, filePath: string): Promise<void> {
    const cachePath = path.join(this.cacheDir, `${cacheKey}.cache`)
    const cacheData = {
      filePath,
      timestamp: Date.now()
    }
    
    await fs.writeFile(cachePath, JSON.stringify(cacheData))
  }

  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  private async ensureDirectories(): Promise<void> {
    await fs.mkdir(this.cacheDir, { recursive: true })
    await fs.mkdir(this.tempDir, { recursive: true })
  }

  private async prepareWatermark(
    watermarkPath: string,
    position: string,
    opacity = 0.5
  ): Promise<Buffer> {
    return sharp(watermarkPath)
      .modulate({ brightness: 1, saturation: 1, hue: 0 })
      .composite([{
        input: Buffer.from([255, 255, 255, Math.round(opacity * 255)]),
        raw: { width: 1, height: 1, channels: 4 },
        tile: true,
        blend: 'multiply'
      }])
      .png()
      .toBuffer()
  }

  private getGravityFromPosition(position: string): sharp.Gravity {
    switch (position) {
      case 'top-left': return 'northwest'
      case 'top-right': return 'northeast'
      case 'bottom-left': return 'southwest'
      case 'bottom-right': return 'southeast'
      case 'center': return 'center'
      default: return 'southeast'
    }
  }

  // === CLEANUP METHODS ===

  async clearCache(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir)
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.cacheDir, file)))
      )
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  async clearTempFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir)
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.tempDir, file)))
      )
    } catch (error) {
      console.error('Failed to clear temp files:', error)
    }
  }
}

// === HELPER FUNCTIONS ===

export function calculateCompressionRatio(originalSize: number, compressedSize: number): number {
  return ((originalSize - compressedSize) / originalSize) * 100
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

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
    <img src="${fallbackSrc}" alt="${alt}"${placeholder ? ` style="background-image: url(${placeholder})"` : ''} />
  </picture>`
}

export default ImageOptimizer