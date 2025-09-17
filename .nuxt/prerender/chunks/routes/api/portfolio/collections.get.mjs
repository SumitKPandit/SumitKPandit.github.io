import { defineEventHandler } from 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/h3@1.15.4/node_modules/h3/dist/index.mjs';

const collections_get = defineEventHandler(async () => {
  return {
    success: true,
    data: [
      {
        title: "Photography",
        slug: "photography",
        description: "A collection of photographic works exploring light, emotion, and human experience.",
        persona: "photographer",
        category: "visual-art",
        tags: ["photography", "visual-storytelling", "light", "emotion"],
        featured: true,
        draft: false,
        createdAt: "2023-12-01T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z",
        ordering: 1,
        coverImage: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800",
        coverImageAlt: "Photography equipment and artistic composition",
        items: ["morning-light", "urban-shadows", "portrait-series"],
        stats: {
          totalItems: 3,
          featured: 2,
          categories: ["nature", "urban", "portrait"]
        },
        settings: {
          displayStyle: "grid",
          itemsPerPage: 12,
          showDescription: true
        },
        url: "/portfolio/photography"
      },
      {
        title: "Web Applications",
        slug: "web-applications",
        description: "A collection of web applications and digital products built with modern technologies and user-centered design principles.",
        persona: "developer",
        category: "development",
        tags: ["web-development", "applications", "user-experience", "accessibility"],
        featured: true,
        draft: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-20T00:00:00Z",
        ordering: 2,
        coverImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
        coverImageAlt: "Code on multiple monitors showing web development",
        items: ["accessible-task-manager", "philosophical-blog-platform", "portfolio-cms"],
        stats: {
          totalItems: 3,
          featured: 2,
          categories: ["productivity", "content-management", "social"]
        },
        settings: {
          displayStyle: "cards",
          itemsPerPage: 6,
          showDescription: true
        },
        url: "/portfolio/web-applications"
      }
    ],
    count: 2,
    stats: {
      total: 2,
      featured: 2,
      personas: ["photographer", "developer"],
      categories: ["visual-art", "development"],
      tags: ["photography", "visual-storytelling", "light", "emotion", "web-development", "applications", "user-experience", "accessibility"],
      totalItems: 6,
      avgItemsPerCollection: 3
    }
  };
});

export { collections_get as default };
//# sourceMappingURL=collections.get.mjs.map
