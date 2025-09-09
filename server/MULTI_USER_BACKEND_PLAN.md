# Backend Implementation Plan for Multi-User Portfolio Platform

This document outlines the necessary changes to transform the current single-user portfolio backend into a multi-user platform.

## Database Schema Updates

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,         // Unique username for portfolio URL
  email: String,            // Unique email for login
  password: String,         // Hashed password
  firstName: String,
  lastName: String,
  role: String,             // "user" or "admin"
  active: Boolean,          // Account status
  verificationToken: String, // For email verification
  resetPasswordToken: String, // For password reset
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Profiles Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,         // Reference to user
  title: String,            // Professional title
  bio: String,              // About text
  skills: [String],         // Array of skills
  location: String,
  contactEmail: String,     // Public contact email (may differ from login email)
  phone: String,
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String,
    // Other social networks...
  },
  headerImageUrl: String,
  profileImageUrl: String,
  cvUrl: String,            // Link to CV file
  integrations: {
    github: {
      username: String,
      accessToken: String,  // Encrypted
      enabled: Boolean
    },
    linkedin: {
      profileId: String,
      accessToken: String,  // Encrypted
      enabled: Boolean
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Projects Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,         // Reference to user
  title: String,
  description: String,
  detailedDescription: String,
  imageUrl: String,
  projectUrl: String,       // Live demo URL
  githubUrl: String,        // Source code URL
  technologies: [String],   // Array of technologies used
  featured: Boolean,        // Whether to highlight this project
  order: Number,            // For custom ordering
  sourceType: String,       // "manual", "github", "external"
  sourceId: String,         // Original ID if imported from external source
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password with token
- `GET /api/auth/verify-email/:token` - Verify email address
- `POST /api/auth/refresh-token` - Get a new JWT with a refresh token

### User Routes
- `GET /api/users/me` - Get current user data
- `PUT /api/users/me` - Update current user data
- `DELETE /api/users/me` - Delete own account

### Profile Routes
- `GET /api/profiles/:username` - Get public profile data
- `GET /api/profiles/me` - Get own profile data
- `PUT /api/profiles/me` - Update own profile
- `POST /api/profiles/me/image` - Upload profile image
- `POST /api/profiles/me/cv` - Upload CV file

### Project Routes
- `GET /api/projects/:username` - Get public projects
- `GET /api/projects/me` - Get own projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/import-github` - Import projects from GitHub
- `PUT /api/projects/reorder` - Change project order

### Admin Routes
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:id` - Get user details
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats` - Get platform statistics

## Server-side Implementation

### Authentication System
1. Use JWT for stateless authentication
2. Implement token refresh mechanism
3. Use bcrypt for password hashing
4. Add role-based authorization middleware

### File Storage
1. Implement file uploads for:
   - Profile images
   - Project images
   - CV files
2. Consider using cloud storage (AWS S3, Google Cloud Storage)

### GitHub Integration
1. Modify current GitHub service to be user-specific
2. Store GitHub tokens securely per user
3. Add GitHub OAuth for connecting accounts

### LinkedIn Integration
1. Modify current LinkedIn integration to be user-specific
2. Implement LinkedIn OAuth

### Email Service
1. Add email service for:
   - Welcome emails
   - Password reset
   - Email verification
   - Notifications

## Database Updates
```javascript
// Example MongoDB migration to create the collections
db.createCollection("users");
db.createCollection("profiles");
db.createCollection("projects");

// Add indexes for performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.profiles.createIndex({ "userId": 1 }, { unique: true });
db.projects.createIndex({ "userId": 1 });
```

## Server Configuration

Update the Express server to include the new routes and middleware:

```javascript
// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import profileRoutes from './routes/profiles.js';
import projectRoutes from './routes/projects.js';
import adminRoutes from './routes/admin.js';
import { authenticateJWT, isAdmin } from './middleware/auth.js';

const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles/:username', profileRoutes.public);
app.use('/api/projects/:username', projectRoutes.public);

// Protected routes
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/profiles', authenticateJWT, profileRoutes.protected);
app.use('/api/projects', authenticateJWT, projectRoutes.protected);

// Admin routes
app.use('/api/admin', authenticateJWT, isAdmin, adminRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Implementation Phases

### Phase 1: Core Backend
1. Update database schema
2. Implement authentication system
3. Create basic CRUD for user profiles and projects
4. Add file upload functionality

### Phase 2: Integrations
1. Implement GitHub integration per user
2. Implement LinkedIn integration per user
3. Add email notifications

### Phase 3: Admin Features
1. Implement user management for admins
2. Add analytics and reporting
3. System configuration settings

## Security Considerations
1. Secure storage of API tokens and keys
2. Rate limiting for API endpoints
3. Input validation and sanitization
4. XSS and CSRF protection
5. Regular security audits
