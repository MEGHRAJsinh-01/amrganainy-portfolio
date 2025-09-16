const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs-extra');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load configuration from the centralized config module
const config = require('./config');

console.log(`Starting server in ${config.server.nodeEnv} mode`);

const app = express();
const PORT = config.server.port;

// MongoDB Connection
mongoose.connect(config.database.mongoUri, config.database.options)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Configure uploads directory
const uploadDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadDir);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enable CORS with configuration from config module
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if the origin is in our allowed list
        if (config.frontend.corsOrigins.includes(origin)) {
            return callback(null, true);
        }

        // For development, allow localhost origins
        if (origin.startsWith('http://localhost:')) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

app.use(express.json());

// Simple in-memory cache store
app.locals.cacheStore = app.locals.cacheStore || new Map();

// Simple health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        env: config.server.nodeEnv,
        timestamp: new Date().toISOString()
    });
});

// Import routes
const authRoutes = require('./routes/auth.routes');
const profileRoutes = require('./routes/profile.routes');
const projectRoutes = require('./routes/project.routes');
const filesRoutes = require('./routes/files.routes');
const translationRoutes = require('./routes/translation.routes');
const githubRoutes = require('./routes/github.routes');
const linkedinRoutes = require('./routes/linkedin.routes');
const cacheRoutes = require('./routes/cache.routes');
// const adminRoutes = require('./routes/admin.routes');
// const filesRoutes = require('./routes/files');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/profiles', profileRoutes); // Add alias for plural form
app.use('/api/projects', projectRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/translate', translationRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/linkedin', linkedinRoutes);
app.use('/api/cache', cacheRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/files', filesRoutes);

// Initialize admin user if not exists
const initAdminUser = async () => {
    try {
        // Import User model
        const User = require('./models/user.model');

        const adminExists = await User.findOne({ role: 'admin' });

        if (!adminExists) {
            // Check if admin credentials are provided in environment variables
            if (!config.auth.admin.username || !config.auth.admin.password) {
                console.error('ERROR: Admin username and/or password are not set in the configuration.');
                console.error('Admin user creation skipped for security reasons.');
                return;
            }

            const hashedPassword = await bcrypt.hash(
                config.auth.admin.password,
                10
            );

            await User.create({
                username: config.auth.admin.username,
                email: 'admin@example.com', // Default admin email
                password: hashedPassword,
                role: 'admin',
                isEmailVerified: true
            });

            console.log('Admin user created');
        }
    } catch (error) {
        console.error('Error initializing admin user:', error);
    }
};

// Call admin user initialization
// initAdminUser();

// Start the server
const server = http.createServer(app);

server.listen(config.server.port, config.server.host, () => {
    console.log(`Portfolio API server running on http://${config.server.host === '0.0.0.0' ? 'localhost' : config.server.host}:${config.server.port}`);
    console.log(`Access the health check at http://${config.server.host === '0.0.0.0' ? 'localhost' : config.server.host}:${config.server.port}/api/health`);
    console.log(`Server running in ${config.server.nodeEnv} mode`);
    console.log('LinkedIn API Proxy is enabled with Apify integration');
    console.log('API Token status:', config.services.apify.token ? 'Available' : 'Missing');
});