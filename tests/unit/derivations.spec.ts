import { describe, it, expect, beforeEach } from 'vitest'
import {
  ReadingTimeCalculator,
  ExcerptGenerator,
  MarkdownProcessor,
  TextAnalyzer,
  ContentTransformer
} from '../../utils/content/content-transformation'
import type { BlogArticle } from '../../utils/validation/content-schemas'

describe('ReadingTimeCalculator', () => {
  describe('calculateReadingTime', () => {
    it('should calculate basic reading time correctly', () => {
      const text = 'This is a simple test text with exactly twenty words in it for testing purposes.'
      const result = ReadingTimeCalculator.calculateReadingTime(text)
      
      expect(result.words).toBe(15) // Actual word count
      expect(result.minutes).toBe(1) // Minimum 1 minute
      expect(result.readingSpeed).toBe(200) // Default average speed
      expect(result.characters).toBe(text.length)
    })

    it('should handle different reading speeds', () => {
      const text = 'Lorem ipsum '.repeat(100) // ~200 words
      
      const slow = ReadingTimeCalculator.calculateReadingTime(text, { speed: 'slow' })
      const average = ReadingTimeCalculator.calculateReadingTime(text, { speed: 'average' })
      const fast = ReadingTimeCalculator.calculateReadingTime(text, { speed: 'fast' })
      
      expect(slow.readingSpeed).toBe(150)
      expect(average.readingSpeed).toBe(200)
      expect(fast.readingSpeed).toBe(250)
      expect(slow.minutes).toBeGreaterThan(average.minutes)
      expect(average.minutes).toBeGreaterThan(fast.minutes)
    })

    it('should handle code blocks with reduced reading factor', () => {
      const textWithCode = `
        Regular text here.
        \`\`\`javascript
        function test() {
          console.log('Hello world');
          return true;
        }
        \`\`\`
        More regular text.
      `
      
      const withCode = ReadingTimeCalculator.calculateReadingTime(textWithCode, { includeCodeBlocks: true })
      const withoutCode = ReadingTimeCalculator.calculateReadingTime(textWithCode, { includeCodeBlocks: false })
      
      expect(withCode.words).toBeGreaterThan(withoutCode.words)
    })

    it('should strip markdown formatting', () => {
      const markdownText = `
        # Heading
        **Bold text** and *italic text*.
        [Link text](http://example.com)
        ![Alt text](image.jpg)
        > Blockquote text
        - List item
        1. Numbered item
      `
      
      const result = ReadingTimeCalculator.calculateReadingTime(markdownText)
      expect(result.words).toBeGreaterThan(0)
    })

    it('should return minimum 1 minute for very short text', () => {
      const shortText = 'Hi'
      const result = ReadingTimeCalculator.calculateReadingTime(shortText)
      expect(result.minutes).toBe(1)
    })
  })

  describe('formatReadingTime', () => {
    it('should format reading times correctly', () => {
      expect(ReadingTimeCalculator.formatReadingTime(0)).toBe('Less than a minute')
      expect(ReadingTimeCalculator.formatReadingTime(1)).toBe('1 minute read')
      expect(ReadingTimeCalculator.formatReadingTime(5)).toBe('5 minutes read')
      expect(ReadingTimeCalculator.formatReadingTime(60)).toBe('1 hour read')
      expect(ReadingTimeCalculator.formatReadingTime(65)).toBe('1 hour 5 minutes read')
      expect(ReadingTimeCalculator.formatReadingTime(120)).toBe('2 hours read')
      expect(ReadingTimeCalculator.formatReadingTime(125)).toBe('2 hours 5 minutes read')
    })
  })
})

describe('ExcerptGenerator', () => {
  describe('generateExcerpt', () => {
    it('should generate excerpt from simple text', () => {
      const text = 'This is the first sentence. This is the second sentence. This is the third sentence.'
      const excerpt = ExcerptGenerator.generateExcerpt(text, { maxSentences: 2 })
      
      expect(excerpt).toBe('This is the first sentence. This is the second sentence.')
    })

    it('should respect max length', () => {
      const longText = 'This is a very long sentence that should be truncated when it exceeds the maximum length specified.'
      const excerpt = ExcerptGenerator.generateExcerpt(longText, { maxLength: 50 })
      
      expect(excerpt.length).toBeLessThanOrEqual(53) // Including ellipsis
      expect(excerpt).toContain('...')
    })

    it('should strip code blocks when requested', () => {
      const textWithCode = `
        This is regular text.
        \`\`\`javascript
        console.log('code');
        \`\`\`
        More text here.
      `
      
      const excerpt = ExcerptGenerator.generateExcerpt(textWithCode, { stripCodeBlocks: true })
      expect(excerpt).not.toContain('console.log')
      expect(excerpt).toContain('regular text')
    })

    it('should remove front matter', () => {
      const textWithFrontMatter = `---
title: Test
date: 2023-01-01
---
This is the actual content.`
      
      const excerpt = ExcerptGenerator.generateExcerpt(textWithFrontMatter)
      expect(excerpt).toBe('This is the actual content.')
      expect(excerpt).not.toContain('title:')
    })

    it('should use smart truncation at word boundaries', () => {
      const text = 'This is a sentence with multiple words that needs truncation.'
      const excerpt = ExcerptGenerator.generateExcerpt(text, { maxLength: 30, smartTruncation: true })
      
      expect(excerpt).not.toMatch(/\w\.\.\.$/) // Should not cut mid-word
    })
  })

  describe('generateArticleExcerpt', () => {
    it('should use existing excerpt if available', () => {
      const article: BlogArticle = {
        title: 'Test Article',
        slug: 'test-article',
        publishedAt: '2023-01-01',
        excerpt: 'Custom excerpt text',
        tags: [],
        relatedArticles: [],
        persona: 'developer',
        draft: false,
        createdAt: '2023-01-01',
        featured: false
      }
      
      const content = 'This is the content that should be ignored.'
      const result = ExcerptGenerator.generateArticleExcerpt(article, content)
      
      expect(result).toBe('Custom excerpt text')
    })

    it('should generate excerpt from content when not provided', () => {
      const article: BlogArticle = {
        title: 'Test Article',
        slug: 'test-article',
        publishedAt: '2023-01-01',
        tags: [],
        relatedArticles: [],
        persona: 'developer',
        draft: false,
        createdAt: '2023-01-01',
        featured: false
      }
      
      const content = 'This is the main content. It should be used to generate an excerpt.'
      const result = ExcerptGenerator.generateArticleExcerpt(article, content)
      
      expect(result).toContain('This is the main content')
    })
  })
})

describe('MarkdownProcessor', () => {
  describe('extractHeadings', () => {
    it('should extract headings with correct levels', () => {
      const markdown = `
# Heading 1
## Heading 2
### Heading 3
Regular text
#### Heading 4
`
      
      const headings = MarkdownProcessor.extractHeadings(markdown)
      
      expect(headings).toHaveLength(4)
      expect(headings[0]).toMatchObject({ level: 1, text: 'Heading 1', line: 2 })
      expect(headings[1]).toMatchObject({ level: 2, text: 'Heading 2', line: 3 })
      expect(headings[2]).toMatchObject({ level: 3, text: 'Heading 3', line: 4 })
      expect(headings[3]).toMatchObject({ level: 4, text: 'Heading 4', line: 6 })
    })

    it('should generate proper slugs for headings', () => {
      const markdown = '# Hello World & Special Characters!'
      const headings = MarkdownProcessor.extractHeadings(markdown)
      
      expect(headings[0].slug).toBe('hello-world-special-characters')
    })
  })

  describe('generateTableOfContents', () => {
    it('should generate hierarchical TOC', () => {
      const markdown = `
# Main Title
## Section 1
### Subsection 1.1
### Subsection 1.2
## Section 2
### Subsection 2.1
`
      
      const { toc, hasContent } = MarkdownProcessor.generateTableOfContents(markdown, { includeLevel1: true })
      
      expect(hasContent).toBe(true)
      expect(toc).toHaveLength(1) // Main title
      expect(toc[0].children).toHaveLength(2) // Section 1 & 2
      expect(toc[0].children?.[0]?.children).toHaveLength(2) // Subsections 1.1 & 1.2
    })

    it('should exclude level 1 headings by default', () => {
      const markdown = `
# Main Title
## Section 1
## Section 2
`
      
      const { toc } = MarkdownProcessor.generateTableOfContents(markdown)
      
      expect(toc).toHaveLength(2) // Only sections, no main title
      expect(toc[0].level).toBe(2)
    })

    it('should return empty TOC for insufficient headings', () => {
      const markdown = '# Only One Heading'
      const { toc, hasContent } = MarkdownProcessor.generateTableOfContents(markdown, { minHeadings: 2 })
      
      expect(hasContent).toBe(false)
      expect(toc).toHaveLength(0)
    })
  })

  describe('extractImages', () => {
    it('should extract images with alt text and sources', () => {
      const markdown = `
![Alt text](image1.jpg)
![Another image](image2.png "Title text")
Regular text
![](image3.gif)
`
      
      const images = MarkdownProcessor.extractImages(markdown)
      
      expect(images).toHaveLength(3)
      expect(images[0]).toMatchObject({ alt: 'Alt text', src: 'image1.jpg', line: 2 })
      expect(images[1]).toMatchObject({ alt: 'Another image', src: 'image2.png', title: 'Title text', line: 3 })
      expect(images[2]).toMatchObject({ alt: '', src: 'image3.gif', line: 5 })
    })
  })

  describe('extractLinks', () => {
    it('should extract links and identify external ones', () => {
      const markdown = `
[Internal link](/about)
[External link](https://example.com)
[Another external](//cdn.example.com/file.pdf)
[Anchor link](#section)
`
      
      const links = MarkdownProcessor.extractLinks(markdown)
      
      expect(links).toHaveLength(4)
      expect(links[0]).toMatchObject({ text: 'Internal link', href: '/about', isExternal: false })
      expect(links[1]).toMatchObject({ text: 'External link', href: 'https://example.com', isExternal: true })
      expect(links[2]).toMatchObject({ isExternal: true })
      expect(links[3]).toMatchObject({ text: 'Anchor link', href: '#section', isExternal: false })
    })
  })

  describe('validateMarkdown', () => {
    it('should validate well-formed markdown', () => {
      const markdown = `
# Title
This is good content with ![alt text](image.jpg) and [link](https://example.com).

\`\`\`javascript
console.log('code');
\`\`\`

## Section
More content here.
`
      
      const result = MarkdownProcessor.validateMarkdown(markdown)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.stats.headings).toBe(2)
      expect(result.stats.images).toBe(1)
      expect(result.stats.links).toBe(1)
    })

    it('should detect unmatched code blocks', () => {
      const markdown = `
Text here
\`\`\`javascript
console.log('unclosed');
More text
`
      
      const result = MarkdownProcessor.validateMarkdown(markdown)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Unmatched code block delimiters (```)')
    })

    it('should warn about images without alt text', () => {
      const markdown = 'Here is an image: ![](image.jpg)'
      const result = MarkdownProcessor.validateMarkdown(markdown)
      
      expect(result.warnings).toContain('1 images missing alt text')
    })

    it('should warn about heading hierarchy issues', () => {
      const markdown = `
# Title
### Skipped H2
#### Another level
`
      
      const result = MarkdownProcessor.validateMarkdown(markdown)
      
      expect(result.warnings.some(w => w.includes('heading hierarchy issues'))).toBe(true)
    })
  })
})

describe('TextAnalyzer', () => {
  describe('analyzeComplexity', () => {
    it('should calculate readability metrics', () => {
      const simpleText = 'This is simple text. It has short words. Easy to read.'
      const result = TextAnalyzer.analyzeComplexity(simpleText)
      
      expect(result.fleschReadingEase).toBeGreaterThan(70) // Should be fairly easy
      expect(result.readabilityLevel).toMatch(/easy/)
      expect(result.averageWordsPerSentence).toBeGreaterThan(0)
      expect(result.averageSyllablesPerWord).toBeGreaterThan(0)
    })

    it('should identify complex text', () => {
      const complexText = 'The implementation of sophisticated algorithms requires comprehensive understanding of computational complexity and optimization methodologies.'
      const result = TextAnalyzer.analyzeComplexity(complexText)
      
      expect(result.fleschReadingEase).toBeLessThan(60) // Should be more difficult
      expect(result.averageSyllablesPerWord).toBeGreaterThan(2)
    })
  })

  describe('extractKeywords', () => {
    it('should extract relevant keywords', () => {
      const text = 'JavaScript programming language tutorial. Learn JavaScript development and JavaScript frameworks.'
      const keywords = TextAnalyzer.extractKeywords(text, { maxKeywords: 5 })
      
      expect(keywords.length).toBeLessThanOrEqual(5)
      expect(keywords[0].word).toBe('javascript') // Most frequent
      expect(keywords[0].frequency).toBeGreaterThan(1)
    })

    it('should exclude common words', () => {
      const text = 'The quick brown fox jumps over the lazy dog. Programming is fun.'
      const keywords = TextAnalyzer.extractKeywords(text, { excludeCommon: true })
      
      const keywordWords = keywords.map(k => k.word)
      expect(keywordWords).not.toContain('the')
      expect(keywordWords).not.toContain('is')
      expect(keywordWords).toContain('programming')
    })

    it('should respect minimum word length', () => {
      const text = 'AI ML API CSS HTML programming development'
      const keywords = TextAnalyzer.extractKeywords(text, { minLength: 4 })
      
      keywords.forEach(keyword => {
        expect(keyword.word.length).toBeGreaterThanOrEqual(4)
      })
    })
  })
})

describe('ContentTransformer', () => {
  describe('processArticleContent', () => {
    let mockArticle: BlogArticle

    beforeEach(() => {
      mockArticle = {
        title: 'Test Article',
        slug: 'test-article',
        publishedAt: '2023-01-01',
        tags: ['javascript', 'tutorial'],
        relatedArticles: [],
        persona: 'developer',
        draft: false,
        createdAt: '2023-01-01',
        featured: false
      }
    })

    it('should process article content completely', () => {
      const content = `
# Introduction
This is a comprehensive tutorial about JavaScript programming.

## Getting Started
JavaScript is a versatile programming language. It can be used for web development.

\`\`\`javascript
console.log('Hello, World!');
\`\`\`

## Advanced Topics
More complex concepts will be covered here.
`
      
      const result = ContentTransformer.processArticleContent(content, mockArticle)
      
      expect(result.excerpt).toBeTruthy()
      expect(result.readingTime.minutes).toBeGreaterThan(0)
      expect(result.toc.hasContent).toBe(true)
      expect(result.validation.valid).toBe(true)
      expect(result.analysis.readabilityLevel).toBeTruthy()
      expect(result.keywords.length).toBeGreaterThan(0)
    })

    it('should use custom excerpt when provided', () => {
      const articleWithExcerpt: BlogArticle = {
        ...mockArticle,
        excerpt: 'Custom excerpt for testing'
      }
      
      const content = 'This content should be ignored for excerpt generation.'
      const result = ContentTransformer.processArticleContent(content, articleWithExcerpt)
      
      expect(result.excerpt).toBe('Custom excerpt for testing')
    })
  })

  describe('batchProcessArticles', () => {
    it('should process multiple articles', () => {
      const articles = [
        {
          article: {
            title: 'Article 1',
            slug: 'article-1',
            publishedAt: '2023-01-01',
            tags: [],
            relatedArticles: [],
            persona: 'developer',
            draft: false,
            createdAt: '2023-01-01',
            featured: false
          } as BlogArticle,
          content: 'Content for article 1. This is a test.'
        },
        {
          article: {
            title: 'Article 2',
            slug: 'article-2',
            publishedAt: '2023-01-02',
            tags: [],
            relatedArticles: [],
            persona: 'developer',
            draft: false,
            createdAt: '2023-01-02',
            featured: false
          } as BlogArticle,
          content: 'Content for article 2. This is another test.'
        }
      ]
      
      const results = ContentTransformer.batchProcessArticles(articles)
      
      expect(results).toHaveLength(2)
      expect(results[0].article.title).toBe('Article 1')
      expect(results[1].article.title).toBe('Article 2')
      expect(results[0].processed.excerpt).toBeTruthy()
      expect(results[1].processed.excerpt).toBeTruthy()
    })
  })
})