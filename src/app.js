// app.js
import express from "express";
import mongoose from 'mongoose';
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import activitiesRouter from "./routes/activities.js";
// import authRouter from "./routes/auth.js";
// import authenticate from "./middleware/authenticate.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan("common"));
app.use(helmet());
app.use(cors());

// Routes
// app.use('/auth', authRouter);
// app.use('/activities', authenticate, activitiesRouter);
app.use('/activities', activitiesRouter);

// Connect to MongoDB server
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));

// Start server
app.listen(process.env.PORT || 5000, () => {
    console.log(`Server started on port ${process.env.PORT || 5000}`);
});