const fs = require("fs");
const path = require("path");

module.exports = function(eleventyConfig) {
  // Copy static assets through (gwern.net compiled CSS/JS/fonts)
  eleventyConfig.addPassthroughCopy("static");

  // Don't process HTML files inside static/ as templates
  eleventyConfig.ignores.add("static/**/*.html");

  // Watch blog content in vault-write
  eleventyConfig.addWatchTarget("../vault-write/blogs/**/*.md");

  // Collection: all published posts across all hosts, sorted newest first
  eleventyConfig.addCollection("published", function(collectionApi) {
    return collectionApi.getFilteredByGlob("../vault-write/blogs/**/*.md")
      .filter(post => post.data.published === true && !post.filePathStem.includes("/drafts/"))
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  // Collection: all published posts grouped by tag
  // Returns { tag: string, posts: [...] }
  eleventyConfig.addCollection("postTags", function(collectionApi) {
    const posts = collectionApi.getFilteredByGlob("../vault-write/blogs/**/*.md")
      .filter(post => post.data.published === true && !post.filePathStem.includes("/drafts/"))
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));

    const tagMap = new Map();
    for (const post of posts) {
      const tags = post.data.tags || [];
      for (const tag of tags) {
        if (!tagMap.has(tag)) tagMap.set(tag, []);
        tagMap.get(tag).push(post);
      }
    }

    return Array.from(tagMap.entries())
      .map(([tag, posts]) => ({ tag, posts }))
      .sort((a, b) => a.tag.localeCompare(b.tag));
  });

  // Collection: unique tag names (for listing all tags)
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const posts = collectionApi.getAll();
    const tagSet = new Set();
    for (const post of posts) {
      const tags = post.data.tags || [];
      for (const tag of tags) tagSet.add(tag);
    }
    return Array.from(tagSet).sort();
  });

  // Computed data: host from directory, slug from filename
  eleventyConfig.addGlobalData("eleventyComputed", {
    host: data => {
      if (data.host) return data.host;
      if (data.page?.filePathStem) {
        const parts = data.page.filePathStem.split("/");
        if (parts.length >= 2 && parts[1] && parts[1] !== "") {
          return parts[1];
        }
      }
      return "goku";
    },
    slug: data => {
      if (data.slug) return data.slug;
      if (data.page?.fileSlug) {
        return data.page.fileSlug.replace(/^\d{4}-\d{2}-\d{2}-/, "");
      }
      return "";
    }
  });

  // Date filter
  eleventyConfig.addFilter("readableDate", function(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric"
    });
  });

  eleventyConfig.addFilter("isoDate", function(date) {
    if (!date) return "";
    return new Date(date).toISOString();
  });

  // Layout aliases
  eleventyConfig.addLayoutAlias("base", "base.njk");
  eleventyConfig.addLayoutAlias("post", "post.njk");
  eleventyConfig.addLayoutAlias("tag", "tag.njk");

  return {
    dir: {
      input: "../vault-write/blogs",
      output: "_site",
      includes: "_includes",
      layouts: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
