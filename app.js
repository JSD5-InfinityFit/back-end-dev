import express from "express";
import { MongoClient, ObjectId, MongoError } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

// Initialize server
const app = express();
const port = 3000;

// Initialize MongoDB
const URI = process.env.MONGODB_URI;
const client = new MongoClient(URI);
const databaseName = "infinityDB";
const collectionName = "sandbox";

// middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// routes

app.get('/activities/', (req, res) =>{
    async function mongoget() {
        try {
            await client.connect();
            // connect to database and collection
            const collection = client.db(databaseName).collection(collectionName);

            // find activity in database
            const activity = await collection.find({}).toArray();
            if (activity) {
                // return activity
                res.status(200).json(activity);
            } else {
                res.status(404).json({ message: "Activity not found" });
            }
        }   
        catch (error) {
            console.error(error);
        }
        finally {
            await client.close();
        }
    }
    mongoget().catch(console.dir);
});

app.post('/activities/',validateActivity, (req, res) =>{
    // receive new activity from client
    const newActivity = req.body;
    console.log(newActivity);
    async function mongopost() {
        try {
            await client.connect();
            // connect to database and collection
            const collection = client.db(databaseName).collection(collectionName);

            // insert new activity into database
            const result = await collection.insertOne(newActivity);
            console.log(result);
            // return result
            res.status(200).json(result);
        } catch (error) {
            console.error(error);
        }
        finally {
            await client.close();
        }
    }
    mongopost().catch(console.dir);
});

app.put('/activities/:id', (req, res) =>{
    const updatedId = req.params.id;
    const objectId = new ObjectId(updatedId);
    console.log(updatedId);
    // receive updated activity from client
    const updatedActivity = {
        name: req.body.name,
        type: req.body.type,
        description: req.body.description,
        duration: req.body.duration,
        date: req.body.date,
        imageURL: req.body.imageURL,
        userID: req.body.userID
    }
    
    console.log(updatedActivity);
    async function mongoput() {
        try {
            await client.connect();
            // connect to database and collection
            const collection = client.db(databaseName).collection(collectionName);

            // check if activity exists in database
            const activityExists = await collection.findOne({ _id: objectId });
            // update activity in database
            if (!activityExists) {
                res.status(404).json({ message: "Activity not found" });
            } else {
                const result = await collection.updateOne(
                    { _id: objectId },
                    { $set: updatedActivity }
                );
                // return updated activity
                res.status(200).json(updatedActivity);
                console.log(result);
            }
        } catch (error) {
            console.error(error);
        }
        finally {
            await client.close();
        }
    }
    mongoput().catch(console.dir);
});

app.delete('/activities/:id', (req, res) =>{
    // receive updated activity from client
    const deletedId = req.params.id;
    const objectId = new ObjectId(deletedId);
    console.log(deletedId);
    async function mongodelete() {
        try {
            await client.connect();
            // connect to database and collection
            const collection = client.db(databaseName).collection(collectionName);

            // check if activity exists in database
            const activityExists = await collection.findOne({ _id: objectId });
            // delete activity in database
            if (activityExists) {
                const result = await collection.deleteOne({ _id: objectId });
                // return result
                res.status(200).json(result);
            }
            else {
                res.status(404).json({ error: "Activity not found" });
            }
        } catch (error) {
            console.error(error);
        }
        finally {
            await client.close();
        }
    }
    mongodelete().catch(console.dir);
});


// error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    if (err instanceof MongoError) {
      res.status(500).json({error: 'Database error'});
    } else if (err.name === 'CastError') {
      res.status(400).json({error:'Invalid id format'});
    } else if (err.name === 'BSONError') {
        res.status(400).json({error:'Invalid id format'});
    } else if (err.status === 404) {
        res.status(404).json({error:'Not found'});
    } else {
      res.status(400).json({error:'Unknown error'});
    }
  });

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

/* Server start code */

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});