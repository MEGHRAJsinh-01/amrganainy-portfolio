import React from 'react';
import { Project } from '../types';
import { translations } from '../constants';

interface ProjectDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
    language: string;
    onVideoClick: (videoUrl: string, title: { en: string; de: string }) => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ isOpen, onClose, project, language, onVideoClick }) => {
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
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <h2 className="text-white text-3xl font-bold truncate">{title[language]}</h2>
                            <div className="flex items-center gap-2 flex-shrink-0">
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

export default ProjectDetailModal;
