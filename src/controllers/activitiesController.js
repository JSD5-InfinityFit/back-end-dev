// controllers/activitiesController.js
import Activities from "../models/activity.js";

// Get all activities
export const getAllActivities = async (req, res) => {
    try {
        const activities = await Activities.find();
        if (activities == null) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        res.json(activities);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get one activity
export const getActivityById = async (req, res) => {
    try {
        const activity = await Activities.findById(req.params.id);
        if (activity == null) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        res.json(activity);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create an activity
export const createActivity = async (req, res) => {
    const activity = new Activities(req.body);

    try {
        const newActivity = await activity.save();
        res.status(201).json(newActivity);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Update an activity
export const updateActivity = async (req, res) => {
    res.send(req.body)
    if (req.body.name != null) {
        res.activity.name = req.body.name;
    }
    if (req.body.type != null) {
        res.activity.type = req.body.type;
    }
    if (req.body.description != null) {
        res.activity.description = req.body.description;
    }
    if (req.body.duration != null) {
        res.activity.duration = req.body.duration;
    }
    if (req.body.date != null) {
        res.activity.date = req.body.date;
    }
    if (req.body.imageURL != null) {
        res.activity.imageURL = req.body.imageURL;
    }
    if (req.body.userID != null) {
        res.activity.userID = req.body.userID;
    }

    try {
        const updatedActivity = await res.activity.save();
        res.json(updatedActivity);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Delete an activity
export const deleteActivity = async (req, res) => {
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
};