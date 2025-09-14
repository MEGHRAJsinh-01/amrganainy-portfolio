const express = require('express');
const translationController = require('../controllers/translation.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// This endpoint can be public if you want any visitor to be able to use the translation.
// If you want to restrict it to logged-in users, you can add the `authenticate` middleware.
router.post('/', translationController.translate);

module.exports = router;
