
const fetch = require('node-fetch');
const config = require('../config');
const { translateText } = require('./translation.controller');

const getLanguageCode = (languageName) => {
    const name = languageName.toLowerCase();
    if (name.includes('german') || name.includes('deutsch')) return 'DE';
    if (name.includes('english')) return 'EN';
    return languageName.substring(0, 2).toUpperCase();
};

const transformLinkedInProfile = (profileData) => {
    return {
        name: profileData.basic_info?.fullname || '',
        headline: profileData.basic_info?.headline || '',
        summary: profileData.basic_info?.about || '',
        about: profileData.basic_info?.about || '',
        description: profileData.basic_info?.about || '',
        location: profileData.basic_info?.location || '',
        profile_pic_url: profileData.basic_info?.profile_picture_url || '',
        background_cover_image_url: profileData.basic_info?.background_picture_url || '',
        public_identifier: profileData.basic_info?.public_identifier || '',
        experiences: (profileData.experience || []).map((exp) => ({
            title: exp.title || '',
            company: exp.company || '',
            companyName: exp.company || '',
            description: exp.description || '',
            location: exp.location || '',
            startDate: exp.start_date?.month ? `${exp.start_date.month} ${exp.start_date.year}` : '',
            endDate: exp.is_current ? 'Present' : (exp.end_date?.month ? `${exp.end_date.month} ${exp.end_date.year}` : '')
        })),
        skills: (profileData.basic_info?.skills || []).map((skill) => ({
            name: typeof skill === 'string' ? skill : skill.name || ''
        })),
        education: (profileData.education || []).map((edu) => ({
            school: edu.school || '',
            schoolName: edu.school || '',
            degree: edu.degree || '',
            fieldOfStudy: edu.field_of_study || '',
            startDate: edu.start_date?.month ? `${edu.start_date.month} ${edu.start_date.year}` : '',
            endDate: edu.end_date?.month ? `${edu.end_date.month} ${edu.end_date.year}` : ''
        })),
        languages: (profileData.languages || []).map((lang) => ({
            language: lang.language || '',
            proficiency: lang.proficiency || '',
            name: lang.language || '',
            code: getLanguageCode(lang.language || ''),
            level: lang.proficiency || 'Unknown',
            certificate: ''
        }))
    };
};

const extractBioFromLinkedIn = async (profileData) => {
    let englishBio = "";
    if (profileData.summary) {
        englishBio = profileData.summary.trim();
    } else if (profileData.about) {
        englishBio = profileData.about.trim();
    } else if (profileData.name && profileData.headline) {
        englishBio = `${profileData.name} - ${profileData.headline}`;
    }

    if (!englishBio) {
        englishBio = ""; // Return empty if no bio can be constructed
    }

    let germanBio = await translateText(englishBio, 'en', 'de');

    return {
        en: englishBio,
        de: germanBio
    };
};

exports.getLinkedInProfile = async (req, res) => {
    const { username } = req.params;
    const cache = req.app.locals.cacheStore;
    const cacheKey = `linkedin_profile_${username}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData && (Date.now() - cachedData.timestamp < 7 * 24 * 60 * 60 * 1000)) {
        return res.json(cachedData.data);
    }

    try {
        const apiToken = config.services.apify.token;
        if (!apiToken || apiToken === 'your_apify_token_here') {
            return res.status(500).json({ error: 'Apify API token is missing or invalid' });
        }

        const apiUrl = `https://api.apify.com/v2/acts/apimaestro~linkedin-profile-detail/run-sync-get-dataset-items?token=${apiToken}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, includeEmail: true })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return res.status(response.status).json({ error: `Apify actor start failed: ${response.status} ${response.statusText}`, details: errorText });
        }

        const runData = await response.json();

        if (!Array.isArray(runData) || runData.length === 0) {
            return res.status(404).json({ error: 'No LinkedIn profile data returned from Apify' });
        }

        const rawProfile = runData[0];
        const profile = transformLinkedInProfile(rawProfile);
        const bio = await extractBioFromLinkedIn(profile);

        const profileData = {
            profile,
            bio
        };

        cache.set(cacheKey, { data: profileData, timestamp: Date.now() });

        res.json(profileData);
    } catch (error) {
        console.error('Error fetching LinkedIn profile:', error);
        res.status(500).json({ message: 'Failed to fetch LinkedIn profile.' });
    }
};
