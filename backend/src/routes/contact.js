const express = require('express');
const rateLimit = require('express-rate-limit');
const { ContactMessage } = require('../models');
const { authenticateAdmin } = require('../middleware/auth');
const router = express.Router();
const limit = rateLimit({windowMs: 3600000, max: 5, standardHeaders: true, legacyHeaders: false,
  message: {success:false,message:'Too many messages. Please try again later.'}});
router.post('/', limit, async (req, res) => {
  const input = req.body || {};
  const lengths = {name:100,email:254,subject:200,message:10000};
  if (input._honey) return res.status(400).json({success:false,message:'Unable to accept this message.'});
  const data = {};
  for (const [key,max] of Object.entries(lengths)) {
    if (typeof input[key] !== 'string' || !input[key].trim() || input[key].trim().length > max) {
      return res.status(400).json({success:false,message:`Please provide a valid ${key} (maximum ${max} characters).`});
    }
    data[key] = input[key].trim();
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || /[\r\n]/.test(data.name + data.email + data.subject)) {
    return res.status(400).json({success:false,message:'Please provide a valid name, email and subject.'});
  }
  try {
    const saved = await ContactMessage.create(data);
    res.status(201).json({success:true,reference:saved.id,message:'Your message is saved in our support inbox.'});
  } catch (_) {
    res.status(503).json({success:false,message:'Unable to save your message. Please try again.'});
  }
});
router.get('/messages', authenticateAdmin, async (req,res) => {
  res.set('Cache-Control','no-store');
  const page = Math.max(1,Number.parseInt(req.query.page,10)||1);
  const size = 20;
  try {
    const result = await ContactMessage.findAndCountAll({order:[['createdAt','DESC'],['id','ASC']],limit:size,offset:(page-1)*size});
    res.json({success:true,data:result.rows,pagination:{page,pages:Math.ceil(result.count/size),total:result.count}});
  } catch (_) { res.status(503).json({success:false,message:'Unable to load messages.'}); }
});
router.put('/messages/:id', authenticateAdmin, async (req,res) => {
  res.set('Cache-Control','no-store');
  if (!['new','read'].includes(req.body?.status)) return res.status(400).json({success:false,message:'Invalid status.'});
  try {
    const message = await ContactMessage.findByPk(req.params.id);
    if (!message) return res.status(404).json({success:false,message:'Message not found.'});
    await message.update({status:req.body.status});
    res.json({success:true});
  } catch (_) { res.status(503).json({success:false,message:'Unable to update message.'}); }
});
module.exports = router;
