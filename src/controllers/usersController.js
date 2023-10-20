import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from 'passport-github';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
dotenv.config();

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
      scope: ["profile", "email"],
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

// Configure GitHub strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/auth/github/callback',
}, async (accessToken, refreshToken, profile, done) => {
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
}));

// Configure LinkedIn strategy
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: '/auth/linkedin/callback',
  scope: ['r_emailaddress', 'r_liteprofile'],
}, async (accessToken, refreshToken, profile, done) => {
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
}));

export const getUsersController = async (req, res) => {
  try {
    const users = await User.find({}).select("-userPassword");
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
};

/**
 * Registers a new user.
 * @async
 * @function registerUsersController
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} Returns a JSON object containing a JWT token.
 * @throws {Object} Throws an error if there's a server error.
 * @description This function checks if the user already exists, hashes the password, saves the user to the database, generates a JWT token, and returns it in a JSON object.
 * @example
 * registerUsersController(req, res);
 */
export const registerUsersController = async (req, res) => {
  try {
    // Check user
    const newUser = new User(req.body);
    console.log(newUser);
    let user = await User.findOne({ userEmail: newUser.userEmail });
    if (user) {
      return res.status(400).send("User Already Exists");
    }
    const salt = await bcrypt.genSalt(10);
    // encrypt
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

    console.log("Register Success");
    res.json({ token });
    
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
};

/**
 * Authenticate user with social login provider and generate JWT token for authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Express response object
 */
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

/**
 * Controller function to handle user login
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - Returns a JSON object containing a token, payload, and user object if successful, or an error message if unsuccessful
 */
export const loginUsersController = async (req, res) => {
  try {
    const userObj = new User(req.body);
    console.log(userObj);
    const user = await User.findOneAndUpdate(
      { userEmail: userObj.userEmail },
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
export const getCurrentUserController = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).select(
      "-userPassword"
    );
    // console.log(user);
    if (user) {
      res.send(user);
    } else {
      res.status(400).send("User not found!!");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
};

/**
 * Updates a user by ID
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.id - User ID
 * @param {Object} req.body - Request body
 * @param {Object} res - Express response object
 * @returns {Object} - Updated user object or error message
 */
export const updateUsersController = async (req, res) => {
  try {
    const {
      userEmail,
      userPassword,
      userBiologicalGender,
      userBD,
      userWeight,
      userHeight,
    } = req.body;
    // gen salt
    const salt = await bcrypt.genSalt(10);
    // encrypt
    let enPassword = await bcrypt.hash(userPassword, salt);
    const user = await User.findOneAndUpdate(
      { _id: req.params.id },
      {
        userEmail,
        userPassword: enPassword,
        userBiologicalGender,
        userBD,
        userWeight,
        userHeight,
      }
    );
    res.send("User Updated");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
};

/**
 * Deletes a user by ID.
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Object} - Returns a JSON object containing the deleted user or an error message.
 */
export const deleteUsersController = async (req, res) => {
  try {
    // const id = req.params.id;
    // const user = await User.findOneAndDelete({ _id: id });
    // if (!user) {
    //   return res.send("No have user or deleted user");
    // }
    // res.status(200).send(user);

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
