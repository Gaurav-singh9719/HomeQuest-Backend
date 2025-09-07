// File: routes/tenantRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  exploreProperties,
  applyForProperty,
  getTenantApplications,
} = require('../controllers/tenantController');

// 🟢 Explore all properties (public)
router.get('/explore', exploreProperties);

// 🟢 Apply for a property (only tenant)
router.post('/apply', auth, applyForProperty);

// 🟢 Get all tenant’s applications with status
router.get('/applications', auth, getTenantApplications);

module.exports = router;
