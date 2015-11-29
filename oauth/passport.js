module.exports = function(passport) {

  var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  var privateKey = require('./private-key')


  passport.use(new GoogleStrategy({
    clientID: privateKey.googleOauth.clientID,
    clientSecret: privateKey.googleOauth.clientSecret,
    callbackURL: privateKey.googleOauth.callbackURL
  },
  function(token, tokenSecret, profile, done) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
};
