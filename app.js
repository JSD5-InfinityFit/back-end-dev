import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();


// Initialize server
const app = express();
const port = 3001;

// Initialize MongoDB
const URI = process.env.MONGODB_URI;
const client = new MongoClient(URI, { 
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const dbName = 'infinityDB'

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


// routes
app.get('/activities/', async (req, res) => {
   
    try {
      // Connect to the MongoDB server
      await client.connect(URI);
  
      const db = client.db(dbName);
      const collection = db.collection('activities');
  
      // Query the MongoDB collection to retrieve data
      const items = await collection.find().toArray();
  
      res.json(items); // Return the retrieved data as JSON response
    } catch (err) {
      console.error('Error getting data from MongoDB:', err);
      res.status(500).json({ message: 'Error getting data from MongoDB' });
    } finally {
      // Close the MongoDB connection when done
      client.close();
    }
  
  });





// app.get('/activities/', (req, res) =>{
//     async function mongoget() {
//         try {
//              
//             await client.connect();
            
//         } catch (error) {
//             console.error(error);
//         }
//         finally {
//             await client.close();
//         }
//     }
//     mongoget().catch(console.dir);
// });

app.post('/activities/', (req, res) =>{
    async function mongopost() {
        try {

            await client.connect(URI);
            const db = client.db(dbName);
            const collection = db.collection('activities');
            await collection.insertOne(req.body) 
            console.log(req.body)
            
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
    async function mongoput() {
        try {
            await client.connect();
            
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
    async function mongodelete() {
        try {
            await client.connect();
            
        } catch (error) {
            console.error(error);
        }
        finally {
            await client.close();
        }
    }
    mongodelete().catch(console.dir);
});

/* Server start code */

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});