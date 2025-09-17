const express = require('express');
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth');
const Report = require('../models/report');

const router = express.Router()

// auth
router.post('/authority/login',authController.loginAuthority)
router.post('/authority/register',authController.registerScientist)

// Get reports for scientists with pagination
router.get('/reports', authenticateToken, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Report.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Report.countDocuments({})
    ]);

    // Map media filenames to public paths
    const mapped = items.map((r) => ({
      _id: r._id,
      text: r.text,
      lat: r.lat,
      lon: r.lon,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      image_url: Array.isArray(r.image_url) ? r.image_url.map((f) => `/uploads/${f}`) : [],
      video_url: Array.isArray(r.video_url) ? r.video_url.map((f) => `/uploads/${f}`) : [],
    }));

    return res.json({
      data: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching reports:', err);
    return res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

module.exports = router