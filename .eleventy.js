module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("style.css");
  eleventyConfig.addPassthroughCopy("docs/");
  eleventyConfig.addPassthroughCopy("sitemap.xml");
  eleventyConfig.addPassthroughCopy("robots.txt");
  eleventyConfig.addPassthroughCopy("assets/");
  
  // Date display filter
  eleventyConfig.addFilter("dateDisplay", function(dateObj) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return months[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear();
  });
  
  // Blog posts collection
  eleventyConfig.addCollection("posts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/posts/*.md").sort((a, b) => {
      return b.date - a.date;
    });
  });
  
  // Category-specific collections
  eleventyConfig.addCollection("vedantaPosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/posts/*.md").filter(function(post) {
      return post.data.category === "Vedanta";
    }).sort((a, b) => {
      return b.date - a.date;
    });
  });
  
  eleventyConfig.addCollection("yogaPosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/posts/*.md").filter(function(post) {
      return post.data.category === "Yoga";
    }).sort((a, b) => {
      return b.date - a.date;
    });
  });
  
  eleventyConfig.addCollection("meditationPosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("content/posts/*.md").filter(function(post) {
      return post.data.category === "Meditation";
    }).sort((a, b) => {
      return b.date - a.date;
    });
  });
  
  return {
    dir: {
      output: "_site"
    },
    templateFormats: ["md", "njk", "html", "xml"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
