const mongoose = require('mongoose');
const { Schema } = mongoose;

const videoSchema = new Schema({
  title: { type: String, required: true },
  key: { type: String, required: true }, // S3 key
  url: { type: String, required: true }, // S3 url
  owner: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('videos', videoSchema);