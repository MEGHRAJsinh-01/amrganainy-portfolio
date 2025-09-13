const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fileStorageService = require('../services/fileStorageService');

// @route   GET api/files/:fileId
// @desc    Get file from GridFS
// @access  Public
router.get('/:fileId', async (req, res) => {
    try {
        const fileId = req.params.fileId;

        // Validate fileId
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ message: 'Invalid file ID' });
        }

        // Get file info
        const file = await fileStorageService.getFile(fileId);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Set appropriate headers
        res.set({
            'Content-Type': file.metadata.mimetype || 'application/octet-stream',
            'Content-Disposition': `inline; filename="${file.metadata.originalName || file.filename}"`,
            'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
        });

        // Stream file to response
        const downloadStream = fileStorageService.getFileStream(fileId);
        downloadStream.pipe(res);

        // Handle stream errors
        downloadStream.on('error', (error) => {
            console.error('Stream error:', error);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Error streaming file' });
            }
        });

    } catch (error) {
        console.error('Error serving file:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error' });
        }
    }
});

// @route   DELETE api/files/:fileId
// @desc    Delete file from GridFS
// @access  Private (requires auth)
router.delete('/:fileId', async (req, res) => {
    try {
        const fileId = req.params.fileId;

        // Validate fileId
        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({ message: 'Invalid file ID' });
        }

        // Get file info first to check ownership
        const file = await fileStorageService.getFile(fileId);

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Check if user owns the file (if userId is stored in metadata)
        if (file.metadata.userId && file.metadata.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this file' });
        }

        // Delete the file
        await fileStorageService.deleteFile(fileId);

        res.json({ message: 'File deleted successfully' });

    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;