import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Serves the FJB embed script as JavaScript
// Usage: <script src="https://app.freejobboard.ai/embed/v1.js" data-board="yourslug"></script>

const EMBED_SCRIPT = `
(function() {
  'use strict';

  var API_BASE = 'https://app.freejobboard.ai/api/embed';

  function getScript() {
    return document.currentScript || (function() {
      var scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
  }

  function formatJobType(type) {
    var map = { 'full-time': 'Full-time', 'part-time': 'Part-time', 'contract': 'Contract', 'freelance': 'Freelance', 'internship': 'Internship' };
    return map[type] || type;
  }

  function timeAgo(dateStr) {
    var now = new Date();
    var then = new Date(dateStr);
    var diff = Math.floor((now - then) / 1000);
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 2592000) return Math.floor(diff / 86400) + 'd ago';
    return Math.floor(diff / 2592000) + 'mo ago';
  }

  function hexToRgb(hex) {
    var result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
    return result ? parseInt(result[1], 16) + ', ' + parseInt(result[2], 16) + ', ' + parseInt(result[3], 16) : '99, 102, 241';
  }

  function injectStyles(color) {
    var rgb = hexToRgb(color);
    var css = [
      '.fjb-widget { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 100%; box-sizing: border-box; }',
      '.fjb-widget * { box-sizing: border-box; }',
      '.fjb-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }',
      '.fjb-job { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; transition: box-shadow 0.15s, border-color 0.15s; }',
      '.fjb-job:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-color: rgba(' + rgb + ', 0.4); }',
      '.fjb-job-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }',
      '.fjb-job-title { font-size: 15px; font-weight: 600; color: #0f172a; margin: 0 0 4px; line-height: 1.3; }',
      '.fjb-job-company { font-size: 13px; color: #64748b; margin: 0; }',
      '.fjb-job-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; align-items: center; }',
      '.fjb-badge { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 20px; white-space: nowrap; }',
      '.fjb-badge-type { background: #f1f5f9; color: #475569; }',
      '.fjb-badge-remote { background: #dcfce7; color: #166534; }',
      '.fjb-badge-featured { background: rgba(' + rgb + ', 0.1); color: rgb(' + rgb + '); }',
      '.fjb-badge-salary { background: #f0fdf4; color: #15803d; }',
      '.fjb-location { font-size: 12px; color: #94a3b8; margin-left: auto; }',
      '.fjb-apply-btn { display: inline-flex; align-items: center; gap: 6px; background: rgb(' + rgb + '); color: #fff; border: none; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; transition: opacity 0.15s; white-space: nowrap; flex-shrink: 0; }',
      '.fjb-apply-btn:hover { opacity: 0.88; }',
      '.fjb-footer { margin-top: 14px; text-align: center; }',
      '.fjb-footer a { font-size: 11px; color: #94a3b8; text-decoration: none; }',
      '.fjb-footer a:hover { color: #64748b; }',
      '.fjb-empty { text-align: center; padding: 40px 20px; color: #94a3b8; font-size: 14px; }',
      '.fjb-loading { text-align: center; padding: 40px 20px; color: #94a3b8; font-size: 14px; }',
      '@media (max-width: 480px) { .fjb-job-header { flex-direction: column; } .fjb-apply-btn { width: 100%; justify-content: center; margin-top: 10px; } }',
    ].join('\\n');

    var style = document.createElement('style');
    style.id = 'fjb-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function renderJobs(container, data) {
    var board = data.board;
    var jobs = data.jobs;

    injectStyles(board.primaryColor);

    var html = '<div class="fjb-widget">';

    if (!jobs || jobs.length === 0) {
      html += '<div class="fjb-empty">No open positions right now. Check back soon!</div>';
    } else {
      html += '<ul class="fjb-list">';
      jobs.forEach(function(job) {
        var applyLink = job.applyUrl || job.detailUrl;
        html += '<li class="fjb-job">';
        html += '<div class="fjb-job-header">';
        html += '<div>';
        html += '<p class="fjb-job-title">' + escHtml(job.title) + '</p>';
        html += '<p class="fjb-job-company">' + escHtml(job.company) + '</p>';
        html += '</div>';
        html += '<a class="fjb-apply-btn" href="' + escHtml(applyLink) + '" target="_blank" rel="noopener">Apply →</a>';
        html += '</div>';
        html += '<div class="fjb-job-meta">';
        html += '<span class="fjb-badge fjb-badge-type">' + formatJobType(job.jobType) + '</span>';
        if (job.remote) html += '<span class="fjb-badge fjb-badge-remote">Remote</span>';
        if (job.featured) html += '<span class="fjb-badge fjb-badge-featured">⭐ Featured</span>';
        if (job.salary) html += '<span class="fjb-badge fjb-badge-salary">' + escHtml(job.salary) + '</span>';
        if (job.location) html += '<span class="fjb-location">📍 ' + escHtml(job.location) + '</span>';
        html += '</div>';
        html += '</li>';
      });
      html += '</ul>';
    }

    html += '<div class="fjb-footer"><a href="https://freejobboard.ai" target="_blank" rel="noopener">Post jobs free at FreeJobBoard.ai</a></div>';
    html += '</div>';

    container.innerHTML = html;
  }

  function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function init() {
    var script = getScript();
    var boardSlug = script.getAttribute('data-board');
    var containerId = script.getAttribute('data-container') || 'fjb-jobs';

    if (!boardSlug) {
      console.warn('[FreeJobBoard] Missing data-board attribute on script tag.');
      return;
    }

    // Find or create container
    var container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      script.parentNode.insertBefore(container, script);
    }

    container.innerHTML = '<div class="fjb-loading">Loading open positions...</div>';

    fetch(API_BASE + '/' + encodeURIComponent(boardSlug))
      .then(function(res) {
        if (!res.ok) throw new Error('Board not found');
        return res.json();
      })
      .then(function(data) {
        renderJobs(container, data);
      })
      .catch(function(err) {
        container.innerHTML = '<div class="fjb-empty">Unable to load positions. Please try again later.</div>';
        console.warn('[FreeJobBoard] Error:', err.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;

export async function GET(_req: NextRequest) {
  return new NextResponse(EMBED_SCRIPT, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
