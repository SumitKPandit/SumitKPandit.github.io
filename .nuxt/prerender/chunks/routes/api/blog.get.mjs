import { defineEventHandler } from 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/h3@1.15.4/node_modules/h3/dist/index.mjs';

const blog_get = defineEventHandler(async () => {
  return {
    success: true,
    data: [
      {
        title: "The Ethics of Artificial Intelligence",
        slug: "ethics-of-artificial-intelligence",
        description: "Exploring the moral implications of creating intelligent machines and their impact on human society.",
        publishDate: "2024-01-15T00:00:00Z",
        updatedDate: "2024-01-20T00:00:00Z",
        persona: "philosopher",
        category: "philosophy",
        series: "AI Ethics Series",
        seriesOrder: 1,
        tags: ["ai", "ethics", "technology", "consciousness"],
        excerpt: "Exploring the moral implications of creating intelligent machines and their impact on human society.",
        featured: true,
        draft: false,
        readingTime: 8,
        author: "Sumit Kumar Pandit",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
        imageAlt: "Abstract representation of artificial intelligence and ethics",
        relatedArticles: [],
        externalLinks: [],
        url: "/blog/ethics-of-artificial-intelligence",
        publishYear: 2024,
        publishMonth: "January"
      },
      {
        title: "Building Accessible Web Applications",
        slug: "building-accessible-web-applications",
        description: "A practical guide to creating web applications that work for everyone, including users with disabilities.",
        publishDate: "2024-01-10T00:00:00Z",
        updatedDate: "2024-01-15T00:00:00Z",
        persona: "developer",
        category: "web-development",
        series: "Accessibility Best Practices",
        seriesOrder: 1,
        tags: ["accessibility", "web-development", "a11y", "inclusive-design"],
        excerpt: "A practical guide to creating web applications that work for everyone, including users with disabilities.",
        featured: true,
        draft: false,
        readingTime: 12,
        author: "Sumit Kumar Pandit",
        image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800",
        imageAlt: "Person using assistive technology to navigate a website",
        relatedArticles: [],
        externalLinks: [],
        url: "/blog/building-accessible-web-applications",
        publishYear: 2024,
        publishMonth: "January"
      },
      {
        title: "Technology and Human Experience",
        slug: "technology-and-human-experience",
        description: "How digital technologies reshape our understanding of time, space, and social relations.",
        publishDate: "2024-01-05T00:00:00Z",
        updatedDate: "2024-01-12T00:00:00Z",
        persona: "philosopher",
        category: "philosophy",
        series: "Digital Phenomenology",
        seriesOrder: 1,
        tags: ["phenomenology", "technology", "human-experience", "digital-media"],
        excerpt: "How digital technologies reshape our understanding of time, space, and social relations.",
        featured: false,
        draft: false,
        readingTime: 15,
        author: "Sumit Kumar Pandit",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800",
        imageAlt: "Person interacting with holographic digital interface",
        relatedArticles: ["ethics-of-artificial-intelligence"],
        externalLinks: [],
        url: "/blog/technology-and-human-experience",
        publishYear: 2024,
        publishMonth: "January"
      }
    ],
    count: 3,
    stats: {
      total: 3,
      featured: 2,
      draft: 0,
      categories: ["philosophy", "web-development"],
      tags: ["ai", "ethics", "technology", "consciousness", "accessibility", "web-development", "a11y", "inclusive-design", "phenomenology", "human-experience", "digital-media"],
      series: ["AI Ethics Series", "Accessibility Best Practices", "Digital Phenomenology"],
      personas: ["philosopher", "developer"],
      years: [2024],
      months: ["January"]
    }
  };
});

export { blog_get as default };
//# sourceMappingURL=blog.get.mjs.map
