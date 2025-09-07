// File: src/routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { 
  createProperty, 
  deleteProperty, 
  getAllProperties, 
  getPropertyById 
} = require('../controllers/propertyController');

router.post('/', auth, upload.array('images', 5), createProperty);

router.delete('/:id', auth, deleteProperty);

router.get('/', getAllProperties);

router.get('/:id', getPropertyById);

module.exports = router;
