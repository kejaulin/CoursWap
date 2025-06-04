const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = mongoose.model('users');

passport.use('local',
    new LocalStrategy(
      {
        usernameField:'email',
        passwordField:'password',
      },
      async (email,password,done) => {
        const userInfos = await User.findOne({email});
        if(!userInfos) {
            return done(null,false, {message:'Utilisateur ou mot de passe incorrect'});
        }
            
        const validPassword = await bcrypt.compare(password,userInfos.password);
        if(!validPassword) return done(null,false, {message:'Utilisateur ou mot de passe incorrect'});
        return done(null,userInfos);
      }
    )
);