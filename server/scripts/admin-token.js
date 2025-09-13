/**
 * Script to create an admin user if one doesn't exist and get a JWT token
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Create an admin user and get token
async function createAdminAndGetToken() {
    try {
        // Check if admin exists
        let admin = await User.findOne({ role: 'admin' });

        if (!admin) {
            console.log('No admin user found. Creating one...');

            // Generate password hash
            const salt = await bcrypt.genSalt(10);
            const password = 'Admin@123456';
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create admin user
            admin = new User({
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin',
                isEmailVerified: true
            });

            await admin.save();
            console.log('Admin user created successfully');
            console.log(`Username: admin`);
            console.log(`Password: ${password}`);
            console.log(`Email: admin@example.com`);
        } else {
            console.log('Found existing admin user');
        }

        // Generate token
        const payload = {
            user: {
                id: admin.id,
                role: admin.role
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
        process.exit(1);
    }
}

// Run script
async function main() {
    await connectDB();
    await createAdminAndGetToken();
    await mongoose.connection.close();
    console.log('Database connection closed');
}

main();
