import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
    const salt = await bcrypt.genSalt(10);
    // encrypt
    newUser.userPassword = await bcrypt.hash(newUser.userPassword, salt);
    await newUser.save();
    res.send("Register Success");
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
};

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

export const deleteUsersController = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findOneAndDelete({ _id: id });
    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
};
