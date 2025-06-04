const passport = require('passport');

exports.googleAuthenticate = (req,res,next) =>{
    try{
        passport.authenticate('google', {
            scope: ['profile', 'email']
        })(req, res, next);
    } catch (err){
        next(err);
        res.status(500).json({ error: err.message });   
    }
}

exports.googleCallback = (req,res,next) =>{
    try{
        passport.authenticate('google',{
            failureRedirect:'/auth/google',
            successRedirect:'http://localhost:3000'})(req, res, next);
    } catch (err){
        next(err);
        res.status(500).json({ error: err.message });   
    }
}

exports.userLogout = (req,res) =>{
    try{
        req.logout()
        res.send(req.user);
    } catch (err){
        res.status(500).json({ error: err.message });   
    }
}

exports.getCurrentUser = (req,res) =>{
    try{
        res.send(req.user || {});
    } catch (err){
        res.status(500).json({ error: err.message });   
    }
}