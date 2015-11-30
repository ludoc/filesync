module.exports = function(passport) {

  var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
  var FacebookStrategy = require('passport-facebook').Strategy;
  var TwitterStrategy  = require('passport-twitter').Strategy;
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

    process.nextTick(function() {
      var st = new Student(profile.id, token, profile.emails[0].value, profile.displayName, 'Google');
      return done(null,st);

    });
  }
));


passport.use(new FacebookStrategy({
  clientID        : privateKey.facebookAuth.clientID,
  clientSecret    : privateKey.facebookAuth.clientSecret,
  callbackURL     : privateKey.facebookAuth.callbackURL,
  profileFields: ["emails", "displayName", "name"],

},

function(token, refreshToken, profile, done) {
  process.nextTick(function() {
    var st = new Student(profile.id, token, profile.emails[0].value, profile.name.givenName + ' ' + profile.name.familyName, 'Facebook');
    return done(null,st);
  });

}));


passport.use(new TwitterStrategy({
  consumerKey     : privateKey.twitterAuth.clientID,
  consumerSecret  : privateKey.twitterAuth.clientSecret,
  callbackURL     : privateKey.twitterAuth.callbackURL

},
function(token, tokenSecret, profile, done) {
  process.nextTick(function() {
    var st = new Student(profile.id, token, profile.username, profile.displayName, 'Twitter');
    return done(null,st);
  });

}));

};
