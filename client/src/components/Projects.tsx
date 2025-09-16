import React, { useState } from 'react';
import { Project } from '../types';
import { translations, API_URL, GITHUB_USERNAME } from '../constants';
import { projectAPI } from '../api/multiUserApi';
import ProjectCard from './ProjectCard';
import VideoModal from './VideoModal';
import ProjectDetailModal from './ProjectDetailModal';

interface ProjectsProps {
    language: string;
    // Optional: username for public portfolio view (/u/:username)
    username?: string;
}

// Helper to ensure image URLs are absolute when coming from backend '/uploads'
const ensureFullImageUrl = (url?: string): string | undefined => {
    if (!url) return url;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/uploads/')) {
        try {
            const api = new URL(API_URL);
            const origin = `${api.protocol}//${api.host}`;
            return `${origin}${url}`;
        } catch {
            return `${window.location.origin}${url}`;
        }
    }
    return url;
};

const Projects: React.FC<ProjectsProps> = ({ language, username }) => {
    const [modalState, setModalState] = useState({ isOpen: false, videoUrl: '', title: { en: '', de: '' } });
    const [projectDetailState, setProjectDetailState] = useState({ isOpen: false, project: null as Project | null });
    const [dynamicProjects, setDynamicProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleVideoClick = (videoUrl: string, title: { en: string; de: string }) => {
        setModalState({ isOpen: true, videoUrl, title });
    };

    const handleProjectClick = (project: Project) => {
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

                if (username) {
                    // Use enriched endpoint that combines database and GitHub projects
                    const resp = await projectAPI.getEnrichedUserProjects(username);
                    const projects = (resp?.data?.data?.projects || resp?.data?.projects || resp?.data || []) as Project[];
                    const mapped = projects.map(p => ({ ...p, imageUrl: ensureFullImageUrl(p.imageUrl) }));
                    setDynamicProjects(mapped);
                } else {
                    // For the main portfolio, use the enriched endpoint with the configured username
                    const resp = await projectAPI.getEnrichedUserProjects(GITHUB_USERNAME);
                    const projects = (resp?.data?.data?.projects || resp?.data?.projects || resp?.data || []) as Project[];
                    const mapped = projects.map(p => ({ ...p, imageUrl: ensureFullImageUrl(p.imageUrl) }));
                    setDynamicProjects(mapped);
                }
            } catch (err) {
                console.error('Error loading projects:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
                setDynamicProjects([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadProjects();
    }, [language, username]);

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
                        <span className="ml-4 text-gray-400">Loading projects...</span>
                    </div>
                )}

                {error && (
                    <div className="text-center py-10">
                        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md mx-auto">
                            <div className="flex items-center gap-2 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <h3 className="text-red-400 text-lg font-bold">Projects are unavailable</h3>
                            </div>
                            <p className="text-gray-300">We couldn’t load the projects right now.</p>
                        </div>
                    </div>
                )}

                {!isLoading && allProjects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {allProjects.map(project => (
                            <ProjectCard
                                key={typeof project.title === 'object' ? project.title.en : project.repoUrl}
                                project={project}
                                language={language}
                                onVideoClick={handleVideoClick}
                                onProjectClick={handleProjectClick}
                            />
                        ))}
                    </div>
                )}

                {!isLoading && allProjects.length === 0 && !error && (
                    <div className="text-center py-10">
                        <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-6 max-w-xl mx-auto">
                            <h3 className="text-white text-xl mb-3">
                                {language === 'de'
                                    ? 'Keine Projekte sind derzeit sichtbar'
                                    : 'No projects are currently visible'}
                            </h3>
                            <p className="text-gray-300 mb-4">
                                {language === 'de'
                                    ? 'Dies könnte folgende Gründe haben:'
                                    : 'This could be because:'}
                            </p>
                            <ul className="text-gray-400 text-sm mb-4 space-y-1 list-disc list-inside">
                                <li>
                                    {language === 'de'
                                        ? 'Kein GitHub-Repository erfüllt die Sichtbarkeitskriterien (Repositories benötigen standardmäßig Stars oder Pull-Requests, um angezeigt zu werden)'
                                        : 'No GitHub repositories meet the visibility criteria (repositories need stars or pull requests to be shown by default)'}
                                </li>
                                <li>
                                    {language === 'de'
                                        ? 'Die Projekteinstellungen sind so konfiguriert, dass alle Projekte ausgeblendet sind'
                                        : 'Project visibility settings are configured to hide all projects'}
                                </li>
                                <li>
                                    {language === 'de'
                                        ? 'Es könnte ein temporäres Problem mit der GitHub-API-Verbindung bestehen'
                                        : 'There might be a temporary issue with the GitHub API connection'}
                                </li>
                            </ul>
                            <p className="text-gray-300 mb-2">
                                {language === 'de'
                                    ? 'Wenn Sie der Website-Besitzer sind, besuchen Sie bitte das Admin-Panel, um die Sichtbarkeitseinstellungen der Projekte zu verwalten.'
                                    : 'If you are the site owner, please visit the admin panel to manage project visibility settings.'}
                            </p>
                            <a href="/admin" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                                {language === 'de' ? 'Zum Admin-Panel' : 'Go to Admin Panel'}
                            </a>
                        </div>
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

export default Projects;