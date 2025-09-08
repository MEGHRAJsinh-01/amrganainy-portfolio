const mongoose = require('mongoose');

// Get MongoDB connection string from environment or use default
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';

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

// Function to display collection data
async function displayCollection(model, name) {
    console.log(`\n===== ${name} Collection =====`);
    try {
        const documents = await model.find();
        if (documents.length === 0) {
            console.log(`No documents found in ${name} collection`);
        } else {
            documents.forEach((doc, index) => {
                console.log(`\n--- Document ${index + 1} ---`);
                console.log(JSON.stringify(doc.toObject(), null, 2));
            });
            console.log(`\nTotal: ${documents.length} documents in ${name} collection`);
        }
    } catch (err) {
        console.error(`Error querying ${name} collection:`, err);
    }
}

// View all collections
async function viewAllCollections() {
    try {
        await displayCollection(Portfolio, 'Portfolio');
        await displayCollection(Project, 'Projects');
        await displayCollection(User, 'Users');

        // Close connection when done
        mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    } catch (err) {
        console.error('Error:', err);
        mongoose.connection.close();
    }
}

// Run the function
viewAllCollections();
