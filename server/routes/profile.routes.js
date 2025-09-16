const express = require('express');
const profileController = require('../controllers/profile.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/username/:username', profileController.getProfileByUsername);
router.get('/aggregated/:username', profileController.getAggregatedProfile);
router.get('/id/:userId', profileController.getProfileByUserId);

// Protected routes
router.use(authenticate); // Apply authentication middleware to all routes below

router.get('/me', profileController.getCurrentUserProfile);
router.patch('/me', profileController.updateProfile);

// Specific update endpoints
router.patch('/me/skills', profileController.updateSkills);
router.patch('/me/languages', profileController.updateLanguages);
router.patch('/me/experience', profileController.updateExperience);

// Specific read endpoints
router.get('/me/skills', profileController.getCurrentUserSkills);
router.get('/me/languages', profileController.getCurrentUserLanguages);
router.get('/me/experience', profileController.getCurrentUserExperience);

router.post('/me/profile-image', profileController.uploadImage.single('image'), profileController.uploadProfileImage);
router.post('/me/cv', profileController.uploadCVFile.single('cv'), profileController.uploadCV);

module.exports = router;
