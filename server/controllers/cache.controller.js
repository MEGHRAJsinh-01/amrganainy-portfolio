const { GITHUB_USERNAME } = require('../config/constants');

exports.clearGithubCache = (req, res) => {
    const cache = req.app.locals.cacheStore;
    const cacheKey = `github_profile_${GITHUB_USERNAME}`;
    cache.del(cacheKey);
    res.status(200).json({ message: 'GitHub cache cleared' });
};

exports.clearSkillsCache = (req, res) => {
    const cache = req.app.locals.cacheStore;
    const cacheKey = `github_skills_cache`;
    cache.del(cacheKey);
    res.status(200).json({ message: 'Skills cache cleared' });
};

exports.clearLinkedInCache = (req, res) => {
    const cache = req.app.locals.cacheStore;
    const cacheKey = `linkedin_profile`;
    cache.del(cacheKey);
    res.status(200).json({ message: 'LinkedIn cache cleared' });
};
