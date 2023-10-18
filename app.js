import express from "express";
import { MongoClient, ObjectId, MongoError } from "mongodb";
import mongoose from "mongoose";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const router = express.Router();

// Define Mongoose schema for activities collection
const activitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: false },
  duration: { type: Number, required: true },
  date: { type: Date, required: true },
  imageURL: { type: String, required: true },
  userID: { type: String, required: true },
});

const userSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    userPassword: { type: String, required: true },
    userBiologicalGender: { type: String, required: false },
    userBD: { type: String, required: false },
    // userBiologicalGender: { type: Boolean, required: false },
    // userBD: { type: Date, required: false },
    userWeight: { type: Number, required: false },
    userHeight: { type: Number, required: false },
    userActivities: { type: Array, required: false },
  },
  { timestamps: true }
);

const Activities = mongoose.model("Activities", activitySchema);
const Users = mongoose.model("Users", userSchema);
const URI = process.env.MONGODB_URI;

// Connect to MongoDB server
mongoose
  .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

// Set up Express app
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up CORS headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

//MIDDLEWARE
app.use(morgan("dev"));
app.use(cors());

// routes

// Get all activities
app.get("/activities/", async (req, res) => {
  try {
    const activities = await Activities.find();
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Get one activity
app.get("/activities/:id", async (req, res) => {
  try {
    const activity = await Activities.findOne({ _id: req.params.id });
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Create new activity
app.post("/activities/", validateActivity, async (req, res) => {
  try {
    const newActivity = new Activities(req.body);
    await newActivity.save();
    res.status(201).send("Activity created successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Update activity
app.put("/activities/:id", async (req, res) => {
  try {
    const updatedActivity = await Activities.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedActivity) {
      res.status(404).json({ message: "Activity not found" });
    } else {
      res.status(200).json(updatedActivity);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Delete activity
app.delete("/activities/:id", async (req, res) => {
  try {
    const deletedActivity = await Activities.findByIdAndDelete(req.params.id);
    if (!deletedActivity) {
      res.status(404).json({ message: "Activity not found" });
    } else {
      res.status(200).json(deletedActivity);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === "CastError") {
    res.status(400).json({ error: "Invalid id format" });
  } else if (err.name === "ValidationError") {
    res.status(400).json({ error: err.message });
  } else {
    res.status(500).json({ error: "Server error" });
  }
});

// Validate activity middleware
function validateActivity(req, res, next) {
  const { name, description, date } = req.body;
  const errors = [];

  if (!name) {
    errors.push("Name is required");
  }

  if (!description) {
    errors.push("Description is required");
  }

  if (!date) {
    errors.push("Date is required");
  }

  if (errors.length > 0) {
    res.status(400).json({ error: errors });
  } else {
    next();
  }
}
//Users
// @endpoint http://localhost:3000/users
app.get("/users", async (req, res) => {
  try {
    const users = await Users.find({}).select("-userPassword");
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
});

// auth
// @endpoint http://localhost:3000/users
// register
app.post("/register", async (req, res) => {
  try {
    // Check user
    const newUser = new Users(req.body);
    console.log(newUser);
    let user = await Users.findOne({ userEmail: newUser.userEmail });
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
});
//login
app.post("/login", async (req, res) => {
  try {
    const userObj = new Users(req.body);
    console.log(userObj);
    const user = await Users.findOneAndUpdate(
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
});
// get current user
app.get("/users/:id", async (req, res) => {
  try {
    const user = await Users.findOne({ _id: req.params.id }).select(
      "-userPassword"
    );
    console.log(user);
    if (user) {
      res.send(user);
    } else {
      res.status(400).send("User not found!!");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
});

// editUser
app.put("/users/:id", async (req, res) => {
  try {
    const updatedUser = await Users.findByIdAndUpdate(req.params.id, req.body, {
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
});

//deleteUser
app.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await Users.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      res.status(404).json({ message: "Activity not found" });
    } else {
      res.status(200).json(deletedUser);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on https://infinity-fit-backend.onrender.com/`);
});
