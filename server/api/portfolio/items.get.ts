export default defineEventHandler(async () => {
  return {
    success: true,
    data: [
      {
        title: "Morning Light",
        slug: "morning-light",
        description: "Capturing the gentle quality of early morning light as it filters through autumn leaves.",
        collection: "photography",
        persona: "photographer",
        category: "nature",
        subcategory: "landscape",
        tags: ["morning", "light", "trees", "autumn", "nature"],
        featured: true,
        draft: false,
        publishDate: "2024-01-10T00:00:00Z",
        updatedDate: "2024-01-12T00:00:00Z",
        createdAt: "2024-01-10T00:00:00Z",
        ordering: 1,
        images: [
          {
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            alt: "Soft morning light filtering through trees",
            caption: "Golden hour light through autumn foliage",
            primary: true
          },
          {
            url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
            alt: "Forest pathway in morning light",
            caption: "The path illuminated by early sun",
            primary: false
          }
        ],
        thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
        dimensions: {
          width: 1920,
          height: 1080,
          aspectRatio: "16:9"
        },
        technicalDetails: {
          camera: "Canon EOS R5",
          lens: "RF 24-70mm f/2.8L",
          settings: "f/5.6, 1/125s, ISO 200",
          location: "Local Park, Morning Walk",
          date: "2024-01-10"
        },
        links: [
          {
            title: "High Resolution Download",
            url: "/downloads/morning-light-hr.jpg",
            type: "download"
          }
        ],
        metadata: {
          fileSize: "2.4MB",
          colorSpace: "sRGB",
          resolution: "300 DPI"
        },
        url: "/portfolio/photography/morning-light"
      },
      {
        title: "Accessible Task Manager",
        slug: "accessible-task-manager",
        description: "A task management application built with accessibility as a first-class feature, supporting screen readers, keyboard navigation, and high contrast modes.",
        collection: "web-applications",
        persona: "developer",
        category: "productivity",
        subcategory: "task-management",
        tags: ["accessibility", "productivity", "vue", "typescript", "a11y"],
        featured: true,
        draft: false,
        publishDate: "2024-01-15T00:00:00Z",
        updatedDate: "2024-01-18T00:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
        ordering: 1,
        images: [
          {
            url: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800",
            alt: "Task management interface with accessibility features highlighted",
            caption: "Main dashboard showing high contrast mode and keyboard focus",
            primary: true
          },
          {
            url: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=800",
            alt: "Screen reader compatible task list interface",
            caption: "Task list with proper ARIA labels and semantic structure",
            primary: false
          }
        ],
        thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400",
        dimensions: {
          width: 1920,
          height: 1080,
          aspectRatio: "16:9"
        },
        technicalDetails: {
          technologies: ["Vue 3", "TypeScript", "Tailwind CSS", "Vite", "Vitest"],
          accessibility: ["WCAG 2.1 AAA", "Screen Reader Support", "Keyboard Navigation", "High Contrast Mode"],
          features: ["Drag & Drop", "Real-time Sync", "Offline Support", "Custom Themes"],
          testing: ["Unit Tests", "Integration Tests", "Accessibility Tests"]
        },
        links: [
          {
            title: "Live Demo",
            url: "https://accessible-tasks.example.com",
            type: "demo"
          },
          {
            title: "GitHub Repository",
            url: "https://github.com/example/accessible-task-manager",
            type: "code"
          },
          {
            title: "Accessibility Report",
            url: "/reports/task-manager-a11y.pdf",
            type: "document"
          }
        ],
        metadata: {
          status: "Production",
          lastUpdated: "2024-01-18",
          version: "2.1.0"
        },
        url: "/portfolio/web-applications/accessible-task-manager"
      }
    ],
    count: 2,
    stats: {
      total: 2,
      featured: 2,
      collections: ["photography", "web-applications"],
      personas: ["photographer", "developer"],
      categories: ["nature", "productivity"],
      tags: ["morning", "light", "trees", "autumn", "nature", "accessibility", "productivity", "vue", "typescript", "a11y"]
    }
  }
})