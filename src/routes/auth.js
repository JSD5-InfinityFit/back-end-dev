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
  passport.authenticate("google", { failureRedirect: "/login" }),
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
    res.redirect("/");
  });
});

export default socialRouter;
