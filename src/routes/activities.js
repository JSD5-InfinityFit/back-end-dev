// routes/activities.js
import express from "express";
import multer from "multer";
import { getAllActivities, getActivityById, createActivity, updateActivity, deleteActivity,getActivityByUser } from "../controllers/activitiesController.js";
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Get all activities
router.get('/', getAllActivities);

// Get one activity
router.get('/:id', getActivityById);

// Create an activity
router.post('/',upload.single('image'), createActivity);

// Update an activity
router.patch('/:id', updateActivity);

// Delete an activity
router.delete('/:id', deleteActivity);

//dashboard
router.get('/users/:id', getActivityByUser);

export default router;