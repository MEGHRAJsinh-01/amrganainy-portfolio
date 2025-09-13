/**
 * Script to promote the user with username 'admin' to admin role
 * and generate a JWT token
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

// Promote user to admin and get token
async function promoteAdminAndGetToken() {
    try {
        // Find user with username 'admin'
        const adminUser = await User.findOne({ username: 'admin' });

        if (!adminUser) {
            console.error('No user with username "admin" found in the database.');
            return;
        }

        console.log('Found user with username "admin":');
        console.log(`- ID: ${adminUser._id}`);
        console.log(`- Current role: ${adminUser.role}`);

        // Update to admin role if not already
        if (adminUser.role !== 'admin') {
            adminUser.role = 'admin';
            await adminUser.save();
            console.log('User has been promoted to admin role.');
        } else {
            console.log('User already has admin role.');
        }

        // Generate token
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

        console.log('\nAdmin Token:');
        console.log(token);

        console.log('\nUse this token in the Authorization header:');
        console.log(`Authorization: Bearer ${token}`);

        console.log('\nOr in x-auth-token header:');
        console.log(`x-auth-token: ${token}`);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

// Run script
async function main() {
    await connectDB();
    await promoteAdminAndGetToken();
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
}

main();
