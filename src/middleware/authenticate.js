const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

passport.use(new FacebookStrategy({
  clientID: 'your-client-id',
  clientSecret: 'your-client-secret',
  callbackURL: 'http://localhost:3000/auth/facebook/callback',
  profileFields: ['id', 'emails', 'name'],
}, (accessToken, refreshToken, profile, done) => {
  // Handle Facebook authentication
}));

passport.use(new GoogleStrategy({
  clientID: 'your-client-id',
  clientSecret: 'your-client-secret',
  callbackURL: 'http://localhost:3000/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  // Handle Google authentication
}));

passport.use(new LinkedInStrategy({
  clientID: 'your-client-id',
  clientSecret: 'your-client-secret',
  callbackURL: 'http://localhost:3000/auth/linkedin/callback',
  scope: ['r_emailaddress', 'r_liteprofile'],
}, (accessToken, refreshToken, profile, done) => {
  // Handle LinkedIn authentication
}));

passport.use(new GitHubStrategy({
  clientID: 'your-client-id',
  clientSecret: 'your-client-secret',
  callbackURL: 'http://localhost:3000/auth/github/callback',
}, (accessToken, refreshToken, profile, done) => {
  // Handle GitHub authentication
}));