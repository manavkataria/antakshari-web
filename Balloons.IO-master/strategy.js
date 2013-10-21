
/*
 * Module dependencies
 */

var passport = require('passport')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
  , FacebookStrategy = require('passport-facebook').Strategy 

/**
 * Expose Authentication Strategy
 */

module.exports = Strategy;

/*
 * Defines Passport authentication
 * strategies from application configs
 *
 * @param {Express} app `Express` instance.
 * @api public
 */

function Strategy (app) {
  var config = app.get('config');

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  if(config.auth.google.clientid.length) {
    passport.use(new GoogleStrategy({
        clientID: config.auth.google.clientid,
        clientSecret: config.auth.google.clientsecret,
        callbackURL: config.auth.google.callback
      },
    function(accessToken, refreshToken, profile, done) {
    	User.findOrCreate({ googleId: profile.id }, function (err, user) {
      	return done(err, user);
    	});
    }
    ));
  }

  if(config.auth.facebook.clientid.length) {
    passport.use(new FacebookStrategy({
        clientID: config.auth.facebook.clientid,
        clientSecret: config.auth.facebook.clientsecret,
        callbackURL: config.auth.facebook.callback
      },
      function(accessToken, refreshToken, profile, done) {
        return done(null, profile);
      }
    ));
  }
}

