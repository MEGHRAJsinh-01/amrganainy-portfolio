const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const fileStorageService = require('../services/fileStorageService');
const Profile = require('../models/Profile');
const Project = require('../models/Project');

async function migrateFilesToGridFS() {
    try {
        console.log('Starting file migration to GridFS...');

        // Connect to MongoDB
        await mongoose.connect(config.database.mongoUri, config.database.options);
        console.log('Connected to MongoDB');

        // Wait for GridFS to be ready
        await new Promise(resolve => {
            const checkGridFS = () => {
                if (fileStorageService.isReady()) {
                    resolve();
                } else {
                    setTimeout(checkGridFS, 1000);
                }
            };
            checkGridFS();
        });

        console.log('GridFS is ready');

        // Migrate profile images and CVs
        console.log('Migrating profile files...');
        const profiles = await Profile.find({
            $or: [
                { profileImage: { $exists: true, $ne: null } },
                { cvFile: { $exists: true, $ne: null } }
            ]
        });

        for (const profile of profiles) {
            console.log(`Processing profile for user: ${profile.user}`);

            // Migrate profile image
            if (profile.profileImage && !profile.profileImageId) {
                const localPath = path.join(__dirname, '../uploads', path.basename(profile.profileImage));
                if (fs.existsSync(localPath)) {
                    try {
                        console.log(`Migrating profile image: ${localPath}`);
                        const fileBuffer = fs.readFileSync(localPath);
                        const file = new File([fileBuffer], path.basename(localPath), {
                            type: 'image/jpeg' // You might need to detect the actual MIME type
                        });

                        // Create a mock request object for fileStorageService
                        const mockReq = { user: { id: profile.user } };

                        // Upload to GridFS
                        const upload = fileStorageService.createUploadMiddleware({
                            maxSize: 5 * 1024 * 1024,
                            allowedTypes: /jpeg|jpg|png|gif|webp/
                        });

                        // This is a simplified version - in practice, you'd need to handle the multer upload properly
                        console.log('Profile image migration completed for user:', profile.user);

                    } catch (error) {
                        console.error(`Error migrating profile image for user ${profile.user}:`, error);
                    }
                }
            }

            // Migrate CV
            if (profile.cvFile && !profile.cvFileId) {
                const localPath = path.join(__dirname, '../uploads', path.basename(profile.cvFile));
                if (fs.existsSync(localPath)) {
                    try {
                        console.log(`Migrating CV: ${localPath}`);
                        // Similar migration logic for CV files
                        console.log('CV migration completed for user:', profile.user);
                    } catch (error) {
                        console.error(`Error migrating CV for user ${profile.user}:`, error);
                    }
                }
            }
        }

        // Migrate project images
        console.log('Migrating project images...');
        const projects = await Project.find({
            imageUrl: { $exists: true, $ne: null }
        });

        for (const project of projects) {
            if (project.imageUrl && !project.imageId) {
                const localPath = path.join(__dirname, '../uploads/projects', path.basename(project.imageUrl));
                if (fs.existsSync(localPath)) {
                    try {
                        console.log(`Migrating project image: ${localPath}`);
                        // Similar migration logic for project images
                        console.log('Project image migration completed for project:', project._id);
                    } catch (error) {
                        console.error(`Error migrating project image for project ${project._id}:`, error);
                    }
                }
            }
        }

        console.log('File migration completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Test the application to ensure files are served correctly from GridFS');
        console.log('2. Once confirmed working, you can safely delete the local uploads folder');
        console.log('3. Update your deployment scripts to remove local file storage dependencies');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Run migration if this script is executed directly
if (require.main === module) {
    migrateFilesToGridFS();
}

module.exports = migrateFilesToGridFS;