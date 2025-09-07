// File: routes/ownerRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  addProperty,
  getOwnerProperties,
  handleRequest,
} = require('../controllers/ownerController');

// 🟢 Add new property (only owner)
router.post('/add-property', auth, upload.single("image"), addProperty);

// 🟢 Get owner’s properties with tenant requests
router.get('/properties', auth, getOwnerProperties);

// 🟢 Accept/Reject tenant request
router.post('/handle-request', auth, handleRequest);

module.exports = router;
