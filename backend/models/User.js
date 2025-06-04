const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    googleId: String,
    accessToken: String
});

mongoose.model('users',userSchema);