import express from "express";
import session from 'express-session';
import passport from "passport";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import activitiesRouter from "./routes/activities.js";
import usersRouter from './routes/users.js';
// import socialRouter from "./routes/auth.js";

dotenv.config();


// Set up Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB server
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));

// Middleware
app.use(morgan("dev"));
app.use(helmet({
    contentSecurityPolicy: false,
    referrerPolicy: { policy: 'no-referrer-when-downgrade' },
}));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Set up session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ 
        client: mongoose.connection.getClient(),
        collection: 'sessions',
    })
}));
  
// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set up routes
// app.use('/auth', socialRouter);
app.use('/users', usersRouter);
app.use('/activities', activitiesRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});