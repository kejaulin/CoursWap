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
    date: { type: Date, required: true },
    heure: { type: String, required: true }, 
    mode: { type: String, enum: ['visio', 'presentiel'], required: true },
    createdAt: { type: Date, default: Date.now },
    location: {type: String}
});

module.exports = mongoose.model('OneToOneEvents', oneToOneEventSchema);