// Migration: Move githubUrl/linkedinUrl from users to profiles.socialLinks
// Usage (PowerShell):
//   node server/scripts/migrations/2025-09-13-move-user-social-links-to-profile.js

const mongoose = require('mongoose');
const path = require('path');
const config = require('../../config');
const User = require('../../models/user.model');
const Profile = require('../../models/profile.model');

(async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || config.db.uri;
    console.log(`[migration] Connecting to ${mongoUri}`);
    await mongoose.connect(mongoUri);

    const users = await User.find({
      $or: [
        { githubUrl: { $exists: true, $ne: '' } },
        { linkedinUrl: { $exists: true, $ne: '' } }
      ]
    }).select('_id githubUrl linkedinUrl');

    console.log(`[migration] Users with legacy social links: ${users.length}`);

    for (const u of users) {
      const profile = await Profile.findOne({ userId: u._id });
      if (!profile) continue;

      const social = profile.socialLinks || {};
      let changed = false;

      if (u.githubUrl && !social.github) {
        social.github = u.githubUrl;
        changed = true;
      }
      if (u.linkedinUrl && !social.linkedin) {
        social.linkedin = u.linkedinUrl;
        changed = true;
      }

      if (changed) {
        profile.socialLinks = social;
        await profile.save();
        console.log(`[migration] Moved links for user ${u._id}`);
      }
    }

    console.log('[migration] Done');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('[migration] Failed:', err);
    process.exit(1);
  }
})();
