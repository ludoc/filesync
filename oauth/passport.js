module.exports = function(passport) {

  var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  var privateKey = require('./private-key');
  var Student = require('./student');

  // used to serialize the user for the session
  passport.serializeUser(function(user, done) {
      done(null, user.id);
  });

  // used to deserialize the user
  passport.deserializeUser(function(id, done) {
    done(null, Student.get(id));
  });

  passport.use(new GoogleStrategy({
    clientID: privateKey.googleOauth.clientID,
    clientSecret: privateKey.googleOauth.clientSecret,
    callbackURL: privateKey.googleOauth.callbackURL
  },
  function(token, tokenSecret, profile, done) {

    //console.log(profil)
    process.nextTick(function() {
      var st = new Student(profile.id, token, profile.emails[0].value, profile.displayName);
      return done(null,st);

  });
  }
));

};
