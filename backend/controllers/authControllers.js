const passport = require('passport');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = mongoose.model('users');

const authService = require('../services/authService');
const App = require('../models/App');

exports.googleAuthenticate = (req,res,next) =>{
    try{
        console.log('Google authentication initiated');
        passport.authenticate('google', {
            scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar','https://www.googleapis.com/auth/forms.body'],
            accessType: 'offline',
            prompt: 'consent'
        })(req, res, next);
    } catch (err){
        next(err);
        return res.status(500).json({ error: err.message });   
    }
}

exports.googleCallback = (req,res,next) =>{
    try{
        passport.authenticate('google',{
            failureRedirect:'/auth/google',
            successRedirect:'http://localhost:3000'})(req, res, next);
    } catch (err){
        next(err);
        return res.status(500).json({ error: err.message });   
    }
}

exports.userRegister = async (req,res) =>{
    try{
        const {email,password} = req.body;
        const userInfos = await User.findOne({email});
        if(userInfos) return res.status(400).send({message:'Impossible de créer l\'utilisateur'});

        const hashedPassword = await bcrypt.hash(password,10);
        const user = await User.create({email,password:hashedPassword,authMethod:'local',role:'etudiant'});
        //Souscription à la token API
        await authService.subscribeToTokenAPI(user,req.appTokenApiKey);
        req.logIn(user, err => {
            if(err) return res.status(500).send('Erreur de session');
            res.send({success: true});
        });
    } catch (err){
        return res.status(500).json({ error: err.message });   
    }
}

exports.userLocalLogin = (req,res,next) => {
 try{
    passport.authenticate('local',(err,user,info)=>{
        if(err) return next(err);
        if(!user) return res.status(401).send(info);

        req.logIn(user, err => {
            if (err) return next(err);
            return res.send({ message: 'Login successful', user });
        });
    })(req, res, next);
 }catch (err){
    return res.status(500).json({ error: err.message });
 } 
}
    
exports.userLogout = (req,res) =>{
  try {
    req.logout(() => {
      req.session.destroy(() => {
        res.redirect('/');
      });
    });
    res.send(req.user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

exports.getCurrentUser = (req,res) =>{
    try{
        res.send(req.user || {});
    } catch (err){
        return res.status(500).json({ error: err.message });   
    }
}

exports.getAppInfos = async (req,res) => {
    try{
        const appInfos = await App.find();
        res.send(appInfos);
    } catch (err){
        return res.status(500).json({ error: err.message });   
    }
}

exports.getProfessors = async (req, res) => {
    try {
        const professors = await User.find({ role: 'professeur' }).select('name email _id');
        res.json(professors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}