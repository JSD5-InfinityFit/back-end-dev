// routes/activities.js
import express from "express";
import multer from "multer";
import { 
    getAllActivities,
    getActivityById, 
    createActivity, 
    updateActivity, 
    deleteActivity,
    getActivityByUser,
    getActivitySummaryByUser,
} from "../controllers/activitiesController.js";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store file in memory as a Buffer
const upload = multer({ storage });


// Get all activities
router.get('/', getAllActivities);

// Get one activity
router.get('/:id', getActivityById);

// Create an activity
// Intercept the request and treat the req.img field as a file to prepare it for uploading
router.post('/', upload.single('img'), createActivity);

// Update an activity
router.patch('/:id', updateActivity);

// Delete an activity
router.delete('/:id', deleteActivity);

//dashboard
router.get('/users/:id', getActivityByUser);
router.get('/users/:id/summary', getActivitySummaryByUser);

export default router;