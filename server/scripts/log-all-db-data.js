// Script to log all data from all collections for debugging
// Usage: node scripts/log-all-db-data.js

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/portfolio?directConnection=true&serverSelectionTimeoutMS=2000';

async function logAllCollections() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('--- All Database Data ---');
  for (const col of collections) {
    const colName = col.name;
    const docs = await mongoose.connection.db.collection(colName).find({}).toArray();
    console.log(`\nCollection: ${colName}`);
    console.log(JSON.stringify(docs, null, 2));
  }
  mongoose.disconnect();
}

logAllCollections().catch(err => {
  console.error('Logging failed:', err);
  mongoose.disconnect();
});
