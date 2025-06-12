const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_2024';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI
},
function(accessToken, refreshToken, profile, cb) {
    console.log('Google Strategy - Profile:', profile);
    const token = jwt.sign(
        { 
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
    return cb(null, { profile, token });
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport; 