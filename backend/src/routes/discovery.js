const express = require('express');
const rateLimit = require('express-rate-limit');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const { Website, Category, WebsiteFeedback } = require('../models');

const router = express.Router();
const legacyWebsitesFile = path.join(__dirname, '../../data/websites.json');

const submissionLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many submissions. Please try again later.' },
});

const feedbackLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many feedback submissions. Please try again later.' },
});

const publicFields = [
  'id', 'name', 'url', 'description', 'categoryId', 'tier', 'tags',
  'logo', 'screenshot', 'totalHits', 'weeklyHits', 'featured', 'verified',
  'status', 'createdAt', 'updatedAt',
];

const toPublicWebsite = (website) => {
  const value = website.toJSON ? website.toJSON() : website;
  return publicFields.reduce((result, field) => {
    if (value[field] !== undefined) result[field] = value[field];
    return result;
  }, {});
};

const readLegacyWebsites = () => {
  try {
    const parsed = JSON.parse(fs.readFileSync(legacyWebsitesFile, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
};

// Read-only discovery feed. Only moderated, active directory entries are public.
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(30, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
    const search = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    const tier = typeof req.query.tier === 'string' ? req.query.tier.trim() : '';
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId.trim().slice(0, 80) : '';
    const sort = ['newest', 'trending', 'popular'].includes(req.query.sort) ? req.query.sort : 'newest';

    const where = { status: 'active' };
    if (tier) where.tier = tier;
    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const order = sort === 'trending'
      ? [['weeklyHits', 'DESC'], ['totalHits', 'DESC']]
      : sort === 'popular'
        ? [['totalHits', 'DESC'], ['weeklyHits', 'DESC']]
        : [['createdAt', 'DESC']];

    const result = await Website.findAndCountAll({
      where,
      attributes: publicFields,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'], required: false }],
      limit,
      offset: (page - 1) * limit,
      order,
    });

    // Directory content is still being migrated separately from the blog store.
    // Keep discovery useful without making legacy JSON a blog-content fallback.
    if (result.count === 0) {
      let legacy = readLegacyWebsites().filter((item) => item.status === 'active' || !item.status);
      if (tier) legacy = legacy.filter((item) => item.tier === tier);
      if (categoryId) legacy = legacy.filter((item) => String(item.categoryId) === categoryId);
      if (search) {
        const needle = search.toLowerCase();
        legacy = legacy.filter((item) => `${item.name || ''} ${item.description || ''}`.toLowerCase().includes(needle));
      }
      legacy.sort((a, b) => {
        const aValue = sort === 'trending' ? (a.weeklyHits || 0) : sort === 'popular' ? (a.totalHits || 0) : new Date(a.createdAt || 0).getTime();
        const bValue = sort === 'trending' ? (b.weeklyHits || 0) : sort === 'popular' ? (b.totalHits || 0) : new Date(b.createdAt || 0).getTime();
        return bValue - aValue;
      });
      const total = legacy.length;
      const data = legacy.slice((page - 1) * limit, page * limit).map(toPublicWebsite);
      return res.json({
        success: true,
        data,
        pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
        discovery: { sort, source: 'legacy-directory-export', filters: { q: search || null, tier: tier || null, categoryId: categoryId || null } },
      });
    }

    res.json({
      success: true,
      data: result.rows.map(toPublicWebsite),
      pagination: {
        page,
        limit,
        total: result.count,
        pages: Math.max(1, Math.ceil(result.count / limit)),
      },
      discovery: {
        sort,
        filters: { q: search || null, tier: tier || null, categoryId: categoryId || null },
      },
    });
  } catch (error) {
    console.error('Discovery feed error:', error);
    res.status(500).json({ success: false, message: 'Unable to load discovery feed' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const website = await Website.findOne({
      where: { id: req.params.id, status: 'active' },
      attributes: publicFields,
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'], required: false }],
    });
    if (!website) return res.status(404).json({ success: false, message: 'Discovery item not found' });
    await website.incrementHits();
    res.json({ success: true, data: toPublicWebsite(website) });
  } catch (error) {
    console.error('Discovery item error:', error);
    res.status(500).json({ success: false, message: 'Unable to load discovery item' });
  }
});

// Structured, privacy-safe feedback powers outcome-based discovery ranking.
// One feedback record per visitor and listing prevents public vote farming.
router.post('/:id/feedback', feedbackLimit, async (req, res) => {
  try {
    const { signal, triedIt = false, note } = req.body || {};
    if (!['useful', 'not_useful'].includes(signal)) {
      return res.status(400).json({ success: false, message: 'signal must be useful or not_useful' });
    }
    if (typeof triedIt !== 'boolean') {
      return res.status(400).json({ success: false, message: 'triedIt must be a boolean' });
    }
    if (note !== undefined && (typeof note !== 'string' || note.trim().length > 500)) {
      return res.status(400).json({ success: false, message: 'note must be 500 characters or fewer' });
    }

    const website = await Website.findOne({ where: { id: req.params.id, status: 'active' } });
    if (!website) return res.status(404).json({ success: false, message: 'Discovery item not found' });

    const ipHash = WebsiteFeedback.hashVisitor(req.ip || req.socket.remoteAddress);
    const [feedback, created] = await WebsiteFeedback.findOrCreate({
      where: { websiteId: website.id, ipHash },
      defaults: { signal, triedIt, note: note ? note.trim() : null },
    });
    if (!created) await feedback.update({ signal, triedIt, note: note ? note.trim() : null });

    const summary = await WebsiteFeedback.findAll({
      where: { websiteId: website.id },
      attributes: ['signal', 'triedIt'],
    });
    const counts = summary.reduce((result, item) => {
      result[item.signal] += 1;
      if (item.triedIt) result.triedIt += 1;
      return result;
    }, { useful: 0, not_useful: 0, triedIt: 0 });

    return res.status(created ? 201 : 200).json({ success: true, data: { signal, triedIt, counts } });
  } catch (error) {
    console.error('Discovery feedback error:', error);
    return res.status(400).json({ success: false, message: 'Unable to record feedback' });
  }
});

// Community submissions enter moderation; they never become public automatically.
router.post('/submissions', submissionLimit, async (req, res) => {
  try {
    const { name, url, description, categoryId, submitterEmail } = req.body || {};
    if (!name || String(name).trim().length < 3 || String(name).trim().length > 100) {
      return res.status(400).json({ success: false, message: 'Name must be between 3 and 100 characters' });
    }
    if (!description || String(description).trim().length < 10 || String(description).trim().length > 5000) {
      return res.status(400).json({ success: false, message: 'Description must be between 10 and 5000 characters' });
    }
    if (!categoryId || !String(categoryId).trim()) {
      return res.status(400).json({ success: false, message: 'A valid categoryId is required' });
    }
    if (submitterEmail && !/^\S+@\S+\.\S+$/.test(String(submitterEmail))) {
      return res.status(400).json({ success: false, message: 'submitterEmail must be a valid email' });
    }

    const website = await Website.create({
      name: String(name).trim(),
      url: String(url || '').trim(),
      description: String(description).trim(),
      categoryId: String(categoryId).trim(),
      status: 'pending',
      tier: 'standard',
      submittedBy: 'community',
      submitterEmail: submitterEmail ? String(submitterEmail).trim().toLowerCase() : null,
      totalHits: 0,
      weeklyHits: 0,
      monthlyHits: 0,
      dailyHits: 0,
      featured: false,
      verified: false,
    });

    res.status(202).json({
      success: true,
      message: 'Submission received and queued for review',
      data: { id: website.id, status: website.status },
    });
  } catch (error) {
    console.error('Discovery submission error:', error);
    const message = error.name === 'SequelizeValidationError' ? 'Please check the submitted website details' : 'Unable to receive submission';
    res.status(400).json({ success: false, message });
  }
});

module.exports = router;

