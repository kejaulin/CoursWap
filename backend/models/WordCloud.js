const mongoose = require('mongoose');

const wordCloudSchema = new mongoose.Schema({
    image: {
        type: String, // base64-encoded image
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('wordClouds', wordCloudSchema);
