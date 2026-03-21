---
title: Book a Session
layout: layouts/base.njk
description: Book one-on-one sessions
---

<div class="page-content">
  <h1><i data-feather="calendar"></i> Book a Session</h1>

  <p>Ready for deeper guidance on your spiritual journey? Book a one-on-one session with me.</p>

  <h2><i data-feather="list"></i> Session Types</h2>
  
  <div class="experience-list">
    <div class="experience-item">
      <div class="exp-header">
        <span class="exp-role"><i data-feather="phone"></i> Discovery Call</span>
        <span class="exp-company">30 min</span>
      </div>
      <p class="exp-desc">Initial consultation, understand your needs and goals</p>
    </div>

    <div class="experience-item">
      <div class="exp-header">
        <span class="exp-role"><i data-feather="wind"></i> Guided Meditation</span>
        <span class="exp-company">45 min</span>
      </div>
      <p class="exp-desc">One-on-one meditation guidance</p>
    </div>

    <div class="experience-item">
      <div class="exp-header">
        <span class="exp-role"><i data-feather="book"></i> Vedanta Discussion</span>
        <span class="exp-company">60 min</span>
      </div>
      <p class="exp-desc">Deep dive into philosophical topics</p>
    </div>

    <div class="experience-item">
      <div class="exp-header">
        <span class="exp-role"><i data-feather="star"></i> Complete Session</span>
        <span class="exp-company">90 min</span>
      </div>
      <p class="exp-desc">Full experience combining meditation + discussion</p>
    </div>
  </div>

  <h2><i data-feather="send"></i> How It Works</h2>
  <ol>
    <li>Select a session type below</li>
    <li>Fill out the contact form</li>
    <li>I'll get back to you to schedule the session</li>
  </ol>

  <form action="https://formspree.io/f/xreydwep" method="POST" class="booking-form">
    <div class="form-group">
      <label for="name"><i data-feather="user"></i> Name</label>
      <input type="text" id="name" name="name" required>
    </div>
    
    <div class="form-group">
      <label for="email"><i data-feather="mail"></i> Email</label>
      <input type="email" id="email" name="email" required>
    </div>

    <div class="form-group">
      <label for="session-type"><i data-feather="list"></i> Session Type</label>
      <select id="session-type" name="session-type">
        <option value="discovery">Discovery Call (30 min)</option>
        <option value="meditation">Guided Meditation (45 min)</option>
        <option value="vedanta">Vedanta Discussion (60 min)</option>
        <option value="complete">Complete Session (90 min)</option>
      </select>
    </div>
    
    <div class="form-group">
      <label for="message"><i data-feather="message-square"></i> Tell me about yourself and what you're looking for</label>
      <textarea id="message" name="message" rows="5"></textarea>
    </div>
    
    <button type="submit" class="btn btn-primary" style="width: 100%;"><i data-feather="send"></i> Submit Request</button>
  </form>

  <p class="note"><i data-feather="clock"></i> I typically respond within 24-48 hours.</p>
</div>
