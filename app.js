import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

// Initialize server
const app = express();
const port = 3000;

// Initialize MongoDB
const URI = process.env.MONGODB_URI;
const client = new MongoClient(URI, { 
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// routes

app.get('/activities/', (req, res) =>{
    async function mongoget() {
        try {
            await client.connect();
            
            
        } catch (error) {
            console.error(error);
        }
        finally {
            await client.close();
        }
    }
    mongoget().catch(console.dir);
});

app.post('/activities/', (req, res) =>{
    async function mongopost() {
        try {
            await client.connect();
            
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

            const database = client.db('infinityDB');
            const userActivity = database.collection("sandbox");
            // Retrieve product information based on the product ID
            const activityInfo = await userActivity.findOne({ _id: 9 });
            
            console.log(activityInfo)

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