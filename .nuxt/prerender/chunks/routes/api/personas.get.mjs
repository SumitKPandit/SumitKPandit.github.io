import { defineEventHandler } from 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/h3@1.15.4/node_modules/h3/dist/index.mjs';

const personas_get = defineEventHandler(async () => {
  return {
    success: true,
    data: [
      {
        key: "philosopher",
        name: "Sumit Kumar Pandit",
        title: "Digital Philosopher",
        bio: "Exploring questions at the intersection of technology, society, and human flourishing through phenomenology, pragmatism, and critical theory.",
        description: "Exploring questions of technology, society, and human flourishing.",
        primary: true,
        draft: false,
        createdAt: "2023-12-01T00:00:00Z",
        updatedAt: "2024-01-20T00:00:00Z",
        tags: ["philosophy", "technology", "phenomenology", "critical-theory"],
        featured: true,
        slug: "philosopher",
        url: "/personas/philosopher"
      },
      {
        key: "developer",
        name: "Sumit Kumar Pandit",
        title: "Full-Stack Developer",
        bio: "Building thoughtful, accessible, and performant web experiences with over a decade of experience in software development.",
        description: "Building thoughtful, accessible, and performant web experiences.",
        primary: false,
        draft: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z",
        tags: ["development", "typescript", "vue", "web"],
        featured: true,
        slug: "developer",
        url: "/personas/developer"
      }
    ],
    count: 2,
    stats: {
      total: 2,
      primary: 1,
      featured: 2,
      tags: ["philosophy", "technology", "phenomenology", "critical-theory", "development", "typescript", "vue", "web"]
    }
  };
});

export { personas_get as default };
//# sourceMappingURL=personas.get.mjs.map
