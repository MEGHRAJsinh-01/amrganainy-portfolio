const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// GET /api/files/:id - Stream a file from GridFS
router.get('/:id', (req, res) => {
    try {
        const gridfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: 'uploads'
        });

        const fileId = new mongoose.Types.ObjectId(req.params.id);

        const downloadStream = gridfsBucket.openDownloadStream(fileId);

        downloadStream.on('file', (file) => {
            res.set('Content-Type', file.contentType);
            res.set('Content-Disposition', `inline; filename="${file.filename}"`);
        });

        downloadStream.on('data', (chunk) => {
            res.write(chunk);
        });

        downloadStream.on('error', (err) => {
            console.error('Error streaming file from GridFS:', err);
            if (!res.headersSent) {
                res.status(404).json({
                    status: 'error',
                    message: 'File not found or error streaming file.'
                });
            }
        });

        downloadStream.on('end', () => {
            res.end();
        });

    } catch (error) {
        console.error('Error creating download stream:', error);
        res.status(400).json({
            status: 'error',
            message: 'Invalid file ID format.'
        });
    }
});

module.exports = router;
