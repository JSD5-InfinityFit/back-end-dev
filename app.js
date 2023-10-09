import express from "express";
import { MongoClient, ObjectId, MongoError } from "mongodb";
import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

// Define Mongoose schema for activities collection
const activitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: false },
    duration: { type: Number, required: true },
    date: { type: Date, required: true },
    imageURL: { type: String, required: true },
    userID: { type: String, required: true }
});

const Activities = mongoose.model('Activities', activitySchema);
const URI = process.env.MONGODB_URI;

// Connect to MongoDB server
mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));

// Set up Express app
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up CORS headers
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Origin");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});

// routes

// Get all activities
app.get('/activities/', async (req, res) => {
    try {
        const activities = await Activities.find();
        res.json(activities);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Create new activity
    app.post('/activities/', validateActivity, async (req, res) => {
        try {
            const newActivity = new Activities(req.body);
            await newActivity.save();
            res.status(201).send('Activity created successfully!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    });

    // Update activity
    app.put('/activities/:id', async (req, res) => {
        try {
            const updatedActivity = await Activities.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedActivity) {
                res.status(404).json({ message: "Activity not found" });
            } else {
                res.status(200).json(updatedActivity);
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    });

    // Delete activity
    app.delete('/activities/:id', async (req, res) => {
        try {
            const deletedActivity = await Activities.findByIdAndDelete(req.params.id);
            if (!deletedActivity) {
                res.status(404).json({ message: "Activity not found" });
            } else {
                res.status(200).json(deletedActivity);
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
        console.error(err);
        if (err.name === 'CastError') {
            res.status(400).json({ error: 'Invalid id format' });
        } else if (err.name === 'ValidationError') {
            res.status(400).json({ error: err.message });
        } else {
            res.status(500).json({ error: 'Server error' });
        }
    });

    // Validate activity middleware
    function validateActivity(req, res, next) {
        const { name, description, date } = req.body;
        const errors = [];

        if (!name) {
            errors.push('Name is required');
        }

        if (!description) {
            errors.push('Description is required');
        }

        if (!date) {
            errors.push('Date is required');
        }

        if (errors.length > 0) {
            res.status(400).json({ error: errors });
        } else {
            next();
        }
    }

    // Start server
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);    
    });

