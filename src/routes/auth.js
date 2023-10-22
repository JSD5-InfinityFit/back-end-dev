import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import User from "../models/user.js";
import dotenv from "dotenv";
dotenv.config();

const socialRouter = express.Router();
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const secret = process.env.JWT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

// passport strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: BACKEND_URL+"/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ userEmail: email });
        if (!user) {
          const newUser = new User({
            userName: profile.displayName,
            userEmail: email,
          });
          user = await newUser.save();
        }
        const token = jwt.sign({ userId: user._id }, secret);
        done(null, user, token);
      } catch (err) {
        console.log(err);
        done(err, false);
      }
    }
  )
);

// Configure GitHub strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: BACKEND_URL+"/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ userEmail: email });
        if (!user) {
          const newUser = new User({
            userName: profile.displayName,
            userEmail: email,
          });
          user = await newUser.save();
        }
        const token = jwt.sign({ userId: user._id }, secret);
        done(null, user);
      } catch (err) {
        console.log(err);
        done(err, false);
      }
    }
  )
);

// Configure LinkedIn strategy
passport.use(
  new LinkedInStrategy(
    {
      clientID: LINKEDIN_CLIENT_ID,
      clientSecret: LINKEDIN_CLIENT_SECRET,
      callbackURL: BACKEND_URL+"/auth/linkedin/callback",
      scope: ["r_emailaddress", "r_liteprofile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ userEmail: email });
        if (!user) {
          const newUser = new User({
            userName: profile.displayName,
            userEmail: email,
          });
          user = await newUser.save();
        }
        const token = jwt.sign({ userId: user._id }, secret);
        done(null, user);
      } catch (err) {
        console.log(err);
        done(err, false);
      }
    }
  )
);

// Configure Facebook strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: BACKEND_URL+"/auth/facebook/callback",
      profileFields: ["id", "emails", "name"],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      try {
        const facebookId = profile.id;
        let user = await User.findOne({ facebookId });
        if (!user) {
          const newUser = new User({
            facebookId,
          });
          user = await newUser.save();
        }
        const token = jwt.sign({ userId: user._id }, secret);
        done(null, user);
      } catch (err) {
        console.log(err);
        done(err, false);
      }
    }
  )
);

passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

socialRouter.get("/login", function (req, res, next) {
  res.render("login");
});

socialRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

socialRouter.get(
  "/google/callback",
  passport.authenticate("google", { 
    successRedirect: FRONTEND_URL+"/home",
    failureRedirect: FRONTEND_URL+"/register"
  }),
  (req, res) => {
    const { user, token } = req.user;
    res.json({ user, token });
  }
);

socialRouter.get(
  "/facebook",
  passport.authenticate("facebook")
);

socialRouter.get(
  "/facebook/callback",
  passport.authenticate("facebook", { 
    successRedirect: FRONTEND_URL+"/home",
    failureRedirect: FRONTEND_URL+"/register"
  }),
  (req, res) => {
    const { user, token } = req.user;
    res.json({ user, token });
  }
);

socialRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["profile", "email"] })
);

socialRouter.get(
  "/github/callback",
  passport.authenticate("github", { 
    successRedirect: FRONTEND_URL+"/home",
    failureRedirect: FRONTEND_URL+"/register"
  }),
  (req, res) => {
    const { user, token } = req.user;
    res.json({ user, token });
  }
);

socialRouter.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect(FRONTEND_URL);
  });
});

export default socialRouter;
