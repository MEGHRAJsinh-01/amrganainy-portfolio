const express = require('express');
const router = express.Router();
const githubController = require('../controllers/github.controller');

router.get('/profile/:username', githubController.getGithubProfile);
router.get('/repos/:username', githubController.getGithubReposForUser);
router.get('/admin/repos/:username', githubController.getGithubReposForAdmin);
router.get('/skills/:username', githubController.getSkills);

module.exports = router;