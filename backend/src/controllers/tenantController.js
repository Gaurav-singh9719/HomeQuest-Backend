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

// 🟢 Apply for a property
exports.applyForProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    // Prevent tenant from applying to own property
    if (property.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot apply to your own property' });
    }

    const existingRequest = await Request.findOne({
      property: propertyId,
      tenant: req.user._id,
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'You have already applied for this property' });
    }

    const request = new Request({
      property: propertyId,
      tenant: req.user._id,
      status: 'pending',
    });

    await request.save();

    property.requests.push(request._id);
    await property.save();

    res.status(201).json({ message: 'Applied successfully', request });
  } catch (err) {
    console.error('applyForProperty error:', err);
    res.status(500).json({ message: 'Server error' });
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
