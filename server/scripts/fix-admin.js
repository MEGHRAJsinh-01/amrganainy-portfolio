/**
 * Script to fix admin user (add missing email and promote to admin role)
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

// Fix admin user and get token
async function fixAdminAndGetToken() {
    try {
        // Find user with username 'admin'
        let adminUser = await User.findOne({ username: 'admin' });

        if (!adminUser) {
            console.error('No user with username "admin" found in the database.');
            return;
        }

        console.log('Found user with username "admin":');
        console.log(`- ID: ${adminUser._id}`);
        console.log(`- Current role: ${adminUser.role}`);
        console.log(`- Current email: ${adminUser.email || 'undefined'}`);

        // We'll use raw MongoDB update to bypass Mongoose validation
        const result = await mongoose.connection.collection('users').updateOne(
            { username: 'admin' },
            {
                $set: {
                    role: 'admin',
                    email: 'admin@example.com',
                    isEmailVerified: true
                }
            }
        );

        console.log(`Update result: ${result.modifiedCount} document(s) modified`);

        // Refresh user data
        adminUser = await User.findOne({ username: 'admin' });

        console.log('\nUpdated admin user:');
        console.log(`- Role: ${adminUser.role}`);
        console.log(`- Email: ${adminUser.email}`);

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
    await fixAdminAndGetToken();
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
}

main();
