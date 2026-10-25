const express = require('express');
const rateLimit = require('express-rate-limit');
const { Op } = require('sequelize');
const { CommunityProfile, Collection, CollectionItem, ProfileFollow, Website } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();
const mutationLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false });

const clean = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const owner = (req) => ({ ownerId: req.user.id, ownerType: req.user.role === 'admin' ? 'admin' : 'user' });
const publicProfile = (profile, followerCount = 0) => ({
  id: profile.id, handle: profile.handle, displayName: profile.displayName,
  bio: profile.bio, avatarUrl: profile.avatarUrl, isPublic: profile.isPublic,
  followerCount,
});

async function findProfileByHandle(handle) {
  return CommunityProfile.findOne({ where: { handle: clean(handle, 40).toLowerCase(), isPublic: true } });
}

router.get('/profiles/:handle', async (req, res, next) => {
  try {
    const profile = await findProfileByHandle(req.params.handle);
    if (!profile) return res.status(404).json({ success: false, message: 'Public profile not found' });
    const followerCount = await ProfileFollow.count({ where: { followingId: profile.ownerId, followingType: profile.ownerType } });
    const collections = await Collection.findAll({ where: { ownerId: profile.ownerId, ownerType: profile.ownerType, isPublic: true }, order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: { profile: publicProfile(profile, followerCount), collections } });
  } catch (error) { next(error); }
});

router.get('/collections/:id', async (req, res, next) => {
  try {
    const collection = await Collection.findByPk(req.params.id, {
      include: [{ model: CollectionItem, as: 'items', include: [{ model: Website, as: 'website', attributes: ['id', 'name', 'url', 'description', 'logo', 'screenshot', 'categoryId', 'tags'] }] }],
    });
    if (!collection || !collection.isPublic) return res.status(404).json({ success: false, message: 'Public collection not found' });
    res.json({ success: true, data: collection });
  } catch (error) { next(error); }
});

router.use(protect);

router.get('/me', async (req, res, next) => {
  try {
    const key = owner(req);
    let profile = await CommunityProfile.findOne({ where: key });
    if (!profile) {
      const displayName = clean(req.user.name || req.user.firstName || 'FindTheWeb member', 100) || 'FindTheWeb member';
      const base = clean(req.user.name || req.user.firstName || 'member', 40).toLowerCase() || 'member';
      const handle = `${base.replace(/[^a-z0-9]+/g, '-')}-${String(req.user.id).slice(0, 6)}`;
      profile = await CommunityProfile.create({ ...key, handle, displayName });
    }
    const followerCount = await ProfileFollow.count({ where: { followingId: profile.ownerId, followingType: profile.ownerType } });
    const followingCount = await ProfileFollow.count({ where: { followerId: profile.ownerId, followerType: profile.ownerType } });
    res.json({ success: true, data: { profile: publicProfile(profile, followerCount), followingCount } });
  } catch (error) { next(error); }
});

router.patch('/me', mutationLimit, async (req, res, next) => {
  try {
    const key = owner(req);
    const profile = await CommunityProfile.findOne({ where: key });
    if (!profile) return res.status(404).json({ success: false, message: 'Create your profile first with GET /me' });
    const updates = {};
    if (req.body.handle !== undefined) updates.handle = clean(req.body.handle, 40);
    if (req.body.displayName !== undefined) updates.displayName = clean(req.body.displayName, 100);
    if (req.body.bio !== undefined) updates.bio = clean(req.body.bio, 280);
    if (req.body.avatarUrl !== undefined) updates.avatarUrl = clean(req.body.avatarUrl, 500) || null;
    if (req.body.isPublic !== undefined) updates.isPublic = Boolean(req.body.isPublic);
    await profile.update(updates);
    res.json({ success: true, data: publicProfile(profile) });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ success: false, message: 'That handle is already in use' });
    next(error);
  }
});

router.get('/collections', async (req, res, next) => {
  try {
    const collections = await Collection.findAll({ where: owner(req), order: [['updatedAt', 'DESC']] });
    res.json({ success: true, data: collections });
  } catch (error) { next(error); }
});

router.post('/collections', mutationLimit, async (req, res, next) => {
  try {
    const name = clean(req.body.name, 120);
    if (!name) return res.status(400).json({ success: false, message: 'Collection name is required' });
    const collection = await Collection.create({ ...owner(req), name, description: clean(req.body.description, 500), isPublic: req.body.isPublic !== false });
    res.status(201).json({ success: true, data: collection });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ success: false, message: 'You already have a collection with that name' });
    next(error);
  }
});

router.patch('/collections/:id', mutationLimit, async (req, res, next) => {
  try {
    const collection = await Collection.findOne({ where: { id: req.params.id, ...owner(req) } });
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
    await collection.update({
      ...(req.body.name !== undefined ? { name: clean(req.body.name, 120) } : {}),
      ...(req.body.description !== undefined ? { description: clean(req.body.description, 500) } : {}),
      ...(req.body.isPublic !== undefined ? { isPublic: Boolean(req.body.isPublic) } : {}),
    });
    res.json({ success: true, data: collection });
  } catch (error) { next(error); }
});

router.delete('/collections/:id', mutationLimit, async (req, res, next) => {
  try {
    const collection = await Collection.findOne({ where: { id: req.params.id, ...owner(req) } });
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
    await collection.destroy();
    res.status(204).send();
  } catch (error) { next(error); }
});

router.post('/collections/:id/items', mutationLimit, async (req, res, next) => {
  try {
    const collection = await Collection.findOne({ where: { id: req.params.id, ...owner(req) } });
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
    const website = await Website.findOne({ where: { id: req.body.websiteId, status: 'active' } });
    if (!website) return res.status(404).json({ success: false, message: 'Active website not found' });
    const item = await CollectionItem.create({ collectionId: collection.id, websiteId: website.id, note: clean(req.body.note, 280), position: Number.isInteger(req.body.position) ? req.body.position : 0 });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ success: false, message: 'Website is already in this collection' });
    next(error);
  }
});

router.delete('/collections/:id/items/:websiteId', mutationLimit, async (req, res, next) => {
  try {
    const collection = await Collection.findOne({ where: { id: req.params.id, ...owner(req) } });
    if (!collection) return res.status(404).json({ success: false, message: 'Collection not found' });
    const deleted = await CollectionItem.destroy({ where: { collectionId: collection.id, websiteId: req.params.websiteId } });
    if (!deleted) return res.status(404).json({ success: false, message: 'Collection item not found' });
    res.status(204).send();
  } catch (error) { next(error); }
});

router.post('/profiles/:handle/follow', mutationLimit, async (req, res, next) => {
  try {
    const target = await findProfileByHandle(req.params.handle);
    if (!target) return res.status(404).json({ success: false, message: 'Public profile not found' });
    const me = owner(req);
    if (target.ownerId === me.ownerId && target.ownerType === me.ownerType) return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    await ProfileFollow.findOrCreate({ where: { followerId: me.ownerId, followerType: me.ownerType, followingId: target.ownerId, followingType: target.ownerType } });
    res.status(204).send();
  } catch (error) { next(error); }
});

router.delete('/profiles/:handle/follow', mutationLimit, async (req, res, next) => {
  try {
    const target = await findProfileByHandle(req.params.handle);
    if (!target) return res.status(404).json({ success: false, message: 'Public profile not found' });
    await ProfileFollow.destroy({ where: { ...owner(req), followingId: target.ownerId, followingType: target.ownerType } });
    res.status(204).send();
  } catch (error) { next(error); }
});

module.exports = router;
