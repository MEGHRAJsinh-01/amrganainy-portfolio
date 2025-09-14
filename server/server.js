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
// const adminRoutes = require('./routes/admin.routes');
// const filesRoutes = require('./routes/files');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/profiles', profileRoutes); // Add alias for plural form
app.use('/api/projects', projectRoutes);
app.use('/api/files', filesRoutes);
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

// -------------------- LinkedIn API Proxy --------------------

app.post('/api/linkedin-profile', async (req, res) => {
    try {
        console.log('LinkedIn profile API endpoint called');
        const { profileUrl } = req.body;

        if (!profileUrl) {
            console.error('No profile URL provided');
            return res.status(400).json({
                error: 'Profile URL is required',
                details: 'Please set your LinkedIn URL in your profile settings'
            });
        }

        console.log('Fetching LinkedIn profile using username from URL:', profileUrl);

        // Extract username from LinkedIn URL if it's a full URL
        // URLs can be like: linkedin.com/in/username or linkedin.com/profile/view?id=...
        let username = 'amr-elganainy'; // Default fallback

        if (profileUrl.includes('/in/')) {
            const match = profileUrl.match(/\/in\/([^\/\?]+)/);
            if (match && match[1]) {
                username = match[1];
            }
        }

        console.log('Extracted LinkedIn username:', username);
        const apiToken = config.services.apify.token;
        if (!apiToken || apiToken === 'your_apify_token_here') {
            console.error('API token missing or invalid');
            return res.status(500).json({
                error: 'Apify API token is missing or invalid in server environment'
            });
        }

        // Using the LinkedIn Profile Detail actor by apimaestro with run-sync-get-dataset-items endpoint
        // This endpoint directly returns the dataset items without needing to poll
        const apiUrl = `https://api.apify.com/v2/acts/apimaestro~linkedin-profile-detail/run-sync-get-dataset-items?token=${apiToken}`;

        console.log('Calling Apify API at:', apiUrl);

        // Cache key and TTL
        const cacheKey = `linkedin:${username}`;
        const now = Date.now();
        const TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

        // Serve from cache if fresh
        const cached = app.locals.cacheStore.get(cacheKey);
        if (cached && now - cached.timestamp < TTL) {
            console.log('Serving LinkedIn profile from cache');
            return res.json(cached.data);
        }

        // Start the actor run
        const startRunResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "includeEmail": true,
                "username": username
            })
        });

        if (!startRunResponse.ok) {
            const errorText = await startRunResponse.text();
            console.error('Apify actor start error:', errorText);
            return res.status(startRunResponse.status).json({
                error: `Apify actor start failed: ${startRunResponse.status} ${startRunResponse.statusText}`,
                details: errorText
            });
        }

        // Parse the response
        const runData = await startRunResponse.json();
        console.log('Apify response:', JSON.stringify(runData).substring(0, 200));

        // For run-sync-get-dataset-items endpoint, we get the data directly
        if (Array.isArray(runData)) {
            console.log('Direct data received, items count:', runData.length);
            if (!runData || runData.length === 0) {
                console.error('No LinkedIn profile data returned');
                return res.status(404).json({ error: 'No LinkedIn profile data returned from Apify' });
            }

            // Cache and return the first profile (as we're only scraping one)
            const payload = runData[0];
            app.locals.cacheStore.set(cacheKey, { data: payload, timestamp: now });
            console.log('Sending profile data to client (cached)');
            return res.json(payload);
        } else {
            return res.status(500).json({
                error: 'Unexpected response format from Apify API',
                details: 'Expected an array of profile data'
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: 'Server error processing LinkedIn profile request',
            message: error.message
        });
    }
});

// -------------------- GitHub Repos Proxy (cached) --------------------
app.get('/api/github-repos', async (req, res) => {
    try {
        const username = String(req.query.username || '').trim();
        if (!username) {
            return res.status(400).json({ error: 'Missing username' });
        }

        const cacheKey = `gh:repos:${username}`;
        const now = Date.now();
        const TTL = 24 * 60 * 60 * 1000; // 24 hours
        const cached = app.locals.cacheStore.get(cacheKey);
        if (cached && now - cached.timestamp < TTL) {
            console.log('Serving GitHub repos from cache for', username);
            return res.json(cached.data);
        }

        const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=pushed&per_page=100`, {
            headers: {
                'User-Agent': 'amrganainy-portfolio'
            }
        });
        if (!ghRes.ok) {
            const text = await ghRes.text();
            console.error('GitHub API error:', ghRes.status, text);
            return res.status(ghRes.status).json({ error: `GitHub API error: ${ghRes.status}` });
        }
        const data = await ghRes.json();
        app.locals.cacheStore.set(cacheKey, { data, timestamp: now });
        res.json(data);
    } catch (err) {
        console.error('GitHub proxy error:', err);
        res.status(500).json({ error: 'Failed to fetch GitHub repos' });
    }
});

// Start the server
const server = http.createServer(app);

server.listen(config.server.port, config.server.host, () => {
    console.log(`Portfolio API server running on http://${config.server.host === '0.0.0.0' ? 'localhost' : config.server.host}:${config.server.port}`);
    console.log(`Access the health check at http://${config.server.host === '0.0.0.0' ? 'localhost' : config.server.host}:${config.server.port}/api/health`);
    console.log(`Server running in ${config.server.nodeEnv} mode`);
    console.log('LinkedIn API Proxy is enabled with Apify integration');
    console.log('API Token status:', config.services.apify.token ? 'Available' : 'Missing');
});
