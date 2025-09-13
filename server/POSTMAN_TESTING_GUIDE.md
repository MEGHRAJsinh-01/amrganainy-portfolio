# Postman Testing Guide for GridFS Endpoints

## Prerequisites
1. **Server Running**: Make sure your server is running on `http://localhost:3001`
2. **Authentication**: Most endpoints require JWT authentication
3. **MongoDB Atlas**: Connected to your MongoDB Atlas database

## 🔐 Authentication Setup

### 1. Login to Get JWT Token
```
Method: POST
URL: http://localhost:3001/api/auth/login
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id_here",
    "username": "your_username",
    "email": "your-email@example.com",
    "role": "user"
  }
}
```

### 2. Set Authorization Header for All Requests
In Postman, create an environment variable:
- **Variable Name**: `auth_token`
- **Value**: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

Then add this header to all authenticated requests:
```
Authorization: {{auth_token}}
```

---

## 📤 File Upload Endpoints

### 1. Upload Profile Image
```
Method: POST
URL: http://localhost:3001/api/profile/upload-profile-image
Headers:
  Authorization: {{auth_token}}
```

**Body Setup:**
1. Select `form-data` in Postman
2. Add key: `profileImage`
3. Type: `File`
4. Select an image file (JPEG, PNG, GIF, WebP, max 5MB)

**Expected Response:**
```json
{
  "message": "Profile image uploaded successfully",
  "profileImage": "http://localhost:3001/api/files/507f1f77bcf86cd799439011",
  "profileImageId": "507f1f77bcf86cd799439011"
}
```

### 2. Upload CV File
```
Method: POST
URL: http://localhost:3001/api/profile/upload-cv
Headers:
  Authorization: {{auth_token}}
```

**Body Setup:**
1. Select `form-data` in Postman
2. Add key: `cvFile`
3. Type: `File`
4. Select a document file (PDF, DOC, DOCX, max 10MB)

**Expected Response:**
```json
{
  "message": "CV uploaded successfully",
  "cvFile": "http://localhost:3001/api/files/507f1f77bcf86cd799439012",
  "cvFileId": "507f1f77bcf86cd799439012"
}
```

### 3. Upload Project Image
```
Method: POST
URL: http://localhost:3001/api/projects/upload-image/PROJECT_ID_HERE
Headers:
  Authorization: {{auth_token}}
```

**Body Setup:**
1. Select `form-data` in Postman
2. Add key: `image`
3. Type: `File`
4. Select an image file (JPEG, PNG, GIF, WebP, max 5MB)

**Note:** Replace `PROJECT_ID_HERE` with an actual project ID from your database.

**Expected Response:**
```json
{
  "message": "Image uploaded successfully",
  "imageUrl": "http://localhost:3001/api/files/507f1f77bcf86cd799439013",
  "imageId": "507f1f77bcf86cd799439013"
}
```

---

## 📥 File Access Endpoints

### 4. Serve/Download File
```
Method: GET
URL: http://localhost:3001/api/files/FILE_ID_HERE
Headers:
  Authorization: {{auth_token}}  (optional for public files)
```

**Note:** Replace `FILE_ID_HERE` with the file ID returned from upload endpoints.

**Expected Response:**
- **Content-Type**: Based on file type (image/jpeg, application/pdf, etc.)
- **Content-Disposition**: `inline; filename="original_filename.jpg"`
- **Body**: Binary file data

### 5. Delete File
```
Method: DELETE
URL: http://localhost:3001/api/files/FILE_ID_HERE
Headers:
  Authorization: {{auth_token}}
```

**Note:** Replace `FILE_ID_HERE` with the file ID you want to delete.

**Expected Response:**
```json
{
  "message": "File deleted successfully"
}
```

---

## 🧪 Complete Testing Workflow

### Step 1: Authentication
1. Login to get JWT token
2. Set `auth_token` environment variable

### Step 2: Upload Files
1. Upload profile image
2. Upload CV file
3. Create a project first, then upload project image

### Step 3: Access Files
1. Use the returned file URLs to view/download files
2. Test file serving endpoint directly

### Step 4: Cleanup
1. Delete uploaded files using DELETE endpoint

---

## 🔍 Troubleshooting

### Common Issues:

1. **401 Unauthorized**
   - Check if JWT token is valid
   - Ensure token is in correct format: `Bearer <token>`

2. **400 Bad Request**
   - Check file size limits
   - Verify file type is supported
   - Ensure form-data is used for file uploads

3. **404 Not Found**
   - Verify file ID is correct
   - Check if file exists in GridFS

4. **500 Internal Server Error**
   - Check server logs for detailed error messages
   - Ensure MongoDB Atlas connection is working
   - Verify GridFS bucket is initialized

### Debug Tips:

1. **Check Server Logs:**
```bash
tail -f server/server-output.log
```

2. **Test Health Endpoint:**
```bash
GET http://localhost:3001/api/health
```

3. **Verify GridFS Connection:**
Look for "GridFS initialized successfully" in server logs

---

## 📋 Postman Collection

You can create a Postman collection with these requests:

```json
{
  "info": {
    "name": "GridFS File Storage API",
    "description": "Test collection for GridFS file upload/download endpoints"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3001"
    },
    {
      "key": "auth_token",
      "value": ""
    }
  ]
}
```

This collection will help you systematically test all GridFS endpoints and ensure everything is working correctly!