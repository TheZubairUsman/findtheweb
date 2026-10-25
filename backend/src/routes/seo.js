const express = require('express');
const { BlogPost } = require('../models');

const router = express.Router();
const siteUrl = (process.env.PUBLIC_SITE_URL || 'https://findtheweb.zus3cu.tech').replace(/\/$/, '');

const escapeXml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

router.get('/sitemap.xml', async (req, res) => {
  try {
    const posts = await BlogPost.scope('published').findAll({
      attributes: ['slug', 'updatedAt', 'publishedAt'],
      order: [['publishedAt', 'DESC']],
      limit: 2000,
    });
    const urls = [
      { loc: `${siteUrl}/`, changefreq: 'weekly', priority: '1.0' },
      { loc: `${siteUrl}/blog`, changefreq: 'daily', priority: '0.9' },
      { loc: `${siteUrl}/discover`, changefreq: 'daily', priority: '0.8' },
      ...posts.map((post) => ({
        loc: `${siteUrl}/blog/${encodeURIComponent(post.slug)}`,
        lastmod: post.updatedAt || post.publishedAt,
        changefreq: 'monthly',
        priority: '0.7',
      })),
    ];
    const body = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...urls.map((url) => [
        '<url>',
        `<loc>${escapeXml(url.loc)}</loc>`,
        url.lastmod ? `<lastmod>${new Date(url.lastmod).toISOString()}</lastmod>` : '',
        `<changefreq>${url.changefreq}</changefreq>`,
        `<priority>${url.priority}</priority>`,
        '</url>',
      ].filter(Boolean).join('')),
      '</urlset>',
    ].join('');
    res.type('application/xml').send(body);
  } catch (error) {
    console.error('SEO sitemap error:', error);
    res.status(500).type('text/plain').send('Unable to generate sitemap');
  }
});

router.get('/rss.xml', async (req, res) => {
  try {
    const posts = await BlogPost.scope('published').findAll({
      attributes: ['title', 'slug', 'excerpt', 'publishedAt', 'updatedAt'],
      order: [['publishedAt', 'DESC']],
      limit: 50,
    });
    const items = posts.map((post) => [
      '<item>',
      `<title>${escapeXml(post.title)}</title>`,
      `<link>${escapeXml(`${siteUrl}/blog/${post.slug}`)}</link>`,
      `<guid isPermaLink="true">${escapeXml(`${siteUrl}/blog/${post.slug}`)}</guid>`,
      `<description>${escapeXml(post.excerpt || '')}</description>`,
      `<pubDate>${new Date(post.publishedAt || post.updatedAt).toUTCString()}</pubDate>`,
      '</item>',
    ].join('')).join('');
    const body = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0"><channel>',
      `<title>${escapeXml('The FindTheWeb Journal')}</title>`,
      `<link>${escapeXml(`${siteUrl}/blog`)}</link>`,
      `<description>${escapeXml('Practical guides for discovering better tools and workflows.')}</description>`,
      items,
      '</channel></rss>',
    ].join('');
    res.type('application/rss+xml').send(body);
  } catch (error) {
    console.error('SEO RSS error:', error);
    res.status(500).type('text/plain').send('Unable to generate RSS feed');
  }
});

module.exports = router;
