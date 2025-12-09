const Property = require('../models/Property');
const Request = require('../models/Request');

// Explore properties
exports.exploreProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('owner', 'name email');
    res.status(200).json(properties);
  } catch (err) {
    console.error('exploreProperties error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Apply for property - ULTRA CLEAN
exports.applyForProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;
    
    console.log('🔍 PropertyId:', propertyId);
    console.log('🔍 UserId:', req.user?._id);

    // Validation
    if (!propertyId) return res.status(400).json({ message: 'Property ID required' });
    if (!req.user?._id) return res.status(401).json({ message: 'Login required' });

    // Find property
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Check owner
    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot apply to own property' });
    }

    // Check existing request
    const existingRequest = await Request.findOne({
      property: propertyId,
      tenant: req.user._id
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'Already applied' });
    }

    // Create request
    const request = new Request({
      property: propertyId,
      tenant: req.user._id,
      status: 'pending'
    });
    await request.save();

    // Update property
    property.requests.push(request._id);
    await property.save();

    console.log('✅ SUCCESS - Request created');
    res.status(201).json({ message: 'Applied successfully' });

  } catch (error) {
    console.error('🚨 ERROR:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get applications
exports.getTenantApplications = async (req, res) => {
  try {
    const requests = await Request.find({ tenant: req.user._id })
      .populate('property', 'title address price images');
    res.status(200).json(requests);
  } catch (err) {
    console.error('getTenantApplications error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
