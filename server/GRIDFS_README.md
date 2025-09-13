# GridFS File Storage Implementation

This document describes the GridFS file storage implementation for the multi-user portfolio platform.

## Overview

The application now uses **MongoDB GridFS** for storing user files (profile images, CVs, and project images) instead of local file storage. This provides better scalability, reliability, and integration with MongoDB Atlas.

## Features

- ✅ **GridFS Integration**: Files stored in MongoDB Atlas using GridFS
- ✅ **File Upload**: Support for profile images, CVs, and project images
- ✅ **File Serving**: RESTful API endpoints to serve files
- ✅ **File Management**: Upload, download, and delete operations
- ✅ **Security**: User ownership validation for file access
- ✅ **Migration Support**: Script to migrate existing local files

## File Types Supported

### Profile Images
- **Formats**: JPEG, JPG, PNG, GIF, WebP
- **Max Size**: 5MB
- **Endpoint**: `POST /api/profile/upload-profile-image`

### CV Files
- **Formats**: PDF, DOC, DOCX
- **Max Size**: 10MB
- **Endpoint**: `POST /api/profile/upload-cv`

### Project Images
- **Formats**: JPEG, JPG, PNG, GIF, WebP
- **Max Size**: 5MB
- **Endpoint**: `POST /api/projects/upload-image/:projectId`

## API Endpoints

### File Serving
```
GET /api/files/:fileId
```
Serves files from GridFS with proper content-type headers and caching.

### File Upload
```javascript
// Profile Image Upload
const formData = new FormData();
formData.append('profileImage', imageFile);
await apiClient.post('/api/profile/upload-profile-image', formData);

// CV Upload
const formData = new FormData();
formData.append('cvFile', cvFile);
await apiClient.post('/api/profile/upload-cv', formData);

// Project Image Upload
const formData = new FormData();
formData.append('image', imageFile);
await apiClient.post(`/api/projects/upload-image/${projectId}`, formData);
```

### File Deletion
```
DELETE /api/files/:fileId
```
Deletes files from GridFS (requires authentication and ownership).

## Database Schema Changes

### Profile Model
```javascript
{
  // ... existing fields
  profileImage: String,    // URL to access the file
  profileImageId: ObjectId, // GridFS file ID
  cvFile: String,          // URL to access the file
  cvFileId: ObjectId       // GridFS file ID
}
```

### Project Model
```javascript
{
  // ... existing fields
  imageUrl: String,        // URL to access the file
  imageId: ObjectId        // GridFS file ID
}
```

## Migration from Local Storage

If you have existing files in the local `uploads/` directory, run the migration script:

```bash
cd server
node scripts/migrate-to-gridfs.js
```

**Note**: The migration script is a template. You may need to customize it based on your specific file structure and requirements.

## Benefits of GridFS

1. **Scalability**: Files stored in MongoDB Atlas scale automatically
2. **Reliability**: Files are replicated across MongoDB Atlas clusters
3. **Backup**: Files included in MongoDB Atlas backups
4. **Cost Effective**: No additional cloud storage costs
5. **Atomic Operations**: File metadata and content stored atomically
6. **Large Files**: Support for files larger than 16MB (BSON limit)

## Configuration

No additional configuration is required. The system uses your existing MongoDB Atlas connection string from the environment variables.

## File Access URLs

Files are accessed via URLs like:
```
http://yourdomain.com/api/files/[fileId]
```

Example:
```javascript
// Get profile image URL
const profileImageUrl = profile.profileImage; // e.g., "/api/files/507f1f77bcf86cd799439011"

// Display image in React
<img src={profileImageUrl} alt="Profile" />
```

## Error Handling

The system includes comprehensive error handling for:
- File not found (404)
- Unauthorized access (403)
- File type validation
- File size limits
- GridFS connection issues

## Security Considerations

- Files are validated for type and size before upload
- User ownership is verified for file operations
- File metadata includes upload timestamps and user information
- GridFS files are not directly accessible via MongoDB queries

## Troubleshooting

### Common Issues

1. **GridFS not initialized**: Ensure MongoDB connection is established before file operations
2. **File not found**: Check if the file ID is correct and the file exists
3. **Upload fails**: Verify file type and size meet requirements
4. **Permission denied**: Ensure user is authenticated and owns the file

### Debug Mode

Enable debug logging by setting the environment variable:
```bash
DEBUG=gridfs:*
```

## Future Enhancements

- File compression and optimization
- Image resizing and thumbnails
- CDN integration for faster file delivery
- Batch file operations
- File versioning
- Advanced file search and filtering