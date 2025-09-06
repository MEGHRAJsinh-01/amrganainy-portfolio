const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs-extra');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Configure multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enable CORS
app.use(cors({
    origin: true, // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// Simple health check endpoint
app.get('/api/health', (req, res) => {
    console.log('Health check endpoint called');
    res.json({ status: 'OK', message: 'Server is running' });
});

// -------------------- Database Schemas --------------------

// User Schema (for admin authentication)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false }
});

// Portfolio Schema
const portfolioSchema = new mongoose.Schema({
    profileImage: { type: String },
    cvViewUrl: { type: String },
    cvDownloadUrl: { type: String },
    personalInfo: {
        name: { type: String },
        title: { type: String },
        email: { type: String },
        phone: { type: String },
        location: { type: String },
        bio: { type: String }
    },
    socialLinks: {
        github: { type: String },
        linkedin: { type: String },
        twitter: { type: String }
    },
    lastUpdated: { type: Date, default: Date.now }
});

// Project Schema
const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    technologies: [{ type: String }],
    imageUrl: { type: String },
    githubUrl: { type: String },
    liveUrl: { type: String },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
});

// Create models
const User = mongoose.model('User', userSchema);
const Portfolio = mongoose.model('Portfolio', portfolioSchema);
const Project = mongoose.model('Project', projectSchema);

// -------------------- Authentication Middleware --------------------

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Requires admin privileges' });
    }
    next();
};

// Initialize admin user if not exists
const initAdminUser = async () => {
    try {
        const adminExists = await User.findOne({ username: 'admin' });

        if (!adminExists) {
            // Check if admin credentials are provided in environment variables
            if (!process.env.VITE_ADMIN_PASSWORD || !process.env.VITE_ADMIN_USERNAME) {
                console.error('ERROR: VITE_ADMIN_USERNAME and/or VITE_ADMIN_PASSWORD environment variables are not set.');
                console.error('Admin user creation skipped for security reasons.');
                return;
            }

            const hashedPassword = await bcrypt.hash(
                process.env.VITE_ADMIN_PASSWORD,
                10
            );

            await User.create({
                username: process.env.VITE_ADMIN_USERNAME,
                password: hashedPassword,
                isAdmin: true
            });

            console.log('Admin user created');
        }
    } catch (error) {
        console.error('Error initializing admin user:', error);
    }
};

// Initialize portfolio data if not exists
const initPortfolioData = async () => {
    try {
        const portfolioExists = await Portfolio.findOne({});

        if (!portfolioExists) {
            await Portfolio.create({
                profileImage: process.env.VITE_PROFILE_IMAGE_URL || 'photos/profile-pic.png',
                cvViewUrl: process.env.VITE_CV_VIEW_URL,
                cvDownloadUrl: process.env.VITE_CV_DOWNLOAD_URL,
                personalInfo: {
                    name: '',      // Will be loaded from LinkedIn API
                    title: '',     // Will be loaded from LinkedIn API
                    email: process.env.VITE_CONTACT_EMAIL || '',     // Loaded from environment variable
                    location: '',  // Will be loaded from LinkedIn API
                    bio: ''        // Will be loaded from LinkedIn API
                },
                socialLinks: {
                    github: process.env.VITE_GITHUB_URL,
                    linkedin: process.env.VITE_LINKEDIN_URL
                }
            });

            console.log('Portfolio data initialized');
        }
    } catch (error) {
        console.error('Error initializing portfolio data:', error);
    }
};

// Initialize data
initAdminUser();
initPortfolioData();

// -------------------- Authentication Routes --------------------

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user._id, username: user.username, isAdmin: user.isAdmin } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// -------------------- Portfolio Routes --------------------

// Helper function to ensure image URLs have proper domain
const ensureFullUrls = (data) => {
    if (!data) return data;

    // Create a deep copy to avoid modifying the original
    const result = JSON.parse(JSON.stringify(data));

    // Function to process URL fields
    const processUrl = (url) => {
        if (!url || typeof url !== 'string') return url;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;

        if (url.startsWith('/uploads/')) {
            return `${process.env.SERVER_URL || `http://${process.env.HOST || 'localhost'}:${PORT}`}${url}`;
        }

        return url;
    };

    // Process profile image
    if (result.profileImage) {
        result.profileImage = processUrl(result.profileImage);
    }

    return result;
};

// Get portfolio data
app.get('/api/portfolio', async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({});
        const processedPortfolio = ensureFullUrls(portfolio);
        res.json(processedPortfolio || {});
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update portfolio data
app.put('/api/portfolio', verifyToken, isAdmin, async (req, res) => {
    try {
        const { personalInfo, socialLinks, cvViewUrl, cvDownloadUrl, profileImage } = req.body;

        // Create update object with only the fields that are provided
        const updateObj = { lastUpdated: new Date() };

        if (personalInfo) updateObj.personalInfo = personalInfo;
        if (socialLinks) updateObj.socialLinks = socialLinks;
        if (cvViewUrl !== undefined) updateObj.cvViewUrl = cvViewUrl;
        if (cvDownloadUrl !== undefined) updateObj.cvDownloadUrl = cvDownloadUrl;
        if (profileImage !== undefined) updateObj.profileImage = profileImage;

        const updatedPortfolio = await Portfolio.findOneAndUpdate(
            {},
            { $set: updateObj },
            { new: true, upsert: true }
        );

        res.json(updatedPortfolio);
    } catch (error) {
        console.error('Error updating portfolio data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload profile image
app.post('/api/portfolio/profile-image', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const fullImageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
        console.log('Generated full image URL:', fullImageUrl);

        // Delete previous profile image if it exists
        const currentPortfolio = await Portfolio.findOne({});
        if (currentPortfolio?.profileImage) {
            // Extract filename from the URL
            const filenamePart = currentPortfolio.profileImage.split('/').pop();
            if (filenamePart) {
                const oldImagePath = path.join(uploadDir, filenamePart);
                console.log('Checking for old image at:', oldImagePath);
                if (fs.existsSync(oldImagePath)) {
                    console.log('Deleting old image:', oldImagePath);
                    fs.unlinkSync(oldImagePath);
                }
            }
        }

        // Update portfolio with new image URL
        const updatedPortfolio = await Portfolio.findOneAndUpdate(
            {},
            { $set: { profileImage: fullImageUrl, lastUpdated: new Date() } },
            { new: true, upsert: true }
        );

        res.json({
            imageUrl: fullImageUrl,
            message: 'Profile image uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading profile image:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete profile image
app.delete('/api/portfolio/profile-image', verifyToken, isAdmin, async (req, res) => {
    try {
        const portfolio = await Portfolio.findOne({});

        if (portfolio?.profileImage && portfolio.profileImage.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, portfolio.profileImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        const updatedPortfolio = await Portfolio.findOneAndUpdate(
            {},
            { $set: { profileImage: '', lastUpdated: new Date() } },
            { new: true }
        );

        res.json({
            message: 'Profile image deleted successfully',
            portfolio: updatedPortfolio
        });
    } catch (error) {
        console.error('Error deleting profile image:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// -------------------- Projects Routes --------------------

// Get all projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ order: 1 });
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single project
app.get('/api/projects/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create project
app.post('/api/projects', verifyToken, isAdmin, async (req, res) => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update project
app.put('/api/projects/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete project
app.delete('/api/projects/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(req.params.id);

        if (!deletedProject) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Upload project image
app.post('/api/projects/upload-image', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const fullImageUrl = `${req.protocol}://${req.get('host')}${imageUrl}`;
        console.log('Generated full project image URL:', fullImageUrl);

        res.json({
            imageUrl: fullImageUrl,
            message: 'Project image uploaded successfully'
        });
    } catch (error) {
        console.error('Error uploading project image:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// -------------------- LinkedIn API Proxy --------------------

app.post('/api/linkedin-profile', async (req, res) => {
    try {
        console.log('LinkedIn profile API endpoint called');
        const { profileUrl } = req.body;

        if (!profileUrl) {
            console.error('No profile URL provided');
            return res.status(400).json({ error: 'Profile URL is required' });
        }

        console.log('Fetching LinkedIn profile using username: amr-elganainy');
        const apiToken = process.env.VITE_APIFY_TOKEN;

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

        // Step 1: Start the actor run
        const startRunResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "includeEmail": true,
                "username": "amr-elganainy"
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

            // Return the first profile (as we're only scraping one)
            console.log('Sending profile data to client');
            return res.json(runData[0]);
        }

        // Step 2: If we didn't get direct data in the previous step, then we need to poll for run completion
        // This happens when using the 'run-sync' endpoint instead of 'run-sync-get-dataset-items'
        const runId = runData.data && runData.data.id;

        if (!runId) {
            console.error('No run ID found in response');
            return res.status(500).json({
                error: 'Invalid response from Apify API, no run ID found',
                details: JSON.stringify(runData).substring(0, 500)
            });
        }

        console.log('Apify actor run started with ID:', runId);
        const maxWaitTime = 60000; // 1 minute timeout
        const startTime = Date.now();
        let isFinished = false;
        let runStatus;

        console.log('Polling for run completion...');
        while (!isFinished && (Date.now() - startTime < maxWaitTime)) {
            // Wait 2 seconds between status checks
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Check run status
            const statusResponse = await fetch(
                `https://api.apify.com/v2/actor-runs/${runId}?token=${apiToken}`
            );

            if (!statusResponse.ok) {
                console.warn(`Error checking run status: ${statusResponse.status}`);
                continue;
            }

            runStatus = await statusResponse.json();
            console.log('Run status:', runStatus.data.status);

            if (['SUCCEEDED', 'FAILED', 'TIMED-OUT', 'ABORTED'].includes(runStatus.data.status)) {
                isFinished = true;
                console.log('Apify actor run finished with status:', runStatus.data.status);
            } else {
                console.log('Apify actor run still in progress:', runStatus.data.status);
            }
        }

        // Check if the run finished successfully
        if (!isFinished) {
            console.error('Apify actor run timed out');
            return res.status(504).json({ error: 'Apify actor run timed out' });
        }

        if (runStatus.data.status !== 'SUCCEEDED') {
            console.error('Apify actor run failed with status:', runStatus.data.status);
            return res.status(500).json({
                error: `Apify actor run failed with status: ${runStatus.data.status}`
            });
        }

        // Step 3: Get the results
        console.log('Fetching dataset results...');
        const resultsResponse = await fetch(
            `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiToken}`
        );

        if (!resultsResponse.ok) {
            console.error('Failed to fetch results:', resultsResponse.status, resultsResponse.statusText);
            return res.status(resultsResponse.status).json({
                error: `Failed to fetch results: ${resultsResponse.status} ${resultsResponse.statusText}`
            });
        }

        const results = await resultsResponse.json();
        console.log('Results received, items count:', results.length);

        if (!results || results.length === 0) {
            console.error('No LinkedIn profile data returned');
            return res.status(404).json({ error: 'No LinkedIn profile data returned from Apify' });
        }

        // Return the first profile (as we're only scraping one)
        console.log('Sending profile data to client');
        res.json(results[0]);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: 'Server error processing LinkedIn profile request',
            message: error.message
        });
    }
});

// Start the server
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => { // Listen on all interfaces for deployment
    console.log(`Portfolio API server running on http://localhost:${PORT}`);
    console.log(`Access the health check at http://localhost:${PORT}/api/health`);
    console.log('LinkedIn API Proxy is enabled with Apify integration');
    console.log('API Token status:', process.env.VITE_APIFY_TOKEN ? 'Available' : 'Missing');
});
