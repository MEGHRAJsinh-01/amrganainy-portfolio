// Migration script for updating skills, languages, and experience fields in Profile documents
// Usage: node scripts/migrate-profile-fields.js


const mongoose = require('mongoose');
const Profile = require('../models/profile.model');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/?directConnection=true&serverSelectionTimeoutMS=2000';

async function migrateProfiles() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const profiles = await Profile.find({});
  let updatedCount = 0;

  for (const profile of profiles) {
    let changed = false;

    // Migrate skills
    if (Array.isArray(profile.skills) && profile.skills.length > 0 && typeof profile.skills[0] === 'string') {
      profile.skills = profile.skills.map(name => ({
        name,
        source: 'custom',
        isVisible: true
      }));
      changed = true;
    }

    // Migrate languages
    if (Array.isArray(profile.languages) && profile.languages.length > 0 && typeof profile.languages[0] === 'string') {
      profile.languages = profile.languages.map(label => ({
        label,
        source: 'custom',
        isVisible: true
      }));
      changed = true;
    }

    // Migrate experience
    if (Array.isArray(profile.experience) && profile.experience.length > 0 && typeof profile.experience[0] === 'object' && !profile.experience[0].source) {
      profile.experience = profile.experience.map(exp => ({
        ...exp,
        source: 'custom',
        isVisible: true
      }));
      changed = true;
    }

    if (changed) {
      await profile.save();
      updatedCount++;
    }
  }

  console.log(`Migration complete. Updated ${updatedCount} profiles.`);
  mongoose.disconnect();
}

migrateProfiles().catch(err => {
  console.error('Migration failed:', err);
  mongoose.disconnect();
});
