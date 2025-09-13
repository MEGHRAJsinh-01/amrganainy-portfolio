/**
 * Script to get an admin JWT token for an existing admin user
 * Usage: node get-admin-token.js
 */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/user.model');

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(config.database.mongoUri, config.database.options);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

// Get token for admin user
async function getAdminToken() {
    try {
        // Find an admin user
        const adminUser = await User.findOne({ role: 'admin' });

        if (!adminUser) {
            console.error('No admin user found in the database.');
            process.exit(1);
        }

        console.log('Found admin user:');
        console.log(`- Username: ${adminUser.username}`);
        console.log(`- Email: ${adminUser.email}`);
        console.log(`- User ID: ${adminUser._id}`);

        // Generate JWT token
        const payload = {
            user: {
                id: adminUser._id,
                role: adminUser.role
            }
        };

        const token = jwt.sign(
            payload,
            config.auth.jwtSecret,
            { expiresIn: config.auth.tokenExpiration }
        );

        console.log('\nAdmin JWT Token:');
        console.log(token);
        console.log('\nUse this token in your Authorization header:');
        console.log('Authorization: Bearer ' + token);
        console.log('\nOr in x-auth-token header:');
        console.log('x-auth-token: ' + token);

        return token;
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

// Run the script
async function main() {
    await connectDB();
    await getAdminToken();
    mongoose.disconnect();
    console.log('\nDatabase connection closed.');
}

main();
