// File: controllers/tenantController.js
const Property = require('../models/Property');
const Request = require('../models/Request');

// 🟢 Explore all properties
exports.exploreProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('owner', 'name email')
      .populate({
        path: 'requests',
        populate: { path: 'tenant', select: 'name email' },
      });

    res.status(200).json(properties);
  } catch (err) {
    console.error('exploreProperties error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🟢 Apply for a property - FIXED!
exports.applyForProperty = async (req, res) => {
  try {
    console.log('🔍 applyForProperty - req.body:', req.body);
    console.log('🔍 applyForProperty - req.user:', req.user?._id);
    
    const { propertyId } = req.body;

    // VALIDATION
    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID required' });
    }
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    // ✅ FIX 1: Remove .lean() - ObjectId needs full mongoose document
    const property = await Property.findById(propertyId);
    if (!property) {
      console.log('❌ Property not found:', propertyId);
      return res.status(404).json({ message: 'Property not found' });
    }

    // ✅ FIX 2: Safe ObjectId comparison
    const userId = req.user._id.toString();
    const ownerId = property.owner._id ? property.owner._id.toString() : property.owner.toString();
    
    console.log('🔍 Owner check - userId:', userId, 'ownerId:', ownerId);

    // Prevent tenant from applying to own property
    if (ownerId === userId) {
      return res.status(400).json({ message: 'You cannot apply to your own property' });
    }

    // Check existing request
    const existingRequest = await Request.findOne({
      property: propertyId,
      tenant: req.user._id,
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'You have already applied for this property' });
    }

    // Create new request
    const request = new Request({
      property: propertyId,
      tenant: req.user._id,
      status: 'pending',
    });

    await request.save();
    console.log('✅ Request created:', request._id);

    // Update property requests array
    await Property.findByIdAndUpdate(propertyId, {
      $push: { requests: request._id }
    });

    console.log('✅ Property updated with request');
    res.status(201).json({ 
      message: 'Applied successfully', 
      request: {
        id: request._id,
        status: request.status,
        property: propertyId
      }
    });

  } catch (err) {
    console.error('❌ applyForProperty FULL ERROR:', err);
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
};

// 🟢 Get tenant's applications with status
exports.getTenantApplications = async (req, res) => {
  try {
    const requests = await Request.find({ tenant: req.user._id })
      .populate('property', 'title address price images owner');
    res.status(200).json(requests);
  } catch (err) {
    console.error('getTenantApplications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
