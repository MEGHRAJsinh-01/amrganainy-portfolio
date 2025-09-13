const mongoose = require('mongoose');

// Get MongoDB connection string from environment or use default
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

console.log('Clearing database...');

// Connect to MongoDB
mongoose.connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Define simple schemas for your collections
const portfolioSchema = new mongoose.Schema({}, { strict: false });
const projectSchema = new mongoose.Schema({}, { strict: false });
const userSchema = new mongoose.Schema({}, { strict: false });

// Create models
const Portfolio = mongoose.model('Portfolio', portfolioSchema);
const Project = mongoose.model('Project', projectSchema);
const User = mongoose.model('User', userSchema);

// Function to clear collection
async function clearCollection(model, name) {
    try {
        const result = await model.deleteMany({});
        console.log(`Cleared ${result.deletedCount} documents from ${name} collection`);
        return result.deletedCount;
    } catch (err) {
        console.error(`Error clearing ${name} collection:`, err);
        return 0;
    }
}

// Clear all collections
async function clearAllCollections() {
    try {
        console.log('\nClearing all collections...');

        const portfolioCount = await clearCollection(Portfolio, 'Portfolio');
        const projectCount = await clearCollection(Project, 'Projects');
        const userCount = await clearCollection(User, 'Users');

        const totalCleared = portfolioCount + projectCount + userCount;
        console.log(`\n✅ Database cleared successfully!`);
        console.log(`Total documents removed: ${totalCleared}`);

        // Close connection when done
        mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (err) {
        console.error('Error clearing database:', err);
        mongoose.connection.close();
        process.exit(1);
    }
}

// Run the function
clearAllCollections();