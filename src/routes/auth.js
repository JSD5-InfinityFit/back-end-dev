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
const secret = process.env.JWT_SECRET;

// passport strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
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

// Configure GitHub strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/github/callback",
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
      clientID: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/linkedin/callback",
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
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3000/auth/facebook/callback",
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
    successRedirect: "http://localhost:5173/",
    failureRedirect: "http://localhost:5173//login" 
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
    successRedirect: "http://localhost:5173/",
    failureRedirect: "http://localhost:5173//login" }),
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
    successRedirect: "http://localhost:5173/",
    failureRedirect: "http://localhost:5173//login" }),
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
    res.redirect("http://localhost:5173/");
  });
});

export default socialRouter;
