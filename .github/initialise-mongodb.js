// Import the MongoDB Node.js driver
const { MongoClient } = require('mongodb');

// Define the MongoDB connection URL for the service
const url = 'mongodb://localhost:27017';

// Define the collections you want to create
const productCollectionsToCreate = ['products'];

// Connect to the MongoDB server
MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.error('Error connecting to MongoDB:', err);
    return;
  }

  // Access the database you want to work with (e.g., ms_products)
  const db = client.db('ms_products');

  // Create collections
  productCollectionsToCreate.forEach((collectionName) => {
    db.createCollection(collectionName, (createErr, collection) => {
      if (createErr) {
        console.error(`Error creating collection ${collectionName}:`, createErr);
      } else {
        console.log(`Collection ${collectionName} created successfully.`);
      }
    });
  });

  // Close the MongoDB connection
  client.close();
});