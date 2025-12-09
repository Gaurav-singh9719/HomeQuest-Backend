// File: controllers/tenantController.js - 100% CLEAN
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

// 🟢 Apply for a property - BULLETPROOF
exports.applyForProperty = async (req, res) => {
  try {
    console.log('🔍 applyForProperty START');
    console.log('🔍 req.body:', req.body);
    console.log('🔍 req.user._id:', req.user?._id);

    const { propertyId } = req.body;

    // SINGLE VALIDATION
    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID required' });
    }
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User authentication required' });
    }

    // SINGLE Property.findById - NO .lean()
    const property = await Property.findById(propertyId);
    if (!property) {
      console.log('❌ Property not found:', propertyId);
      return res.status(404).json({ message: 'Property not found' });
    }

    // SAFE ObjectId comparison
    const userIdStr = req.user._id.toString();
    const ownerIdStr = property.owner.toString();
    console.log('🔍 Owner check:', { userId: userIdStr, ownerId: ownerIdStr });

    if (ownerIdStr === userIdStr) {
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

    // Create request
    const request = new Request({
      property: propertyId,
      tenant: req.user._id,
      status: 'pending',
    });
    await request.save();
    console.log('✅ Request created:', request._id);

    // Update property
    await Property.findByIdAndUpdate(propertyId, {
      $push: { requests: request._id }
    });
    console.log('✅ Property updated');

    // SINGLE Response
    res.status(201).json({ 
      message: 'Applied successfully',
      requestId: request._id
    });

  } catch (err) {
    console.error('❌ applyForProperty ERROR:', err.message);
    console.error('❌ Stack trace:', err.stack);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🟢 Get tenant's applications
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
