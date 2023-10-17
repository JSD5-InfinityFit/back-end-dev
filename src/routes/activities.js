// routes/activities.js
import express from "express";
import { getAllActivities, getActivityById, createActivity, updateActivity, deleteActivity } from "../controllers/activitiesController.js";

const router = express.Router();

// Get all activities
router.get('/', getAllActivities);

// Get one activity
router.get('/:id', getActivityById);

// Create an activity
router.post('/', createActivity);

// Update an activity
router.patch('/:id', updateActivity);

// Delete an activity
router.delete('/:id', deleteActivity);

export default router;