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
  
  return {
    dir: {
      output: "_site"
    },
    templateFormats: ["md", "njk", "html", "xml"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
