// File: src/controllers/propertyController.js
const Property = require('../models/Property');
const Request = require('../models/Request'); 
const uploadToCloudinary = require('../utils/cloudinary');

const createProperty = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can create properties' });
    }

    const { title, description, address, price } = req.body;

    if (!title || !address || !price) {
      return res.status(400).json({ message: 'title, address and price are required' });
    }

    const numericPrice = Number(price);
    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ message: 'price must be a positive number' });
    }

    let images = [];
    if (req.files && req.files.length > 0) {
      const uploads = req.files.map((file) => uploadToCloudinary(file.buffer));
      images = await Promise.all(uploads);
    }

    const property = await Property.create({
      title,
      description,
      address,
      price: numericPrice,
      images,
      owner: req.user._id
    });

    return res.status(201).json({ message: 'Property created successfully', property });
  } catch (err) {
    console.error('ERROR in createProperty:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};


const deleteProperty = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Only owners can delete properties' });
    }

    const { id } = req.params;
    const property = await Property.findById(id);
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Request.deleteMany({ property: property._id });

    await Property.deleteOne({ _id: property._id });

    return res.status(200).json({ message: 'Property removed successfully' });
  } catch (err) {
    console.error('deleteProperty error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate('owner', 'name email')
      .populate({
        path: 'requests',
        populate: { path: 'tenant', select: 'name email' }
      });

    return res.status(200).json(properties);
  } catch (err) {
    console.error('getAllProperties error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findById(id)
      .populate('owner', 'name email')
      .populate({
        path: 'requests',
        populate: { path: 'tenant', select: 'name email' }
      });

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    return res.status(200).json(property);
  } catch (err) {
    console.error('getPropertyById error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createProperty, deleteProperty, getAllProperties, getPropertyById };
