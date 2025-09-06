import { GitHubRepo, CachedData, Project, LinkedInProfileData, LinkedInAdditionalProfileData, LinkedInCacheData, LinkedInAdditionalCacheData } from './types';
import { GITHUB_USERNAME, CACHE_KEY, CACHE_DURATION, FEATURED_REPOS, VISIBILITY_KEY, personalInfo } from './constants';
import { translateText } from './translationService';

export const SKILLS_CACHE_KEY = 'github_skills_cache';
export const README_CACHE_KEY = 'github_readme_cache'; // Keeping for backward compatibility

export interface SkillsData {
    programmingLanguages: string[];
    otherSkills: string[];
}

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

// List of common programming languages to separate from other skills
const PROGRAMMING_LANGUAGES = [
    "JavaScript", "TypeScript", "Python", "Java", "Kotlin", "C#", "C++", "C", "Swift",
    "Go", "Rust", "PHP", "Ruby", "Dart", "Scala", "R", "Objective-C", "Shell",
    "PowerShell", "HTML", "CSS", "SQL", "Perl", "Lua", "Haskell", "F#"
];

// --- Skills Extraction Functions ---
export const extractSkillsFromRepos = (repos: GitHubRepo[]): { programmingLanguages: string[], otherSkills: string[] } => {
    const skillCounts: { [key: string]: number } = {};
    const languageCounts: { [key: string]: number } = {};

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

                // Check if it's a programming language
                if (PROGRAMMING_LANGUAGES.includes(formattedTopic)) {
                    languageCounts[formattedTopic] = (languageCounts[formattedTopic] || 0) + 1;
                } else {
                    skillCounts[formattedTopic] = (skillCounts[formattedTopic] || 0) + 1;
                }
            });
        }

        // Include programming languages if not already in topics
        if (repo.language) {
            if (PROGRAMMING_LANGUAGES.includes(repo.language)) {
                languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
            } else {
                skillCounts[repo.language] = (skillCounts[repo.language] || 0) + 1;
            }
        }
    });

    // Sort languages by frequency
    const sortedLanguages = Object.entries(languageCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([language]) => language)
        .slice(0, 15); // Top 15 programming languages

    // Sort skills by frequency
    const sortedSkills = Object.entries(skillCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([skill]) => skill)
        .slice(0, 20); // Top 20 other skills

    return {
        programmingLanguages: sortedLanguages,
        otherSkills: sortedSkills
    };
};

export const getCachedSkills = (): SkillsData | null => {
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

export const setCachedSkills = (skills: SkillsData): void => {
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

export const getDynamicSkills = async (): Promise<SkillsData> => {
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
        // Return empty arrays if GitHub API fails
        return {
            programmingLanguages: [],
            otherSkills: []
        };
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

// --- LinkedIn Profile Bio Functions ---
export const LINKEDIN_USERNAME = 'amr-elganainy';
export const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/amr-elganainy/';
export const LINKEDIN_CACHE_KEY = 'linkedin_profile_cache';
export const LINKEDIN_ADDITIONAL_CACHE_KEY = 'linkedin_profile_additional_cache';
export const LINKEDIN_COMPANY_CACHE_KEY = 'linkedin_company_cache';
export const APIFY_ACTOR_ID = 'apify/linkedin-profile-scraper';
export const CACHE_DURATION_LONG = 7 * 24 * 60 * 60 * 1000; // 7 days for LinkedIn data

export const fetchLinkedInProfile = async (): Promise<LinkedInProfileData> => {
    try {
        console.log('Fetching LinkedIn profile using proxy for:', LINKEDIN_PROFILE_URL);

        // Use our proxy server instead of calling Apify directly
        const proxyServerUrl = 'http://localhost:3000/api/linkedin-profile'; // Update this URL if your server runs on a different port

        const response = await fetch(proxyServerUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                profileUrl: LINKEDIN_PROFILE_URL
            })
        });

        if (!response.ok) {
            // Get detailed error message from the proxy server
            const errorData = await response.json();
            console.error('Proxy server error:', errorData);

            if (response.status === 500 && errorData.error?.includes('API token')) {
                throw new Error('Apify API token is missing or invalid in server environment. Please configure your .env.local file.');
            } else if (response.status === 504) {
                throw new Error('LinkedIn profile scraping timed out. The operation took too long to complete.');
            } else {
                throw new Error(`LinkedIn profile scraping failed: ${errorData.error || response.statusText}`);
            }
        }

        // The proxy server returns the profile data directly
        const profileData = await response.json();

        console.log('LinkedIn profile data retrieved successfully from Apify');

        // Transform the response to match our LinkedInProfileData interface
        const transformedData: LinkedInProfileData = {
            name: profileData.basic_info?.fullname || '',
            headline: profileData.basic_info?.headline || '',
            summary: profileData.basic_info?.about || '',
            about: profileData.basic_info?.about || '',
            description: profileData.basic_info?.about || '',
            location: profileData.basic_info?.location || '',
            profile_pic_url: profileData.basic_info?.profile_picture_url || '',
            background_cover_image_url: profileData.basic_info?.background_picture_url || '',
            public_identifier: profileData.basic_info?.public_identifier || '',
            experiences: (profileData.experience || []).map((exp: any) => ({
                title: exp.title || '',
                company: exp.company || '',
                companyName: exp.company || '',
                description: exp.description || '',
                location: exp.location || '',
                startDate: exp.start_date?.month ? `${exp.start_date.month} ${exp.start_date.year}` : '',
                endDate: exp.is_current ? 'Present' : (exp.end_date?.month ? `${exp.end_date.month} ${exp.end_date.year}` : '')
            })),
            skills: (profileData.basic_info?.skills || []).map((skill: any) => ({
                name: typeof skill === 'string' ? skill : skill.name || ''
            })),
            education: (profileData.education || []).map((edu: any) => ({
                school: edu.school || '',
                schoolName: edu.school || '',
                degree: edu.degree || '',
                fieldOfStudy: edu.field_of_study || '',
                startDate: edu.start_date?.month ? `${edu.start_date.month} ${edu.start_date.year}` : '',
                endDate: edu.end_date?.month ? `${edu.end_date.month} ${edu.end_date.year}` : ''
            }))
        };

        return transformedData;
    } catch (error) {
        console.error('Error fetching LinkedIn profile from Apify:', error);
        throw error;
    }
};

export const extractBioFromLinkedIn = async (profileData: LinkedInProfileData): Promise<{ en: string; de: string }> => {
    try {
        console.log('Extracting bio from LinkedIn data:', profileData);

        // Create the English bio from LinkedIn profile data
        let englishBio = "";

        // Check all possible fields that might contain bio information
        // First check if we have a summary from LinkedIn
        if (profileData.summary) {
            console.log('Found bio in summary field');
            englishBio = profileData.summary.trim();
        }
        // Check if there's an about field
        else if (profileData.about) {
            console.log('Found bio in about field');
            englishBio = profileData.about.trim();
        }
        // If no summary, try to create from name and headline
        else if (profileData.name && profileData.headline) {
            console.log('Creating bio from name and headline');
            englishBio = `${profileData.name} - ${profileData.headline}`;
        }
        // If we still don't have anything useful, combine various profile elements
        else if (profileData.experiences && profileData.experiences.length > 0) {
            console.log('Creating bio from experiences');
            const latestExperience = profileData.experiences[0]; // Assuming sorted by most recent
            englishBio = `${profileData.name || 'Amr Elganainy'} - ${latestExperience.title || ''} at ${latestExperience.company || ''}`;
        }

        // If we still couldn't find anything, create a default bio
        if (!englishBio) {
            console.log('No bio information found, using default');
            englishBio = "Amr Elganainy - Computer Science Graduate and Internet Security Master's Student";
        }

        console.log("Extracted LinkedIn bio:", englishBio);

        // Create a manually enhanced bio if we only have basic information
        if (englishBio === `${profileData.name} - ${profileData.headline}`) {
            // Add additional information from experiences if available
            if (profileData.experiences && profileData.experiences.length > 0) {
                const exp = profileData.experiences[0];
                const additionalInfo = exp.description
                    ? `\n\n${exp.description}`
                    : `\n\nCurrently working as ${exp.title} at ${exp.company}.`;
                englishBio += additionalInfo;
            }

            // Add skills if available
            if (profileData.skills && profileData.skills.length > 0) {
                const skillNames = profileData.skills
                    .map(skill => typeof skill === 'string' ? skill : skill.name)
                    .filter(name => name) // Filter out undefined/null
                    .slice(0, 5); // Take top 5 skills

                if (skillNames.length > 0) {
                    englishBio += `\n\nSkills include: ${skillNames.join(', ')}.`;
                }
            }
        }

        // Add location if available and not already mentioned
        if (profileData.location && !englishBio.includes(profileData.location)) {
            englishBio += `\n\nBased in ${profileData.location}.`;
        }

        // Add education if available and not already mentioned
        if (profileData.education && profileData.education.length > 0) {
            const edu = profileData.education[0];
            const educationInfo = `${edu.degree || ''} from ${edu.school || ''}`.trim();

            if (educationInfo && !englishBio.includes(educationInfo)) {
                englishBio += `\n\nEducation: ${educationInfo}.`;
            }
        }

        // Translate the English bio to German using Lingva Translate API
        console.log('Translating bio to German...');
        let germanBio;
        try {
            germanBio = await translateText(englishBio, 'en', 'de');
            console.log('Bio successfully translated to German');
        } catch (error) {
            console.error('Error translating bio to German:', error);
            germanBio = englishBio; // Fallback to English if translation fails
        }

        return {
            en: englishBio,
            de: germanBio
        };
    } catch (error) {
        console.error('Error extracting bio from LinkedIn data:', error);
        // Return a default bio instead of throwing an error
        const defaultEnglishBio = "Amr Elganainy - Computer Science Graduate and Internet Security Master's Student";

        try {
            // Try to translate the default bio
            const defaultGermanBio = await translateText(defaultEnglishBio, 'en', 'de');
            return {
                en: defaultEnglishBio,
                de: defaultGermanBio
            };
        } catch (translateError) {
            console.error('Error translating default bio:', translateError);
            return {
                en: defaultEnglishBio,
                de: defaultEnglishBio // Fallback to English if translation fails
            };
        }
    }
};

export const extractBioFromLinkedInCombined = async (profileData: LinkedInProfileData, additionalData: LinkedInAdditionalProfileData): Promise<{ en: string; de: string }> => {
    try {
        console.log('Extracting combined bio from LinkedIn data:', { profileData, additionalData });

        // Create the English bio from combined LinkedIn profile data
        let englishBio = "";

        // First priority: use the summary/about from either source
        if (additionalData.summary) {
            console.log('Found bio in additional data summary field');
            englishBio = additionalData.summary.trim();
        } else if (profileData.summary) {
            console.log('Found bio in profile data summary field');
            englishBio = profileData.summary.trim();
        } else if (additionalData.about) {
            console.log('Found bio in additional data about field');
            englishBio = additionalData.about.trim();
        } else if (profileData.about) {
            console.log('Found bio in profile data about field');
            englishBio = profileData.about.trim();
        } else if (profileData.description) {
            console.log('Found bio in profile description field');
            englishBio = profileData.description.trim();
        }

        // If still no bio, create one from basic info
        if (!englishBio) {
            // Get name from either source
            const name = profileData.name || additionalData.fullName || 'Amr Elganainy';

            // Get headline from either source
            const headline = profileData.headline || additionalData.headline || '';

            if (headline) {
                console.log('Creating bio from name and headline');
                englishBio = `${name} - ${headline}`;
            } else if (profileData.experiences && profileData.experiences.length > 0) {
                console.log('Creating bio from experiences');
                const latestExperience = profileData.experiences[0]; // Assuming sorted by most recent
                englishBio = `${name} - ${latestExperience.title || ''} at ${latestExperience.company || ''}`;
            } else if (additionalData.experiences && additionalData.experiences.length > 0) {
                console.log('Creating bio from additional data experiences');
                const latestExperience = additionalData.experiences[0];
                englishBio = `${name} - ${latestExperience.title || ''} at ${latestExperience.companyName || ''}`;
            }
        }

        // If we still couldn't find anything, create a default bio
        if (!englishBio) {
            console.log('No bio information found, using default');
            englishBio = "Amr Elganainy - Computer Science Graduate and Internet Security Master's Student";
        }

        // Enhance the bio with additional information
        let enhancedBio = englishBio;

        // Add location if available
        const location = additionalData.geoLocationName || profileData.location;
        if (location && !enhancedBio.includes(location)) {
            enhancedBio += `\n\nBased in ${location}.`;
        }

        // Add current position if not already included
        let currentPosition = '';
        if (additionalData.experiences && additionalData.experiences.length > 0) {
            const exp = additionalData.experiences[0];
            currentPosition = `${exp.title || ''} at ${exp.companyName || ''}`;
        } else if (profileData.experiences && profileData.experiences.length > 0) {
            const exp = profileData.experiences[0];
            currentPosition = `${exp.title || ''} at ${exp.company || ''}`;
        }

        if (currentPosition && !enhancedBio.includes(currentPosition)) {
            enhancedBio += `\n\nCurrently working as ${currentPosition}.`;
        }

        // Add education if available and not already included
        let education = '';
        if (additionalData.education && additionalData.education.length > 0) {
            const edu = additionalData.education[0];
            education = `${edu.degree || ''} from ${edu.schoolName || ''}`;
        } else if (profileData.education && profileData.education.length > 0) {
            const edu = profileData.education[0];
            education = `${edu.degree || ''} from ${edu.school || ''}`;
        }

        if (education && !enhancedBio.includes(education)) {
            enhancedBio += `\n\nEducation: ${education}.`;
        }

        // Merge skills from both sources
        const skills: string[] = [];

        // Add skills from profileData
        if (profileData.skills && Array.isArray(profileData.skills)) {
            profileData.skills.forEach(skill => {
                if (skill && skill.name && !skills.includes(skill.name)) {
                    skills.push(skill.name);
                }
            });
        }

        // Add skills from additionalData
        if (additionalData.skills && Array.isArray(additionalData.skills)) {
            additionalData.skills.forEach(skill => {
                const skillName = typeof skill === 'string' ? skill : (skill.name || '');
                if (skillName && !skills.includes(skillName)) {
                    skills.push(skillName);
                }
            });
        }

        // Add skills to bio if we have any and they're not already included
        if (skills.length > 0) {
            const topSkills = skills.slice(0, 7); // Take top 7 skills
            enhancedBio += `\n\nSkills include: ${topSkills.join(', ')}.`;
        }

        // Add recommendations if available
        if (additionalData.recommendations && additionalData.recommendations.length > 0) {
            const recentRecommendation = additionalData.recommendations[0];
            if (recentRecommendation.text && recentRecommendation.text.length > 0) {
                enhancedBio += `\n\nRecommendation: "${recentRecommendation.text.substring(0, 150)}${recentRecommendation.text.length > 150 ? '...' : ''}" - ${recentRecommendation.author || 'LinkedIn connection'}`;
            }
        }

        // Add certifications if available
        if (additionalData.certifications && additionalData.certifications.length > 0) {
            const certList = additionalData.certifications
                .slice(0, 3) // Top 3 certifications
                .map(cert => cert.name)
                .filter(Boolean);

            if (certList.length > 0) {
                enhancedBio += `\n\nCertifications: ${certList.join(', ')}.`;
            }
        }

        console.log("Enhanced LinkedIn bio:", enhancedBio);

        // Use the same English bio for both languages (in a real scenario, you might want to translate this)
        return {
            en: enhancedBio,
            de: enhancedBio // Using English bio for German as well
        };
    } catch (error) {
        console.error('Error extracting combined bio from LinkedIn data:', error);
        // Fallback to the basic extraction if there's an error
        if (profileData) {
            return await extractBioFromLinkedIn(profileData);
        }
        // Return a default bio if all else fails
        return {
            en: "Amr Elganainy - Computer Science Graduate and Internet Security Master's Student",
            de: "Amr Elganainy - Computer Science Graduate and Internet Security Master's Student"
        };
    }
};

export const fetchLinkedInAdditionalProfile = async (): Promise<LinkedInAdditionalProfileData> => {
    try {
        // For Apify implementation, we don't need a separate API call for additional data
        // Instead, we'll reuse the data from the main profile call and restructure it

        // Try to get cached profile data first to avoid making a new API call
        const cachedProfile = getCachedLinkedInProfile();

        if (cachedProfile) {
            console.log('Using cached LinkedIn profile data for additional profile');
            // Create additional profile data from the cached profile
            return createAdditionalProfileFromBasic(cachedProfile);
        }

        // If no cache, fetch the profile data
        console.log('No cache available, fetching LinkedIn profile for additional data');
        const profileData = await fetchLinkedInProfile();

        // Cache the profile data
        setCachedLinkedInProfile(profileData);

        // Create additional profile data from the fetched profile
        return createAdditionalProfileFromBasic(profileData);
    } catch (error) {
        console.error('Error generating additional LinkedIn profile data:', error);
        throw error;
    }
};

// Helper function to create additional profile data from basic profile
const createAdditionalProfileFromBasic = (profileData: LinkedInProfileData): LinkedInAdditionalProfileData => {
    return {
        fullName: profileData.name || '',
        headline: profileData.headline || '',
        summary: profileData.summary || '',
        about: profileData.about || '',
        geoLocationName: profileData.location || '',
        skills: profileData.skills?.map(skill => skill.name || '') || [],
        certifications: [], // We don't have certifications in the basic profile
        recommendations: [], // We don't have recommendations in the basic profile
        experiences: profileData.experiences?.map(exp => ({
            title: exp.title || '',
            companyName: exp.company || exp.companyName || '',
            description: exp.description || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || ''
        })) || [],
        education: profileData.education?.map(edu => ({
            schoolName: edu.school || edu.schoolName || '',
            degree: edu.degree || '',
            fieldOfStudy: edu.fieldOfStudy || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || ''
        })) || []
    };
};

export const getCachedLinkedInProfile = (): LinkedInProfileData | null => {
    try {
        const cached = localStorage.getItem(LINKEDIN_CACHE_KEY);
        if (!cached) return null;

        const parsed = JSON.parse(cached) as LinkedInCacheData;
        const now = Date.now();

        if (now - parsed.timestamp > CACHE_DURATION_LONG) {
            console.log('LinkedIn profile cache expired');
            // Don't remove the cache - we'll still use it if the API call fails
            return null;
        }

        console.log('Using LinkedIn profile from cache, last updated:', new Date(parsed.timestamp).toLocaleString());
        return parsed.profileData;
    } catch (error) {
        console.error('Error reading LinkedIn cache:', error);
        return null;
    }
};

export const setCachedLinkedInProfile = (profile: LinkedInProfileData): void => {
    try {
        const cacheData: LinkedInCacheData = {
            profileData: profile,
            timestamp: Date.now()
        };
        localStorage.setItem(LINKEDIN_CACHE_KEY, JSON.stringify(cacheData));
        console.log('LinkedIn profile cached successfully');
    } catch (error) {
        console.error('Error setting LinkedIn cache:', error);
    }
};

export const getCachedLinkedInAdditionalProfile = (): LinkedInAdditionalProfileData | null => {
    try {
        const cached = localStorage.getItem(LINKEDIN_ADDITIONAL_CACHE_KEY);
        if (!cached) return null;

        const parsed = JSON.parse(cached) as LinkedInAdditionalCacheData;
        const now = Date.now();

        if (now - parsed.timestamp > CACHE_DURATION_LONG) {
            console.log('LinkedIn additional profile cache expired');
            // Don't remove the cache - we'll still use it if needed
            return null;
        }

        console.log('Using LinkedIn additional profile from cache, last updated:', new Date(parsed.timestamp).toLocaleString());
        return parsed.additionalProfileData;
    } catch (error) {
        console.error('Error reading LinkedIn additional cache:', error);
        return null;
    }
};

export const setCachedLinkedInAdditionalProfile = (profile: LinkedInAdditionalProfileData): void => {
    try {
        const cacheData: LinkedInAdditionalCacheData = {
            additionalProfileData: profile,
            timestamp: Date.now()
        };
        localStorage.setItem(LINKEDIN_ADDITIONAL_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Error setting LinkedIn additional cache:', error);
    }
};

export const getDynamicBio = async (): Promise<{ en: string; de: string }> => {
    try {
        // Try to get cached LinkedIn profile first
        const cachedProfile = getCachedLinkedInProfile();

        // If we have a cached profile, use it
        if (cachedProfile) {
            console.log('Using cached LinkedIn profile data for bio generation');

            // Extract bio from the profile data
            return await extractBioFromLinkedIn(cachedProfile);
        }

        console.log('No cached profile found, fetching fresh data');
        try {
            // Try to fetch profile data from LinkedIn using Apify
            console.log('Fetching LinkedIn profile data for bio');
            const linkedInProfile = await fetchLinkedInProfile();

            // Check if we got usable data
            const dataQualityCheck = checkLinkedInDataQuality(linkedInProfile);

            // If data quality is poor, use fallback
            if (!dataQualityCheck.isUsable) {
                console.warn('LinkedIn API returned poor quality data:', dataQualityCheck.issues);
                return createFallbackBio();
            }

            // Cache the profile data
            setCachedLinkedInProfile(linkedInProfile);

            // Extract bio using just the profile data
            return await extractBioFromLinkedIn(linkedInProfile);
        } catch (linkedInError: any) {
            console.error('LinkedIn API error, using fallback:', linkedInError);

            // If we have an expired cache, use it even though it's expired
            if (localStorage.getItem(LINKEDIN_CACHE_KEY)) {
                try {
                    const expiredCache = JSON.parse(localStorage.getItem(LINKEDIN_CACHE_KEY) || '{}');
                    if (expiredCache.profileData) {
                        console.log('Using expired cache due to API error');
                        return await extractBioFromLinkedIn(expiredCache.profileData);
                    }
                } catch (cacheError) {
                    console.error('Error parsing expired cache:', cacheError);
                }
            }

            // If it's an Apify-specific error, provide helpful message
            if (linkedInError.message) {
                if (linkedInError.message.includes('API token is missing')) {
                    throw new Error('LinkedIn API token is missing. Please configure your Apify token in .env.local');
                } else if (linkedInError.message.includes('actor run failed')) {
                    throw new Error('LinkedIn profile scraping failed. This could be due to LinkedIn rate limits or changes. Please try again later.');
                } else if (linkedInError.message.includes('timed out')) {
                    throw new Error('LinkedIn profile scraping timed out. The operation took too long to complete. Please try again later.');
                }
            }

            // For other errors, use the fallback bio
            return await createFallbackBio();
        }
    } catch (error) {
        console.error('Error fetching dynamic bio:', error);
        // Rethrow specific errors that we want to show to the user
        if (error instanceof Error &&
            (error.message.includes('API token') ||
                error.message.includes('scraping failed') ||
                error.message.includes('timed out'))) {
            throw error;
        }
        // Use fallback bio
        return await createFallbackBio();
    }
};

// Helper function to check LinkedIn data quality
const checkLinkedInDataQuality = (profileData: LinkedInProfileData) => {
    const issues: string[] = [];

    // Check for essential fields
    if (!profileData) {
        issues.push('Profile data is null or undefined');
        return { isUsable: false, issues };
    }

    if (Object.keys(profileData).length === 0) {
        issues.push('Profile data is an empty object');
        return { isUsable: false, issues };
    }

    // Check for core identity data
    if (!profileData.name) issues.push('Missing name');
    if (!profileData.headline) issues.push('Missing headline');

    // Check for bio content
    const hasBioContent = !!(
        profileData.summary ||
        profileData.about
    );

    if (!hasBioContent) issues.push('No bio content found (summary/about)');

    // Check for experiences
    if (!profileData.experiences || profileData.experiences.length === 0) {
        issues.push('No experiences found');
    }

    // Check for skills
    if (!profileData.skills || profileData.skills.length === 0) {
        issues.push('No skills found');
    }

    // Determine if the data is usable
    // We consider it usable if we have at least name + headline, or bio content
    const isUsable = (
        (profileData.name && profileData.headline) ||
        hasBioContent ||
        (profileData.experiences && profileData.experiences.length > 0)
    );

    return { isUsable, issues };
};

// Helper function to create a fallback bio
const createFallbackBio = async (): Promise<{ en: string; de: string }> => {
    // Create a rich, manually crafted bio that looks professional
    const richEnglishBio = `Amr Elganainy is a Computer Science Graduate and Internet Security Master's Student with a passion for web development and cybersecurity. 

With expertise in JavaScript, TypeScript, React, and Node.js, Amr builds modern web applications that combine excellent user experience with robust security features.

His background in both computer science and internet security provides a unique perspective when developing software, ensuring that applications are not only functional and user-friendly but also secure and reliable.

Amr is constantly exploring new technologies and frameworks to improve his skills and deliver high-quality software solutions.`;

    // Translate the English bio to German
    try {
        console.log('Translating fallback bio to German...');
        const germanBio = await translateText(richEnglishBio, 'en', 'de');
        console.log('Fallback bio successfully translated');

        return {
            en: richEnglishBio,
            de: germanBio
        };
    } catch (error) {
        console.error('Error translating fallback bio:', error);

        // Fallback to a manually translated version if API fails
        const manualGermanBio = `Amr Elganainy ist Computer Science Absolvent und Student für Internet Security mit einer Leidenschaft für Webentwicklung und Cybersicherheit.

Mit Expertise in JavaScript, TypeScript, React und Node.js entwickelt Amr moderne Webanwendungen, die hervorragende Benutzererfahrung mit robusten Sicherheitsfunktionen kombinieren.

Sein Hintergrund in Informatik und Internet-Sicherheit bietet eine einzigartige Perspektive bei der Softwareentwicklung und stellt sicher, dass Anwendungen nicht nur funktional und benutzerfreundlich, sondern auch sicher und zuverlässig sind.

Amr erforscht ständig neue Technologien und Frameworks, um seine Fähigkeiten zu verbessern und hochwertige Softwarelösungen zu liefern.`;

        return {
            en: richEnglishBio,
            de: manualGermanBio
        };
    }
};

export const clearLinkedInCache = () => {
    try {
        localStorage.removeItem(LINKEDIN_CACHE_KEY);
        localStorage.removeItem(LINKEDIN_ADDITIONAL_CACHE_KEY);
        localStorage.removeItem(LINKEDIN_COMPANY_CACHE_KEY);
        console.log('LinkedIn cache cleared successfully');
        return true;
    } catch (error) {
        console.error('Error clearing LinkedIn cache:', error);
        return false;
    }
};

/**
 * Fetches company information from LinkedIn for a given company domain
 * This can be useful to show information about companies you've worked with
 */
export const fetchLinkedInCompany = async (domain: string): Promise<any> => {
    try {
        // First check if the API key is available
        const apiKey = import.meta.env.VITE_RAPIDAPI_KEY;
        if (!apiKey || apiKey === '' || apiKey === 'your_rapidapi_key') {
            console.error('LinkedIn API key is missing or invalid');
            throw new Error('LinkedIn API key is missing. Please add your RapidAPI key to .env.local');
        }

        console.log('Fetching LinkedIn company data for domain:', domain);

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'linkedin-data-scraper.p.rapidapi.com'
            }
        };

        // Use the company endpoint from the LinkedIn Data Scraper API
        const response = await fetch(
            `https://linkedin-data-scraper.p.rapidapi.com/company-by-domain?domain=${domain}`,
            options
        );

        console.log('LinkedIn API response status for company data:', response.status);

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('LinkedIn API authentication failed. Please check your RapidAPI key.');
            } else if (response.status === 429) {
                throw new Error('LinkedIn API rate limit exceeded. Please try again later.');
            } else {
                throw new Error(`LinkedIn API error: ${response.status}`);
            }
        }

        const data = await response.json();

        // Log successful retrieval
        console.log('LinkedIn company data retrieved successfully for:', domain);
        console.log('Company data summary:', {
            name: data.name || 'Not found',
            industry: data.industry || 'Not found',
            description: data.description?.substring(0, 50) + '...' || 'Not found',
            followerCount: data.followerCount || 0,
            employeeCount: data.employeeCount || 0
        });

        // Cache the company data
        setCachedLinkedInCompany(domain, data);

        return data;
    } catch (error) {
        console.error(`Error fetching LinkedIn company data for ${domain}:`, error);
        throw error;
    }
};

export const getCachedLinkedInCompany = (domain: string): any => {
    try {
        const cacheKey = `${LINKEDIN_COMPANY_CACHE_KEY}_${domain}`;
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;

        const parsed = JSON.parse(cached);
        const now = Date.now();

        if (now - parsed.timestamp > CACHE_DURATION) {
            localStorage.removeItem(cacheKey);
            return null;
        }

        return parsed.data;
    } catch (error) {
        console.error(`Error reading LinkedIn company cache for ${domain}:`, error);
        return null;
    }
};

export const setCachedLinkedInCompany = (domain: string, companyData: any): void => {
    try {
        const cacheKey = `${LINKEDIN_COMPANY_CACHE_KEY}_${domain}`;
        const cacheData = {
            data: companyData,
            timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
        console.error(`Error setting LinkedIn company cache for ${domain}:`, error);
    }
};
