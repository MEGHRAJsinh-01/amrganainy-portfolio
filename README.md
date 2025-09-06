# Amr Elganainy Portfolio

A modern, responsive portfolio website built with React, TypeScript, and Tailwind CSS.

## Features

- **Dynamic Skills**: Automatically extracts and displays skills from GitHub repositories
- **Project Showcase**: Displays GitHub projects with stars, forks, and descriptions
- **Contact Form**: Functional contact form with EmailJS integration
- **Admin Panel**: Control project visibility and manage cache
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Dark Theme**: Modern dark theme optimized for developer portfolios

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS (production-ready setup)
- **Build Tool**: Vite
- **API**: GitHub API for dynamic content

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

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
   - Copy `.env.local.example` to `.env.local`
   - Fill in the required environment variables:
     ```
     VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
     VITE_EMAILJS_PRIVATE_KEY=your_emailjs_private_key
     VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
     VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
     VITE_ADMIN_PASSWORD=your_admin_password
     ```
   - See `EMAILJS_SETUP.md` for detailed instructions on setting up EmailJS

4. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Production Build

```bash
npm run build
npm run preview
```

## Tailwind CSS Setup

This project uses Tailwind CSS with proper production configuration:

- **PostCSS**: Configured with `@tailwindcss/postcss` plugin
- **Autoprefixer**: Automatic vendor prefixing
- **Content Scanning**: Scans all `.tsx`, `.ts`, `.jsx`, `.js` files in `src/` and `index.html`

## Project Structure

```
src/
├── components/          # React components
│   ├── About.tsx       # About section with dynamic skills
│   ├── Projects.tsx    # Projects showcase
│   ├── AdminPanel.tsx  # Admin controls
│   └── ...
├── constants.ts        # Static data and translations
├── githubService.ts    # GitHub API integration
├── types.ts           # TypeScript interfaces
└── App.tsx           # Main application component
```

## Admin Panel

Access the admin panel by adding `#admin` to the URL. Use password `admin123` (or set `VITE_ADMIN_PASSWORD` environment variable).

Features:
- Control project visibility
- Clear GitHub cache
- Clear skills cache
- Manage featured repositories
