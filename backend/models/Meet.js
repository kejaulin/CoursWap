const mongoose = require('mongoose');

const meetSchema = new mongoose.Schema({
    summary: String,
    startDateTime: Date,
    endDateTime: Date,
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
})

module.exports = mongoose.model('meetings', meetSchema);