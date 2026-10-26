const express = require('express');
const { BlogPost, Admin, sequelize } = require('../models');
const { publicArticle } = require('../services/editorialSeo');

const router = express.Router();
router.get('/articles/:slug', async (req,res) => {
  res.set('Cache-Control','no-store');
  if(!/^[A-Za-z0-9][A-Za-z0-9_-]{0,254}$/.test(req.params.slug))return res.status(404).json({success:false,message:'Article not found'});
  try {
    const post=await BlogPost.findOne({where:{slug:req.params.slug,status:'published',publishedAt:{[sequelize.Sequelize.Op.lte]:new Date()}},include:[{model:Admin,as:'author',attributes:['name']}]});
    if(!post)return res.status(404).json({success:false,message:'Article not found'});
    return res.json({success:true,data:publicArticle(post)});
  }catch(error){console.error('SEO article unavailable');return res.status(503).json({success:false,message:'Article temporarily unavailable'});}
});
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
      where: { publishedAt: { [sequelize.Sequelize.Op.lte]: new Date() } },
      attributes: ['slug', 'updatedAt', 'publishedAt'],
      order: [['publishedAt', 'DESC']],
      limit: 2000,
    });
    const urls = [
      { loc: `${siteUrl}/`, changefreq: 'weekly', priority: '1.0' },
      { loc: `${siteUrl}/blog`, changefreq: 'daily', priority: '0.9' },
      { loc: `${siteUrl}/categories`, changefreq: 'weekly', priority: '0.8' },
      { loc: `${siteUrl}/about`, changefreq: 'monthly', priority: '0.5' },
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
      where: { publishedAt: { [sequelize.Sequelize.Op.lte]: new Date() } },
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
