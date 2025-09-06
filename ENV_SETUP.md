# Environment Files Setup

This project uses separate environment files for different environments:

## Production Environment

### Frontend Environment (.env.production.frontend)

This file contains all the environment variables needed by the frontend application and is used by Vite during the build process when building for production.

**Key variables:**
- `VITE_API_URL`: URL of the backend API
- `VITE_EMAILJS_*`: EmailJS configuration for the contact form
- `VITE_ADMIN_*`: Admin credentials
- Social media and GitHub configuration

### Backend Environment (server/.env.production)

This file contains all the environment variables needed by the Node.js backend server and is located in the server directory.

**Key variables:**
- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `PORT`: Server port number
- `FRONTEND_URL`: Frontend URL for CORS configuration

## Development Environment (.env.local)

In development mode, both frontend and backend use the same `.env.local` file in the root directory, which contains all the necessary variables for local development.

**Key variables:**
- `VITE_API_URL`: Set to "http://localhost:3000/api"
- `MONGO_URI`: Local MongoDB connection string
- `JWT_SECRET`: Development secret key
- `NODE_ENV`: Set to "development"

## How to Deploy

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set the build command to `npm run build`
3. Set the publish directory to `dist`
4. Add all the variables from `.env.production.frontend` to your Netlify environment variables

### Backend (Render)
1. Connect your GitHub repository to Render
2. Choose the server directory as the root directory
3. Set the build command to `npm install`
4. Set the start command to `node server.js`
5. Add all the variables from `server/.env.production` to your Render environment variables
6. Make sure to set `NODE_ENV=production`
