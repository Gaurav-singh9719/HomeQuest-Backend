// File: controllers/ownerController.js
const Property = require('../models/Property');
const Request = require('../models/Request');
const uploadToCloudinary = require('../utils/cloudinary');
// 🟢 Add new property
exports.addProperty = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can add properties' });
    }

    const { title, description, address, price } = req.body;

    let imageUrl = null;
    if (req.file) {
      // Upload image buffer to cloudinary
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const property = new Property({
      title,
      description,
      address,
      price,
      owner: req.user._id,
      images: imageUrl ? [imageUrl] : [],
    });

    await property.save();

    return res.status(201).json({
      message: 'Property added successfully',
      property,
    });
  } catch (err) {
    console.error('addProperty error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// 🟢 Get owner properties + tenant requests
exports.getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .populate({
        path: "requests",
        populate: { path: "tenant", select: "name email" }, // tenant details bhi lao
      });

    res.status(200).json(properties);
  } catch (err) {
    console.error("getOwnerProperties error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Accept/Reject tenant request
exports.handleRequest = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can manage requests' });
    }

    const { requestId, action } = req.body; // action: 'accepted' | 'rejected'
    if (!requestId || !['accepted', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid requestId or action' });
    }

    const request = await Request.findById(requestId)
      .populate('property')
      .populate('tenant', 'name email');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.property.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: `Request already ${request.status}` });
    }

    request.status = action;
    await request.save();

    return res.status(200).json({ message: 'Request updated successfully', request });
  } catch (err) {
    console.error('handleRequest error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
