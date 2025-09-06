import { GitHubRepo, CachedData, Project } from './types';
import { GITHUB_USERNAME, CACHE_KEY, CACHE_DURATION, FEATURED_REPOS, VISIBILITY_KEY } from './constants';

export const SKILLS_CACHE_KEY = 'github_skills_cache';

export const fetchGitHubRepos = async (): Promise<GitHubRepo[]> => {
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

export const getCachedRepos = (): GitHubRepo[] | null => {
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

export const setCachedRepos = (repos: GitHubRepo[]): void => {
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

export const clearGitHubCache = () => {
    try {
        localStorage.removeItem(CACHE_KEY);
        console.log('GitHub cache cleared successfully');
        return true;
    } catch (error) {
        console.error('Error clearing GitHub cache:', error);
        return false;
    }
};

export const transformGitHubRepoToProject = (repo: GitHubRepo, language: string): Project | null => {
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
        // Use topics from GitHub with proper formatting
        tags = repo.topics && repo.topics.length > 0 ? 
            repo.topics.map(topic => 
                topic
                    .replace(/-/g, ' ')  // Replace hyphens with spaces
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
                    .join(' ')
            ) : 
            [repo.language || 'Project'];
    } else {
        // Generate tags from language and topics
        const generatedTags: string[] = [];
        if (repo.language) {
            generatedTags.push(repo.language);
        }
        if (repo.topics && repo.topics.length > 0) {
            // Format topics before adding them
            const formattedTopics = repo.topics.slice(0, 3).map(topic => 
                topic
                    .replace(/-/g, ' ')  // Replace hyphens with spaces
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
                    .join(' ')
            );
            generatedTags.push(...formattedTopics); // Limit to 3 additional topics
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

// --- Admin Panel Functions ---
export const getVisibilitySettings = () => {
    try {
        const settings = localStorage.getItem(VISIBILITY_KEY);
        return settings ? JSON.parse(settings) : {};
    } catch (error) {
        console.error('Error reading visibility settings:', error);
        return {};
    }
};

export const saveVisibilitySettings = (settings: { [key: string]: boolean }) => {
    try {
        localStorage.setItem(VISIBILITY_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving visibility settings:', error);
    }
};

export const isProjectVisible = (repoName: string) => {
    const settings = getVisibilitySettings();
    // If no setting exists, default to visible for featured repos, hidden for others
    if (settings[repoName] === undefined) {
        return FEATURED_REPOS.includes(repoName);
    }
    return settings[repoName];
};

// --- Skills Extraction Functions ---
export const extractSkillsFromRepos = (repos: GitHubRepo[]): string[] => {
    const skillCounts: { [key: string]: number } = {};

    repos.forEach(repo => {
        // Prioritize topics/tags (these often represent technologies/frameworks)
        if (repo.topics && repo.topics.length > 0) {
            repo.topics.forEach(topic => {
                // Convert topic to proper readable format
                // For example: "android-app" becomes "Android App"
                const formattedTopic = topic
                    .replace(/-/g, ' ')  // Replace hyphens with spaces
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize first letter of each word
                    .join(' ');
                
                skillCounts[formattedTopic] = (skillCounts[formattedTopic] || 0) + 1;
            });
        }
        
        // Include programming languages if not already in topics
        if (repo.language && !skillCounts[repo.language]) {
            skillCounts[repo.language] = (skillCounts[repo.language] || 0) + 1;
        }
    });    // Sort skills by frequency and return top skills
    const sortedSkills = Object.entries(skillCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([skill]) => skill)
        .slice(0, 30); // Increased to top 30 skills for more variety

    return sortedSkills;
};

export const getCachedSkills = (): string[] | null => {
    try {
        const cached = localStorage.getItem(SKILLS_CACHE_KEY);
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        const now = Date.now();

        if (now - parsed.timestamp > CACHE_DURATION) {
            localStorage.removeItem(SKILLS_CACHE_KEY);
            return null;
        }

        return parsed.data;
    } catch (error) {
        console.error('Error reading skills cache:', error);
        return null;
    }
};

export const setCachedSkills = (skills: string[]): void => {
    try {
        const cacheData = {
            data: skills,
            timestamp: Date.now()
        };
        localStorage.setItem(SKILLS_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error setting skills cache:', error);
    }
};

export const getDynamicSkills = async (): Promise<string[]> => {
    try {
        // Try to get cached skills first
        const cachedSkills = getCachedSkills();
        if (cachedSkills) {
            return cachedSkills;
        }

        // Fetch fresh data from GitHub
        const repos = await fetchGitHubRepos();
        const dynamicSkills = extractSkillsFromRepos(repos);

        // Cache the results
        setCachedSkills(dynamicSkills);

        return dynamicSkills;
    } catch (error) {
        console.error('Error fetching dynamic skills:', error);
        // Return empty array if GitHub API fails
        return [];
    }
};

export const clearSkillsCache = () => {
    try {
        localStorage.removeItem(SKILLS_CACHE_KEY);
        console.log('Skills cache cleared successfully');
        return true;
    } catch (error) {
        console.error('Error clearing skills cache:', error);
        return false;
    }
};
