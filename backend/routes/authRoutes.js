const passport = require('passport');


module.exports = app => {
  app.get(
    '/auth/google', passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  app.get('/auth/google/callback',
    passport.authenticate('google',{failureRedirect:'/'}),
    (req,res)=>{
        res.redirect('http://localhost:3000');
    }
  );

  app.post('/logout', (req, res) => {
    req.logout()
    res.send(req.user);
  });

  app.get('/current_user', (req, res) => {
    res.send(req.user || {});
  });
};