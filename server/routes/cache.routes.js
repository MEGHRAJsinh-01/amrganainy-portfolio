const express = require('express');
const router = express.Router();
const cacheController = require('../controllers/cache.controller');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

router.use(authenticate);
router.use(isAdmin);

router.post('/clear/github', cacheController.clearGithubCache);
router.post('/clear/skills', cacheController.clearSkillsCache);
router.post('/clear/linkedin', cacheController.clearLinkedInCache);

module.exports = router;
