module.exports = function(app, passport) {

  app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
  app.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect : '/',
    failureRedirect : '/login'
  }));

  app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
  app.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect : '/',
    failureRedirect : '/login'
  }));
  app.get('/auth/twitter', passport.authenticate('twitter'));
  app.get('/auth/twitter/callback',
  passport.authenticate('twitter', {
    successRedirect : '/',
    failureRedirect : '/login'
  }));

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
  });
  app.get('/ludo', function(req, res){
    console.log(req.user);
  });

  app.get('/login', function(req, res) {
    var path = require('path');
    res.sendFile(path.resolve('public/login.html'));
  });

};
