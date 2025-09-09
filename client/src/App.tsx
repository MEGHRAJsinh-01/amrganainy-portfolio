import React, { useState } from 'react';
import Header from './components/Header';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import CVSection from './components/CVSection';
import { clearLinkedInCache, clearGitHubCache, clearSkillsCache } from './githubService';
// Import the multi-user app
import MultiUserApp from './MultiUserApp';

const App: React.FC = () => {
    const [language, setLanguage] = useState('en');
    const [showAdmin, setShowAdmin] = useState(false);
    const [showAdminLink, setShowAdminLink] = useState(false);
    const [showMultiUserPlatform, setShowMultiUserPlatform] = useState(false);

    // Check for admin access or multi-user platform via URL path
    React.useEffect(() => {
        const currentPath = window.location.pathname;
        // Check if the URL has a hash part which would indicate the router is already active
        const hasHash = window.location.hash !== '';
        
        if (currentPath === '/admin') {
            setShowAdmin(true);
        } else if (currentPath === '/multi-user' || hasHash) {
            setShowMultiUserPlatform(true);
        }
    }, []);

    // Keyboard shortcut to show admin link (Ctrl+Shift+A)
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                setShowAdminLink(!showAdminLink);
            }
            // Toggle multi-user platform with Ctrl+Shift+M
            if (e.ctrlKey && e.shiftKey && e.key === 'M') {
                e.preventDefault();
                setShowMultiUserPlatform(!showMultiUserPlatform);
                if (showMultiUserPlatform) {
                    window.location.hash = ''; // Clear hash routing
                    window.history.pushState(null, '', '/');
                } else {
                    window.location.hash = '/'; // Start with hash routing
                }
            }
            // Clear GitHub cache with Ctrl+Shift+C
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                clearGitHubCache();
                clearSkillsCache();
                alert('GitHub cache cleared! Refresh the page to reload projects and skills.');
            }
            // Clear Bio cache with Ctrl+Alt+C
            if (e.ctrlKey && e.altKey && e.key === 'c') {
                e.preventDefault();
                clearLinkedInCache();
                alert('Bio cache cleared! Refresh the page to reload your bio from GitHub.');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showAdminLink, showMultiUserPlatform]);

    if (showAdmin) {
        return <AdminPanel onBackToPortfolio={() => {
            setShowAdmin(false);
            // Navigate back to main portfolio
            window.history.pushState(null, '', '/');
        }} />;
    }

    // For demonstration purposes, we'll show a placeholder for the multi-user platform
    // since we don't have react-router-dom installed yet
    if (showMultiUserPlatform) {
        return <MultiUserApp />;
    }

    return (
        <>
            <Header language={language} setLanguage={setLanguage} />
            <main className="flex flex-col gap-0">
                <About language={language} />
                <Projects language={language} />
                <CVSection language={language} />
                <Contact language={language} />
            </main>
            <Footer 
                language={language} 
                showAdminLink={showAdminLink} 
                onAdminClick={() => {
                    setShowAdmin(true);
                    window.history.pushState(null, '', '/admin');
                }} 
            />
            {/* Add a floating button to access the multi-user platform */}
            {showAdminLink && (
                <div className="fixed bottom-20 right-4">
                    <button
                        onClick={() => {
                            setShowMultiUserPlatform(true);
                            window.location.hash = '/'; // Start with hash routing
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center"
                    >
                        <span className="mr-1">🚀</span> Multi-User Platform
                    </button>
                </div>
            )}
        </>
    );
};

export default App;
