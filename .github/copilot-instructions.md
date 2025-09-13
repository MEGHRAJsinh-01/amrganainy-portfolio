AI Coding Instructions for Amr Elganainy Portfolio Project
Project Overview
This is a modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS. The project features dynamic GitHub integration, LinkedIn profile fetching, MongoDB backend, and an admin panel for content management.
Architecture
Frontend (React + TypeScript + Vite)

Framework: React 19 with TypeScript
Build Tool: Vite
Styling: Tailwind CSS with PostCSS
State Management: React Context API
Routing: React Router DOM (for multi-user features)
Location: client/ directory

Backend (Node.js + Express)

Server: Node.js with Express
Database: MongoDB with Mongoose ODM
Authentication: JWT with bcryptjs
File Storage: Local storage with multer + GridFS
Location: server/ directory

Key Features

Dynamic GitHub repository integration with skills extraction
LinkedIn profile scraping via Apify API
Admin panel for content management
Multi-language support (English/German)
Responsive design with mobile-first approach
Email contact form with EmailJS
File upload for profile images and CVs

Coding Conventions
File Structure
client/
├── src/
│   ├── api.ts              # Centralized API client
│   ├── constants.ts        # Static data and translations
│   ├── githubService.ts    # GitHub/LinkedIn integration
│   ├── types.ts            # TypeScript interfaces
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   └── pages/              # Page components
├── public/                 # Static assets
└── package.json

server/
├── config/                 # Configuration files
├── controllers/            # Route handlers
├── middleware/             # Express middleware
├── models/                 # Mongoose models
├── routes/                 # API routes
├── scripts/                # Utility scripts
└── uploads/                # File uploads

Naming Conventions
Files and Directories

Components: PascalCase (e.g., About.tsx, ContactForm.tsx)
Services: camelCase (e.g., githubService.ts, api.ts)
Types: PascalCase (e.g., Project.ts, User.ts)
Constants: camelCase (e.g., constants.ts)
Directories: lowercase with hyphens (e.g., src/components/)

Variables and Functions

Constants: UPPER_SNAKE_CASE (e.g., API_URL, CACHE_DURATION)
Functions: camelCase (e.g., fetchGitHubRepos(), transformGitHubRepoToProject())
Components: PascalCase (e.g., About, Projects)
Interfaces: PascalCase with 'I' prefix (e.g., IGitHubRepo, IProject)
Types: PascalCase (e.g., GitHubRepo, Project)

Code Style
TypeScript

Use strict type checking
Prefer interfaces over types for object shapes
Use union types for multiple possible values
Export types from types.ts
Use optional properties with ? for non-required fields

React

Use functional components with hooks
Prefer custom hooks for reusable logic
Use TypeScript for props interfaces
Follow component composition patterns
Use React Context for global state

API Design

RESTful endpoints with consistent naming
Use async/await for asynchronous operations
Implement proper error handling
Return consistent response formats
Use middleware for authentication and validation

Command Line Usage

Use PowerShell syntax for all command-line instructions on Windows systems
Example commands should be compatible with PowerShell (e.g., use & for running scripts, Set-Location instead of cd, etc.)

Configuration Management
Environment Variables

Development: .env.local in root and client directories
Production: .env.production in server directory
Naming: VITE_ prefix for client-side variables
Storage: Never commit secrets to version control

Centralized Config

Server config in server/config/index.js
Environment-specific overrides
CORS configuration with dynamic origins
Database and API service configurations

Data Management
Caching Strategy

GitHub Data: 24-hour localStorage cache
LinkedIn Data: 7-day localStorage cache
Skills Data: 24-hour localStorage cache
Cache Keys: Descriptive constants in services

Database Design

Use MongoDB with Mongoose schemas
Implement proper indexing
Use GridFS for large file storage
Separate collections for different entities

Error Handling
Frontend

Try-catch blocks for API calls
User-friendly error messages
Fallback UI states
Graceful degradation

Backend

Express error middleware
Validation with express-validator
Proper HTTP status codes
Detailed error logging

Security Practices
Authentication

JWT tokens with expiration
Password hashing with bcryptjs
Secure token storage in localStorage
Admin role-based access control

API Security

CORS configuration with allowed origins
Input validation and sanitization
Rate limiting considerations
Secure file upload handling

Internationalization
Translation Structure

Bilingual support (English/German)
Nested translation objects
Dynamic language switching
Fallback to English for missing translations

Testing Strategy
Manual Testing

Test all user flows
Verify responsive design
Check cross-browser compatibility
Validate form submissions

API Testing

Test all endpoints
Verify error responses
Check authentication flows
Validate data transformations

Deployment
Frontend

Build with Vite for production
Static hosting on Netlify/Vercel
Environment variable configuration
Asset optimization

Backend

Node.js hosting (Heroku/DigitalOcean)
MongoDB Atlas for database
Environment-specific configurations
File storage setup

Development Workflow
Local Development

Install dependencies: npm run install-all
Start development servers properly:
Run the start-all.bat script using PowerShell: & ./start-all.bat
The backend server will run on http://localhost:3000
The frontend UI will run on http://localhost:5173


Open a new PowerShell terminal tab to write and execute additional development commands
Access the application:
Frontend: http://localhost:5173
Backend API: http://localhost:3000
Admin panel: Add #admin to the frontend URL



Environment Setup

Copy .env.example files to .env.local
Configure MongoDB connection
Set up API keys (GitHub, LinkedIn, EmailJS)
Configure admin credentials

Git Workflow

Feature branches for new development
Pull requests for code review
Semantic commit messages
Version tagging for releases

Key Integration Points
GitHub API

Repository fetching with topics
Skills extraction from languages/topics
Project transformation and filtering
Cache management for performance

LinkedIn API

Profile scraping via Apify
Data transformation and caching
Bio generation from profile data
Error handling for API failures

EmailJS

Contact form integration
Template configuration
Error handling and user feedback

Performance Optimization
Frontend

Code splitting with Vite
Image optimization
Lazy loading for components
Efficient re-rendering

Backend

Database query optimization
Caching layers
File compression
API response compression

Monitoring and Maintenance
Logging

Server-side error logging
API request logging
Performance monitoring
User activity tracking

Updates

Regular dependency updates
Security patch management
API compatibility checks
Database migration handling

Future Enhancements
Planned Features

Multi-user platform support
Custom portfolio templates
Analytics dashboard
Advanced admin features

Scalability Considerations

Database optimization
CDN integration
Load balancing
Microservices architecture

This document serves as a comprehensive guide for maintaining and extending the portfolio project. Follow these conventions to ensure code consistency and maintainability.