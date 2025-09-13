/**
 * Script to list all users in the database and get a token for each admin user
 */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(config.database.mongoUri);
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

// List all users and get tokens for admin users
async function listUsersAndGetAdminTokens() {
    try {
        // Find all users
        const users = await User.find().select('-password');

        console.log(`Found ${users.length} users in the database:\n`);

        const admins = [];

        // List all users
        users.forEach((user, index) => {
            console.log(`User ${index + 1}:`);
            console.log(`- ID: ${user._id}`);
            console.log(`- Username: ${user.username}`);
            console.log(`- Email: ${user.email}`);
            console.log(`- Role: ${user.role}`);
            console.log(`- Email Verified: ${user.isEmailVerified}`);
            console.log('------------------------');

            if (user.role === 'admin') {
                admins.push(user);
            }
        });

        // Generate tokens for admin users
        console.log(`\nFound ${admins.length} admin users. Generating tokens:\n`);

        if (admins.length === 0) {
            console.log('No admin users found.');
            return;
        }

        admins.forEach((admin, index) => {
            const payload = {
                user: {
                    id: admin._id,
                    role: admin.role
                }
            };

            const token = jwt.sign(
                payload,
                config.auth.jwtSecret,
                { expiresIn: config.auth.tokenExpiration }
            );

            console.log(`Admin ${index + 1}: ${admin.username}`);
            console.log(`Token: ${token}`);
            console.log(`\nAuthorization: Bearer ${token}`);
            console.log(`x-auth-token: ${token}`);
            console.log('========================\n');
        });

    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

// Run script
async function main() {
    await connectDB();
    await listUsersAndGetAdminTokens();
    await mongoose.connection.close();
    console.log('Database connection closed');
}

main();
