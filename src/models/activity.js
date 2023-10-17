// models/activity.js
import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: false },
    duration: { type: Number, required: true },
    date: { type: Date, required: true },
    imageURL: { type: String, required: false },
    userID: { type: String, required: false }
});

const Activities = mongoose.model('Activities', activitySchema);

export default Activities;