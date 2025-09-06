import React from 'react';
import { Project } from '../types';
import DynamicText from './DynamicText';

interface ProjectCardProps {
    project: Project;
    language: string;
    onVideoClick?: (videoUrl: string, title: { en: string; de: string }) => void;
    onProjectClick?: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, language, onVideoClick, onProjectClick }) => {
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

    // Language logo mapping - using lowercase keys for case-insensitive comparison
    const languageLogos = {
        'kotlin': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/kotlin/kotlin-original.svg',
        'java': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/java/java-original.svg',
        'python': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg',
        'flutter': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/flutter/flutter-original.svg',
        'dart': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/dart/dart-original.svg',
        'typescript': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg',
        'javascript': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg',
        'react': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg',
        'node.js': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg',
        'android': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/android/android-original.svg',
        'html': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg',
        'css': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg',
        'shell': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/bash/bash-original.svg'
    };

    // Get primary language from tags (first programming language found) using case-insensitive comparison
    const getPrimaryLanguage = (tags: string[]) => {
        const programmingLanguages = [
            'kotlin', 'java', 'python', 'flutter', 'dart',
            'typescript', 'javascript', 'react', 'node.js',
            'html', 'css', 'shell', 'android'
        ];
        return tags.find(tag => programmingLanguages.includes(tag.toLowerCase())) || tags[0];
    };

    const primaryLanguage = getPrimaryLanguage(tags);
    const displayImage = imageUrl || languageLogos[primaryLanguage?.toLowerCase()] || 'https://via.placeholder.com/400x225/374151/9CA3AF?text=No+Image';

    return (
        <div
            className="flex flex-col gap-4 bg-gray-800 border border-gray-700 rounded-lg p-6 group transition-all duration-300 hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 cursor-pointer"
            onClick={handleProjectClick}
        >
            <div className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-md flex items-center justify-center overflow-hidden" style={{ backgroundImage: imageUrl ? `url("${imageUrl}")` : 'none', backgroundColor: imageUrl ? 'transparent' : '#374151' }}>
                {!imageUrl && (
                    <img
                        src={languageLogos[primaryLanguage?.toLowerCase()] || 'https://via.placeholder.com/400x225/374151/9CA3AF?text=No+Image'}
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
                    <h3 className="text-white text-xl font-bold leading-normal flex-1 truncate mr-2">
                        <DynamicText content={title} language={language} as="span" />
                    </h3>
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
                <p className="text-gray-400 text-sm font-normal leading-relaxed flex-1">
                    <DynamicText content={description} language={language} as="span" />
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map(tag => {
                        const tagClasses = {
                            'java': 'bg-blue-900/50 text-blue-300',
                            'kotlin': 'bg-blue-900/50 text-blue-300',
                            'android': 'bg-green-900/50 text-green-300',
                            'firebase': 'bg-orange-900/50 text-orange-300',
                            'real-time': 'bg-purple-900/50 text-purple-300',
                            'workmanager': 'bg-red-900/50 text-red-300',
                            'localization': 'bg-yellow-900/50 text-yellow-300',
                            'flutter': 'bg-cyan-900/50 text-cyan-300',
                            'dart': 'bg-blue-900/50 text-blue-300',
                            'multiplayer': 'bg-pink-900/50 text-pink-300',
                            'python': 'bg-yellow-900/50 text-yellow-300',
                            'typescript': 'bg-blue-900/50 text-blue-300',
                            'javascript': 'bg-yellow-900/50 text-yellow-300',
                            'html': 'bg-orange-900/50 text-orange-300',
                            'css': 'bg-blue-900/50 text-blue-300',
                            'shell': 'bg-gray-900/50 text-gray-300',
                            'ai': 'bg-purple-900/50 text-purple-300',
                            'security': 'bg-red-900/50 text-red-300',
                            'privacy': 'bg-indigo-900/50 text-indigo-300'
                        };
                        return (
                            <span key={tag} className={`${tagClasses[tag.toLowerCase()] || 'bg-gray-700 text-gray-300'} text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
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

export default ProjectCard;
