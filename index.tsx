import React, { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';

// --- GitHub API Service ---
const GITHUB_USERNAME = 'ganainy';
const CACHE_KEY = 'github_projects_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// --- Admin Panel Data ---
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'; // Fallback for development
const VISIBILITY_KEY = 'project_visibility_settings';

// Featured repositories that should be treated as manual projects
const FEATURED_REPOS = [
    'appium-traverser',
    'captive-portal-analyzer-kotlin',
    'raspberrypi-captive-portal',
    'job-app-assistant',
    'Our_chat',
    'gym_masters_kotlin_compose',
    'realtime_quizzes',
    'Reminderly'
];

interface GitHubRepo {
    id: number;
    name: string;
    description: string | null;
    html_url: string;
    language: string | null;
    topics: string[];
    pushed_at: string;
    fork: boolean;
    private: boolean;
    stargazers_count: number;
    forks_count: number;
}

interface CachedData {
    data: GitHubRepo[];
    timestamp: number;
}

const fetchGitHubRepos = async (): Promise<GitHubRepo[]> => {
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=100`);
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        throw error;
    }
};

const getCachedRepos = (): GitHubRepo[] | null => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const parsed: CachedData = JSON.parse(cached);
        const now = Date.now();

        if (now - parsed.timestamp > CACHE_DURATION) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        return parsed.data;
    } catch (error) {
        console.error('Error reading cache:', error);
        return null;
    }
};

const setCachedRepos = (repos: GitHubRepo[]): void => {
    try {
        const cacheData: CachedData = {
            data: repos,
            timestamp: Date.now()
        };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error setting cache:', error);
    }
};

const clearGitHubCache = () => {
    try {
        localStorage.removeItem(CACHE_KEY);
        console.log('GitHub cache cleared successfully');
        return true;
    } catch (error) {
        console.error('Error clearing GitHub cache:', error);
        return false;
    }
};

const transformGitHubRepoToProject = (repo: GitHubRepo, language: string) => {
    // Filter out repos we don't want to show
    if (repo.fork || repo.private || repo.name.toLowerCase().includes('fork')) {
        return null;
    }

    // Check admin visibility settings
    if (!isProjectVisible(repo.name)) {
        return null;
    }

    // Check if this is a featured repository
    const isFeatured = FEATURED_REPOS.includes(repo.name);

    // Parse custom data from repo description for featured repos
    let customData = {};
    if (isFeatured) {
        const videoMatch = repo.description?.match(/https:\/\/www\.youtube\.com\/watch\?v=[\w-]+/);
        if (videoMatch) {
            customData = { videoUrl: videoMatch[0] };
        }
    }

    // Use GitHub data directly (enhanced descriptions and tags are now stored in GitHub)
    let title, description, tags;
    if (isFeatured) {
        title = {
            en: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            de: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        };
        description = {
            en: repo.description || `A ${repo.language || 'software'} project`,
            de: repo.description || `Ein ${repo.language || 'Software'} Projekt`
        };
        // Use topics from GitHub (these are now the enhanced tags)
        tags = repo.topics && repo.topics.length > 0 ? repo.topics : [repo.language || 'Project'];
    } else {
        // Generate tags from language and topics
        const generatedTags: string[] = [];
        if (repo.language) {
            generatedTags.push(repo.language);
        }
        if (repo.topics && repo.topics.length > 0) {
            generatedTags.push(...repo.topics.slice(0, 3)); // Limit to 3 additional topics
        }

        // Create bilingual title and description
        title = {
            en: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            de: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        };

        description = {
            en: repo.description || `A ${repo.language || 'software'} project`,
            de: repo.description || `Ein ${repo.language || 'Software'} Projekt`
        };

        tags = generatedTags.length > 0 ? generatedTags : ['Project'];
    }

    return {
        title,
        description,
        tags: tags.length > 0 ? tags : ['Project'],
        liveUrl: '#',
        repoUrl: repo.html_url,
        lastUpdated: repo.pushed_at,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        isFeatured,
        ...customData // Add custom data like videoUrl for featured repos
    };
};

// --- Translations ---
const translations = {
    en: {
        nav: {
            about: "About",
            projects: "Projects",
            contact: "Contact"
        },
        about: {
            title: "CS Graduate & Cyber Security Master Student",
            bio: "Junior Android and cross-platform mobile developer with solid project experience. I love turning ideas into functional apps, am a team player, and always ready to learn. As a CS graduate and Cyber Security master's student, I'm currently writing my master's thesis.",
            education: "Education:",
            master: "Master in Internet Security, Westfälische Hochschule (2022 - present, Grade: 2.2)",
            bachelor: "Bachelor in Computer Science, Mansoura University, Egypt (2015 - 2019, Grade: 2.3)",
            languages: "Languages:",
            german: "German: C1 Telc University Certificate",
            english: "English: B2",
            skills: "My Skills"
        },
        projects: {
            title: "Projects",
            subtitle: "A collection of my work, from mobile apps to open-source libraries."
        },
        contact: {
            title: "Get in Touch",
            subtitle: "I'm always open to discussing new projects, creative ideas, or opportunities. Feel free to reach out, and I'll get back to you as soon as possible.",
            form: {
                name: "Your Name",
                namePlaceholder: "Enter your name",
                email: "Your Email",
                emailPlaceholder: "Enter your email address",
                subject: "Subject",
                subjectPlaceholder: "What's this about?",
                message: "Your Message",
                messagePlaceholder: "Let me know how I can help.",
                submit: "Send Message"
            }
        },
        footer: {
            copyright: "© {year} {name}. All Rights Reserved."
        }
    },
    de: {
        nav: {
            about: "Über mich",
            projects: "Projekte",
            contact: "Kontakt"
        },
        about: {
            title: "CS Graduate & Cyber Security Master Student",
            bio: "Junior Android- und cross-platform Mobile-Entwickler mit fundierter Projekterfahrung. Ich liebe es, Ideen in funktionierende Apps umzusetzen, bin Teamplayer und immer bereit, mehr zu lernen. Als CS-Absolvent und Master-Student in Cyber Security schreibe ich derzeit meine Masterarbeit.",
            education: "Ausbildung:",
            master: "Master in Internet-Sicherheit, Westfälische Hochschule (2022 - heute, Note: 2,2)",
            bachelor: "Bachelor in Informatik, Mansoura Universität, Ägypten (2015 - 2019, Note: 2,3)",
            languages: "Sprachen:",
            german: "Deutsch: C1 Telc Hochschulzertifikat",
            english: "Englisch: B2",
            skills: "Meine Fähigkeiten"
        },
        projects: {
            title: "Projekte",
            subtitle: "Eine Sammlung meiner Arbeiten von mobilen Apps bis hin zu Open-Source-Bibliotheken."
        },
        contact: {
            title: "Kontakt",
            subtitle: "Ich bin immer offen für neue Projekte, kreative Ideen oder Möglichkeiten. Melden Sie sich gerne bei mir, ich antworte so schnell wie möglich.",
            form: {
                name: "Ihr Name",
                namePlaceholder: "Geben Sie Ihren Namen ein",
                email: "Ihre E-Mail",
                emailPlaceholder: "Geben Sie Ihre E-Mail-Adresse ein",
                subject: "Betreff",
                subjectPlaceholder: "Worum geht es?",
                message: "Ihre Nachricht",
                messagePlaceholder: "Lassen Sie mich wissen, wie ich helfen kann.",
                submit: "Nachricht senden"
            }
        },
        footer: {
            copyright: "© {year} {name}. Alle Rechte vorbehalten."
        }
    }
};

// --- Data ---
const personalInfo = {
    name: "Amr Elganainy",
    title: "CS Graduate & Cyber Security Master Student",
    bio: {
        en: "Junior Android and cross-platform mobile developer with solid project experience. I love turning ideas into functional apps, am a team player, and always ready to learn. As a CS graduate and Cyber Security master's student, I'm currently writing my master's thesis.",
        de: "Junior Android- und cross-platform Mobile-Entwickler mit fundierter Projekterfahrung. Ich liebe es, Ideen in funktionierende Apps umzusetzen, bin Teamplayer und immer bereit, mehr zu lernen. Als CS-Absolvent und Master-Student in Cyber Security schreibe ich derzeit meine Masterarbeit."
    },
    imageUrl: "photos/profile-pic.png",
    contact: {
        email: "amrmohammedali11@gmail.com",
        linkedin: "https://www.linkedin.com/in/amr-elganainy/",
        github: "https://github.com/ganainy",
        phone: "017 641 733 956",
        address: "44143, Dortmund"
    }
};

const skills = [
    'Java', 'Kotlin', 'Dart', 'Python',
    'Restful APIs', 'Firebase Services', 'Jetpack', 'MVVM', 'XML', 'Kotlin Compose',
    'Coroutines', 'Database', 'Work Manager', 'Play Console', 'Social SDKs', 'Adaptive UI',
    'Android Studio', 'Visual Studio Code', 'Git', 'GitHub', 'Linux',
    'AI/ML', 'Appium', 'Security Analysis', 'Privacy Evaluation'
];

// --- Components ---

const Header = ({ language, setLanguage }) => (
    <header className="sticky top-0 w-full h-16 bg-black/80 backdrop-blur-md border-b border-gray-800 z-50">
        <nav className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
            <a href="#" className="text-xl font-bold">{personalInfo.name}</a>
            <div className="flex items-center gap-8">
                <ul className="flex gap-8">
                    <li><a href="#about" className="text-gray-400 hover:text-blue-400 transition-colors">{translations[language].nav.about}</a></li>
                    <li><a href="#projects" className="text-gray-400 hover:text-blue-400 transition-colors">{translations[language].nav.projects}</a></li>
                    <li><a href="#contact" className="text-gray-400 hover:text-blue-400 transition-colors">{translations[language].nav.contact}</a></li>
                </ul>
                <button
                    onClick={() => setLanguage(language === 'en' ? 'de' : 'en')}
                    className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                    {language === 'en' ? 'DE' : 'EN'}
                </button>
            </div>
        </nav>
    </header>
);

const VideoModal = ({ isOpen, onClose, videoUrl, title, language }) => {
    if (!isOpen || !videoUrl) return null;

    // Extract YouTube video ID from URL
    const getYouTubeVideoId = (url: string) => {
        const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        return match ? match[1] : null;
    };

    const videoId = getYouTubeVideoId(videoUrl);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="relative w-full max-w-4xl bg-gray-900 rounded-lg overflow-hidden shadow-2xl z-[70]" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-800/80 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>

                {/* Video container */}
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        title={title[language]}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>

                {/* Title */}
                <div className="p-6 bg-gray-800">
                    <h3 className="text-white text-xl font-bold">{title[language]}</h3>
                </div>
            </div>
        </div>
    );
};

const ProjectDetailModal = ({ isOpen, onClose, project, language, onVideoClick }) => {
    if (!isOpen || !project) return null;

    const { title, description, imageUrl, videoUrl, tags, liveUrl, repoUrl, lastUpdated, stars, forks } = project;

    const handleLiveDemoClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onVideoClick && videoUrl) {
            onVideoClick(videoUrl, title);
        }
    };

    // Format date function
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Last updated today';
        } else if (diffDays <= 7) {
            return `Last updated ${diffDays} days ago`;
        } else if (diffDays <= 30) {
            const weeks = Math.floor(diffDays / 7);
            return `Last updated ${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else if (diffDays <= 365) {
            const months = Math.floor(diffDays / 30);
            return `Last updated ${months} month${months > 1 ? 's' : ''} ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `Last updated ${years} year${years > 1 ? 's' : ''} ago`;
        }
    };

    // Language logo mapping
    const languageLogos = {
        'Kotlin': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/kotlin/kotlin-original.svg',
        'Java': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg',
        'Python': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg',
        'Flutter': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/flutter/flutter-original.svg',
        'Dart': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/dart/dart-original.svg',
        'TypeScript': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg',
        'JavaScript': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg',
        'React': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg',
        'Node.js': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg',
        'Android': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/android/android-original.svg'
    };

    // Get primary language from tags (first programming language found)
    const getPrimaryLanguage = (tags: string[]) => {
        const programmingLanguages = ['Kotlin', 'Java', 'Python', 'Flutter', 'Dart', 'TypeScript', 'JavaScript', 'React', 'Node.js'];
        return tags.find(tag => programmingLanguages.includes(tag)) || tags[0];
    };

    const primaryLanguage = getPrimaryLanguage(tags);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
            <div className="relative w-full max-w-4xl bg-gray-900 rounded-lg overflow-hidden shadow-2xl my-8" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-gray-800/80 hover:bg-gray-700 rounded-full flex items-center justify-center text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>

                {/* Project Image */}
                <div className="w-full h-64 bg-center bg-no-repeat bg-cover flex items-center justify-center overflow-hidden" style={{ backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none', backgroundColor: imageUrl ? 'transparent' : '#374151' }}>
                    {!imageUrl && (
                        <img
                            src={languageLogos[primaryLanguage] || 'https://via.placeholder.com/400x225/374151/9CA3AF?text=No+Image'}
                            alt={`${primaryLanguage} logo`}
                            className="w-32 h-32 object-contain opacity-60"
                            onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/400x225/374151/9CA3AF?text=No+Image';
                            }}
                        />
                    )}
                </div>

                {/* Project Details */}
                <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-white text-3xl font-bold">{title[language]}</h2>
                            <div className="flex items-center gap-2">
                                {stars > 0 && (
                                    <div className="flex items-center gap-1 bg-yellow-600/20 text-yellow-400 text-lg font-semibold px-3 py-1 rounded-full border border-yellow-600/30">
                                        <span className="material-symbols-outlined">star</span>
                                        <span>{stars}</span>
                                    </div>
                                )}
                                {forks > 0 && (
                                    <div className="flex items-center gap-1 bg-blue-600/20 text-blue-400 text-lg font-semibold px-3 py-1 rounded-full border border-blue-600/30">
                                        <span className="material-symbols-outlined">fork_right</span>
                                        <span>{forks}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {lastUpdated && (
                            <span className="text-gray-400 text-sm font-medium whitespace-nowrap ml-4">
                                {formatDate(lastUpdated)}
                            </span>
                        )}
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">{description[language]}</p>

                    {/* Tags */}
                    <div className="mb-6">
                        <h3 className="text-white text-xl font-semibold mb-3">Technologies Used</h3>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => {
                                const tagClasses = {
                                    'Java': 'bg-blue-900/50 text-blue-300',
                                    'Kotlin': 'bg-blue-900/50 text-blue-300',
                                    'Android': 'bg-green-900/50 text-green-300',
                                    'Firebase': 'bg-orange-900/50 text-orange-300',
                                    'Real-time': 'bg-purple-900/50 text-purple-300',
                                    'WorkManager': 'bg-red-900/50 text-red-300',
                                    'Localization': 'bg-yellow-900/50 text-yellow-300',
                                    'Flutter': 'bg-cyan-900/50 text-cyan-300',
                                    'Dart': 'bg-blue-900/50 text-blue-300',
                                    'Multiplayer': 'bg-pink-900/50 text-pink-300',
                                    'Python': 'bg-yellow-900/50 text-yellow-300',
                                    'TypeScript': 'bg-blue-900/50 text-blue-300',
                                    'AI': 'bg-purple-900/50 text-purple-300',
                                    'Security': 'bg-red-900/50 text-red-300',
                                    'Privacy': 'bg-indigo-900/50 text-indigo-300'
                                };
                                return (
                                    <span key={tag} className={`${tagClasses[tag] || 'bg-gray-700 text-gray-300'} text-sm font-semibold px-3 py-1 rounded-full`}>
                                        {tag}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4">
                        {videoUrl && (
                            <button
                                onClick={handleLiveDemoClick}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">play_circle</span>
                                Live Demo
                            </button>
                        )}
                        {repoUrl && repoUrl !== "#" && (
                            <a
                                href={repoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                View on GitHub
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
const About = ({ language }) => (
    <section id="about" className="py-20 px-4 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-transparent"></div>

        <div className="max-w-7xl mx-auto relative">
            {/* Hero Section */}
            <div className="flex flex-col lg:flex-row items-center gap-12 mb-20">
                <div className="flex-shrink-0 relative">
                    <div className="w-48 h-48 bg-center bg-no-repeat bg-cover rounded-full border-4 border-gray-800 shadow-2xl shadow-blue-500/20" style={{ backgroundImage: `url("${personalInfo.imageUrl}")` }} aria-label={`Portrait of ${personalInfo.name}`}></div>
                </div>
                <div className="flex flex-col gap-6 text-center lg:text-left">
                    <div>
                        <h1 className="text-white text-5xl lg:text-6xl font-bold leading-tight tracking-tighter mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                            {personalInfo.name}
                        </h1>
                        <h2 className="text-blue-400 text-xl lg:text-2xl font-medium leading-normal mb-6">
                            {personalInfo.title}
                        </h2>
                    </div>
                    <p className="text-gray-300 text-lg font-normal leading-relaxed max-w-2xl">
                        {personalInfo.bio[language]}
                    </p>
                </div>
            </div>

            {/* Education & Languages Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                {/* Education Card */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-blue-400">school</span>
                        </div>
                        <h3 className="text-white text-2xl font-bold">{translations[language].about.education}</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                                <p className="text-gray-300 font-medium">{translations[language].about.master}</p>
                                <p className="text-gray-500 text-sm">Grade: 2.2</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                                <p className="text-gray-300 font-medium">{translations[language].about.bachelor}</p>
                                <p className="text-gray-500 text-sm">Grade: 2.3</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Languages Card */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 hover:border-blue-500/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-400">language</span>
                        </div>
                        <h3 className="text-white text-2xl font-bold">{translations[language].about.languages}</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">DE</span>
                            </div>
                            <div>
                                <p className="text-gray-300 font-medium">{translations[language].about.german}</p>
                                <p className="text-gray-500 text-sm">C1 Telc University Certificate</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">EN</span>
                            </div>
                            <div>
                                <p className="text-gray-300 font-medium">{translations[language].about.english}</p>
                                <p className="text-gray-500 text-sm">B2 Level</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills Section */}
            <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-purple-400">code</span>
                    </div>
                    <h3 className="text-white text-2xl font-bold">{translations[language].about.skills}</h3>
                </div>
                <div className="flex gap-3 flex-wrap">
                    {skills.map(skill => (
                        <div key={skill} className="flex items-center justify-center gap-x-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-2 border border-gray-600 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                            <p className="text-gray-300 text-sm font-medium leading-normal">
                                {skill}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
);

const ProjectCard = ({ project, language, onVideoClick, onProjectClick }: { project: any; language: string; onVideoClick?: (videoUrl: string, title: any) => void; onProjectClick?: (project: any) => void; key?: string }) => {
    const { title, description, imageUrl, videoUrl, tags, liveUrl, repoUrl, lastUpdated, stars, forks } = project;

    const handleLiveDemoClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering project click
        if (videoUrl && onVideoClick) {
            e.preventDefault();
            onVideoClick(videoUrl, title);
        }
    };

    const handleProjectClick = () => {
        if (onProjectClick) {
            onProjectClick(project);
        }
    };

    // Format date function
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            return 'Last updated today';
        } else if (diffDays <= 7) {
            return `Last updated ${diffDays} days ago`;
        } else if (diffDays <= 30) {
            const weeks = Math.floor(diffDays / 7);
            return `Last updated ${weeks} week${weeks > 1 ? 's' : ''} ago`;
        } else if (diffDays <= 365) {
            const months = Math.floor(diffDays / 30);
            return `Last updated ${months} month${months > 1 ? 's' : ''} ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            return `Last updated ${years} year${years > 1 ? 's' : ''} ago`;
        }
    };

    // Language logo mapping
    const languageLogos = {
        'Kotlin': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/kotlin/kotlin-original.svg',
        'Java': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg',
        'Python': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg',
        'Flutter': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/flutter/flutter-original.svg',
        'Dart': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/dart/dart-original.svg',
        'TypeScript': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg',
        'JavaScript': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg',
        'React': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg',
        'Node.js': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg',
        'Android': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/android/android-original.svg'
    };

    // Get primary language from tags (first programming language found)
    const getPrimaryLanguage = (tags: string[]) => {
        const programmingLanguages = ['Kotlin', 'Java', 'Python', 'Flutter', 'Dart', 'TypeScript', 'JavaScript', 'React', 'Node.js'];
        return tags.find(tag => programmingLanguages.includes(tag)) || tags[0];
    };

    const primaryLanguage = getPrimaryLanguage(tags);
    const displayImage = imageUrl || languageLogos[primaryLanguage] || 'https://via.placeholder.com/400x225/374151/9CA3AF?text=No+Image';

    return (
        <div
            className="flex flex-col gap-4 bg-gray-800 border border-gray-700 rounded-lg p-6 group transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 cursor-pointer"
            onClick={handleProjectClick}
        >
            <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-md flex items-center justify-center overflow-hidden" style={{ backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none', backgroundColor: imageUrl ? 'transparent' : '#374151' }}>
                {!imageUrl && (
                    <img
                        src={languageLogos[primaryLanguage] || 'https://via.placeholder.com/400x225/374151/9CA3AF?text=No+Image'}
                        alt={`${primaryLanguage} logo`}
                        className="w-24 h-24 object-contain opacity-60"
                        onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/400x225/374151/9CA3AF?text=No+Image';
                        }}
                    />
                )}
            </div>
            <div className="flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white text-xl font-bold leading-normal flex-1 truncate mr-2">{title[language]}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {stars > 0 && (
                            <div className="flex items-center gap-1 bg-yellow-600/20 text-yellow-400 text-sm font-semibold px-2 py-1 rounded-full border border-yellow-600/30">
                                <span className="material-symbols-outlined text-sm">star</span>
                                <span>{stars}</span>
                            </div>
                        )}
                        {forks > 0 && (
                            <div className="flex items-center gap-1 bg-blue-600/20 text-blue-400 text-sm font-semibold px-2 py-1 rounded-full border border-blue-600/30">
                                <span className="material-symbols-outlined text-sm">fork_right</span>
                                <span>{forks}</span>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-gray-400 text-sm font-normal leading-relaxed flex-1">{description[language]}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map(tag => {
                        const tagClasses = {
                            'Java': 'bg-blue-900/50 text-blue-300',
                            'Kotlin': 'bg-blue-900/50 text-blue-300',
                            'Android': 'bg-green-900/50 text-green-300',
                            'Firebase': 'bg-orange-900/50 text-orange-300',
                            'Real-time': 'bg-purple-900/50 text-purple-300',
                            'WorkManager': 'bg-red-900/50 text-red-300',
                            'Localization': 'bg-yellow-900/50 text-yellow-300',
                            'Flutter': 'bg-cyan-900/50 text-cyan-300',
                            'Dart': 'bg-blue-900/50 text-blue-300',
                            'Multiplayer': 'bg-pink-900/50 text-pink-300',
                            'Python': 'bg-yellow-900/50 text-yellow-300',
                            'TypeScript': 'bg-blue-900/50 text-blue-300',
                            'AI': 'bg-purple-900/50 text-purple-300',
                            'Security': 'bg-red-900/50 text-red-300',
                            'Privacy': 'bg-indigo-900/50 text-indigo-300'
                        };
                        return (
                            <span key={tag} className={`${tagClasses[tag] || 'bg-gray-700 text-gray-300'} text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
                                {tag}
                            </span>
                        );
                    })}
                </div>
                <div className="mt-4 flex items-center gap-4">
                    {videoUrl && (
                        <button
                            onClick={handleLiveDemoClick}
                            className="text-white font-medium hover:text-blue-400 transition-colors duration-300 flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">play_circle</span>
                            Live Demo
                        </button>
                    )}
                    {repoUrl && repoUrl !== "#" && (
                        <a className="text-white font-medium hover:text-blue-400 transition-colors duration-300 flex items-center gap-2" href={repoUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub
                        </a>
                    )}
                </div>
                {lastUpdated && (
                    <div className="mt-4 flex items-center gap-2 text-gray-400 text-xs">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>{formatDate(lastUpdated)}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const Projects = ({ language }) => {
    const [modalState, setModalState] = useState({ isOpen: false, videoUrl: '', title: { en: '', de: '' } });
    const [projectDetailState, setProjectDetailState] = useState({ isOpen: false, project: null });
    const [dynamicProjects, setDynamicProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const handleVideoClick = (videoUrl: string, title: any) => {
        setModalState({ isOpen: true, videoUrl, title });
    };

    const handleProjectClick = (project: any) => {
        setProjectDetailState({ isOpen: true, project });
    };

    const closeModal = () => {
        setModalState({ isOpen: false, videoUrl: '', title: { en: '', de: '' } });
    };

    const closeProjectDetailModal = () => {
        setProjectDetailState({ isOpen: false, project: null });
    };

    React.useEffect(() => {
        const loadProjects = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Try to get cached data first
                let githubRepos = getCachedRepos();

                if (!githubRepos) {
                    // Fetch from GitHub API
                    githubRepos = await fetchGitHubRepos();
                    setCachedRepos(githubRepos);
                }

                // Transform GitHub repos to project format
                const transformedProjects = githubRepos
                    .map(repo => transformGitHubRepoToProject(repo, language))
                    .filter(project => project !== null);

                // Sort: featured projects first, then by last updated date
                const sortedProjects = transformedProjects.sort((a, b) => {
                    if (a.isFeatured && !b.isFeatured) return -1;
                    if (!a.isFeatured && b.isFeatured) return 1;
                    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
                });

                setDynamicProjects(sortedProjects);
            } catch (err) {
                console.error('Error loading projects:', err);
                setError(err.message);
                setDynamicProjects([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadProjects();
    }, [language]);

    // Use dynamic projects as the main projects list
    const allProjects = dynamicProjects;

    return (
        <section id="projects" className="py-20 px-4 bg-gray-900/50">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tighter mb-4">{translations[language].projects.title}</h2>
                    <p className="max-w-2xl mx-auto text-lg text-gray-400">{translations[language].projects.subtitle}</p>
                </div>

                {isLoading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                        <span className="ml-4 text-gray-400">Loading projects from GitHub...</span>
                    </div>
                )}

                {error && (
                    <div className="text-center py-10">
                        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
                            <p className="text-red-400 mb-2">Failed to load GitHub projects</p>
                            <p className="text-gray-400 text-sm">Showing manual projects only</p>
                        </div>
                    </div>
                )}

                {!isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allProjects.map(project => (
                            <ProjectCard
                                key={project.title?.en || project.repoUrl}
                                project={project}
                                language={language}
                                onVideoClick={handleVideoClick}
                                onProjectClick={handleProjectClick}
                            />
                        ))}
                    </div>
                )}
            </div>

            <VideoModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                videoUrl={modalState.videoUrl}
                title={modalState.title}
                language={language}
            />

            <ProjectDetailModal
                isOpen={projectDetailState.isOpen}
                onClose={closeProjectDetailModal}
                project={projectDetailState.project}
                language={language}
                onVideoClick={handleVideoClick}
            />
        </section>
    );
};
const Contact = ({ language }) => (
    <section id="contact" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tighter mb-4">{translations[language].contact.title}</h2>
                <p className="max-w-2xl mx-auto text-lg text-gray-400">{translations[language].contact.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 group">
                            <svg className="text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            <a className="text-lg text-gray-300 hover:text-blue-400 transition-colors" href={`tel:${personalInfo.contact.phone}`}>{personalInfo.contact.phone}</a>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <svg className="text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            <a className="text-lg text-gray-300 hover:text-blue-400 transition-colors" href={`mailto:${personalInfo.contact.email}`}>{personalInfo.contact.email}</a>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <svg className="text-gray-400 group-hover:text-blue-400 transition-colors" fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px"><path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z"></path></svg>
                            <a className="text-lg text-gray-300 hover:text-blue-400 transition-colors" href={personalInfo.contact.linkedin} target="_blank" rel="noopener noreferrer">linkedin.com/in/amr-elganainy</a>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <svg className="text-gray-400 group-hover:text-blue-400 transition-colors" fill="currentColor" height="24px" viewBox="0 0 256 256" width="24px"><path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z"></path></svg>
                            <a className="text-lg text-gray-300 hover:text-blue-400 transition-colors" href={personalInfo.contact.github} target="_blank" rel="noopener noreferrer">GitHub</a>
                        </div>
                        <div className="flex items-center gap-3 group">
                            <svg className="text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span className="text-lg text-gray-300">{personalInfo.contact.address}</span>
                        </div>
                    </div>
                </div>
                <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-300">{translations[language].contact.form.name}</span>
                        <input className="w-full rounded-md bg-gray-800 border border-gray-700 text-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 px-4" type="text" placeholder={translations[language].contact.form.namePlaceholder} />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-300">{translations[language].contact.form.email}</span>
                        <input className="w-full rounded-md bg-gray-800 border border-gray-700 text-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 px-4" type="email" placeholder={translations[language].contact.form.emailPlaceholder} />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-300">{translations[language].contact.form.subject}</span>
                        <input className="w-full rounded-md bg-gray-800 border border-gray-700 text-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 px-4" type="text" placeholder={translations[language].contact.form.subjectPlaceholder} />
                    </label>
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-300">{translations[language].contact.form.message}</span>
                        <textarea className="w-full rounded-md bg-gray-800 border border-gray-700 text-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-36 p-4" placeholder={translations[language].contact.form.messagePlaceholder} rows={5}></textarea>
                    </label>
                    <button className="flex items-center justify-center rounded-md h-12 px-6 bg-blue-600 text-white text-base font-bold hover:bg-blue-700 transition-all w-full lg:w-auto" type="submit">
                        <span>{translations[language].contact.form.submit}</span>
                    </button>
                </form>
            </div>
        </div>
    </section>
);


const Footer = ({ language, showAdminLink, onAdminClick }) => (
    <footer className="text-center py-8 border-t border-gray-800 bg-gray-900/50 relative">
        <p className="text-gray-400">{translations[language].footer.copyright.replace('{year}', new Date().getFullYear().toString()).replace('{name}', personalInfo.name)}</p>
        {showAdminLink && (
            <button
                onClick={onAdminClick}
                className="absolute bottom-2 right-4 text-xs text-gray-600 hover:text-gray-400 transition-colors underline"
                title="Admin Panel (Ctrl+Shift+A to toggle)"
            >
                Admin
            </button>
        )}
    </footer>
);

// --- Admin Panel Functions ---
const getVisibilitySettings = () => {
    try {
        const settings = localStorage.getItem(VISIBILITY_KEY);
        return settings ? JSON.parse(settings) : {};
    } catch (error) {
        console.error('Error reading visibility settings:', error);
        return {};
    }
};

const saveVisibilitySettings = (settings: { [key: string]: boolean }) => {
    try {
        localStorage.setItem(VISIBILITY_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving visibility settings:', error);
    }
};

const isProjectVisible = (repoName: string) => {
    const settings = getVisibilitySettings();
    // If no setting exists, default to visible for featured repos, hidden for others
    if (settings[repoName] === undefined) {
        return FEATURED_REPOS.includes(repoName);
    }
    return settings[repoName];
};

// --- Admin Panel Component ---
const AdminPanel = ({ onBackToPortfolio }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [allRepos, setAllRepos] = useState([]);
    const [visibilitySettings, setVisibilitySettings] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (isAuthenticated) {
            loadAllRepos();
        }
    }, [isAuthenticated]);

    const loadAllRepos = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=100`);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            const repos = await response.json();

            // Filter out forks and private repos
            const filteredRepos = repos.filter((repo: GitHubRepo) =>
                !repo.fork && !repo.private && !repo.name.toLowerCase().includes('fork')
            );

            setAllRepos(filteredRepos);
            setVisibilitySettings(getVisibilitySettings());
        } catch (error) {
            console.error('Error loading repos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
        } else {
            alert('Incorrect password');
        }
    };

    const toggleVisibility = (repoName: string) => {
        const newSettings = {
            ...visibilitySettings,
            [repoName]: !isProjectVisible(repoName)
        };
        setVisibilitySettings(newSettings);
        saveVisibilitySettings(newSettings);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setPassword('');
        onBackToPortfolio();
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
                <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Panel</h2>
                    <form onSubmit={handleLogin}>
                        <div className="mb-4">
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter admin password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                        >
                            Login
                        </button>
                    </form>
                    <button
                        onClick={onBackToPortfolio}
                        className="w-full mt-4 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors font-medium"
                    >
                        Back to Portfolio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Portfolio Admin Panel</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                if (clearGitHubCache()) {
                                    alert('GitHub cache cleared! The projects will reload with fresh data from GitHub.');
                                    window.location.reload();
                                }
                            }}
                            className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                            title="Clear GitHub cache and reload fresh data"
                        >
                            Clear Cache
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                        <button
                            onClick={onBackToPortfolio}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Back to Portfolio
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-6 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Project Visibility Control</h2>
                        <p className="text-gray-400 mb-6">
                            Control which of your GitHub repositories are displayed in the portfolio.
                            Toggle visibility on/off for each project below.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
                            <span className="ml-4 text-gray-400">Loading repositories...</span>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {allRepos.map((repo: GitHubRepo) => {
                                const isVisible = isProjectVisible(repo.name);
                                const isFeatured = FEATURED_REPOS.includes(repo.name);

                                return (
                                    <div key={repo.id} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-white">{repo.name}</h3>
                                                    {isFeatured && (
                                                        <span className="bg-yellow-600 text-yellow-100 text-xs px-2 py-1 rounded-full">
                                                            Featured
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-400 text-sm mb-3">{repo.description || 'No description'}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span>⭐ {repo.stargazers_count}</span>
                                                    <span>🔄 {new Date(repo.pushed_at).toLocaleDateString()}</span>
                                                    {repo.language && <span>💻 {repo.language}</span>}
                                                </div>
                                            </div>
                                            <div className="ml-6">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <span className={`text-sm font-medium ${isVisible ? 'text-green-400' : 'text-gray-500'}`}>
                                                        {isVisible ? 'Visible' : 'Hidden'}
                                                    </span>
                                                    <div
                                                        className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full ${isVisible ? 'bg-green-600' : 'bg-gray-600'
                                                            }`}
                                                        onClick={() => toggleVisibility(repo.name)}
                                                    >
                                                        <span
                                                            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out ${isVisible ? 'translate-x-6' : 'translate-x-0'
                                                                }`}
                                                        />
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                        <h3 className="text-blue-400 font-semibold mb-2">💡 Tips:</h3>
                        <ul className="text-blue-300 text-sm space-y-1">
                            <li>• Featured repositories are visible by default</li>
                            <li>• Changes are saved automatically to your browser's local storage</li>
                            <li>• Only you can access this admin panel with the password</li>
                            <li>• Refresh the main portfolio to see visibility changes</li>
                            <li>• <strong>Cache Control:</strong> Use "Clear Cache" button above or press <kbd>Ctrl+Shift+C</kbd> to reload fresh GitHub data</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

const App = () => {
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
                localStorage.removeItem(CACHE_KEY);
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

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);

root.render(
    <StrictMode>
        <App />
    </StrictMode>
);