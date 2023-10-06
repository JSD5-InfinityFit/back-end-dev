import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import bcrypt from 'bcryptjs'
dotenv.config();

// Initialize server
const app = express();
const port = 3000;

// Initialize MongoDB
const URI = process.env.MONGODB_URI;
const client = new MongoClient(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes

app.get("/activities/", (req, res) => {
  async function mongoget() {
    try {
      res.send("test");
      await client.connect();
    } catch (error) {
      console.error(error);
    } finally {
      await client.close();
    }
  }
  mongoget().catch(console.dir);
});

app.post("/register/", (req, res) => {
  async function mongoRegister() {
    try {
      await client.connect();
      // Check user
      const { username, password } = req.body;
      let user = await User.findOne({ username });
      if (user) {
        return res.status(400).send("User Already Exists");
      }
      const salt = await bcrypt.genSalt(10);
      user = new User({
        username,
        password,
      });
      // encrypt
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      res.send("Register Success");
    } catch (error) {
      console.error(error);
    } finally {
      await client.close();
    }
  }
  mongopost().catch(console.dir);
});

app.post("/login/", (req, res) => {
  async function mongoLogin() {
    try {
      await client.connect();
      const {username, password} = req.body
      let user = await User.findOneAndUpdate({username}, {new: true})
      if (user && user.enabled) {
          //check password
          const isMatch = await bcrypt.compare(password, user.password)
          if (!isMatch) {
              return res.status(400).send('Password Invalid')
          }
          // payload
          const payload = {
              user: {
                  username: user.username,
                  role: user.role
              }
          }
          // generate token
          jwt.sign(payload, 'jwtSecret', {expiresIn: 3600}, (err, token)=>{
              if(err) throw err
              res.json({token, payload})
          } )

          // console.log(isMatch)
          // res.send('Hello login')
      } else {
          return res.status(400).send('User not found!!')
      }
    } catch (error) {
      console.error(error);
    } finally {
      await client.close();
    }
  }
  mongopost().catch(console.dir);
});

app.put("/activities/:id", (req, res) => {
  async function mongoput() {
    try {
      await client.connect();
    } catch (error) {
      console.error(error);
    } finally {
      await client.close();
    }
  }
  mongoput().catch(console.dir);
});

app.delete("/activities/:id", (req, res) => {
  async function mongodelete() {
    try {
      await client.connect();
    } catch (error) {
      console.error(error);
    } finally {
      await client.close();
    }
  }
  mongodelete().catch(console.dir);
});

/* Server start code */

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
