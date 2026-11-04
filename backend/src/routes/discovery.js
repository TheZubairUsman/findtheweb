const express = require('express');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const { Website, Category, WebsiteFeedback } = require('../models');

const router = express.Router();
const legacyWebsitesFile = path.join(__dirname, '../../data/websites.json');
const legacyCategoriesFile = path.join(__dirname, '../../data/categories.json');
const productKnowledgeFile = path.join(__dirname, '../../data/product-knowledge.json');

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

const asCleanString = (value, max = 240) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const asStringList = (value, maxItems = 8, maxLength = 160) => Array.isArray(value)
  ? value.map((item) => asCleanString(item, maxLength)).filter(Boolean).slice(0, maxItems)
  : [];

// Product knowledge is stored in the existing metadata JSON column so this MVP
// can ship without a destructive schema migration. Only the allowlisted shape
// is exposed publicly; arbitrary metadata remains private to admins.
const readProductKnowledge = () => {
  try {
    const parsed = JSON.parse(fs.readFileSync(productKnowledgeFile, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
};
const productKnowledgeCatalog = readProductKnowledge();

const toProductKnowledge = (metadata, websiteId, websiteUrl) => {
  const catalog = productKnowledgeCatalog;
  const legacyId = legacyIdByUrl.get(String(websiteUrl || '').toLowerCase());
  const curated = catalog[String(websiteId)] || catalog[String(legacyId)] || {};
  const product = metadata && typeof metadata === 'object' && metadata.product && typeof metadata.product === 'object'
    ? { ...curated, ...metadata.product }
    : curated;
  const pricing = product.pricing && typeof product.pricing === 'object' ? product.pricing : {};
  const privacy = product.privacy && typeof product.privacy === 'object' ? product.privacy : {};
  const alternatives = Array.isArray(product.alternatives)
    ? product.alternatives.slice(0, 6).map((item) => ({
      name: asCleanString(item?.name, 120),
      reason: asCleanString(item?.reason, 240),
      url: asCleanString(item?.url, 500),
    })).filter((item) => item.name)
    : [];

  return {
    problem: asCleanString(product.problem, 500),
    audience: asCleanString(product.audience, 240),
    bestFor: asStringList(product.bestFor),
    notFor: asStringList(product.notFor),
    useCases: asStringList(product.useCases, 10, 200),
    pricing: {
      model: asCleanString(pricing.model, 80),
      summary: asCleanString(pricing.summary, 240),
      startingAt: asCleanString(pricing.startingAt, 80),
    },
    privacy: {
      dataCollection: asCleanString(privacy.dataCollection, 240),
      securityNotes: asCleanString(privacy.securityNotes, 500),
    },
    alternatives,
    lastVerifiedAt: asCleanString(product.lastVerifiedAt, 40),
    verificationSources: asStringList(product.verificationSources, 5, 500),
    articleSlugs: asStringList(Array.isArray(product.articleSlugs) && product.articleSlugs.length
      ? product.articleSlugs : curated.articleSlugs, 8, 160),
  };
};

const toPublicWebsite = (website) => {
  const value = website.toJSON ? website.toJSON() : website;
  const result = publicFields.reduce((output, field) => {
    if (value[field] !== undefined) output[field] = value[field];
    return output;
  }, {});
  if (value.metadata?.submittedCategory) {
    result.categoryId = value.metadata.submittedCategory.id;
    result.category = value.metadata.submittedCategory.name;
  }
  result.product = toProductKnowledge(value.metadata, value.id, value.url);
  return result;
};

const readLegacyWebsites = () => {
  try {
    const parsed = JSON.parse(fs.readFileSync(legacyWebsitesFile, 'utf8'));
    return Array.isArray(parsed) ? parsed.filter((item) => {
      if (!item || !item.id || typeof item.name !== 'string' || !item.name.trim() || typeof item.url !== 'string') return false;
      try { return ['http:', 'https:'].includes(new URL(item.url).protocol); } catch (_) { return false; }
    }) : [];
  } catch (_) {
    return [];
  }
};

const readLegacyCategories = () => {
  try {
    const parsed = JSON.parse(fs.readFileSync(legacyCategoriesFile, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
};
const legacyIdByUrl = new Map();
const curatedIds = productKnowledgeCatalog;
for (const item of readLegacyWebsites()) {
  const url = item.url.toLowerCase();
  if (!legacyIdByUrl.has(url) && curatedIds[String(item.id)]) legacyIdByUrl.set(url, item.id);
}

// Editorial links are explicit, not inferred from article keywords. Never
// return a pending listing or expose arbitrary metadata from the catalog.
router.get('/related/articles/:slug', async (req, res) => {
  try {
    const slug = String(req.params.slug || '').slice(0, 160);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return res.status(400).json({ success: false, message: 'Invalid article slug' });
    }
    const db = await Website.findAll({ where: { status: 'active' }, attributes: [...publicFields, 'metadata'] });
    const listed = new Map();
    for (const item of readLegacyWebsites()) {
      if (!item.status || item.status === 'active') listed.set(item.url.toLowerCase(), item);
    }
    for (const row of db) {
      const item = row.toJSON();
      if (item.url) listed.set(item.url.toLowerCase(), item);
    }
    const matches = [...listed.values()]
      .filter((item) => toProductKnowledge(item.metadata, item.id, item.url).articleSlugs.includes(slug))
      .slice(0, 6)
      .map((item) => ({ id: item.id, name: item.name, description: asCleanString(item.description, 240) }));
    return res.json({ success: true, data: matches });
  } catch (error) {
    console.error('Related discovery error:', error);
    return res.status(500).json({ success: false, message: 'Unable to load related websites' });
  }
});

// Read-only discovery feed. Only moderated, active directory entries are public.
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(30, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
    const search = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
    const tier = typeof req.query.tier === 'string' ? req.query.tier.trim() : '';
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId.trim().slice(0, 80) : '';
    const sort = ['newest', 'trending', 'popular'].includes(req.query.sort) ? req.query.sort : 'newest';

    // The database and export coexist until the directory backfill is done.
    // A first approved submission must not make the old directory disappear.
    const db = await Website.findAll({ where: { status: 'active' }, attributes: [...publicFields, 'metadata'] });
    const items = new Map();
    const categoriesByUrl = new Map();
    for (const legacy of readLegacyWebsites()) {
      if (!legacy.status || legacy.status === 'active') {
        const url = legacy.url.toLowerCase();
        items.set(url, legacy);
        if (legacy.categoryId != null) {
          if (!categoriesByUrl.has(url)) categoriesByUrl.set(url, new Set());
          categoriesByUrl.get(url).add(String(legacy.categoryId));
        }
      }
    }
    for (const row of db) {
      const value = row.toJSON();
      if (value.url) items.set(value.url.toLowerCase(), value);
    }
    const needle = search.toLowerCase();
    const matches = [...items.values()].filter((item) =>
      (!tier || item.tier === tier)
      && (!categoryId || String(item.metadata?.submittedCategory?.id ?? item.categoryId) === categoryId
        || categoriesByUrl.get(String(item.url || '').toLowerCase())?.has(categoryId))
      && (!needle || `${item.name || ''} ${item.description || ''}`.toLowerCase().includes(needle)));
    const score = (item) => sort === 'trending' ? Number(item.weeklyHits || 0)
      : sort === 'popular' ? Number(item.totalHits || 0) : new Date(item.createdAt || 0).getTime() || 0;
    matches.sort((a, b) => score(b) - score(a) || String(a.name).localeCompare(String(b.name)));
    const total = matches.length;
    res.json({
      success: true,
      data: matches.slice((page - 1) * limit, page * limit).map(toPublicWebsite),
      pagination: {
        page,
        limit,
        total,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
      discovery: {
        sort,
        source: db.length ? 'combined-directory' : 'legacy-directory-export',
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
      // Metadata is read only to build the allowlisted product shape below;
      // it is never returned as a raw public field.
      attributes: [...publicFields, 'metadata'],
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'], required: false }],
    });
    if (!website) {
      // The directory is still being migrated from the legacy export. Keep
      // detail links working for those public IDs until the DB backfill lands.
      const legacy = readLegacyWebsites().find((item) => String(item.id) === String(req.params.id));
      if (!legacy || (legacy.status && legacy.status !== 'active')) {
        return res.status(404).json({ success: false, message: 'Discovery item not found' });
      }
      return res.json({ success: true, data: toPublicWebsite(legacy), discovery: { source: 'legacy-directory-export' } });
    }
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
    const { name, url, description, categoryId, submitterEmail, company } = req.body || {};
    // Keep the public form bot-resistant without exposing whether a request
    // was rejected by the honeypot. Legitimate clients never fill `company`.
    if (typeof company === 'string' && company.trim()) {
      return res.status(400).json({ success: false, message: 'Unable to receive submission' });
    }
    if (!name || String(name).trim().length < 3 || String(name).trim().length > 100) {
      return res.status(400).json({ success: false, message: 'Name must be between 3 and 100 characters' });
    }
    if (!description || String(description).trim().length < 10 || String(description).trim().length > 5000) {
      return res.status(400).json({ success: false, message: 'Description must be between 10 and 5000 characters' });
    }
    const websiteUrl = String(url || '').trim();
    let parsedUrl;
    try {
      parsedUrl = new URL(websiteUrl);
    } catch (_) {
      parsedUrl = null;
    }
    if (!parsedUrl || !['http:', 'https:'].includes(parsedUrl.protocol) || !parsedUrl.hostname || websiteUrl.length > 500) {
      return res.status(400).json({ success: false, message: 'A valid http or https URL is required' });
    }
    if (!categoryId || !String(categoryId).trim()) {
      return res.status(400).json({ success: false, message: 'A valid categoryId is required' });
    }
    if (submitterEmail && !/^\S+@\S+\.\S+$/.test(String(submitterEmail))) {
      return res.status(400).json({ success: false, message: 'submitterEmail must be a valid email' });
    }

    // The public category selector currently uses the directory export's
    // numeric IDs. Resolve them to the corresponding database UUID if the
    // category has been backfilled, while preserving the export ID for filters.
    const legacyCategory = readLegacyCategories().find((item) => String(item.id) === String(categoryId));
    const dbCategory = legacyCategory
      ? await Category.findOne({ where: { slug: legacyCategory.slug } })
      : await Category.findByPk(String(categoryId));
    if (!legacyCategory && !dbCategory) {
      return res.status(400).json({ success: false, message: 'Choose a valid category' });
    }

    const website = await Website.create({
      name: String(name).trim(),
      url: websiteUrl,
      description: String(description).trim(),
      categoryId: dbCategory ? dbCategory.id : null,
      metadata: legacyCategory ? { submittedCategory: {
        id: legacyCategory.id, name: legacyCategory.name, slug: legacyCategory.slug,
      } } : {},
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
