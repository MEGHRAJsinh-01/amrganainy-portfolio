const Profile = require('../models/profile.model');
const User = require('../models/user.model');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const fetch = require('node-fetch');

// --- Image Upload Config ---
// Configure multer storage for profile images
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/profiles');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Create unique filename with user ID and timestamp
        const uniqueSuffix = `${req.user._id}-${Date.now()}`;
        const extension = path.extname(file.originalname);
        cb(null, `profile-${uniqueSuffix}${extension}`);
    }
});

// Filter files to accept only images
const imageFileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

// Initialize multer upload for images
exports.uploadImage = multer({
    storage: imageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// --- CV Upload Config ---
// Configure multer storage for CVs
const cvStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/cvs');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        // Create unique filename with user ID and timestamp
        const uniqueSuffix = `${req.user._id}-${Date.now()}`;
        const extension = path.extname(file.originalname);
        cb(null, `cv-${uniqueSuffix}${extension}`);
    }
});

// Filter files to accept only PDF and DOCX
const cvFileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type! Please upload a PDF or DOCX file.'), false);
    }
};

// Initialize multer upload for CVs
exports.uploadCVFile = multer({
    storage: cvStorage,
    fileFilter: cvFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

/**
 * Get profile by user ID
 */
exports.getProfileByUserId = async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.params.userId });

        if (!profile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        // Also return minimal user summary for single-source read model
        const user = await User.findById(profile.userId).select('username email');

        res.status(200).json({
            status: 'success',
            data: {
                profile,
                user: user ? { username: user.username, email: user.email } : undefined
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get profile by username
 */
exports.getProfileByUsername = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        const profile = await Profile.findOne({ userId: user._id });

        if (!profile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                profile,
                user: {
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get aggregated profile with integrated data
 */
exports.getAggregatedProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        const profile = await Profile.findOne({ userId: user._id });

        if (!profile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        // Fetch GitHub skills if GitHub username is configured
        let githubSkills = { programmingLanguages: [], otherSkills: [] };
        if (profile.socialLinks?.github) {
            try {
                const githubUsername = profile.socialLinks.github.split('/').pop();
                const skillsResponse = await fetch(`${req.protocol}://${req.get('host')}/api/github/skills/${githubUsername}`);
                if (skillsResponse.ok) {
                    const skillsData = await skillsResponse.json();
                    githubSkills = skillsData.data || githubSkills;
                }
            } catch (error) {
                console.warn('Failed to fetch GitHub skills:', error.message);
            }
        }

        // Fetch LinkedIn profile if configured
        let linkedinProfile = null;
        if (profile.socialLinks?.linkedin) {
            try {
                const linkedinUsername = profile.socialLinks.linkedin.split('/').pop();
                const linkedinResponse = await fetch(`${req.protocol}://${req.get('host')}/api/linkedin/profile/${linkedinUsername}`);
                if (linkedinResponse.ok) {
                    linkedinProfile = await linkedinResponse.json();
                }
            } catch (error) {
                console.warn('Failed to fetch LinkedIn profile:', error.message);
            }
        }

        // Combine skills from profile and GitHub
        const combinedSkills = {
            programmingLanguages: [
                ...new Set([
                    ...(profile.skills || []),
                    ...githubSkills.programmingLanguages
                ])
            ],
            otherSkills: githubSkills.otherSkills
        };

        // Ensure URLs are absolute
        const ensureFullUrl = (url) => {
            if (!url) return url;
            if (url.startsWith('http')) return url;
            return `${req.protocol}://${req.get('host')}${url}`;
        };

        const aggregatedProfile = {
            ...profile.toObject(),
            skills: combinedSkills,
            linkedinData: linkedinProfile,
            profileImageUrl: ensureFullUrl(profile.profileImageUrl),
            cvViewUrl: ensureFullUrl(profile.cvViewUrl),
            cvDownloadUrl: ensureFullUrl(profile.cvDownloadUrl)
        };

        res.status(200).json({
            status: 'success',
            data: aggregatedProfile
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get current user's profile
 */
exports.getCurrentUserProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user._id });

        if (!profile) {
            // Create profile if it doesn't exist
            const newProfile = await Profile.create({ userId: req.user._id });

            return res.status(200).json({
                status: 'success',
                data: {
                    profile: newProfile,
                    user: {
                        username: req.user.username,
                        email: req.user.email
                    }
                }
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                profile,
                user: {
                    username: req.user.username,
                    email: req.user.email
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Update profile
 */
exports.updateProfile = async (req, res) => {
    try {
        // Fields that should not be updated directly on the profile
        const restrictedFields = ['userId', 'createdAt', 'updatedAt', 'profileImageUrl', 'cvFileUrl'];

        // Guard: disallow updates to user-owned fields here (SoT: Users)
        const userOwnedFields = ['email', 'username', 'role', 'password'];
        for (const f of userOwnedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, f)) {
                return res.status(400).json({
                    status: 'error',
                    message: `Field "${f}" belongs to user identity and cannot be updated via profile`
                });
            }
        }

        // Filter out restricted fields
        const filteredBody = Object.keys(req.body).reduce((obj, key) => {
            if (!restrictedFields.includes(key)) {
                obj[key] = req.body[key];
            }
            return obj;
        }, {});

        // Backward compatibility: if client sent `about`, map it to `bio`
        if (typeof filteredBody.about === 'string' && !filteredBody.bio) {
            filteredBody.bio = filteredBody.about;
            delete filteredBody.about;
        }

        // Update profile
        const updatedProfile = await Profile.findOneAndUpdate(
            { userId: req.user._id },
            filteredBody,
            {
                new: true,
                runValidators: true,
                upsert: true
            }
        );

        res.status(200).json({
            status: 'success',
            data: {
                profile: updatedProfile
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Upload profile image
 */
exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No file uploaded'
            });
        }

        // Get profile
        const profile = await Profile.findOne({ userId: req.user._id });

        if (!profile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        // Delete old profile image if exists
        if (profile.profileImageUrl) {
            const oldFilePath = path.join(__dirname, '..', profile.profileImageUrl.replace('/api', ''));

            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        // Update profile with new image URL
        // Match express static mount at app.use('/uploads', ...)
        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}`;

        profile.profileImageUrl = imageUrl;
        await profile.save();

        res.status(200).json({
            status: 'success',
            data: {
                profileImageUrl: imageUrl
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Upload CV file
 */
exports.uploadCV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No file uploaded'
            });
        }

        // Get profile
        const profile = await Profile.findOne({ userId: req.user._id });

        if (!profile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        // With GridFS, old files can be removed by ID if needed, but for simplicity,
        // we'll just add the new one and update the reference.
        // A cleanup script could periodically remove unreferenced files.

        // Construct absolute URL for the CV
        const cvFileUrl = `${req.protocol}://${req.get('host')}/uploads/cvs/${req.file.filename}`;

        profile.cvFileUrl = cvFileUrl;
        profile.cvViewUrl = cvFileUrl; // Set view URL to same as file URL
        profile.cvDownloadUrl = cvFileUrl; // Set download URL to same as file URL

        await profile.save();

        res.status(200).json({
            status: 'success',
            data: {
                cvFileUrl,
                cvViewUrl: profile.cvViewUrl,
                cvDownloadUrl: profile.cvDownloadUrl
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Update skills
 */
exports.updateSkills = async (req, res) => {
    try {
        const { skills } = req.body;

        // Validate skills array
        if (!Array.isArray(skills)) {
            return res.status(400).json({
                status: 'error',
                message: 'Skills must be an array'
            });
        }

        // Validate each skill object
        for (const skill of skills) {
            if (typeof skill !== 'object' || !skill.name) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Each skill must be an object with at least a name property'
                });
            }
        }

        // Update profile skills
        const updatedProfile = await Profile.findOneAndUpdate(
            { userId: req.user._id },
            { skills },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProfile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                profile: updatedProfile
            }
        });
    } catch (error) {
        console.error('Error updating skills:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Update languages
 */
exports.updateLanguages = async (req, res) => {
    try {
        const { languages } = req.body;

        // Validate languages array
        if (!Array.isArray(languages)) {
            return res.status(400).json({
                status: 'error',
                message: 'Languages must be an array'
            });
        }

        // Validate each language object
        for (const language of languages) {
            if (typeof language !== 'object' || !language.label) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Each language must be an object with at least a label property'
                });
            }
        }

        // Update profile languages
        const updatedProfile = await Profile.findOneAndUpdate(
            { userId: req.user._id },
            { languages },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProfile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                profile: updatedProfile
            }
        });
    } catch (error) {
        console.error('Error updating languages:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Update work experience
 */
exports.updateExperience = async (req, res) => {
    try {
        const { experience } = req.body;

        // Validate experience array
        if (!Array.isArray(experience)) {
            return res.status(400).json({
                status: 'error',
                message: 'Experience must be an array'
            });
        }

        // Validate each experience object
        for (const exp of experience) {
            if (typeof exp !== 'object' || !exp.title || !exp.company) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Each experience must be an object with at least title and company properties'
                });
            }
        }

        // Update profile experience
        const updatedProfile = await Profile.findOneAndUpdate(
            { userId: req.user._id },
            { experience },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedProfile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                profile: updatedProfile
            }
        });
    } catch (error) {
        console.error('Error updating experience:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get current user's skills
 */
exports.getCurrentUserSkills = async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user._id });

        if (!profile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                skills: profile.skills || []
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get current user's languages
 */
exports.getCurrentUserLanguages = async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user._id });

        if (!profile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                languages: profile.languages || []
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

/**
 * Get current user's work experience
 */
exports.getCurrentUserExperience = async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.user._id });

        if (!profile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                experience: profile.experience || []
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
