// Server-side constants
// These should be separate from client constants to avoid cross-dependency issues

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// GitHub username from environment variables
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || process.env.VITE_GITHUB_USERNAME;

module.exports = {
    CACHE_DURATION,
    GITHUB_USERNAME
};