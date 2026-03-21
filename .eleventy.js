module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("style.css");
  return {
    dir: {
      output: "_site"
    }
  };
};
