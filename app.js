import express from "express";
import { MongoClient, ObjectId, MongoError } from "mongodb";
import mongoose from "mongoose";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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
    userBiologicalGender: { type: Boolean, required: false },
    userBD: { type: Date, required: false },
    userWeight: { type: Number, required: false },
    userHeight: { type: Number, required: false },
    userActivities: {type: Array, required: false},
    role: { type: String, default: "user" },
    enabled: { type: Boolean, default: true },
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

const auth = (req, res, next) => {
  try {
    const token = req.headers["authtoken"];
    if (!token) {
      return res.status(401).send("no token, authorization denied");
    }
    const decoded = jwt.verify(token, "jwtSecret");
    console.log(decoded);
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).send("Token Invalid!!");
  }
};

const adminCheck = async (req, res, next) => {
  try {
    const { username } = req.user;
    const adminUser = await User.findOne({ username }).exec();
    if (adminUser.role !== "admin") {
      res.status(403).send(err, "Admin access denied");
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(401).send("Admin access denied");
  }
};

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
app.get('/users', async (req, res) => {
  try {
    const users = await Users.find({}).select("-userPassword")
    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
})
// router.get("/users", auth, adminCheck, listUsers);
// router.get("/users/:id", readUsers);
// router.put("/users/:id", updateUsers);
// router.delete("/users/:id", removeUsers);
// router.post("/change-status", auth, adminCheck, changeStatus);
// router.post("/change-role", auth, adminCheck, changeRole);



// auth
// @endpoint http://localhost:3000/users
// register
app.post('/register', async (req, res) => {
  try {
    // Check user
    const newUser = new Users(req.body)
    console.log(newUser)
    let user = await Users.findOne({ userEmail:newUser.userEmail });
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
})
//login
app.post('/login', async (req, res) => {
  try {
    const userObj = new Users(req.body)
    // console.log(userObj)
    const user = await Users.findOneAndUpdate({ userEmail:userObj.userEmail }, { new: true });
    if (user && user.enabled) {
      //check password
      const isMatch = await bcrypt.compare(userObj.userPassword, user.userPassword);
      if (!isMatch) {
        return res.status(400).send("Password Invalid");
      }
      // payload
      const payload = {
        user: {
          username: user.username,
          role: user.role,
        },
      };
      // generate token
      jwt.sign(payload, "jwtSecret", { expiresIn: 3600 }, (err, token) => {
        if (err) throw err;
        res.json({ token, payload });
      });
      // console.log(isMatch)
      // res.send('Hello login')
    } else {
      return res.status(400).send("User not found!!");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
})
// get current user
app.get('/users/:id', async (req, res) => {
  try {
    const user = await Users.findOne({_id:req.params.id})
      .select("-userPassword")
      if (user && user.enabled) {
        res.send(user);
      } else {
        res.status(400).send('User not found!!')
      }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
})
// router.post("/current-user", auth, currentUser);
// router.post("/current-admin", auth, adminCheck, currentUser);


// editUser
 app.put('/users/:id', async (req, res) => {
  try {
    const updatedUser = await Users.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true });
    if (!updatedUser) {
      res.status(404).json({ message: "Activity not found" });
    } else {
      res.status(200).json(updatedUser);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error!");
  }
})

//deleteUser
 app.delete('/users/:id', async (req, res) => {
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
})

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
