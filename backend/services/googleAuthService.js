const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
require('dotenv').config();

const App = require('../models/App');
const authService = require('./authService');
const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
      callbackURL: '/auth/google/callback',
      accessType: 'offline',
      prompt: 'consent',
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = await new User({
          googleId: profile.id,
          accessToken,
          refreshToken,
          authMethod: 'google',
          email: profile.emails[0].value,
        }).save();

        const app = await App.findOne({ name: 'CoursWapFreddy' }).select({ tokenAPIKey: 1, _id: 0 });

        if (app) {
          await authService.subscribeToTokenAPI(newUser, app.tokenAPIKey);
        }

        done(null, newUser);
      } catch (err) {
        done(err, null);
      }
    }
  )
);