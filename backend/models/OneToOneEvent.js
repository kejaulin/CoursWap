const mongoose = require('mongoose');
const { Schema } = mongoose;

const oneToOneEventSchema = new Schema({
    etudiantId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    profId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    oneToOneEventId: { type: String, required: true },
    date: { type: Date, required: true },
    heure: { type: String, required: true }, 
    mode: { type: String, enum: ['visio', 'présentiel'], required: true },
    meetingLocations: [{key:String, location: { lat: Number, lng: Number }}], 
    createdAt: { type: Date, default: Date.now },

    });

module.exports = mongoose.model('OneToOneEvents', oneToOneEventSchema);