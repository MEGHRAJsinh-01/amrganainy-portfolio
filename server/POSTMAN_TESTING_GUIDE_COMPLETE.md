# Portfolio Multi-User API - Complete Postman Testing Guide

## Overview
This guide provides comprehensive testing instructions for all endpoints in your Portfolio Multi-User API with GridFS file storage integration.

## Setup Instructions

### 1. Environment Variables
Create a new environment in Postman with these variables:
- `baseUrl`: `http://localhost:3001` (your server port)
- `token`: (will be set automatically after login)
- `admin_token`: (will be set after admin login)
- `user_id`: (will be set after getting user info)
- `project_id`: (will be set after creating a project)
- `file_id_from_upload`: (will be set after file uploads)

### 2. Authentication Flow
1. Register a new user
2. Login to get JWT token
3. Use the token in subsequent requests

---

## API Endpoints Testing

### Health Check
**Method:** GET  
**URL:** `{{baseUrl}}/api/health`  
**Auth:** None  
**Expected Response:** 200 OK with server status

### Authentication Endpoints

#### Register User
**Method:** POST  
**URL:** `{{baseUrl}}/api/auth/register`  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "username": "testuser123",
  "email": "testuser@example.com",
  "password": "password123"
}
```

#### Login
**Method:** POST  
**URL:** `{{baseUrl}}/api/auth/login`  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "email": "testuser@example.com",
  "password": "password123"
}
```
**Tests Script:**
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
}
```

#### Get Current User
**Method:** GET  
**URL:** `{{baseUrl}}/api/auth/me`  
**Headers:** `Authorization: Bearer {{token}}`

#### Update Password
**Method:** PUT  
**URL:** `{{baseUrl}}/api/auth/update-password`  
**Headers:** `Authorization: Bearer {{token}}`  
**Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newPassword123"
}
```

### Profile Endpoints

#### Get User Profile
**Method:** GET  
**URL:** `{{baseUrl}}/api/profiles/me`  
**Headers:** `Authorization: Bearer {{token}}`

#### Update Profile
**Method:** PUT  
**URL:** `{{baseUrl}}/api/profiles/me`  
**Headers:** `Authorization: Bearer {{token}}`  
**Body:**
```json
{
  "name": "Test User",
  "title": "Full Stack Developer",
  "bio": "Experienced developer with a passion for building web applications",
  "location": "New York, USA",
  "skills": ["JavaScript", "React", "Node.js"],
  "socialLinks": {
    "github": "https://github.com/testuser",
    "linkedin": "https://linkedin.com/in/testuser"
  }
}
```

#### Get Profile by Username (Public)
**Method:** GET  
**URL:** `{{baseUrl}}/api/profile/user/:username`  
**Auth:** None  
**URL Params:** `username: testuser123`

#### Get CV by Username (Public)
**Method:** GET  
**URL:** `{{baseUrl}}/api/profile/cv/:username`  
**Auth:** None  
**URL Params:** `username: testuser123`

### File Upload Endpoints (GridFS)

#### Upload Profile Image
**Method:** POST  
**URL:** `{{baseUrl}}/api/profile/upload-profile-image`  
**Headers:** `Authorization: Bearer {{token}}`  
**Body:** Form-data  
- Key: `profileImage`  
- Type: File  
- Select an image file (JPEG, PNG, WebP, GIF < 5MB)

**Tests Script:**
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("profile_image_id", jsonData.profileImageId);
}
```

#### Upload CV
**Method:** POST  
**URL:** `{{baseUrl}}/api/profile/upload-cv`  
**Headers:** `Authorization: Bearer {{token}}`  
**Body:** Form-data  
- Key: `cvFile`  
- Type: File  
- Select a PDF, DOC, or DOCX file (< 10MB)

**Tests Script:**
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("cv_file_id", jsonData.cvFileId);
}
```

### Project Endpoints

#### Create Project
**Method:** POST  
**URL:** `{{baseUrl}}/api/projects`  
**Headers:** `Authorization: Bearer {{token}}`  
**Body:**
```json
{
  "title": "Test Project",
  "description": "This is a test project",
  "technologies": ["React", "Node.js", "MongoDB"],
  "githubUrl": "https://github.com/testuser/test-project",
  "liveUrl": "https://test-project.com",
  "featured": true
}
```

**Tests Script:**
```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("project_id", jsonData._id);
}
```

#### Get User's Projects
**Method:** GET  
**URL:** `{{baseUrl}}/api/projects`  
**Headers:** `Authorization: Bearer {{token}}`

#### Get Project by ID
**Method:** GET  
**URL:** `{{baseUrl}}/api/projects/{{project_id}}`  
**Headers:** `Authorization: Bearer {{token}}`

#### Get Projects by Username (Public)
**Method:** GET  
**URL:** `{{baseUrl}}/api/projects/user/:username`  
**Auth:** None  
**URL Params:** `username: testuser123`

#### Update Project
**Method:** PUT  
**URL:** `{{baseUrl}}/api/projects/{{project_id}}`  
**Headers:** `Authorization: Bearer {{token}}`  
**Body:**
```json
{
  "title": "Updated Test Project",
  "description": "This is an updated test project",
  "technologies": ["React", "Node.js", "MongoDB", "Express"],
  "featured": false
}
```

#### Upload Project Image
**Method:** POST  
**URL:** `{{baseUrl}}/api/projects/upload-image/{{project_id}}`  
**Headers:** `Authorization: Bearer {{token}}`  
**Body:** Form-data  
- Key: `image`  
- Type: File  
- Select an image file (JPEG, PNG, WebP, GIF < 5MB)

**Tests Script:**
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("project_image_id", jsonData.imageId);
}
```

#### Reorder Projects
**Method:** PATCH  
**URL:** `{{baseUrl}}/api/projects/reorder`  
**Headers:** `Authorization: Bearer {{token}}`  
**Body:**
```json
{
  "projects": [
    {
      "id": "{{project_id}}",
      "order": 1
    }
  ]
}
```

#### Delete Project
**Method:** DELETE  
**URL:** `{{baseUrl}}/api/projects/{{project_id}}`  
**Headers:** `Authorization: Bearer {{token}}`

### File Management Endpoints

#### View File
**Method:** GET  
**URL:** `{{baseUrl}}/api/files/:fileId`  
**Headers:** `Authorization: Bearer {{token}}`  
**URL Params:** `fileId: {{profile_image_id}}` or `{{cv_file_id}}` or `{{project_image_id}}`

#### Delete File
**Method:** DELETE  
**URL:** `{{baseUrl}}/api/files/:fileId`  
**Headers:** `Authorization: Bearer {{token}}`  
**URL Params:** `fileId: {{profile_image_id}}` or `{{cv_file_id}}` or `{{project_image_id}}`

### Admin Endpoints

#### Get All Users (Admin Only)
**Method:** GET  
**URL:** `{{baseUrl}}/api/admin/users`  
**Headers:** `Authorization: Bearer {{admin_token}}`

#### Get User by ID (Admin Only)
**Method:** GET  
**URL:** `{{baseUrl}}/api/admin/users/:userId`  
**Headers:** `Authorization: Bearer {{admin_token}}`  
**URL Params:** `userId: {{user_id}}`

#### Update User (Admin Only)
**Method:** PUT  
**URL:** `{{baseUrl}}/api/admin/users/:userId`  
**Headers:** `Authorization: Bearer {{admin_token}}`  
**Body:**
```json
{
  "role": "admin",
  "isActive": true
}
```

#### Delete User (Admin Only)
**Method:** DELETE  
**URL:** `{{baseUrl}}/api/admin/users/:userId`  
**Headers:** `Authorization: Bearer {{admin_token}}`

### LinkedIn Integration

#### Get LinkedIn Profile
**Method:** POST  
**URL:** `{{baseUrl}}/api/linkedin-profile`  
**Headers:** `Content-Type: application/json`  
**Body:**
```json
{
  "profileUrl": "https://linkedin.com/in/username"
}
```

---

## Testing Workflow

### 1. Basic Authentication Flow
1. ✅ Register User
2. ✅ Login (token will be saved automatically)
3. ✅ Get Current User
4. ✅ Update Profile

### 2. File Upload Testing
1. ✅ Upload Profile Image
2. ✅ Upload CV
3. ✅ View uploaded files
4. ✅ Create Project
5. ✅ Upload Project Image
6. ✅ View project image

### 3. Project Management
1. ✅ Get User's Projects
2. ✅ Update Project
3. ✅ Reorder Projects
4. ✅ Delete Project

### 4. Public Endpoints
1. ✅ Get Profile by Username
2. ✅ Get Projects by Username
3. ✅ Get CV by Username

### 5. Admin Functions (requires admin user)
1. ✅ Get All Users
2. ✅ Update User
3. ✅ Delete User

### 6. Cleanup
1. ✅ Delete uploaded files
2. ✅ Delete test user (if admin)

---

## Common Issues & Solutions

### Port Configuration
- Make sure your server is running on port 3001
- Update `baseUrl` in environment if using different port

### Authentication Issues
- Ensure token is set after login
- Check token expiration (usually 24 hours)
- Verify Bearer token format in headers

### File Upload Issues
- Check file size limits (5MB for images, 10MB for CVs)
- Verify file types are supported
- Ensure form-data is used, not raw JSON

### MongoDB Connection
- Verify MongoDB Atlas connection string
- Check database permissions
- Ensure GridFS is properly configured

### CORS Issues
- Make sure CORS is configured for your frontend origin
- Check preflight requests for file uploads

---

## Expected Response Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

---

## Performance Testing

For load testing file uploads:
1. Use multiple file types
2. Test concurrent uploads
3. Verify file integrity after upload
4. Check download speeds
5. Monitor MongoDB performance

---

## Security Testing

1. Test unauthorized access to private endpoints
2. Verify file ownership validation
3. Check input validation
4. Test SQL injection prevention
5. Verify HTTPS in production

This guide covers all endpoints in your Portfolio Multi-User API with GridFS integration. Follow the testing workflow in order for the best experience.