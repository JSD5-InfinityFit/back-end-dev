import express from "express";
import { MongoClient , ObjectId} from "mongodb";
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
            await client.connect(URI);
            
            const db = client.db("infinityDB");
            const database = db.collection('sandbox');

            const query = await database.find({}).toArray();
            res.json(query);
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
            await client.connect(URI);
            
            const db = client.db('infinityDB');
            const database = db.collection('sandbox');
            await database.insertOne(req.body);

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
   const deleteId = req.params.id;
   const objectId = new ObjectId(deleteId);

   console.log(deleteId);
    async function mongodelete() {
        try {
            await client.connect(URI);
            
            const db = client.db("infinityDB");

            const collection = db.collection("sandbox");

            const query = { _id: new ObjectId(objectId) };

            const result = await collection.deleteOne(query);

            // if(result.deleteCondition === 1) {
            //     console.log("Document deleted");
            // }else{
            //     console.log("Document not found");
            // }
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

/* Server start code */

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});