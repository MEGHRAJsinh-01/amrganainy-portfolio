
const fetch = require('node-fetch');
const { GITHUB_USERNAME, CACHE_DURATION } = require('../config/constants');

// Helper function to transform GitHub repo to project format
const transformGitHubRepoToProject = (repo) => {
    if (repo.fork || repo.private) {
        return null;
    }

    let customData = {};
    const videoMatch = repo.description?.match(/https:\/\/www\.youtube\.com\/watch\?v=[\w-]+/);
    if (videoMatch) {
        customData = { videoUrl: videoMatch[0] };
    }

    const generatedTags = [];
    if (repo.language) {
        generatedTags.push(repo.language);
    }
    if (repo.topics && repo.topics.length > 0) {
        const formattedTopics = repo.topics.slice(0, 3).map(topic =>
            topic.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        );
        generatedTags.push(...formattedTopics);
    }

    const title = {
        en: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        de: repo.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    };

    const description = {
        en: repo.description || `A ${repo.language || 'software'} project`,
        de: repo.description || `Ein ${repo.language || 'Software'} Projekt`
    };

    return {
        title,
        description,
        tags: generatedTags.length > 0 ? generatedTags : ['Project'],
        liveUrl: '#',
        repoUrl: repo.html_url,
        lastUpdated: repo.pushed_at,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        isFeatured: false,
        ...customData
    };
};

// Helper function to extract skills from repos
const extractSkillsFromRepos = (repos) => {
    const skillCounts = {};
    const languageCounts = {};
    const PROGRAMMING_LANGUAGES = [
        "JavaScript", "TypeScript", "Python", "Java", "Kotlin", "C#", "C++", "C", "Swift",
        "Go", "Rust", "PHP", "Ruby", "Dart", "Scala", "R", "Objective-C", "Shell",
        "PowerShell", "HTML", "CSS", "SQL", "Perl", "Lua", "Haskell", "F#"
    ];

    repos.forEach(repo => {
        if (repo.topics && repo.topics.length > 0) {
            repo.topics.forEach(topic => {
                const formattedTopic = topic.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                if (PROGRAMMING_LANGUAGES.includes(formattedTopic)) {
                    languageCounts[formattedTopic] = (languageCounts[formattedTopic] || 0) + 1;
                } else {
                    skillCounts[formattedTopic] = (skillCounts[formattedTopic] || 0) + 1;
                }
            });
        }
        if (repo.language) {
            if (PROGRAMMING_LANGUAGES.includes(repo.language)) {
                languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
            } else {
                skillCounts[repo.language] = (skillCounts[repo.language] || 0) + 1;
            }
        }
    });

    const sortedLanguages = Object.entries(languageCounts).sort(([, a], [, b]) => b - a).map(([language]) => language).slice(0, 15);
    const sortedSkills = Object.entries(skillCounts).sort(([, a], [, b]) => b - a).map(([skill]) => skill).slice(0, 20);

    return {
        programmingLanguages: sortedLanguages,
        otherSkills: sortedSkills
    };
};

exports.getGithubProfile = async (req, res) => {
    const { username } = req.params;
    const cache = req.app.locals.cacheStore;
    const cacheKey = `github_profile_${username}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
        return res.json(cachedData.data);
    }

    try {
        // Fetch repos from GitHub
        const repoResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`);
        if (!repoResponse.ok) {
            throw new Error(`GitHub API responded with ${repoResponse.status}`);
        }
        const repos = await repoResponse.json();

        // Process data
        const projects = repos.map(transformGitHubRepoToProject).filter(p => p);
        const skills = extractSkillsFromRepos(repos);

        const profileData = {
            projects,
            skills
        };

        // Store in cache
        cache.set(cacheKey, { data: profileData, timestamp: Date.now() });

        res.json(profileData);

    } catch (error) {
        console.error('Error fetching GitHub profile data:', error);
        res.status(500).json({ message: 'Failed to fetch GitHub profile data.' });
    }
};

exports.getGithubReposForUser = async (req, res) => {
    const { username } = req.params;
    const cache = req.app.locals.cacheStore;
    const cacheKey = `github_user_repos_${username}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
        return res.json(cachedData.data);
    }

    try {
        // Fetch repos from GitHub
        const repoResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`);
        if (!repoResponse.ok) {
            throw new Error(`GitHub API responded with ${repoResponse.status}`);
        }
        const repos = await repoResponse.json();

        // Filter out forks and private repos for user access
        const filteredRepos = repos.filter(repo => !repo.fork && !repo.private && !repo.name.toLowerCase().includes('fork'));

        // Store in cache
        cache.set(cacheKey, { data: filteredRepos, timestamp: Date.now() });

        res.json(filteredRepos);

    } catch (error) {
        console.error('Error fetching GitHub repos for user:', error);
        res.status(500).json({ message: 'Failed to fetch GitHub repos for user.' });
    }
};

exports.getSkills = async (req, res) => {
    const { username } = req.params;
    const cache = req.app.locals.cacheStore;
    const cacheKey = `github_skills_${username}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
        return res.json({
            status: 'success',
            data: cachedData.data
        });
    }

    try {
        // Fetch repos from GitHub
        const repoResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`);
        if (!repoResponse.ok) {
            throw new Error(`GitHub API responded with ${repoResponse.status}`);
        }
        const repos = await repoResponse.json();

        // Extract skills using existing function
        const skills = extractSkillsFromRepos(repos);

        // Store in cache
        cache.set(cacheKey, { data: skills, timestamp: Date.now() });

        res.json({
            status: 'success',
            data: skills
        });

    } catch (error) {
        console.error('Error fetching GitHub skills:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch GitHub skills'
        });
    }
};

exports.getGithubReposForAdmin = async (req, res) => {
    const { username } = req.params;
    const cache = req.app.locals.cacheStore;
    const cacheKey = `github_admin_repos_${username}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
        return res.json(cachedData.data);
    }

    try {
        // Fetch repos from GitHub (admin can see more repos)
        const repoResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`);
        if (!repoResponse.ok) {
            throw new Error(`GitHub API responded with ${repoResponse.status}`);
        }
        const repos = await repoResponse.json();

        // For admin, include forks but still filter out private repos unless authenticated
        const filteredRepos = repos.filter(repo => !repo.private);

        // Store in cache
        cache.set(cacheKey, { data: filteredRepos, timestamp: Date.now() });

        res.json(filteredRepos);

    } catch (error) {
        console.error('Error fetching GitHub repos for admin:', error);
        res.status(500).json({ message: 'Failed to fetch GitHub repos for admin.' });
    }
};
