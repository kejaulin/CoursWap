const mongoose = require('mongoose');

const meetSchema = new mongoose.Schema({
    summary: String,
    matiere: String,
    startDateTime: Date,
    endDateTime: Date,
    imageUrl: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    hangoutLink: {
        type: String,
        required: true
    },
    eventId: {
        type: String,
        required: true
    },
    rejoinCost: {
        type: Number,
        required: true
    },    
    originalCost: {
        type: Number,
        required: true
    },  
    participants: [], 
    keywords: String,
})

module.exports = mongoose.model('meetings', meetSchema);