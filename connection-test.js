const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://infinityjsd5:MongoDB2023@cluster0.trpirfy.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp";

const client = new MongoClient(uri);
async function connectToMongoDBTest() {
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    return "Connected to MongoDB Atlas";

    //const database = client.db('mongodb');

    /*// Use the listCollections method to get a cursor to the collections
    const collectionsCursor = database.listCollections();

    // Iterate over the cursor to get the collection names
    const collectionNames = await collectionsCursor.toArray();

    // Print the collection names
    console.log('Collections in the database:');
    collectionNames.forEach((collection) => {
      console.log(collection.name);
    });
    return collectionNames;*/

    /*const products = database.collection('products2'); // Replace with your collection name

    // Use the findOne method to find a single item by its _id
    const product = await products.findOne({ _id: 1 });

    return product;*/

    /*const products = database.collection('products2'); // Replace with your collection name

    const product = await products.find({ type: "simple" }).toArray();

    return product;*/
    
  } catch (error) {
    console.error('Error connecting to MongoDB Atlas', error);
    throw error;
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

module.exports = connectToMongoDBTest