import User from '../models/User.js'
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
}

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
}

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
}

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
}

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
}