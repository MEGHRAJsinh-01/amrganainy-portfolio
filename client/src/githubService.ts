import { GitHubRepo, CachedData, Project, LinkedInProfileData, LinkedInAdditionalProfileData, LinkedInCacheData, LinkedInAdditionalCacheData } from './types';
import { GITHUB_USERNAME, CACHE_DURATION, VISIBILITY_KEY, personalInfo, CLOUD_API_URL, LOCAL_API_URL } from './constants';

export const SKILLS_CACHE_KEY = 'github_skills_cache';
export const GITHUB_REPOS_CACHE_KEY = 'github_repos_cache_v1';

export interface SkillsData {
    programmingLanguages: string[];
    otherSkills: string[];
}

export const fetchGitHubProfile = async (username: string) => {
    const isProd = import.meta.env.MODE === 'production';
    const apiBaseUrl = isProd ? CLOUD_API_URL : LOCAL_API_URL;
    const response = await fetch(`${apiBaseUrl}/github/profile/${username}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch GitHub profile: ${response.status}`);
    }
    return await response.json();
};

export const fetchGitHubRepos = async (username?: string): Promise<GitHubRepo[]> => {
    try {
        const cached = getCachedRepos();
        if (cached && cached.length > 0 && !username) {
            return cached;
        }

        // Use provided username or fallback to constant
        const targetUsername = username || GITHUB_USERNAME;
        if (!targetUsername) {
            throw new Error('No GitHub username provided');
        }

        const isProd = import.meta.env.MODE === 'production';
        const apiBaseUrl = isProd ? CLOUD_API_URL : LOCAL_API_URL;
        const response = await fetch(`${apiBaseUrl}/github/repos/${targetUsername}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch GitHub repos: ${response.status}`);
        }

        const repos = await response.json();
        setCachedRepos(repos);
        return repos;
    } catch (error) {
        console.error('Error fetching GitHub repos:', error);
        throw error;
    }
};

export const getCachedRepos = (): GitHubRepo[] | null => {
    try {
        const cached = localStorage.getItem(GITHUB_REPOS_CACHE_KEY);
        if (!cached) return null;

        const parsed: CachedData = JSON.parse(cached);
        const now = Date.now();

        if (now - parsed.timestamp > CACHE_DURATION) {
            localStorage.removeItem(GITHUB_REPOS_CACHE_KEY);
            return null;
        }

        return parsed.data;
    } catch (error) {
        console.error('Error getting cached repos:', error);
        return null;
    }
};

const setCachedRepos = (repos: GitHubRepo[]): void => {
    try {
        const cacheData: CachedData = {
            data: repos,
            timestamp: Date.now()
        };
        localStorage.setItem(GITHUB_REPOS_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error caching repos:', error);
    }
};

export const clearGitHubCache = (): void => {
    localStorage.removeItem(GITHUB_REPOS_CACHE_KEY);
};

export const clearSkillsCache = (): void => {
    localStorage.removeItem(SKILLS_CACHE_KEY);
};

export const clearLinkedInCache = (): void => {
    localStorage.removeItem('linkedin_profile_cache');
    localStorage.removeItem('linkedin_additional_cache');
};

export const fetchLinkedInProfile = async (): Promise<LinkedInProfileData> => {
    try {
        const cached = getCachedLinkedInProfile();
        if (cached) {
            return cached;
        }

        const isProd = import.meta.env.MODE === 'production';
        const apiBaseUrl = isProd ? CLOUD_API_URL : LOCAL_API_URL;
        const response = await fetch(`${apiBaseUrl}/linkedin/profile`);

        if (!response.ok) {
            throw new Error(`Failed to fetch LinkedIn profile: ${response.status}`);
        }

        const profile = await response.json();
        setCachedLinkedInProfile(profile);
        return profile;
    } catch (error) {
        console.error('Error fetching LinkedIn profile:', error);
        throw error;
    }
};

export const getCachedLinkedInProfile = (): LinkedInProfileData | null => {
    try {
        const cached = localStorage.getItem('linkedin_profile_cache');
        if (!cached) return null;

        const parsed: LinkedInCacheData = JSON.parse(cached);
        const now = Date.now();

        if (now - parsed.timestamp > CACHE_DURATION) {
            localStorage.removeItem('linkedin_profile_cache');
            return null;
        }

        return parsed.profileData;
    } catch (error) {
        console.error('Error getting cached LinkedIn profile:', error);
        return null;
    }
};

const setCachedLinkedInProfile = (profile: LinkedInProfileData): void => {
    try {
        const cacheData: LinkedInCacheData = {
            profileData: profile,
            timestamp: Date.now()
        };
        localStorage.setItem('linkedin_profile_cache', JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error caching LinkedIn profile:', error);
    }
};