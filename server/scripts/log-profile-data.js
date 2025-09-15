// Script to log all profile data for debugging
// Usage: node scripts/log-profile-data.js

const mongoose = require('mongoose');
const Profile = require('../models/profile.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/portfolio?directConnection=true&serverSelectionTimeoutMS=2000';

async function logProfiles() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const profiles = await Profile.find({});
  console.log('--- All Profile Data ---');
  profiles.forEach((profile, idx) => {
    console.log(`\nProfile #${idx + 1} (id: ${profile._id}):`);
    console.log(JSON.stringify(profile, null, 2));
  });
  mongoose.disconnect();
}

logProfiles().catch(err => {
  console.error('Logging failed:', err);
  mongoose.disconnect();
});
