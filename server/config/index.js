/**
 * Configuration management system
 * Loads environment-specific configurations based on NODE_ENV
 */
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// Determine which environment we're in
const environment = process.env.NODE_ENV || 'development';
console.log(`Loading configuration for environment: ${environment}`);

// Define the paths to the environment files
const ENV_PATHS = {
    development: path.resolve(__dirname, '../.env.local'),
    production: path.resolve(__dirname, '../.env.production'),
    test: path.resolve(__dirname, '../.env.test')
};

// Load environment variables from the appropriate file
const envPath = ENV_PATHS[environment];
if (fs.existsSync(envPath)) {
    console.log(`Loading environment variables from: ${envPath}`);
    dotenv.config({ path: envPath });
} else {
    console.warn(`Environment file not found: ${envPath}`);
    console.warn('Using default environment variables');
}

// Configuration with environment-specific overrides and sensible defaults
const config = {
    // Server configuration
    server: {
        port: parseInt(process.env.PORT, 10) || 3000,
        host: process.env.HOST || '0.0.0.0',
        nodeEnv: environment,
        isDevelopment: environment === 'development',
        isProduction: environment === 'production',
        isTest: environment === 'test'
    },

    // Database configuration
    database: {
        mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },

    // Frontend URLs
    frontend: {
        url: process.env.FRONTEND_URL || (environment === 'development'
            ? 'http://localhost:5173'
            : 'https://yourproductionurl.com'),
        // Development allowed origins
        corsOrigins: [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            'http://localhost:3000',
            // You can add more origins here for different environments
            ...(process.env.ADDITIONAL_CORS_ORIGINS
                ? process.env.ADDITIONAL_CORS_ORIGINS.split(',')
                : [])
        ]
    },

    // Authentication configuration
    auth: {
        jwtSecret: process.env.JWT_SECRET || 'your_development_jwt_secret',
        tokenExpiration: '1d',
        admin: {
            username: process.env.VITE_ADMIN_USERNAME,
            password: process.env.VITE_ADMIN_PASSWORD
        }
    },

    // JWT configuration (for backward compatibility with auth controller)
    jwt: {
        secret: process.env.JWT_SECRET || 'your_development_jwt_secret',
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        cookieExpiresIn: parseInt(process.env.JWT_COOKIE_EXPIRES_IN, 10) || 1 // days
    },

    // API Services
    services: {
        apify: {
            token: process.env.VITE_APIFY_TOKEN
        }
    },

    // Upload settings
    uploads: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
        serverUrl: process.env.SERVER_URL || null,
        getFullUrl: (req, path) => {
            // Use SERVER_URL from environment if available, otherwise construct from request
            if (config.uploads.serverUrl) {
                return `${config.uploads.serverUrl}${path}`;
            }

            const protocol = environment === 'production' ? 'https' : req.protocol;
            return `${protocol}://${req.get('host')}${path}`;
        }
    },

    // Portfolio settings - meta defaults only; content is stored in MongoDB
    // via the Profile model and managed through the admin panel.
    portfolio: {
        defaultProfileImage: '',  // No default, use what's in the database
        cvViewUrl: '',            // Stored in DB (Profile)
        cvDownloadUrl: '',        // Stored in DB (Profile)
        contactEmail: ''          // Stored in DB (Profile)
        // Note: Social links (GitHub, LinkedIn, etc.) live in Profile.socialLinks.
    }
};

module.exports = config;
