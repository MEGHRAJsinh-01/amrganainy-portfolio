// Script to log only skills, languages, and experience from all profiles
// Usage: node scripts/log-profile-fields.js

const mongoose = require('mongoose');
const Profile = require('../models/profile.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/portfolio?directConnection=true&serverSelectionTimeoutMS=2000';

async function logProfileFields() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const profiles = await Profile.find({});
  console.log('--- Skills, Languages, Work Experience ---');
  profiles.forEach((profile, idx) => {
    console.log(`\nProfile #${idx + 1} (id: ${profile._id}):`);
    console.log('Skills:', JSON.stringify(profile.skills, null, 2));
    console.log('Languages:', JSON.stringify(profile.languages, null, 2));
    console.log('Work Experience:', JSON.stringify(profile.experience, null, 2));
  });
  mongoose.disconnect();
}

logProfileFields().catch(err => {
  console.error('Logging failed:', err);
  mongoose.disconnect();
});
