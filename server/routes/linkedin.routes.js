
const express = require('express');
const router = express.Router();
const linkedinController = require('../controllers/linkedin.controller');

router.get('/profile/:username', linkedinController.getLinkedInProfile);

module.exports = router;
