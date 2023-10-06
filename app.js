import express from "express";
import { MongoClient, ObjectId, MongoError } from "mongodb";
import dotenv from "dotenv";
dotenv.config();


// Initialize server
const app = express();
const port = 3001;

// Initialize MongoDB
const URI = process.env.MONGODB_URI;
const client = new MongoClient(URI);
const databaseName = "infinityDB";
const collectionName = "sandbox";

// middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

//  Allow access to different links
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type, Accept,Authorization,Origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
  });

app.get('/activities/', (req, res) =>{
    async function mongoget() {
        try {
            // Connect to the MongoDB server
            await client.connect(URI);
  
            const db = client.db(databaseName);
            const collection = db.collection('activities');
  
            // Query the MongoDB collection to retrieve data
            const items = await collection.find().toArray();
            
            if (items) {
                // return activity
                res.json(items); // Return the retrieved data as JSON response
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
});

app.post('/activities/',validateActivity, (req, res) =>{
    // receive new activity from client
    const newActivity = req.body;
    console.log(newActivity);
    async function mongopost() {
        try {
            await client.connect(URI);
            const db = client.db(databaseName);
            const collection = db.collection('activities');
            await collection.insertOne(req.body) 
            console.log(req.body)
            res.status(201).send('Activity created successfully!');
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
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
   const deleteId = req.params.id;
   const objectId = new ObjectId(deleteId);

   console.log(deleteId);
    async function mongodelete() {
        try {
            await client.connect(URI);
            
            const db = client.db("infinityDB");

            const collection = db.collection("sandbox");

            const query = { _id: new ObjectId(objectId) };

            const check = await collection.findOne(query);

            if (check) {
                const result = await collection.deleteOne(query);
                // return result
                res.status(200).json(result);
            }
            else {
                res.status(404).json({ error: "Activity not found" });
            }
            res.status(201).send(`Document deleted with id: ${deleteId}`)
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