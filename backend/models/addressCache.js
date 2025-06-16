const mongoose = require('mongoose');

const geocodeCacheSchema = new mongoose.Schema({
  originalAddress: { type: String, required: true, unique: true },
  formattedAddress: { type: String, required: true, unique: true },
  lat: Number,
  lng: Number,
  streetNumber: String,
  route: String,
  postalCode: String,
  city: String,
  region: String,
  country: String,
});

module.exports = mongoose.model('geocodecaches', geocodeCacheSchema);