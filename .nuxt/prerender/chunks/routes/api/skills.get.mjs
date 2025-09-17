import { defineEventHandler } from 'file:///Users/sumitkumarpandit/codebase/misc/SumitKPandit.github.io/node_modules/.pnpm/h3@1.15.4/node_modules/h3/dist/index.mjs';

const skills_get = defineEventHandler(async () => {
  return {
    success: true,
    data: [
      {
        name: "TypeScript",
        key: "typescript",
        slug: "typescript",
        description: "Strongly typed JavaScript superset for building robust applications with enhanced developer experience and maintainability.",
        persona: "developer",
        category: "programming-language",
        subcategory: "web-development",
        group: "language",
        proficiency: "expert",
        proficiencyLevel: 9,
        yearsOfExperience: 5,
        featured: true,
        endorsed: true,
        draft: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T00:00:00Z",
        tags: ["javascript", "web-development", "type-safety", "frontend", "backend"],
        relatedSkills: ["javascript", "vue", "react", "node", "testing"],
        projects: ["accessible-task-manager", "portfolio-cms", "philosophical-blog-platform"],
        certifications: [],
        endorsements: [
          "Exceptional TypeScript expertise demonstrated in complex application architecture",
          "Strong understanding of advanced TypeScript patterns and best practices"
        ],
        learningResources: [
          {
            title: "TypeScript Handbook",
            url: "https://www.typescriptlang.org/docs/",
            type: "documentation"
          },
          {
            title: "Advanced TypeScript Patterns",
            url: "https://example.com/ts-patterns",
            type: "course"
          }
        ],
        achievements: [
          "Migrated 10+ JavaScript codebases to TypeScript with 0 runtime errors",
          "Created reusable TypeScript utility libraries used across multiple projects",
          "Mentored developers in TypeScript adoption and best practices"
        ],
        url: "/skills/typescript"
      },
      {
        name: "Accessibility (A11y)",
        key: "accessibility",
        slug: "accessibility",
        description: "Creating inclusive digital experiences that work for users of all abilities, with expertise in WCAG guidelines, assistive technologies, and universal design principles.",
        persona: "developer",
        category: "specialization",
        subcategory: "web-accessibility",
        group: "practice",
        proficiency: "expert",
        proficiencyLevel: 9,
        yearsOfExperience: 7,
        featured: true,
        endorsed: true,
        draft: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-20T00:00:00Z",
        tags: ["a11y", "wcag", "inclusive-design", "assistive-technology", "usability"],
        relatedSkills: ["html", "css", "javascript", "user-experience", "testing"],
        projects: ["accessible-task-manager", "nonprofit-website-audit", "accessibility-training-platform"],
        certifications: ["IAAP Certified Professional in Accessibility Core Competencies (CPACC)"],
        endorsements: [
          "Demonstrated exceptional ability to create accessible solutions that exceed compliance requirements",
          "Excellent at training teams on accessibility best practices and implementation strategies"
        ],
        learningResources: [
          {
            title: "WCAG 2.1 Guidelines",
            url: "https://www.w3.org/WAI/WCAG21/quickref/",
            type: "specification"
          },
          {
            title: "WebAIM Screen Reader Testing",
            url: "https://webaim.org/articles/screenreader_testing/",
            type: "guide"
          }
        ],
        achievements: [
          "Achieved WCAG 2.1 AAA compliance for 15+ client applications",
          "Reduced accessibility issues by 95% through automated testing implementation",
          "Trained 50+ developers in accessibility best practices",
          "Created accessibility audit framework adopted by multiple organizations"
        ],
        url: "/skills/accessibility"
      },
      {
        name: "Critical Theory",
        key: "critical-theory",
        slug: "critical-theory",
        description: "Analyzing power structures, social systems, and ideological formations through the lens of Frankfurt School critical theory and contemporary continental philosophy.",
        persona: "philosopher",
        category: "theoretical-framework",
        subcategory: "continental-philosophy",
        group: "methodology",
        proficiency: "expert",
        proficiencyLevel: 8,
        yearsOfExperience: 8,
        featured: true,
        endorsed: true,
        draft: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-18T00:00:00Z",
        tags: ["frankfurt-school", "social-theory", "ideology-critique", "political-philosophy", "cultural-analysis"],
        relatedSkills: ["phenomenology", "academic-writing", "research-methodology", "german-philosophy"],
        projects: ["dissertation-digital-presence", "technology-ethics-research", "democratic-theory-conference"],
        certifications: ["PhD in Philosophy"],
        endorsements: [
          "Sophisticated understanding of critical theory's application to contemporary digital culture",
          "Exceptional ability to connect abstract theoretical concepts to concrete social phenomena"
        ],
        learningResources: [
          {
            title: "Dialectic of Enlightenment",
            url: "https://example.com/adorno-horkheimer",
            type: "book"
          },
          {
            title: "Critical Theory: Selected Essays",
            url: "https://example.com/marcuse-essays",
            type: "anthology"
          }
        ],
        achievements: [
          "Published peer-reviewed articles applying critical theory to digital media analysis",
          "Organized interdisciplinary conference on critical approaches to technology",
          "Developed undergraduate curriculum integrating critical theory with contemporary issues",
          "Received award for innovative application of critical theory to digital phenomenology"
        ],
        url: "/skills/critical-theory"
      },
      {
        name: "Vue.js",
        key: "vue",
        slug: "vue-js",
        description: "Progressive JavaScript framework for building user interfaces with focus on component composition and reactive data flow.",
        persona: "developer",
        category: "framework",
        subcategory: "frontend-framework",
        group: "technology",
        proficiency: "expert",
        proficiencyLevel: 9,
        yearsOfExperience: 6,
        featured: true,
        endorsed: true,
        draft: false,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-12T00:00:00Z",
        tags: ["javascript", "frontend", "reactive", "component-based", "spa"],
        relatedSkills: ["typescript", "javascript", "html", "css", "testing"],
        projects: ["accessible-task-manager", "portfolio-cms", "client-dashboard"],
        certifications: [],
        endorsements: [
          "Expert-level Vue.js development with strong understanding of advanced patterns",
          "Exceptional ability to build scalable and maintainable Vue applications"
        ],
        learningResources: [
          {
            title: "Vue.js Official Guide",
            url: "https://vuejs.org/guide/",
            type: "documentation"
          },
          {
            title: "Vue Mastery Courses",
            url: "https://www.vuemastery.com/",
            type: "course"
          }
        ],
        achievements: [
          "Built 20+ production Vue.js applications with zero critical bugs",
          "Created Vue component libraries used across multiple projects",
          "Contributed to Vue.js ecosystem with open source plugins",
          "Led Vue.js training sessions for development teams"
        ],
        url: "/skills/vue-js"
      }
    ],
    count: 4,
    stats: {
      total: 4,
      featured: 4,
      endorsed: 4,
      categories: ["programming-language", "specialization", "theoretical-framework", "framework"],
      subcategories: ["web-development", "web-accessibility", "continental-philosophy", "frontend-framework"],
      groups: ["language", "practice", "methodology", "technology"],
      personas: ["developer", "philosopher"],
      proficiencyLevels: {
        expert: 4,
        advanced: 0,
        intermediate: 0,
        beginner: 0
      },
      averageProficiency: 8.75,
      totalExperience: 26,
      tags: ["javascript", "web-development", "type-safety", "frontend", "backend", "a11y", "wcag", "inclusive-design", "assistive-technology", "usability", "frankfurt-school", "social-theory", "ideology-critique", "political-philosophy", "cultural-analysis", "reactive", "component-based", "spa"]
    }
  };
});

export { skills_get as default };
//# sourceMappingURL=skills.get.mjs.map
