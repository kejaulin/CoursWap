const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    googleId: String,
    accessToken: String,
    refreshToken: String, // long-live, used to get new access token
    email: String,
    password: String,
    authMethod: String
});

mongoose.model('users',userSchema);