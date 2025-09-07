const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  price: { type: Number, required: true },
  images: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Request' }]
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
