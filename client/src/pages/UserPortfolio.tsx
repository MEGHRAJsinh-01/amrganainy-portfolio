import React from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import About from '../components/About';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

// This is a mock implementation of the user portfolio view
// It will use the same components as the original portfolio but with user-specific data
const UserPortfolio: React.FC = () => {
    const { username } = useParams<{ username: string }>();

    // In a real implementation, we would fetch the user's data here
    // For this prototype, we'll use mock data
    const userData = {
        name: 'John Doe',
        title: 'Full Stack Developer',
        bio: 'Passionate developer with 5+ years of experience in creating web applications. Specialized in React, Node.js, and cloud technologies.',
        profileImage: 'https://randomuser.me/api/portraits/men/41.jpg',
        cvViewUrl: 'https://example.com/view-cv',
        cvDownloadUrl: 'https://example.com/download-cv',
        socialLinks: {
            github: 'https://github.com/johndoe',
            linkedin: 'https://linkedin.com/in/johndoe',
            twitter: 'https://twitter.com/johndoe'
        },
        skills: {
            programmingLanguages: ['JavaScript', 'TypeScript', 'Python', 'Java'],
            otherSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'AWS', 'Docker']
        },
        projects: [
            {
                id: '1',
                title: { en: 'Portfolio Website', de: 'Portfolio Webseite' },
                description: {
                    en: 'A personal portfolio website built with React and TypeScript',
                    de: 'Eine persönliche Portfolio-Website, erstellt mit React und TypeScript'
                },
                tags: ['React', 'TypeScript', 'TailwindCSS'],
                liveUrl: 'https://example.com/portfolio',
                repoUrl: 'https://github.com/johndoe/portfolio-website',
                imageUrl: 'https://via.placeholder.com/500x300?text=Portfolio+Website',
                isFeatured: true
            },
            {
                id: '2',
                title: { en: 'E-Commerce Platform', de: 'E-Commerce Plattform' },
                description: {
                    en: 'Full stack e-commerce application with payment processing',
                    de: 'Full-Stack-E-Commerce-Anwendung mit Zahlungsabwicklung'
                },
                tags: ['React', 'Node.js', 'Express', 'MongoDB'],
                liveUrl: 'https://example.com/ecommerce',
                repoUrl: 'https://github.com/johndoe/ecommerce-platform',
                imageUrl: 'https://via.placeholder.com/500x300?text=E-Commerce',
                isFeatured: true
            },
            {
                id: '3',
                title: { en: 'Weather Dashboard', de: 'Wetter-Dashboard' },
                description: {
                    en: 'A weather dashboard that shows current weather and forecasts',
                    de: 'Ein Wetter-Dashboard, das aktuelles Wetter und Prognosen anzeigt'
                },
                tags: ['JavaScript', 'API', 'CSS'],
                liveUrl: 'https://example.com/weather',
                repoUrl: 'https://github.com/johndoe/weather-dashboard',
                imageUrl: 'https://via.placeholder.com/500x300?text=Weather+App',
                isFeatured: false
            }
        ]
    };

    // If username doesn't match any user, we would show a not found page
    // For the prototype, we'll just use the mock data

    // Basic language state for public portfolio header
    const [language, setLanguage] = React.useState('en');

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header language={language} setLanguage={(l) => setLanguage(l === 'de' ? 'de' : 'en')} isViewMode={true} />

            <main>
                <About language={language} />

                <Projects language={language} username={username} />

                <Contact language={language} />
            </main>

            <Footer language={language} showAdminLink={false} onAdminClick={() => { }} />
        </div>
    );
};

export default UserPortfolio;
