const { MongoClient } = require("mongodb");

// Replace the uri string with your connection string.
const uri="mongodb+srv://infinityjsd5:MongoDB2023@cluster0.trpirfy.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp"

const client = new MongoClient(uri, 
//     {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   }
  );
  
async function run() {
    try{
        await client.connect();

        const database = client.db('infinityDB');
        const userActivity = database.collection("sandbox");
        // Retrieve product information based on the product ID
        const activityInfo = await userActivity.findOne({ _id: 9 });
        
        console.log(activityInfo)
    }finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir); 
