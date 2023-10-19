import express from "express";
import mongoose from 'mongoose';
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import activitiesRouter from "./routes/activities.js";
import usersRouter from './routes/users.js';
dotenv.config();

// Set up Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB server
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
    .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));

// Middleware
app.use(express.json());
app.use(morgan("common"));
app.use(helmet());
app.use(cors());

app.use('/activities', activitiesRouter);
app.use('/users', usersRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});