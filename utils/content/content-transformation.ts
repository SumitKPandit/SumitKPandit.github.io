import type { BlogArticle } from '../validation/content-schemas'

// Reading time calculation utilities
export class ReadingTimeCalculator {
  // Average reading speeds (words per minute)
  private static readonly READING_SPEEDS = {
    slow: 150,
    average: 200,
    fast: 250
  }
  
  // Calculate reading time for text content
  static calculateReadingTime(
    text: string,
    options: {
      speed?: 'slow' | 'average' | 'fast'
      includeCodeBlocks?: boolean
      includeTables?: boolean
      codeReadingFactor?: number // How much slower code is to read (default: 0.5)
    } = {}
  ): {
    minutes: number
    words: number
    characters: number
    readingSpeed: number
  } {
    const {
      speed = 'average',
      includeCodeBlocks = true,
      includeTables = true,
      codeReadingFactor = 0.5
    } = options
    
    let processedText = text
    let codeWords = 0
    
    // Extract and count code blocks separately if needed
    if (includeCodeBlocks) {
      const codeBlocks = text.match(/```[\s\S]*?```/g) || []
      const inlineCode = text.match(/`[^`]+`/g) || []
      
      // Count words in code blocks with different factor
      codeWords = [...codeBlocks, ...inlineCode]
        .join(' ')
        .split(/\s+/)
        .filter(word => word.length > 0).length * codeReadingFactor
      
      // Remove code blocks from main text count
      processedText = processedText
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '')
    }
    
    // Handle tables
    if (!includeTables) {
      processedText = processedText.replace(/\|[\s\S]*?\|/g, '')
    }
    
    // Remove markdown syntax that doesn't contribute to reading
    processedText = processedText
      .replace(/#+\s/g, '') // Headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1') // Italic
      .replace(/~~(.*?)~~/g, '$1') // Strikethrough
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links (keep link text)
      .replace(/!\[.*?\]\(.*?\)/g, '') // Images
      .replace(/>\s/g, '') // Blockquotes
      .replace(/^\s*[-*+]\s/gm, '') // List markers
      .replace(/^\s*\d+\.\s/gm, '') // Numbered lists
      .replace(/\n+/g, ' ') // Multiple newlines
      .trim()
    
    // Count words
    const regularWords = processedText
      .split(/\s+/)
      .filter(word => word.length > 0).length
    
    const totalWords = regularWords + codeWords
    const characters = text.length
    const readingSpeed = this.READING_SPEEDS[speed]
    const minutes = Math.max(1, Math.ceil(totalWords / readingSpeed))
    
    return {
      minutes,
      words: totalWords,
      characters,
      readingSpeed
    }
  }
  
  // Format reading time for display
  static formatReadingTime(minutes: number): string {
    if (minutes < 1) return 'Less than a minute'
    if (minutes === 1) return '1 minute read'
    if (minutes < 60) return `${minutes} minutes read`
    
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    
    if (hours === 1 && remainingMinutes === 0) return '1 hour read'
    if (remainingMinutes === 0) return `${hours} hours read`
    if (hours === 1) return `1 hour ${remainingMinutes} minutes read`
    
    return `${hours} hours ${remainingMinutes} minutes read`
  }
}

// Excerpt generation utilities
export class ExcerptGenerator {
  private static readonly SENTENCE_ENDINGS = /[.!?]+\s/g
  private static readonly WORD_BOUNDARY = /\b/
  
  // Generate excerpt from markdown content
  static generateExcerpt(
    content: string,
    options: {
      maxLength?: number
      maxSentences?: number
      preserveFormatting?: boolean
      stripCodeBlocks?: boolean
      smartTruncation?: boolean
    } = {}
  ): string {
    const {
      maxLength = 160,
      maxSentences = 2,
      preserveFormatting = false,
      stripCodeBlocks = true,
      smartTruncation = true
    } = options
    
    let processedContent = content.trim()
    
    // Strip front matter if present
    processedContent = processedContent.replace(/^---[\s\S]*?---\n?/m, '')
    
    // Remove code blocks if requested
    if (stripCodeBlocks) {
      processedContent = processedContent
        .replace(/```[\s\S]*?```/g, '')
        .replace(/`[^`]+`/g, '')
    }
    
    // Remove images and complex markdown if not preserving formatting
    if (!preserveFormatting) {
      processedContent = processedContent
        .replace(/!\[.*?\]\(.*?\)/g, '') // Images
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links (keep text)
        .replace(/#+\s/g, '') // Headers
        .replace(/>\s/g, '') // Blockquotes
        .replace(/^\s*[-*+]\s/gm, '') // List markers
        .replace(/^\s*\d+\.\s/gm, '') // Numbered lists
        .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
        .replace(/\*(.*?)\*/g, '$1') // Italic
        .replace(/~~(.*?)~~/g, '$1') // Strikethrough
        .replace(/\n+/g, ' ') // Multiple newlines
        .trim()
    }
    
    // Split into sentences
    const sentences = processedContent
      .split(this.SENTENCE_ENDINGS)
      .map(s => s.trim())
      .filter(s => s.length > 0)
    
    let excerpt = ''
    let sentenceCount = 0
    
    // Build excerpt sentence by sentence
    for (const sentence of sentences) {
      const potentialExcerpt = excerpt + (excerpt ? ' ' : '') + sentence + '.'
      
      if (potentialExcerpt.length <= maxLength && sentenceCount < maxSentences) {
        excerpt = potentialExcerpt
        sentenceCount++
      } else {
        break
      }
    }
    
    // If no complete sentences fit, truncate smartly
    if (!excerpt && sentences.length > 0) {
      const firstSentence = sentences[0]
      
      if (smartTruncation && firstSentence.length > maxLength) {
        // Find last complete word that fits
        const truncated = firstSentence.substring(0, maxLength)
        const lastSpace = truncated.lastIndexOf(' ')
        
        if (lastSpace > maxLength * 0.8) { // If we can keep 80% of desired length
          excerpt = truncated.substring(0, lastSpace) + '...'
        } else {
          excerpt = truncated + '...'
        }
      } else {
        excerpt = firstSentence.substring(0, maxLength) + '...'
      }
    }
    
    return excerpt.trim()
  }
  
  // Generate excerpt from article metadata and content
  static generateArticleExcerpt(article: BlogArticle, content: string): string {
    // Use existing excerpt if available
    if (article.excerpt) {
      return article.excerpt
    }
    
    // Generate from content
    return this.generateExcerpt(content, {
      maxLength: 200,
      maxSentences: 3,
      smartTruncation: true
    })
  }
}

// Markdown processing utilities
export class MarkdownProcessor {
  // Extract headings from markdown
  static extractHeadings(content: string): Array<{
    level: number
    text: string
    slug: string
    line: number
  }> {
    const headings: Array<{
      level: number
      text: string
      slug: string
      line: number
    }> = []
    
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
      if (headingMatch) {
        const level = headingMatch[1].length
        const text = headingMatch[2].trim()
        const slug = this.createSlug(text)
        
        headings.push({
          level,
          text,
          slug,
          line: index + 1
        })
      }
    })
    
    return headings
  }
  
  // Generate table of contents
  static generateTableOfContents(
    content: string,
    options: {
      maxDepth?: number
      minHeadings?: number
      includeLevel1?: boolean
    } = {}
  ): {
    toc: Array<{
      level: number
      text: string
      slug: string
      children?: any[]
    }>
    hasContent: boolean
  } {
    const {
      maxDepth = 6,
      minHeadings = 2,
      includeLevel1 = false
    } = options
    
    const headings = this.extractHeadings(content)
      .filter(h => h.level <= maxDepth)
      .filter(h => includeLevel1 || h.level > 1)
    
    if (headings.length < minHeadings) {
      return { toc: [], hasContent: false }
    }
    
    // Build hierarchical structure
    const toc: any[] = []
    const stack: any[] = []
    
    headings.forEach(heading => {
      const tocItem = {
        level: heading.level,
        text: heading.text,
        slug: heading.slug,
        children: []
      }
      
      // Find correct parent level
      while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
        stack.pop()
      }
      
      if (stack.length === 0) {
        toc.push(tocItem)
      } else {
        stack[stack.length - 1].children.push(tocItem)
      }
      
      stack.push(tocItem)
    })
    
    return { toc, hasContent: true }
  }
  
  // Extract images from markdown
  static extractImages(content: string): Array<{
    alt: string
    src: string
    title?: string
    line: number
  }> {
    const images: Array<{
      alt: string
      src: string
      title?: string
      line: number
    }> = []
    
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      const imageMatches = line.matchAll(/!\[([^\]]*)\]\(([^)]+)(?:\s+"([^"]*)")?\)/g)
      
      for (const match of imageMatches) {
        images.push({
          alt: match[1] || '',
          src: match[2],
          title: match[3],
          line: index + 1
        })
      }
    })
    
    return images
  }
  
  // Extract links from markdown
  static extractLinks(content: string): Array<{
    text: string
    href: string
    title?: string
    isExternal: boolean
    line: number
  }> {
    const links: Array<{
      text: string
      href: string
      title?: string
      isExternal: boolean
      line: number
    }> = []
    
    const lines = content.split('\n')
    
    lines.forEach((line, index) => {
      const linkMatches = line.matchAll(/\[([^\]]+)\]\(([^)]+)(?:\s+"([^"]*)")?\)/g)
      
      for (const match of linkMatches) {
        const href = match[2]
        const isExternal = href.startsWith('http') || href.startsWith('//')
        
        links.push({
          text: match[1],
          href,
          title: match[3],
          isExternal,
          line: index + 1
        })
      }
    })
    
    return links
  }
  
  // Create URL-friendly slug from text
  private static createSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
  }
  
  // Validate markdown content
  static validateMarkdown(content: string): {
    valid: boolean
    errors: string[]
    warnings: string[]
    stats: {
      headings: number
      images: number
      links: number
      codeBlocks: number
      words: number
    }
  } {
    const errors: string[] = []
    const warnings: string[] = []
    
    // Extract various elements for validation
    const headings = this.extractHeadings(content)
    const images = this.extractImages(content)
    const links = this.extractLinks(content)
    
    // Count code blocks
    const codeBlocks = (content.match(/```/g) || []).length / 2
    
    // Count words
    const words = content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/)
      .filter(word => word.length > 0).length
    
    // Validation checks
    
    // Check for unmatched code blocks
    const codeBlockMatches = content.match(/```/g) || []
    if (codeBlockMatches.length % 2 !== 0) {
      errors.push('Unmatched code block delimiters (```)')
    }
    
    // Check for images without alt text
    const imagesWithoutAlt = images.filter(img => !img.alt.trim())
    if (imagesWithoutAlt.length > 0) {
      warnings.push(`${imagesWithoutAlt.length} images missing alt text`)
    }
    
    // Check for broken internal links (basic check)
    const suspiciousLinks = links.filter(link => 
      !link.isExternal && 
      !link.href.startsWith('#') && 
      !link.href.startsWith('/')
    )
    if (suspiciousLinks.length > 0) {
      warnings.push(`${suspiciousLinks.length} potentially malformed internal links`)
    }
    
    // Check heading hierarchy
    let previousLevel = 0
    let hierarchyIssues = 0
    
    headings.forEach(heading => {
      if (previousLevel > 0 && heading.level > previousLevel + 1) {
        hierarchyIssues++
      }
      previousLevel = heading.level
    })
    
    if (hierarchyIssues > 0) {
      warnings.push(`${hierarchyIssues} heading hierarchy issues (skipped levels)`)
    }
    
    // Check for very short content
    if (words < 100) {
      warnings.push('Content is very short (less than 100 words)')
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      stats: {
        headings: headings.length,
        images: images.length,
        links: links.length,
        codeBlocks,
        words
      }
    }
  }
}

// Text analysis utilities
export class TextAnalyzer {
  // Analyze text complexity
  static analyzeComplexity(text: string): {
    fleschReadingEase: number
    fleschKincaidGrade: number
    averageWordsPerSentence: number
    averageSyllablesPerWord: number
    readabilityLevel: 'very easy' | 'easy' | 'fairly easy' | 'standard' | 'fairly difficult' | 'difficult' | 'very difficult'
  } {
    // Clean text for analysis
    const cleanText = text
      .replace(/[^\w\s.!?]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    
    // Count sentences
    const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const sentenceCount = sentences.length
    
    // Count words
    const words = cleanText.split(/\s+/).filter(w => w.length > 0)
    const wordCount = words.length
    
    // Count syllables (approximation)
    const syllableCount = words.reduce((total, word) => {
      return total + this.countSyllables(word)
    }, 0)
    
    // Calculate metrics
    const averageWordsPerSentence = wordCount / sentenceCount
    const averageSyllablesPerWord = syllableCount / wordCount
    
    // Flesch Reading Ease Score
    const fleschReadingEase = 206.835 - (1.015 * averageWordsPerSentence) - (84.6 * averageSyllablesPerWord)
    
    // Flesch-Kincaid Grade Level
    const fleschKincaidGrade = (0.39 * averageWordsPerSentence) + (11.8 * averageSyllablesPerWord) - 15.59
    
    // Determine readability level
    let readabilityLevel: 'very easy' | 'easy' | 'fairly easy' | 'standard' | 'fairly difficult' | 'difficult' | 'very difficult'
    if (fleschReadingEase >= 90) readabilityLevel = 'very easy'
    else if (fleschReadingEase >= 80) readabilityLevel = 'easy'
    else if (fleschReadingEase >= 70) readabilityLevel = 'fairly easy'
    else if (fleschReadingEase >= 60) readabilityLevel = 'standard'
    else if (fleschReadingEase >= 50) readabilityLevel = 'fairly difficult'
    else if (fleschReadingEase >= 30) readabilityLevel = 'difficult'
    else readabilityLevel = 'very difficult'
    
    return {
      fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
      fleschKincaidGrade: Math.round(fleschKincaidGrade * 10) / 10,
      averageWordsPerSentence: Math.round(averageWordsPerSentence * 10) / 10,
      averageSyllablesPerWord: Math.round(averageSyllablesPerWord * 10) / 10,
      readabilityLevel
    }
  }
  
  // Count syllables in a word (approximation)
  private static countSyllables(word: string): number {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    
    // Remove common endings that don't add syllables
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    word = word.replace(/^y/, '')
    
    // Count vowel groups
    const vowelGroups = word.match(/[aeiouy]{1,2}/g)
    const syllables = vowelGroups ? vowelGroups.length : 1
    
    return Math.max(1, syllables)
  }
  
  // Extract keywords from text
  static extractKeywords(
    text: string,
    options: {
      minLength?: number
      maxKeywords?: number
      excludeCommon?: boolean
    } = {}
  ): Array<{ word: string; frequency: number; score: number }> {
    const {
      minLength = 3,
      maxKeywords = 10,
      excludeCommon = true
    } = options
    
    // Common words to exclude
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'did',
      'will', 'would', 'could', 'should', 'can', 'may', 'might', 'this', 'that', 'these',
      'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us',
      'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'about', 'above',
      'below', 'up', 'down', 'out', 'off', 'over', 'under', 'again', 'further', 'then',
      'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both',
      'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
      'only', 'own', 'same', 'so', 'than', 'too', 'very', 'can', 'just', 'now'
    ])
    
    // Clean and tokenize text
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length >= minLength && 
        (!excludeCommon || !commonWords.has(word))
      )
    
    // Count word frequencies
    const wordFreq = new Map<string, number>()
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
    })
    
    // Calculate scores (frequency + length bonus)
    const keywords = Array.from(wordFreq.entries())
      .map(([word, frequency]) => ({
        word,
        frequency,
        score: frequency + (word.length > 6 ? 2 : 0) // Bonus for longer words
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, maxKeywords)
    
    return keywords
  }
}

// Content transformation pipeline
export class ContentTransformer {
  // Process blog article content
  static processArticleContent(
    content: string,
    article: BlogArticle
  ): {
    processedContent: string
    excerpt: string
    readingTime: ReturnType<typeof ReadingTimeCalculator.calculateReadingTime>
    toc: ReturnType<typeof MarkdownProcessor.generateTableOfContents>
    validation: ReturnType<typeof MarkdownProcessor.validateMarkdown>
    analysis: ReturnType<typeof TextAnalyzer.analyzeComplexity>
    keywords: ReturnType<typeof TextAnalyzer.extractKeywords>
  } {
    // Generate excerpt
    const excerpt = ExcerptGenerator.generateArticleExcerpt(article, content)
    
    // Calculate reading time
    const readingTime = ReadingTimeCalculator.calculateReadingTime(content)
    
    // Generate table of contents
    const toc = MarkdownProcessor.generateTableOfContents(content)
    
    // Validate markdown
    const validation = MarkdownProcessor.validateMarkdown(content)
    
    // Analyze text complexity
    const analysis = TextAnalyzer.analyzeComplexity(content)
    
    // Extract keywords
    const keywords = TextAnalyzer.extractKeywords(content)
    
    // Process content (placeholder for actual markdown rendering)
    const processedContent = content // This would be processed by a markdown renderer
    
    return {
      processedContent,
      excerpt,
      readingTime,
      toc,
      validation,
      analysis,
      keywords
    }
  }
  
  // Batch process multiple articles
  static batchProcessArticles(
    articles: Array<{ article: BlogArticle; content: string }>
  ): Array<{
    article: BlogArticle
    processed: ReturnType<typeof ContentTransformer.processArticleContent>
  }> {
    return articles.map(({ article, content }) => ({
      article,
      processed: this.processArticleContent(content, article)
    }))
  }
}