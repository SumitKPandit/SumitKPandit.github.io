---
title: Blog
layout: layouts/base.njk
description: Articles on Vedanta, Yoga, and Meditation
---

<div class="page-content">
  <h1><i data-feather="book"></i> Blog</h1>
  
  <p>Articles on Vedanta, Yoga, and Meditation — the timeless paths to self-realization.</p>

  <div class="blog-filters">
    <a href="/blog/" class="filter-link active">All</a>
    <a href="/blog/vedanta/" class="filter-link">Vedanta</a>
    <a href="/blog/yoga/" class="filter-link">Yoga</a>
    <a href="/blog/meditation/" class="filter-link">Meditation</a>
  </div>

  <div class="posts-grid">
    {% for post in collections.posts %}
    <article class="post-card">
      <span class="post-category {{ post.data.category | lower }}">{{ post.data.category }}</span>
      <h2><a href="{{ post.url }}">{{ post.data.title }}</a></h2>
      <p class="post-date">{{ post.date | dateDisplay }}</p>
      <p class="post-excerpt">{{ post.data.excerpt }}</p>
      <a href="{{ post.url }}" class="read-more">Read more <i data-feather="arrow-right"></i></a>
    </article>
    {% endfor %}
  </div>
</div>
