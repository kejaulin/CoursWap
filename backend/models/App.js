const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
    name: String,
    tokenAPIKey: String
})

module.exports = mongoose.model('apps', appSchema);