const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const path = require('path');
const config = require('../config');

class FileStorageService {
    constructor() {
        this.gfs = null;
        this.gridfsBucket = null;
        this.initGridFS();
    }

    initGridFS() {
        // Wait for MongoDB connection to be established
        const initWhenReady = () => {
            if (mongoose.connection.readyState === 1) {
                this.initializeBucket();
            } else {
                // Wait a bit and try again
                setTimeout(initWhenReady, 100);
            }
        };

        // Initialize when connection opens
        mongoose.connection.once('open', () => {
            this.initializeBucket();
        });

        // Also try to initialize if connection becomes ready later
        mongoose.connection.on('connected', () => {
            this.initializeBucket();
        });

        // Start trying immediately
        initWhenReady();
    }

    initializeBucket() {
        try {
            console.log('Attempting to initialize GridFS bucket...');
            console.log('MongoDB connection state:', mongoose.connection.readyState);
            console.log('Database name:', mongoose.connection.db ? mongoose.connection.db.databaseName : 'No database');

            if (mongoose.connection.readyState !== 1) {
                console.log('MongoDB not connected, skipping GridFS initialization');
                return;
            }

            this.gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
                bucketName: 'uploads'
            });
            console.log('GridFS initialized successfully');
        } catch (error) {
            console.error('Error initializing GridFS bucket:', error);
        }
    }

    // Ensure GridFS is ready for operations
    ensureGridFSReady() {
        if (!this.gridfsBucket) {
            if (mongoose.connection.readyState === 1) {
                this.initializeBucket();
            } else {
                console.log('MongoDB connection not ready for GridFS initialization');
                return false;
            }
        }
        return this.gridfsBucket !== null;
    }

    // Create multer storage for GridFS
    createGridFSStorage() {
        return new GridFsStorage({
            url: config.database.mongoUri,
            options: { useNewUrlParser: true, useUnifiedTopology: true },
            file: (req, file) => {
                return new Promise((resolve, reject) => {
                    // Generate unique filename
                    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;

                    const fileInfo = {
                        filename: filename,
                        bucketName: 'uploads',
                        metadata: {
                            originalName: file.originalname,
                            uploadDate: new Date(),
                            userId: req.user ? req.user.id : null,
                            mimetype: file.mimetype,
                            size: file.size
                        }
                    };

                    resolve(fileInfo);
                });
            }
        });
    }

    // Create multer upload middleware
    createUploadMiddleware(options = {}) {
        const storage = this.createGridFSStorage();

        return multer({
            storage: storage,
            limits: {
                fileSize: options.maxSize || 5 * 1024 * 1024, // 5MB default
            },
            fileFilter: (req, file, cb) => {
                // Default file filter - can be customized
                if (options.allowedTypes) {
                    const filetypes = options.allowedTypes;
                    const mimetype = filetypes.test(file.mimetype);
                    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

                    if (mimetype && extname) {
                        return cb(null, true);
                    } else {
                        cb(new Error(`File type not allowed. Allowed types: ${options.allowedTypes}`));
                    }
                } else {
                    cb(null, true);
                }
            }
        });
    }

    // Get file by ID
    async getFile(fileId) {
        if (!this.ensureGridFSReady()) {
            throw new Error('GridFS bucket not initialized');
        }

        try {
            // Use MongoDB driver directly to find file
            const files = await mongoose.connection.db.collection('uploads.files').findOne({
                _id: new mongoose.Types.ObjectId(fileId)
            });
            return files;
        } catch (error) {
            console.error('Error getting file:', error);
            throw error;
        }
    }

    // Get file stream for download
    getFileStream(fileId) {
        if (!this.ensureGridFSReady()) {
            throw new Error('GridFS bucket not initialized');
        }

        try {
            return this.gridfsBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
        } catch (error) {
            console.error('Error getting file stream:', error);
            throw error;
        }
    }

    // Delete file
    async deleteFile(fileId) {
        if (!this.ensureGridFSReady()) {
            throw new Error('GridFS bucket not initialized');
        }

        try {
            await this.gridfsBucket.delete(new mongoose.Types.ObjectId(fileId));
            return true;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

    // Get files by user ID
    async getUserFiles(userId) {
        try {
            const files = await mongoose.connection.db.collection('uploads.files').find({
                'metadata.userId': userId
            }).toArray();
            return files;
        } catch (error) {
            console.error('Error getting user files:', error);
            throw error;
        }
    }

    // Generate file URL
    generateFileUrl(fileId, req = null) {
        if (req) {
            // Use request object to construct full URL
            const protocol = config.server.nodeEnv === 'production' ? 'https' : req.protocol;
            return `${protocol}://${req.get('host')}/api/files/${fileId}`;
        } else {
            // Return relative URL
            return `/api/files/${fileId}`;
        }
    }

    // Check if GridFS is ready
    isReady() {
        return this.gridfsBucket !== null;
    }
}

module.exports = new FileStorageService();