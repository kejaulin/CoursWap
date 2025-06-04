const mongoose = require('mongoose');
const {Schema} = mongoose;

const userSchema = new Schema({
    googleId: String,
    accessToken: String,
    email: String,
    password: String,
    authMethod: String
});

mongoose.model('users',userSchema);