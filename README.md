# Amr Elganainy Portfolio

A modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS. Featuring dynamic GitHub integration, LinkedIn profile fetching, MongoDB backend, and an admin panel.

## 🌟 Features

### Frontend Features
- **Dynamic Skills**: Automatically extracts and displays skills from GitHub repositories
- **Project Showcase**: Displays GitHub projects with stars, forks, and descriptions
- **LinkedIn Integration**: Fetches professional bio, education, and skills from LinkedIn
- **Contact Form**: Functional contact form with EmailJS integration
- **Admin Panel**: Control project visibility, manage cache, update CV links and profile image
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark Theme**: Modern dark theme optimized for developer portfolios
- **CV Section**: Display and download links to your resume/CV
- **Profile Image Management**: Upload and manage your profile picture
- **Internationalization**: Support for English and German languages

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

### Frontend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ganainy/amrganainy-portfolio.git
   cd amrganainy-portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in the required environment variables (see Environment Variables section)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install server dependencies:
   ```bash
   npm install
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

4. The server will run on port 3000 by default

## 🛡️ Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Database Configuration
MONGO_URI=mongodb://localhost:27017/portfolio

# JWT Authentication
JWT_SECRET=your_secure_jwt_secret_here

# Admin Authentication
VITE_ADMIN_PASSWORD=your_secure_admin_password_here

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:5173

# LinkedIn Scraper (Apify)
VITE_APIFY_TOKEN=your_apify_token_here

# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
VITE_EMAILJS_PRIVATE_KEY=your_emailjs_private_key
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id

# CV URLs (Fallback)
VITE_CV_VIEW_URL=https://drive.google.com/file/d/YOUR_FILE_ID/view
VITE_CV_DOWNLOAD_URL=https://drive.google.com/uc?export=download&id=YOUR_FILE_ID

# Profile Image (Fallback)
VITE_PROFILE_IMAGE_URL=your_profile_image_path_or_url
```

## 📊 Admin Panel

Access the admin panel by adding `#admin` to the URL. Use the password set in your `VITE_ADMIN_PASSWORD` environment variable.

Features:
- **Project Visibility**: Control which GitHub repositories are displayed
- **Cache Management**: Clear GitHub, LinkedIn, and skills caches
- **CV URLs**: Update your CV viewing and download links
- **Profile Image**: Upload, update, or remove your profile picture
- **Authentication**: Secure JWT-based login system

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
├── public/            # Static assets
├── server/            # Backend server
│   ├── uploads/       # Uploaded files directory
│   └── server.js      # Express server implementation
├── src/
│   ├── api.ts         # API client for backend communication
│   ├── components/    # React components
│   │   ├── About.tsx  # About section with LinkedIn data
│   │   ├── AdminPanel.tsx # Admin controls
│   │   ├── Contact.tsx # Contact form with EmailJS
│   │   ├── CVSection.tsx # CV view/download section
│   │   ├── Header.tsx # Navigation header
│   │   ├── Projects.tsx # GitHub projects showcase
│   │   └── ...        # Other components
│   ├── constants.ts   # Static data and translations
│   ├── githubService.ts # GitHub and LinkedIn API integration
│   ├── types.ts       # TypeScript interfaces
│   └── App.tsx        # Main application component
└── .env.local         # Environment variables (not in repo)
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
