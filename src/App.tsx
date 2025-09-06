import React, { useState } from 'react';
import Header from './components/Header';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';

const App: React.FC = () => {
    const [language, setLanguage] = useState('en');
    const [showAdmin, setShowAdmin] = useState(false);
    const [showAdminLink, setShowAdminLink] = useState(false);

    // Check for admin access via URL path
    React.useEffect(() => {
        const currentPath = window.location.pathname;
        if (currentPath === '/admin') {
            setShowAdmin(true);
        }
    }, []);

    // Keyboard shortcut to show admin link (Ctrl+Shift+A)
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                setShowAdminLink(!showAdminLink);
            }
            // Clear GitHub cache with Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                localStorage.removeItem('github_projects_cache');
                alert('GitHub cache cleared! Refresh the page to reload projects.');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showAdminLink]);

    if (showAdmin) {
        return <AdminPanel onBackToPortfolio={() => {
            setShowAdmin(false);
            // Navigate back to main portfolio
            window.history.pushState(null, '', '/');
        }} />;
    }

    return (
        <>
            <Header language={language} setLanguage={setLanguage} />
            <main className="flex flex-col gap-0">
                <About language={language} />
                <Projects language={language} />
                <Contact language={language} />
            </main>
            <Footer language={language} showAdminLink={showAdminLink} onAdminClick={() => {
                setShowAdmin(true);
                window.history.pushState(null, '', '/admin');
            }} />
        </>
    );
};

export default App;
