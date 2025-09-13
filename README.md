# Amr Elganainy Portfolio Platform

A modern, multi-user portfolio platform built 6. Open [http://localhost:5173](http://localhost:5173) in your browser

   **Default Routes:**
   - `/` - Redirects to login if not authenticated, dashboard if authenticated
   - `/login` - User login page
   - `/register` - User registration page
   - `/dashboard` - User portfolio management dashboard
   - `/u/:username` - Public portfolio display for any user
   - `/admin` - Admin dashboard (admin users only)ith React, TypeScript, and Tailwind CSS. Multiple users can register, create, and manage their own professional portfolios with dynamic GitHub integration, LinkedIn profile fetching, and MongoDB backend.

## 🌟 Features

### Multi-User Platform
- **User Registration**: Users can create accounts with LinkedIn and GitHub integration
- **Personal Portfolios**: Each user gets their own portfolio at `/u/username`
- **Dashboard Management**: Users can manage their profile, projects, and settings
- **Admin Panel**: Platform administrators can manage all users and system settings

### Dynamic Content Integration
- **GitHub Integration**: Automatically sync repositories and extract skills
- **LinkedIn Integration**: Fetch professional bio and experience data
- **Project Management**: Control project visibility and custom project creation
- **Skills Extraction**: Auto-generate skills from GitHub repositories and LinkedIn

### Backend Features
- **MongoDB Database**: Store portfolio data, projects, and user information
- **JWT Authentication**: Secure login for the admin panel
- **File Upload**: Store and serve profile images and project images
- **API Integration**: Full REST API for portfolio management
- **LinkedIn API Proxy**: Bypass CORS restrictions for LinkedIn data fetching

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS (production-ready setup)
- **Build Tool**: Vite
- **State Management**: React Context API

### Backend
- **Server**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Local storage with multer
- **API Integration**: Apify for LinkedIn scraping

### APIs
- **GitHub API**: For fetching repositories and skills
- **LinkedIn Data API**: Via Apify for profile data
- **EmailJS**: For contact form submissions

## 🚀 Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ganainy/amrganainy-portfolio.git
   cd amrganainy-portfolio
   ```

2. Install all dependencies at once (client and server):
   ```bash
   npm run install-all
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local` in the root directory
   - Copy `.env.example` to `.env.local` in the client directory
   - Fill in the required environment variables (see Environment Variables section)

4. Start both the frontend and backend:
   ```bash
   npm start
   ```

5. Or start them separately:
   ```bash
   # Start just the frontend
   npm run dev
   
   # Start just the backend (from the root directory)
   cd server && npm start
   ```

6. Open [http://localhost:5174](http://localhost:5174) in your browser



## 🛡️ Environment Configuration System

The application uses a robust configuration system that loads different settings based on the `NODE_ENV` environment variable:

### Configuration Structure

- **Development**: Uses `.env.local` in the root directory
- **Production**: Uses `.env.production` in the server directory
- **Test**: Uses `.env.test` in the root directory (if needed)

### Configuration Organization

The centralized configuration module is located at `server/config/index.js` and manages:

- **Server Settings**: Port, host, environment detection
- **Database Configuration**: MongoDB connection
- **Frontend URLs**: CORS settings
- **Authentication**: JWT secrets and admin credentials
- **API Services**: Third-party service keys
- **Upload Settings**: File storage and URL generation
- **Portfolio Settings**: Default values and content URLs

### Setting Up Environment Files

Example environment files are provided in the `server/config/` directory:
- `example.env.local`: Template for local development
- `example.env.production`: Template for production deployment

Copy these files to their appropriate locations and update with your specific values:

```bash
# For development
cp server/config/example.env.local .env.local
# Edit .env.local with your values

# For production
cp server/config/example.env.production server/.env.production
# Edit server/.env.production with your production values
```

### Environment Variables vs Database Content

The application uses a hybrid approach for configuration:

1. **Environment Variables**: Used for technical configuration and secrets:
   - Server settings (port, host, environment)
   - Database connection strings
   - API keys and tokens
   - Authentication secrets
   - CORS settings

2. **Database Content**: All portfolio content is stored in the database and managed through the admin panel:
   - Profile image URL
   - CV view/download URLs
   - Contact email
   - Social media links
   - Personal information

This separation ensures that sensitive configuration stays in environment files while content can be dynamically managed through the user interface.

## 📊 Admin Panel

The admin panel provides platform administrators with tools to manage the entire multi-user portfolio platform.

**Access:** Admin users can access the admin dashboard at `/admin`

**Features:**
- **User Management**: View all registered users, their portfolios, and account details
- **User Analytics**: Monitor platform usage and user activity
- **System Administration**: Manage platform settings and configurations
- **Content Moderation**: Review and manage user-generated content

## 📚 Integration Guides

### EmailJS Setup

For contact form functionality:

1. **Create an EmailJS Account**
   - Go to [EmailJS website](https://www.emailjs.com/) and sign up
   - Verify your account through the email you receive

2. **Add an Email Service**
   - Log in to your EmailJS dashboard
   - Go to "Email Services" and click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the authentication steps and connect your email account
   - Note down the service ID for your `.env` file

3. **Create an Email Template**
   - Go to "Email Templates" in your EmailJS dashboard
   - Click "Create New Template"
   - Design your email template with variables like `{{from_name}}`, `{{reply_to}}`, `{{subject}}`, and `{{message}}`
   - Note down the template ID for your `.env` file

4. **Get Your API Keys**
   - Go to "Account" > "API Keys" in your EmailJS dashboard
   - Copy your public key and private key
   - Add these to your `.env.local` file

### LinkedIn Integration

The portfolio uses Apify to fetch LinkedIn profile data:

1. **Apify Setup**
   - Create an account at [Apify](https://apify.com/)
   - Get your API token from your account settings
   - Add the token to your `.env.local` file as `VITE_APIFY_TOKEN`

2. **LinkedIn Profile**
   - By default, the application will scrape the profile of "amr-elganainy"
   - To change this, edit the profile username in the LinkedIn API call in the server

3. **Data Usage**
   - The application will fetch:
     - Basic profile information (name, headline, summary)
     - Work experiences
     - Education history
     - Skills and endorsements

4. **Caching Mechanism**
   - LinkedIn data is cached for 24 hours to reduce API calls
   - Use the Admin Panel to clear the cache when needed

## 🏗️ Project Structure

```
├── client/                    # Frontend application
│   ├── public/                # Static assets
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── auth/          # Authentication components (Login, Register)
│   │   │   ├── UserDashboard.tsx    # User portfolio management
│   │   │   ├── AdminDashboard.tsx   # Admin user management
│   │   │   ├── UserPortfolio.tsx    # Public portfolio display
│   │   │   └── ...            # Other components
│   │   ├── contexts/          # React contexts (Auth, Profile, Project, Admin)
│   │   ├── pages/             # Portfolio display pages
│   │   ├── api.ts             # API client for backend communication
│   │   ├── constants.ts       # Static data and translations
│   │   ├── githubService.ts   # GitHub and LinkedIn API integration
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── MultiUserApp.tsx   # Main multi-user application
│   │   └── index.tsx          # Application entry point
│   ├── index.html             # HTML template
│   └── vite.config.ts         # Vite configuration
├── server/                    # Backend server
│   ├── controllers/           # Route handlers
│   ├── models/                # MongoDB models (User, Profile, Project)
│   ├── routes/                # API routes
│   ├── middleware/            # Express middleware
│   ├── config/                # Configuration management
│   ├── uploads/               # File upload directory
│   └── server.js              # Express server implementation
└── package.json               # Root package.json with scripts
```

## 🔄 Data Caching

To optimize performance and reduce API calls, the application implements caching for:
- **GitHub repository data**: 24-hour cache in localStorage
- **GitHub skills data**: 24-hour cache in localStorage
- **LinkedIn profile data**: 24-hour cache in localStorage
- **Project visibility settings**: Persistent in localStorage
- **Portfolio data**: Stored in MongoDB database

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login`: Login as admin

### Portfolio Management
- `GET /api/portfolio`: Get portfolio data
- `PUT /api/portfolio`: Update portfolio data (authenticated)
- `POST /api/portfolio/profile-image`: Upload profile image (authenticated)
- `DELETE /api/portfolio/profile-image`: Delete profile image (authenticated)

### Projects
- `GET /api/projects`: Get all projects
- `GET /api/projects/:id`: Get single project
- `POST /api/projects`: Create project (authenticated)
- `PUT /api/projects/:id`: Update project (authenticated)
- `DELETE /api/projects/:id`: Delete project (authenticated)
- `POST /api/projects/upload-image`: Upload project image (authenticated)

### LinkedIn
- `POST /api/linkedin-profile`: Fetch LinkedIn profile data

## 📱 Responsive Design

The portfolio is fully responsive with:
- Mobile-first design approach
- Breakpoints for various device sizes
- Optimized images and layouts
- Touch-friendly interactive elements

## 🌍 Internationalization

The application includes translations for:
- **English**: Default language
- **German**: Complete translation

Add more languages by extending the `translations` object in `constants.ts`.

## 🌐 Deployment

### Frontend Deployment

To build the frontend for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory, ready for deployment to any static site hosting service like:
- Netlify
- Vercel
- GitHub Pages

### Backend Deployment

The backend can be deployed to:
- Heroku
- DigitalOcean
- AWS
- Any Node.js hosting service

Make sure to:
1. Set up all environment variables on your hosting platform
2. Configure MongoDB connection (Atlas recommended for production)
3. Set up proper CORS settings for your frontend domain

## 🔍 Troubleshooting

### Common Issues

#### LinkedIn API Issues
- Check your Apify token is valid
- Verify the profile username exists
- Consider API usage limits

#### MongoDB Connection Issues
- Check your MongoDB connection string
- Ensure MongoDB is running (if using local instance)
- Verify network access to MongoDB Atlas (if using cloud)

#### Authentication Issues
- Check your JWT secret is set
- Verify admin password is correct
- Ensure token is being sent with requests

#### Image Upload Issues
- Verify uploads directory exists and is writable
- Check file size limits (default: 5MB)
- Ensure file type is supported (default: images only)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For questions or feedback about this portfolio, please contact:
- **Email**: amrmohammedali11@gmail.com
- **LinkedIn**: [Amr Elganainy](https://www.linkedin.com/in/amr-elganainy/)
- **GitHub**: [ganainy](https://github.com/ganainy)
