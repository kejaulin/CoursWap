const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    googleId: String,
    accessToken: String,
    refreshToken: String, // long-live, used to get new access token
    email: String,
    password: String,
    authMethod: String,
    nom: String, 
    role: { type: String, enum: ['etudiant', 'professeur'] }, 
    matiere: String, 
    disponibilites: Array, 
    photo: String, 
    meetingLocations: [{key:String, location: { lat: Number, lng: Number }}], 
});

module.exports = mongoose.model('users',userSchema);
