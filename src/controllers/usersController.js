import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

// Configure Facebook strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "emails", "name"],
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
        done(null, user);
      } catch (err) {
        console.log(err);
        done(err, false);
      }
    }
  )
);

// Configure Google strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
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
        done(null, user);
      } catch (err) {
        console.log(err);
        done(err, false);
      }
    }
  )
);

export const getUsersController = async (req, res) => {
  try {
    const users = await User.find({}).select("-userPassword");
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
};

export const registerUsersController = async (req, res) => {
  try {
    // Check user
    const newUser = new User(req.body);
    console.log(newUser);
    let user = await User.findOne({ userEmail: newUser.userEmail });
    if (user) {
      return res.status(400).send("User Already Exists");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    newUser.userPassword = await bcrypt.hash(newUser.userPassword, salt);

    // Save user
    user = await newUser.save();

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
};

export const socialLoginController = (req, res, next) => {
  passport.authenticate(req.params.provider, { session: false }, (err, user) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Server Error!');
    }
    if (!user) {
      return res.status(401).send('Unauthorized');
    }
    const payload = {
      user: {
        id: user.id,
      },
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('jwt', token);
    res.redirect('/');
  })(req, res, next);
};

export const loginUsersController = async (req, res) => {
  try {
    const userObj = new User(req.body);
    console.log(userObj);
    const user = await User.findOneAndUpdate(
      // { userEmail: userObj.userEmail },
      { new: true }
    );
    if (user) {
      //check password
      const isMatch = await bcrypt.compare(
        userObj.userPassword,
        user.userPassword
      );
      if (!isMatch) {
        return res.status(400).send("Password Invalid");
      }
      // payload
      const payload = {
        user: {
          userEmail: user.userEmail,
          userID: user._id,
        },
      };
      // generate token
      jwt.sign(payload, "jwtSecret", { expiresIn: 3600 }, (err, token) => {
        if (err) throw err;
        res.json({ token, payload, userObj });
      });
    } else {
      return res.status(400).send("User not found!!");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
};

export const updateUsersController = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedUser) {
      res.status(404).json({ message: "Activity not found" });
    } else {
      res.status(200).json(updatedUser);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
};

export const deleteUsersController = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      res.status(404).json({ message: "Activity not found" });
    } else {
      res.status(200).json(deletedUser);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
};