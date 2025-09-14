import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import About from '../components/About';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import CVSection from '../components/CVSection';
import { useProfile } from '../contexts/ProfileContext'; // Using context to fetch by username
import { IProfile } from '../types';

// This is a mock implementation of the user portfolio view
// It will use the same components as the original portfolio but with user-specific data
const UserPortfolio: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { getProfileByUsername } = useProfile(); // Use the context hook
    const [userProfile, setUserProfile] = useState<IProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!username) {
                setError('No username provided.');
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                const profileData = await getProfileByUsername(username);
                if (profileData) {
                    setUserProfile(profileData.profile);
                } else {
                    setError('Profile not found.');
                }
            } catch (err) {
                setError('Failed to fetch profile.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [username, getProfileByUsername]);


    // If username doesn't match any user, we would show a not found page
    // For the prototype, we'll just use the mock data

    // Basic language state for public portfolio header
    const [language, setLanguage] = React.useState('en');

    if (isLoading) {
        return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">Loading...</div>;
    }

    if (error) {
        return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">{error}</div>;
    }

    if (!userProfile) {
        return <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">User not found.</div>;
    }


    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Header
                language={language}
                setLanguage={(l) => setLanguage(l === 'de' ? 'de' : 'en')}
                isViewMode={true}
                cvUrl={userProfile.cvViewUrl} // Pass the CV URL to the header
            />

            <main>
                <About language={language} />

                <Projects language={language} username={username} />

                <CVSection language={language} />

                <Contact language={language} />
            </main>

            <Footer language={language} showAdminLink={false} onAdminClick={() => { }} />
        </div>
    );
};

export default UserPortfolio;
